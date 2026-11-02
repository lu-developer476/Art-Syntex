import { createPurchaseOrderPdf } from './purchaseOrderPdf.js'

export function createCheckoutDeliveryService(checkoutService, emailService = null) {
  async function createPendingOrder(input) {
    const order = await checkoutService.createPendingOrder(input)
    const pdfFileName = 'orden-de-compra-' + String(order.orderId).replace(/[^a-zA-Z0-9_-]/g, '') + '.pdf'
    let pdfBuffer = null
    let emailDelivery = { internal: false, customer: false }

    try {
      pdfBuffer = createPurchaseOrderPdf(order)
    } catch {
      console.error('Could not generate the purchase order PDF.')
    }

    if (pdfBuffer && typeof emailService?.sendPurchaseOrderEmails === 'function') {
      try {
        emailDelivery = await emailService.sendPurchaseOrderEmails({
          order,
          pdfBuffer,
          fileName: pdfFileName,
        })
      } catch {
        console.error('Could not deliver the purchase order emails.')
      }
    }

    return {
      ...order,
      pdfReady: Boolean(pdfBuffer),
      pdfFileName,
      pdfBase64: pdfBuffer ? pdfBuffer.toString('base64') : null,
      emailDelivery,
    }
  }

  return { createPendingOrder }
}
