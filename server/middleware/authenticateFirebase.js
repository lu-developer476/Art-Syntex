import { getAdminServices } from '../services/firebaseAdmin.js'

export function createFirebaseAuthenticator(services) {
  return async function authenticateFirebase(req, res, next) {
    try {
      const authorization = req.get('authorization')
      if (!authorization?.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, error: 'Authentication required.', requestId: req.requestId })
      }

      const adminServices = services ?? getAdminServices()
      req.firebaseUser = await adminServices.auth.verifyIdToken(authorization.slice(7))
      return next()
    } catch {
      return res.status(401).json({ success: false, error: 'Invalid authentication token.', requestId: req.requestId })
    }
  }
}
