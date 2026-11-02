import nodemailer from 'nodemailer'
import { ExternalServiceError } from '../core/errors.js'

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}

function renderEmailShell({ eyebrow, title, body, ctaLabel, ctaHref, footer }) {
  return `<!doctype html>
  <html lang="es">
    <body style="margin:0;padding:0;background:#05010d;font-family:Arial,sans-serif;color:#f5ebff;">
      <div style="max-width:680px;margin:0 auto;padding:32px 20px;">
        <div style="border:1px solid rgba(192,132,252,.45);border-radius:28px;padding:32px;background:linear-gradient(145deg,#240046 0%,#090015 45%,#0f172a 100%);box-shadow:0 0 45px rgba(147,51,234,.18);">
          <p style="margin:0 0 12px;font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:#67e8f9;">${escapeHtml(eyebrow)}</p>
          <h1 style="margin:0 0 16px;font-size:30px;line-height:1.15;color:#ffffff;">${escapeHtml(title)}</h1>
          <div style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#e9d5ff;">${body}</div>
          ${ctaHref && ctaLabel ? `<a href="${escapeHtml(ctaHref)}" style="display:inline-block;padding:14px 20px;border-radius:14px;background:#7e22ce;color:#fff;text-decoration:none;font-weight:700;letter-spacing:.06em;">${escapeHtml(ctaLabel)}</a>` : ''}
          <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#c4b5fd;">${escapeHtml(footer)}</p>
        </div>
      </div>
    </body>
  </html>`
}

