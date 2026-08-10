import nodemailer from 'nodemailer'
import { ExternalServiceError } from '../core/errors.js'

function renderEmailShell({ eyebrow, title, body, ctaLabel, ctaHref, footer }) {
  return `<!doctype html>
  <html lang="es">
    <body style="margin:0;padding:0;background:#05010d;font-family:Arial,sans-serif;color:#f5ebff;">
      <div style="max-width:680px;margin:0 auto;padding:32px 20px;">
        <div style="border:1px solid rgba(192,132,252,.45);border-radius:28px;padding:32px;background:linear-gradient(145deg,#240046 0%,#090015 45%,#0f172a 100%);box-shadow:0 0 45px rgba(147,51,234,.18);">
          <p style="margin:0 0 12px;font-size:12px;letter-spacing:.3em;text-transform:uppercase;color:#67e8f9;">${eyebrow}</p>
          <h1 style="margin:0 0 16px;font-size:30px;line-height:1.15;color:#ffffff;">${title}</h1>
          <div style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#e9d5ff;">${body}</div>
          ${ctaHref && ctaLabel ? `<a href="${ctaHref}" style="display:inline-block;padding:14px 20px;border-radius:14px;background:#7e22ce;color:#fff;text-decoration:none;font-weight:700;letter-spacing:.06em;">${ctaLabel}</a>` : ''}
          <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#c4b5fd;">${footer}</p>
        </div>
      </div>
    </body>
  </html>`
}

export function createEmailService(config, transporter = null) {
  const mailer = transporter ?? nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  })

  async function sendContactEmails(data) {
    try {
      await mailer.sendMail({
        from: config.email.user,
        replyTo: data.email,
        to: config.email.receiver,
        subject: `Nueva postulación de ${data.name}`,
        text: [
          `Nombre: ${data.name}`,
          `Email: ${data.email}`,
          '',
          data.message,
        ].join('\n'),
        html: renderEmailShell({
          eyebrow: 'Nuevo contacto',
          title: `Solicitud de ${data.name}`,
          body: `<p style="margin:0 0 12px;">Se recibió una nueva postulación desde el portal de A/S Nexus.</p><p style="margin:0 0 12px;"><strong>Email:</strong> ${data.email}</p><p style="margin:0;">${data.message}</p>`,
          ctaLabel: 'Abrir panel',
          ctaHref: `${config.appBaseUrl}/contacto`,
          footer: 'Podés responder directamente a este correo para continuar la conversación con el postulante.',
        }),
      })

      await mailer.sendMail({
        from: config.email.user,
        to: data.email,
        subject: 'A/S Nexus | Recibimos tu postulación',
        text: [
          `Hola ${data.name},`,
          '',
          'Recibimos tu presentación correctamente. Nuestro equipo ya está revisando tu perfil y te contactará si encaja con una operación activa.',
          '',
          'Podés volver al portal cuando quieras:',
          `${config.appBaseUrl}/contacto`,
        ].join('\n'),
        html: renderEmailShell({
          eyebrow: 'Contacto recibido',
          title: `Hola ${data.name}, tu perfil ya ingresó a la red.`,
          body: '<p style="margin:0 0 12px;">Recibimos tu presentación y quedó registrada para evaluación. Si tu especialidad coincide con una operación activa, el equipo se comunicará por este mismo correo.</p><p style="margin:0;">Mientras tanto, podés seguir explorando el ecosistema de implantes y sistemas tácticos de A/S Nexus.</p>',
          ctaLabel: 'Volver al portal',
          ctaHref: `${config.appBaseUrl}/contacto`,
          footer: 'Si no reconocés esta solicitud, respondé este mensaje para que podamos revisar el incidente.',
        }),
      })
    } catch (error) {
      throw new ExternalServiceError()
    }
  }

  async function sendRegistrationNotice(data) {
    try {
      await mailer.sendMail({
        from: config.email.user,
        to: data.email,
        subject: 'A/S Nexus | Activá tu cuenta',
        text: [
          'Tu cuenta fue creada correctamente.',
          '',
          'Antes de operar en la red, verificá tu dirección de correo usando el enlace que te enviamos desde Firebase Authentication.',
          '',
          'Centro de verificación:',
          data.verificationUrl,
        ].join('\n'),
        html: renderEmailShell({
          eyebrow: 'Acceso habilitado',
          title: 'Tu cuenta ya fue creada. Falta validar tu correo.',
          body: '<p style="margin:0 0 12px;">Ya generamos tu acceso en A/S Nexus. Para habilitar ingresos y compras, necesitás validar el correo electrónico registrado.</p><p style="margin:0;">Entrá al centro de verificación y seguí la instrucción principal: revisar la bandeja del correo usado durante el alta y abrir el enlace seguro de validación.</p>',
          ctaLabel: 'Ir al centro de verificación',
          ctaHref: data.verificationUrl,
          footer: 'Si no encontrás el correo de validación, revisá spam/promociones o solicitá un nuevo envío desde la sección de Acceso.',
        }),
      })
    } catch (error) {
      throw new ExternalServiceError()
    }
  }

  return { sendContactEmails, sendRegistrationNotice, transporter: mailer }
}
