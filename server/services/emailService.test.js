import { describe, expect, it, vi } from 'vitest'
import { createEmailService } from './emailService.js'

describe('email service sender configuration', () => {
  it('uses the configured from addresses for contact, newsletter, and registration emails', async () => {
    const transporter = { sendMail: vi.fn().mockResolvedValue({ messageId: 'test-message' }) }
    const config = {
      smtp: { host: 'smtp.gmail.com', port: 465, secure: true },
      email: {
        user: 'lucasmontenegroburgos@gmail.com',
        pass: 'app-password',
        receiver: 'lucasmontenegroburgos@gmail.com',
        contactFrom: 'contacto@example.net',
        contactReplyTo: 'support@example.net',
        newsletterFrom: 'newsletters@example.net',
        registrationFrom: 'accounts@example.net',
      },
      appBaseUrl: 'https://art-syntex.example',
    }
    const service = createEmailService(config, transporter)

    await service.sendContactEmails({
      name: 'Lu',
      email: 'visitor@example.com',
      message: 'I would like to know more about the project.',
    })
    await service.sendNewsletterWelcome({ email: 'subscriber@example.com' })
    await service.sendRegistrationNotice({
      email: 'new-user@example.com',
      verificationUrl: 'https://art-syntex.example/verificar-email',
    })

    expect(transporter.sendMail).toHaveBeenCalledTimes(4)
    expect(transporter.sendMail.mock.calls[0][0]).toMatchObject({
      from: 'contacto@example.net',
      replyTo: 'visitor@example.com',
      to: 'lucasmontenegroburgos@gmail.com',
    })
    expect(transporter.sendMail.mock.calls[1][0]).toMatchObject({
      from: 'contacto@example.net',
      replyTo: 'support@example.net',
      to: 'visitor@example.com',
    })
    expect(transporter.sendMail.mock.calls[2][0]).toMatchObject({
      from: 'newsletters@example.net',
      to: 'subscriber@example.com',
    })
    expect(transporter.sendMail.mock.calls[3][0]).toMatchObject({
      from: 'accounts@example.net',
      to: 'new-user@example.com',
    })
  })

  it('escapes user-provided HTML in contact notifications', async () => {
    const transporter = { sendMail: vi.fn().mockResolvedValue({ messageId: 'test-message' }) }
    const service = createEmailService({
      email: {
        user: 'lucasmontenegroburgos@gmail.com',
        receiver: 'lucasmontenegroburgos@gmail.com',
      },
      appBaseUrl: 'https://art-syntex.example',
    }, transporter)

    await service.sendContactEmails({
      name: 'Lu',
      email: 'visitor@example.com',
      message: '<script>alert(1)</script> Check this message.',
    })

    expect(transporter.sendMail.mock.calls[0][0].html).not.toContain('<script>')
    expect(transporter.sendMail.mock.calls[0][0].html).toContain('&lt;script&gt;')
  })

  it('attaches the purchase order PDF to both internal and customer emails', async () => {
    const pdfBuffer = Buffer.from('%PDF-1.4 test document')
    const transporter = { sendMail: vi.fn().mockResolvedValue({ messageId: 'order-message' }) }
    const service = createEmailService({
      email: {
        user: 'lucasmontenegroburgos@gmail.com',
        pass: 'app-password',
        receiver: 'contact@example.com',
        orderReceiver: 'orders@example.com',
        contactFrom: 'lucasmontenegroburgos@gmail.com',
        contactReplyTo: 'contact@example.com',
      },
      appBaseUrl: 'https://art-syntex.example',
    }, transporter)

    const result = await service.sendPurchaseOrderEmails({
      order: {
        orderId: 'AS-ORDER-001',
        customerName: 'Cliente',
        customerEmail: 'buyer@example.com',
        items: [{ name: 'Implante', quantity: 2, unitPrice: 50, lineTotal: 100 }],
        total: 100,
      },
      pdfBuffer,
      fileName: 'orden-de-compra-AS-ORDER-001.pdf',
    })

    expect(result).toEqual({ internal: true, customer: true })
    expect(transporter.sendMail).toHaveBeenCalledTimes(2)
    expect(transporter.sendMail.mock.calls[0][0]).toMatchObject({
      to: 'orders@example.com',
      attachments: [{
        filename: 'orden-de-compra-AS-ORDER-001.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    })
    expect(transporter.sendMail.mock.calls[1][0]).toMatchObject({
      to: 'buyer@example.com',
      attachments: [{
        filename: 'orden-de-compra-AS-ORDER-001.pdf',
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    })
  })

})