import { createApp } from './app.js'
import { assertRequiredConfig, getConfig } from './config/env.js'

const config = getConfig()

try {
  assertRequiredConfig(config)
} catch (error) {
  console.error(`[ERROR] ${error.message}`)
  process.exit(1)
}

const app = createApp(config)
const emailService = app.locals.emailService

async function startServer() {
  try {
    await emailService.transporter.verify()
    app.listen(config.port, () => {
      console.log(`[INFO] Mail server running on ${config.port}`)
    })
  } catch (error) {
    console.error('[ERROR] Mail transporter verification failed.', error)
    process.exit(1)
  }
}

startServer()
