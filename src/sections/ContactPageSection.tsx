import { useState, type FormEvent } from 'react'
import ContactSection from '../components/home/ContactSection'
import { addNotification } from '../lib/home'
import { postMailService } from '../lib/api'
import { useI18n } from '../i18n'

export default function ContactPageSection() {
  const { t } = useI18n()
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactDescription, setContactDescription] = useState('')
  const [contactMessage, setContactMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterConsent, setNewsletterConsent] = useState(false)
  const [newsletterMessage, setNewsletterMessage] = useState<string | null>(null)
  const [isNewsletterSubmitting, setIsNewsletterSubmitting] = useState(false)

  const handleContactSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setContactMessage(null)

    if (contactDescription.trim().length < 20) {
      setContactMessage('El formulario debe ser claro y extenso para poder evaluarlo adecuadamente.')
      return
    }

    setIsSubmitting(true)

    try {
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('../firebase/config')

      await addDoc(collection(db, 'contactMessages'), {
        name: contactName,
        email: contactEmail,
        description: contactDescription,
        createdAt: serverTimestamp(),
      })

      let emailSent = false
      try {
        await postMailService({
          path: '/contact',
          payload: {
            name: contactName,
            email: contactEmail,
            message: contactDescription,
          },
        })
        emailSent = true
      } catch {
        // The contact request is already persisted in Firestore.
      }

      try {
        await addNotification(db, 'Nueva solicitud', 'Se ha recibido una solicitud desde el formulario de contacto', {
          email: contactEmail,
        })
      } catch {
        // Notifications are ancillary and may be unavailable for signed-out visitors.
      }

      setContactName('')
      setContactEmail('')
      setContactDescription('')
      setContactMessage(emailSent ? t('contactEmailSuccess') : t('contactSavedWithoutEmail'))
    } catch {
      setContactMessage('No se pudo registrar el mensaje. Revisá tu conexión e intentá nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNewsletterSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setNewsletterMessage(null)

    const normalizedEmail = newsletterEmail.trim().toLowerCase()
    if (!newsletterConsent || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setNewsletterMessage(t('newsletterValidation'))
      return
    }

    setIsNewsletterSubmitting(true)

    try {
      const { doc, serverTimestamp, setDoc } = await import('firebase/firestore')
      const { db } = await import('../firebase/config')

      // Persist the consent first so an unavailable mail API does not discard the subscription.
      await setDoc(doc(db, 'newsletterSubscribers', encodeURIComponent(normalizedEmail)), {
        email: normalizedEmail,
        consent: true,
        source: 'contact-page',
        consentedAt: serverTimestamp(),
      }, { merge: true })

      setNewsletterEmail('')
      setNewsletterConsent(false)

      try {
        const result = await postMailService({
          path: '/newsletter/subscribe',
          payload: {
            email: normalizedEmail,
            consent: true,
          },
        })

        if (result.welcomeEmailSent === true) {
          setNewsletterMessage(t('newsletterSuccess'))
        } else if (result.pending === true) {
          setNewsletterMessage(t('newsletterPending'))
        } else {
          setNewsletterMessage(t('newsletterAlreadyRegistered'))
        }
      } catch {
        setNewsletterMessage(t('newsletterSavedWithoutWelcome'))
      }
    } catch {
      setNewsletterMessage(t('newsletterError'))
    } finally {
      setIsNewsletterSubmitting(false)
    }
  }

  return (
    <section>
      <ContactSection
        contactDescription={contactDescription}
        contactEmail={contactEmail}
        contactMessage={contactMessage}
        contactName={contactName}
        isSubmitting={isSubmitting}
        newsletterConsent={newsletterConsent}
        newsletterEmail={newsletterEmail}
        newsletterMessage={newsletterMessage}
        isNewsletterSubmitting={isNewsletterSubmitting}
        onDescriptionChange={setContactDescription}
        onEmailChange={setContactEmail}
        onNameChange={setContactName}
        onSubmit={handleContactSubmit}
        onNewsletterConsentChange={setNewsletterConsent}
        onNewsletterEmailChange={setNewsletterEmail}
        onNewsletterSubmit={handleNewsletterSubmit}
      />
    </section>
  )
}
