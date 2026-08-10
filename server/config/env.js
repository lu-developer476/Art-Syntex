const REQUIRED_ENV_VARS = ['EMAIL_USER', 'EMAIL_PASS']

function readOptionalEnv(name, fallback = '') {
  return process.env[name]?.trim() || fallback
}

function readPort(value, fallback = 3001) {
  const port = Number.parseInt(value ?? '', 10)
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : fallback
}

export function getConfig(env = process.env) {
  const missing = REQUIRED_ENV_VARS.filter((name) => !env[name]?.trim())
  const allowedOrigin = readOptionalEnv('ALLOWED_ORIGIN')

  return {
    port: readPort(env.PORT),
    email: {
      user: readOptionalEnv('EMAIL_USER'),
      pass: readOptionalEnv('EMAIL_PASS'),
      receiver: readOptionalEnv('CONTACT_RECEIVER_EMAIL', readOptionalEnv('EMAIL_USER')),
    },
    cors: {
      allowedOrigin,
    },
    appBaseUrl: (readOptionalEnv('APP_BASE_URL', allowedOrigin || 'http://localhost:5173')).replace(/\/$/, ''),
    missing,
  }
}

export function assertRequiredConfig(config) {
  if (config.missing.length > 0) {
    throw new Error(`Missing required environment variables: ${config.missing.join(', ')}`)
  }
}
