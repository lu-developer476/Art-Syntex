import { getAdminServices } from '../services/firebaseAdmin.js'

export function createFirebaseAuthenticator(services, { optional = false } = {}) {
  return async function authenticateFirebase(req, res, next) {
    const authorization = req.get('authorization')

    if (!authorization?.startsWith('Bearer ')) {
      if (optional) return next()
      return res.status(401).json({ success: false, error: 'Authentication required.', requestId: req.requestId })
    }

    try {
      const adminServices = services ?? getAdminServices()
      req.firebaseUser = await adminServices.auth.verifyIdToken(authorization.slice(7))
      return next()
    } catch {
      return res.status(401).json({ success: false, error: 'Invalid authentication token.', requestId: req.requestId })
    }
  }
}
