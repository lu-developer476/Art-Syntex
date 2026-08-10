import cors from 'cors'
import express from 'express'
import nodemailer from 'nodemailer'
import { validateContactPayload, validateRegistrationPayload } from './validation.js'

const REQUIRED_ENV_VARS = ['EMAIL_USER', 'EMAIL_PASS']
const missingEnvVars = REQUIRED_ENV_VARS.filter((envVar) => !process.env[envVar]?.trim())

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`)
  process.exit(1)
}

const PORT = Number.parseInt(process.env.PORT ?? '3001', 10)
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 6
const requestLog = new Map()

const app = express()
const allowedOrigin = process.env.ALLOWED_ORIGIN?.trim()
const contactReceiver = process.env.CONTACT_RECEIVER_EMAIL?.trim() || process.env.EMAIL_USER
const appBaseUrl = (process.env.APP_BASE_URL?.trim() || allowedOrigin || 'http://localhost:5173').replace(/\/$/, '')

app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(
  cors(
    allowedOrigin
      ? {
          origin: allowedOrigin,
        }
      : undefined,
  ),
)
app.use(express.json({ limit: '10kb' }))

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for']

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim()
  }

  return req.ip || req.socket.remoteAddress || 'unknown'
}

function applyRateLimit(req, res, next) {
  const now = Date.now()
  const clientIp = getClientIp(req)
  const recentRequests = (requestLog.get(clientIp) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  )

  if (recentRequests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
    })
  }

  recentRequests.push(now)
  requestLog.set(clientIp, recentRequests)

  for (const [ip, timestamps] of requestLog.entries()) {
    const validTimestamps = timestamps.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS)

    if (validTimestamps.length === 0) {
      requestLog.delete(ip)
      continue
    }

    requestLog.set(ip, validTimestamps)
  }

  return next()
}

function renderEmailShell({ eyebrow, title, body, ctaLabel, ctaHref, footer }) {
  return `<!doctype html>
  <html lang="es">
    <body style="margin:0;padding:0;background:#05010d;font-family:Arial,sans-serif;color:#f5ebff;">
      <div style="max-width:680px;margin:0 auto;padding:32px 20px;">
        <div style="border:1px solid rgba(192,132,252,.45);border-radius:28px;padding:32px;background:linear-gradient(145deg,#240046 0%,#090015 45%,#0f172a 100%);box-shadow:0 0 45px rgba(147,51,234,.18);">
          <p style="margin:0 0 12px;font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:#67e8f9;">${eyebrow}</p>
          <h1 style="margin:0 0 16px;font-size:30px;line-height:1.15;color:#ffffff;">${title}</h1>
          <div style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#e9d5ff;">${body}</div>
          ${ctaHref && ctaLabel ? `<a href="${ctaHref}" style="display:inline-block;padding:14px 20px;border-radius:14px;background:#7e22ce;color:#fff;text-decoration:none;font-weight:700;letter-spacing:.06em;">${ctaLabel}</a>` : ''}
          <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#c4b5fd;">${footer}</p>
        </div>
      </div>
    </body>
  </html>`
}

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK' })
})

app.post('/contact', applyRateLimit, async (req, res) => {
  const { isValid, errors, sanitizedData } = validateContactPayload(req.body)

  if (!isValid || !sanitizedData) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request payload.',
      details: errors,
    })
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      replyTo: sanitizedData.email,
      to: contactReceiver,
      subject: `Nueva postulación de ${sanitizedData.name}`,
      text: [
        `Nombre: ${sanitizedData.name}`,
        `Email: ${sanitizedData.email}`,
        '',
        sanitizedData.message,
      ].join('\n'),
      html: renderEmailShell({
        eyebrow: 'Nuevo contacto',
        title: `Solicitud de ${sanitizedData.name}`,
        body: `<p style="margin:0 0 12px;">Se recibió una nueva postulación desde el portal de A/S Nexus.</p><p style="margin:0 0 12px;"><strong>Email:</strong> ${sanitizedData.email}</p><p style="margin:0;">${sanitizedData.message}</p>`,
        ctaLabel: 'Abrir panel',
        ctaHref: `${appBaseUrl}/contacto`,
        footer: 'Podés responder directamente a este correo para continuar la conversación con el postulante.',
      }),
    })

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: sanitizedData.email,
      subject: 'A/S Nexus | Recibimos tu postulación',
      text: [
        `Hola ${sanitizedData.name},`,
        '',
        'Recibimos tu presentación correctamente. Nuestro equipo ya está revisando tu perfil y te contactará si encaja con una operación activa.',
        '',
        'Podés volver al portal cuando quieras:',
        `${appBaseUrl}/contacto`,
      ].join('\n'),
      html: renderEmailShell({
        eyebrow: 'Contacto recibido',
        title: `Hola ${sanitizedData.name}, tu perfil ya ingresó a la red.`,
        body: '<p style="margin:0 0 12px;">Recibimos tu presentación y quedó registrada para evaluación. Si tu especialidad coincide con una operación activa, el equipo se comunicará por este mismo correo.</p><p style="margin:0;">Mientras tanto, podés seguir explorando el ecosistema de implantes y sistemas tácticos de A/S Nexus.</p>',
        ctaLabel: 'Volver al portal',
        ctaHref: `${appBaseUrl}/contacto`,
        footer: 'Si no reconocés esta solicitud, respondé este mensaje para que podamos revisar el incidente.',
      }),
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Failed to process contact email.', error)

    return res.status(502).json({
      success: false,
      error: 'Unable to process the request right now.',
    })
  }
})

app.post('/registration-notice', applyRateLimit, async (req, res) => {
  const { isValid, errors, sanitizedData } = validateRegistrationPayload(req.body)

  if (!isValid || !sanitizedData) {
    return res.status(400).json({
      success: false,
      error: 'Invalid request payload.',
      details: errors,
    })
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: sanitizedData.email,
      subject: 'A/S Nexus | Activá tu cuenta',
      text: [
        'Tu cuenta fue creada correctamente.',
        '',
        'Antes de operar en la red, verificá tu dirección de correo usando el enlace que te enviamos desde Firebase Authentication.',
        '',
        'Centro de verificación:',
        sanitizedData.verificationUrl,
      ].join('\n'),
      html: renderEmailShell({
        eyebrow: 'Acceso habilitado',
        title: 'Tu cuenta ya fue creada. Falta validar tu correo.',
        body: '<p style="margin:0 0 12px;">Ya generamos tu acceso en A/S Nexus. Para habilitar ingresos y compras, necesitás validar el correo electrónico registrado.</p><p style="margin:0;">Entrá al centro de verificación y seguí la instrucción principal: revisar la bandeja del correo usado durante el alta y abrir el enlace seguro de validación.</p>',
        ctaLabel: 'Ir al centro de verificación',
        ctaHref: sanitizedData.verificationUrl,
        footer: 'Si no encontrás el correo de validación, revisá spam/promociones o solicitá un nuevo envío desde la sección de Acceso.',
      }),
    })

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Failed to send registration notice.', error)

    return res.status(502).json({
      success: false,
      error: 'Unable to process the request right now.',
    })
  }
})

async function startServer() {
  try {
    await transporter.verify()
    app.listen(PORT, () => {
      console.log(`Mail server running on ${PORT}`)
    })
  } catch (error) {
    console.error('Mail transporter verification failed.', error)
    process.exit(1)
  }
}

startServer()
