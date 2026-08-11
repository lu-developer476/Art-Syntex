const BLOCKED_METHODS = new Set(['TRACE', 'CONNECT'])

export function requestGuards(req, res, next) {
  if (BLOCKED_METHODS.has(req.method)) {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed.',
    })
  }

  if (req.is('application/json') && req.body && typeof req.body !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON payload.',
    })
  }

  return next()
}
