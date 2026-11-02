const DEFAULT_EMAIL_USER = 'lucasmontenegroburgos@gmail.com'

const REQUIRED_ENV_VARS = [
  'EMAIL_PASS',
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
]

function readOptionalEnv(env, name, fallback = '') {
  return env[name]?.trim() || fallback
}

function readPort(value, fallback = 465) {
  const port = Number.parseInt(value ?? '', 10)
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : fallback
}

function readBoolean(value, fallback) {
  if (value == null || value.trim() === '') return fallback
  return ['true', '1', 'yes'].includes(value.trim().toLowerCase())
}

function readAllowedOrigins(env) {
  const configured = readOptionalEnv(env, 'ALLOWED_ORIGINS')
  const legacy = readOptionalEnv(env, 'ALLOWED_ORIGIN')
  const raw = configured || legacy

  if (!raw) return []

  return raw.split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean)
}

export function getConfig(env = process.env) {
  const missing = REQUIRED_ENV_VARS.filter((name) => !env[name]?.trim())
  const allowedOrigins = readAllowedOrigins(env)
  const appBaseUrl = readOptionalEnv(env, 'APP_BASE_URL', allowedOrigins[0] || 'http://localhost:5173').replace(/\/$/, '')
  const emailUser = readOptionalEnv(env, 'EMAIL_USER', DEFAULT_EMAIL_USER)
  const contactReceiver = readOptionalEnv(env, 'CONTACT_RECEIVER_EMAIL', emailUser)

  return {
    port: readPort(env.PORT, 3001),
    smtp: {
      host: readOptionalEnv(env, 'SMTP_HOST', 'smtp.gmail.com'),
      port: readPort(env.SMTP_PORT, 465),
      secure: readBoolean(env.SMTP_SECURE, readPort(env.SMTP_PORT, 465) === 465),
    },
    email: {
      user: emailUser,
      pass: readOptionalEnv(env, 'EMAIL_PASS'),
      receiver: contactReceiver,
      contactFrom: readOptionalEnv(env, 'CONTACT_FROM', emailUser),
      contactReplyTo: readOptionalEnv(env, 'CONTACT_REPLY_TO', contactReceiver),
      newsletterFrom: readOptionalEnv(env, 'NEWSLETTER_FROM', emailUser),
      registrationFrom: readOptionalEnv(env, 'REGISTRATION_FROM', emailUser),
    },
    cors: { allowedOrigins },
    appBaseUrl,
    missing,
  }
}

export function assertRequiredConfig(config) {
  if (config.missing.length > 0) {
    throw new Error(`Missing required environment variables: ${config.missing.join(', ')}`)
  }
}
