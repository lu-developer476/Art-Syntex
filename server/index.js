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

app.listen(config.port, () => {
  const mailStatus = config.smtp.configured ? 'configured' : 'not configured'
  console.log(`[INFO] Art-Syntex API running on port ${config.port}. SMTP: ${mailStatus}.`)
})
