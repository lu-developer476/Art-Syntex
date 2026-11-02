import { randomUUID } from 'node:crypto'
import { getConfig } from '../../server/config/env.js'
import { validateContactPayload, validateNewsletterPayload, validateRegistrationPayload } from '../../server/validation.js'
import { createEmailService } from '../../server/services/emailService.js'
import { getAdminServices } from '../../server/services/firebaseAdmin.js'
import { createNewsletterService } from '../../server/services/newsletterService.js'
import { createCheckoutService } from '../../server/services/checkoutService.js'
import { createCheckoutDeliveryService } from '../../server/services/checkoutDeliveryService.js'

const BODY_LIMIT_BYTES = 20 * 1024
const RATE_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMITS = {
  '/contact': 6,
  '/newsletter/subscribe': 6,
  '/registration-notice': 6,
  '/checkout': 10,
}
const requestLog = new Map()
let emailService

function response(status, payload, headers = {}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  })
}

function getRequestId(context) {
  return context?.requestId || randomUUID()
}

function getCorsHeaders(origin) {
  const allowedOrigins = getConfig().cors.allowedOrigins
  const isAllowed = !origin || allowedOrigins.includes(origin) || (allowedOrigins.length === 0 && origin === 'http://localhost:5173')
  if (!isAllowed) return null

  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}

function isRateLimited(request, route, context) {
  const now = Date.now()
  const ip = context?.ip
    || request.headers.get('x-nf-client-connection-ip')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
  const key = route + ':' + ip
  const recent = (requestLog.get(key) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS)

  if (recent.length >= RATE_LIMITS[route]) {
    requestLog.set(key, recent)
    return true
  }

  recent.push(now)
  requestLog.set(key, recent)

  if (requestLog.size > 1500) {
    for (const [entry, timestamps] of requestLog.entries()) {
      if (timestamps.every((timestamp) => now - timestamp >= RATE_WINDOW_MS)) requestLog.delete(entry)
    }
  }
  return false
}

async function readPayload(request) {
  const declaredLength = Number(request.headers.get('content-length') || 0)
  if (declaredLength > BODY_LIMIT_BYTES) {
    const error = new Error('Request body is too large.')
    error.statusCode = 413
    throw error
  }

  const raw = await request.text()
  if (Buffer.byteLength(raw, 'utf8') > BODY_LIMIT_BYTES) {
    const error = new Error('Request body is too large.')
    error.statusCode = 413
    throw error
  }

  try {
    const payload = JSON.parse(raw || '{}')
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) throw new Error('Invalid object')
    return payload
  } catch {
    const error = new Error('Request body must contain valid JSON.')
    error.statusCode = 400
    throw error
  }
}

function getEmailService(required = true) {
  const config = getConfig()
  if (!config.email.pass) {
    if (!required) return null
    const error = new Error('Email service is not configured.')
    error.statusCode = 503
    throw error
  }

  if (!emailService) emailService = createEmailService(config)
  return emailService
}

function getFirebaseAdmin() {
  try {
    return getAdminServices()
  } catch {
    const error = new Error('Firebase Admin service is not configured.')
    error.statusCode = 503
    throw error
  }
}

function invalidPayload(validation, message, requestId, headers) {
  if (validation.isValid && validation.sanitizedData) return null
  return response(400, {
    success: false,
    error: message,
    details: validation.errors,
    requestId,
  }, headers)
}

export async function handleRequest(request, context = {}) {
  const requestId = getRequestId(context)
  const url = new URL(request.url)
  const route = url.pathname.replace(/\/$/, '') || '/'
  const origin = request.headers.get('origin')
  const corsHeaders = getCorsHeaders(origin)

  if (!corsHeaders) {
    return response(403, { success: false, error: 'Origin not allowed.', requestId })
  }

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (route === '/health') {
    if (request.method !== 'GET') {
      return response(405, { success: false, error: 'Method not allowed.', requestId }, {
        ...corsHeaders,
        Allow: 'GET, OPTIONS',
      })
    }
    return response(200, {
      status: 'OK',
      service: 'art-syntex-serverless-api',
      timestamp: new Date().toISOString(),
    }, corsHeaders)
  }

  if (request.method !== 'POST' || !Object.hasOwn(RATE_LIMITS, route)) {
    return response(404, { success: false, error: 'Route not found.', requestId }, corsHeaders)
  }

  if (isRateLimited(request, route, context)) {
    return response(429, {
      success: false,
      error: 'Too many requests. Please try again later.',
      requestId,
    }, corsHeaders)
  }

  try {
    const payload = await readPayload(request)

    if (route === '/contact') {
      const validation = validateContactPayload(payload)
      const invalid = invalidPayload(validation, 'Invalid contact request.', requestId, corsHeaders)
      if (invalid) return invalid

      await getEmailService().sendContactEmails(validation.sanitizedData)
      return response(200, { success: true, requestId }, corsHeaders)
    }

    if (route === '/newsletter/subscribe') {
      const validation = validateNewsletterPayload(payload)
      const invalid = invalidPayload(validation, 'Invalid newsletter subscription.', requestId, corsHeaders)
      if (invalid) return invalid

      const adminServices = getFirebaseAdmin()
      const newsletterService = createNewsletterService(getEmailService(), adminServices)
      const result = await newsletterService.subscribe(validation.sanitizedData)
      return response(200, { success: true, ...result, requestId }, corsHeaders)
    }

    if (route === '/registration-notice') {
      const validation = validateRegistrationPayload(payload)
      const invalid = invalidPayload(validation, 'Invalid registration notice.', requestId, corsHeaders)
      if (invalid) return invalid

      await getEmailService().sendRegistrationNotice(validation.sanitizedData)
      return response(200, { success: true, requestId }, corsHeaders)
    }

    const authorization = request.headers.get('authorization') || ''
    if (!authorization.startsWith('Bearer ')) {
      return response(401, { success: false, error: 'Authentication required.', requestId }, corsHeaders)
    }

    const adminServices = getFirebaseAdmin()
    const checkoutService = createCheckoutService(adminServices)
    const deliveryService = createCheckoutDeliveryService(
      checkoutService,
      getEmailService(false),
    )
    const result = await deliveryService.createPendingOrder({
      idToken: authorization.slice(7),
      items: payload.items,
    })

    return response(201, { success: true, ...result, requestId }, corsHeaders)
  } catch (error) {
    const status = Number.isInteger(error?.statusCode) ? error.statusCode : 503
    const message = status < 500
      ? String(error.message || 'Request rejected.')
      : 'The request could not be completed. Check the API configuration and try again.'

    if (status >= 500) console.error('Art-Syntex serverless API request failed.')
    return response(status, { success: false, error: message, requestId }, corsHeaders)
  }
}

export default async (request, context) => handleRequest(request, context)

export const config = {
  path: [
    '/health',
    '/contact',
    '/newsletter/subscribe',
    '/registration-notice',
    '/checkout',
  ],
}
