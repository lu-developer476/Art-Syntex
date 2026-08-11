import { randomUUID } from 'node:crypto'

export function requestId(req, res, next) {
  const incomingId = req.get('x-request-id')
  const id = incomingId && incomingId.length <= 100 ? incomingId : randomUUID()

  req.requestId = id
  res.setHeader('X-Request-ID', id)
  next()
}
