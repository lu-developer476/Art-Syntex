export function createCheckoutController(checkoutService) {
  return async function checkoutController(req, res, next) {
    try {
      const result = await checkoutService.createPendingOrder({
        idToken: req.get('authorization').slice(7),
        items: req.body?.items,
      })

      return res.status(201).json({ success: true, ...result, requestId: req.requestId })
    } catch (error) {
      return next(error)
    }
  }
}
