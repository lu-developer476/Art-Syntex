export function createCheckoutController(checkoutDeliveryService) {
  return async function checkoutController(req, res, next) {
    try {
      const result = await checkoutDeliveryService.createPendingOrder({
        firebaseUser: req.firebaseUser ?? null,
        customer: req.body?.customer,
        items: req.body?.items,
      })

      return res.status(201).json({ success: true, ...result, requestId: req.requestId })
    } catch (error) {
      return next(error)
    }
  }
}
