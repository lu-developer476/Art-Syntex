const requestLog = new Map()

function getClientIp(req) {
  const forwardedFor = req.headers['x-forwarded-for']

  if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
    return forwardedFor.split(',')[0].trim()
  }

  return req.ip || req.socket.remoteAddress || 'unknown'
}

export function createRateLimiter({ windowMs, maxRequests, message = 'Too many requests. Please try again later.' }) {
  return (req, res, next) => {
    const now = Date.now()
    const clientIp = getClientIp(req)
    const recentRequests = (requestLog.get(clientIp) ?? []).filter(
      (timestamp) => now - timestamp < windowMs,
    )

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: message,
      })
    }

    recentRequests.push(now)
    requestLog.set(clientIp, recentRequests)

    if (requestLog.size > 1000) {
      for (const [ip, timestamps] of requestLog.entries()) {
        if (timestamps.every((timestamp) => now - timestamp >= windowMs)) {
          requestLog.delete(ip)
        }
      }
    }

    return next()
  }
}
