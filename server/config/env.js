const REQUIRED_ENV_VARS = ['EMAIL_USER', 'EMAIL_PASS']

function readOptionalEnv(env, name, fallback = '') {
  return env[name]?.trim() || fallback
}

function readPort(value, fallback = 3001) {
  const port = Number.parseInt(value ?? '', 10)
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : fallback
}

function readAllowedOrigins(env) {
  const configured = readOptionalEnv(env, 'ALLOWED_ORIGINS')
  const legacy = readOptionalEnv(env, 'ALLOWED_ORIGIN')
  const raw = configured || legacy

  if (!raw) return []

  return raw
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
}

export function getConfig(env = process.env) {
  const missing = REQUIRED_ENV_VARS.filter((name) => !env[name]?.trim())
  const allowedOrigins = readAllowedOrigins(env)
  const appBaseUrl = readOptionalEnv(
    env,
    'APP_BASE_URL',
    allowedOrigins[0] || 'http://localhost:5173',
  ).replace(/\/$/, '')

  return {
    port: readPort(env.PORT),
    email: {
      user: readOptionalEnv(env, 'EMAIL_USER'),
      pass: readOptionalEnv(env, 'EMAIL_PASS'),
      receiver: readOptionalEnv(
        env,
        'CONTACT_RECEIVER_EMAIL',
        readOptionalEnv(env, 'EMAIL_USER'),
      ),
    },
    cors: {
      allowedOrigins,
    },
    appBaseUrl,
    missing,
  }
}

export function assertRequiredConfig(config) {
  if (config.missing.length > 0) {
    throw new Error(`Missing required environment variables: ${config.missing.join(', ')}`)
  }
}