export function createEmailService(config, transporter = null) {
  const mailer = transporter ?? nodemailer.createTransport({
    host: config.smtp?.host || 'smtp.gmail.com',
    port: config.smtp?.port || 465,
    secure: config.smtp?.secure ?? true,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  })

  async function sendContactEmails(data) {
    const safeEmail = escapeHtml(data.email)
    const safeMessage = escapeHtml(data.message).replace(/\n/g, '<br>')

    try {
      await mailer.sendMail({
        from: config.email.contactFrom || config.email.user,
        replyTo: data.email,
        to: config.email.receiver,
        subject: `Nueva consulta de ${data.name}`,
        text: [
          `Nombre: ${data.name}`,
          `Email: ${data.email}`,
          '',
          data.message,
        ].join('\n'),
        html: renderEmailShell({
          eyebrow: 'Nuevo contacto',
          title: `Mensaje de ${data.name}`,
          body: `<p style="margin:0 0 12px;">Se recibió un nuevo mensaje desde el sitio de Art-Syntex.</p><p style="margin:0 0 12px;"><strong>Email:</strong> ${safeEmail}</p><p style="margin:0;">${safeMessage}</p>`,
          ctaLabel: 'Abrir sitio',
          ctaHref: `${config.appBaseUrl}/contacto`,
          footer: 'Podés responder directamente a este correo para continuar la conversación.',
        }),
      })

      await mailer.sendMail({
        from: config.email.contactFrom || config.email.user,
        replyTo: config.email.contactReplyTo || config.email.receiver,
        to: data.email,
        subject: 'Art-Syntex | Recibimos tu mensaje',
        text: [
          `Hola ${data.name},`,
          '',
          'Recibimos tu mensaje correctamente. Nuestro equipo lo revisará y responderá a esta dirección de correo.',
          '',
          `Art-Syntex: ${config.appBaseUrl}/contacto`,
        ].join('\n'),
        html: renderEmailShell({
          eyebrow: 'Mensaje recibido',
          title: `Hola ${data.name}, recibimos tu mensaje.`,
          body: '<p style="margin:0 0 12px;">Tu mensaje quedó registrado correctamente. Nuestro equipo lo revisará y, si hace falta información adicional, se comunicará con vos por este mismo correo.</p><p style="margin:0;">Gracias por comunicarte con Art-Syntex.</p>',
          ctaLabel: 'Volver al sitio',
          ctaHref: `${config.appBaseUrl}/contacto`,
          footer: 'Si no reconocés esta solicitud, respondé este mensaje para que podamos revisar el incidente.',
        }),
      })
    } catch (error) {
      throw new ExternalServiceError()
    }
  }

  async function sendNewsletterWelcome(data) {
    try {
      await mailer.sendMail({
        from: config.email.newsletterFrom || config.email.user,
        replyTo: config.email.contactReplyTo || config.email.receiver,
        to: data.email,
        subject: 'Art-Syntex | Bienvenido al newsletter',
        text: [
          'Tu suscripción al newsletter de Art-Syntex quedó confirmada.',
          '',
          'A partir de ahora vas a recibir novedades sobre productos, lanzamientos y actualizaciones del proyecto.',
          '',
          `Sitio web: ${config.appBaseUrl}`,
          '',
          'Gracias por sumarte.',
        ].join('\n'),
        html: renderEmailShell({
          eyebrow: 'Suscripción confirmada',
          title: 'Ya estás en la lista.',
          body: '<p style="margin:0 0 12px;">Tu dirección quedó registrada correctamente en el newsletter de Art-Syntex.</p><p style="margin:0;">Vas a recibir novedades sobre productos, lanzamientos y actualizaciones del proyecto.</p>',
          ctaLabel: 'Visitar Art-Syntex',
          ctaHref: config.appBaseUrl,
          footer: 'Gracias por acompañar el proyecto.',
        }),
      })
    } catch (error) {
      throw new ExternalServiceError()
    }
  }

  async function sendRegistrationNotice(data) {
    try {
      await mailer.sendMail({
        from: config.email.registrationFrom || config.email.user,
        to: data.email,
        subject: 'Art-Syntex | Activá tu cuenta',
        text: [
          'Tu cuenta fue creada correctamente.',
          '',
          'Antes de operar, verificá tu dirección de correo usando el enlace que te enviamos desde Firebase Authentication.',
          '',
          'Centro de verificación:',
          data.verificationUrl,
        ].join('\n'),
        html: renderEmailShell({
          eyebrow: 'Acceso habilitado',
          title: 'Tu cuenta ya fue creada. Falta validar tu correo.',
          body: '<p style="margin:0 0 12px;">Ya generamos tu acceso a Art-Syntex. Para habilitar tu cuenta, necesitás validar el correo electrónico registrado.</p><p style="margin:0;">Revisá tu bandeja de entrada y abrí el enlace seguro de validación.</p>',
          ctaLabel: 'Ir al centro de verificación',
          ctaHref: data.verificationUrl,
          footer: 'Si no encontrás el correo de validación, revisá spam/promociones o solicitá un nuevo envío desde la sección de Acceso.',
        }),
      })
    } catch (error) {
      throw new ExternalServiceError()
    }
  }


  async function sendPurchaseOrderEmails({ order, pdfBuffer, fileName }) {
    const safeOrderId = escapeHtml(order.orderId)
    const safeCustomerName = escapeHtml(order.customerName || 'Cliente')
    const itemsText = order.items.map((item) =>
      '- ' + item.name + ' x' + item.quantity + ': USD ' + Number(item.lineTotal).toFixed(2),
    ).join('\\n')
    const itemsHtml = order.items.map((item) => (
      '<tr>'
      + '<td style="padding:9px;border-bottom:1px solid #342344;">' + escapeHtml(item.name) + '</td>'
      + '<td style="padding:9px;border-bottom:1px solid #342344;text-align:center;">' + item.quantity + '</td>'
      + '<td style="padding:9px;border-bottom:1px solid #342344;text-align:right;">USD ' + Number(item.unitPrice).toFixed(2) + '</td>'
      + '<td style="padding:9px;border-bottom:1px solid #342344;text-align:right;">USD ' + Number(item.lineTotal).toFixed(2) + '</td>'
      + '</tr>'
    )).join('')
    const attachment = [{
      filename: fileName,
      content: pdfBuffer,
      contentType: 'application/pdf',
    }]
    const receiver = config.email.orderReceiver || config.email.receiver

    const internalMessage = {
      from: config.email.contactFrom || config.email.user,
      replyTo: order.customerEmail,
      to: receiver,
      subject: 'Nueva orden de compra ' + order.orderId + ' | Art-Syntex',
      text: [
        'Orden: ' + order.orderId,
        'Cliente: ' + order.customerName,
        'Correo: ' + order.customerEmail,
        'Estado: Pendiente de confirmación / pago',
        '',
        itemsText,
        '',
        'Total: USD ' + Number(order.total).toFixed(2),
        'Se adjunta el PDF de la orden.',
      ].join('\\n'),
      html: renderEmailShell({
        eyebrow: 'Nueva orden de compra',
        title: 'Orden ' + safeOrderId,
        body: '<p><strong>Cliente:</strong> ' + safeCustomerName + '</p>'
          + '<p><strong>Correo:</strong> ' + escapeHtml(order.customerEmail) + '</p>'
          + '<p><strong>Estado:</strong> Pendiente de confirmación / pago</p>'
          + '<table style="width:100%;border-collapse:collapse;margin-top:18px;">'
          + '<thead><tr><th>Producto</th><th>Cant.</th><th>Unitario</th><th>Subtotal</th></tr></thead>'
          + '<tbody>' + itemsHtml + '</tbody></table>'
          + '<h2 style="text-align:right;">Total: USD ' + Number(order.total).toFixed(2) + '</h2>'
          + '<p>El PDF de la orden está adjunto.</p>',
        ctaLabel: 'Abrir Art-Syntex',
        ctaHref: config.appBaseUrl,
        footer: 'El checkout no procesa ni confirma un pago.',
      }),
      attachments: attachment,
    }

    const customerMessage = {
      from: config.email.contactFrom || config.email.user,
      replyTo: config.email.contactReplyTo || receiver,
      to: order.customerEmail,
      subject: 'Art-Syntex | Orden de compra ' + order.orderId + ' registrada',
      text: [
        'Hola ' + order.customerName + ',',
        '',
        'Registramos tu orden ' + order.orderId + ' por USD ' + Number(order.total).toFixed(2) + '.',
        'El estado actual es pendiente de confirmación / pago; este correo no acredita un pago.',
        '',
        'Adjuntamos el PDF con el detalle de tu orden.',
        config.appBaseUrl,
      ].join('\\n'),
      html: renderEmailShell({
        eyebrow: 'Orden registrada',
        title: 'Hola ' + safeCustomerName + ', recibimos tu pedido.',
        body: '<p>Registramos tu orden <strong>' + safeOrderId + '</strong> por <strong>USD ' + Number(order.total).toFixed(2) + '</strong>.</p>'
          + '<p>El estado actual es <strong>pendiente de confirmación / pago</strong>. No se ha procesado ni confirmado ningún pago.</p>'
          + '<p>Adjuntamos el PDF con el detalle de la orden.</p>',
        ctaLabel: 'Visitar Art-Syntex',
        ctaHref: config.appBaseUrl,
        footer: 'Si no reconocés esta operación, respondé este correo para solicitar una revisión.',
      }),
      attachments: attachment,
    }

    const sendSafely = async (message) => {
      try {
        await mailer.sendMail(message)
        return true
      } catch {
        return false
      }
    }

    const [internal, customer] = await Promise.all([
      sendSafely(internalMessage),
      sendSafely(customerMessage),
    ])

    return { internal, customer }
  }

  return { sendContactEmails, sendNewsletterWelcome, sendRegistrationNotice, sendPurchaseOrderEmails, transporter: mailer }
}
