import { FieldValue } from 'firebase-admin/firestore'
import { getAdminServices } from './firebaseAdmin.js'

const WELCOME_EMAIL_LEASE_MS = 5 * 60 * 1000

function getTimestampMillis(value) {
  if (typeof value?.toMillis === 'function') return value.toMillis()
  if (typeof value?.toDate === 'function') return value.toDate().getTime()
  if (value instanceof Date) return value.getTime()
  return 0
}

export function createNewsletterService(emailService, services = null, clock = Date.now) {
  async function subscribe({ email }) {
    const { db } = services ?? getAdminServices()
    const subscriberRef = db.collection('newsletterSubscribers').doc(encodeURIComponent(email))
    let claimStatus = 'claimed'

    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(subscriberRef)
      const current = snapshot.exists ? snapshot.data() : {}

      if (current.welcomeEmailStatus === 'sent') {
        claimStatus = 'sent'
        return
      }

      const claimAge = clock() - getTimestampMillis(current.welcomeEmailClaimedAt)
      if (current.welcomeEmailStatus === 'sending' && claimAge < WELCOME_EMAIL_LEASE_MS) {
        claimStatus = 'pending'
        return
      }

      transaction.set(subscriberRef, {
        email,
        consent: true,
        source: 'contact-page',
        consentedAt: current.consentedAt ?? FieldValue.serverTimestamp(),
        status: 'subscribed',
        welcomeEmailStatus: 'sending',
        welcomeEmailClaimedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })
    })

    if (claimStatus === 'sent') {
      return { alreadySubscribed: true, welcomeEmailSent: false }
    }

    if (claimStatus === 'pending') {
      return { alreadySubscribed: true, pending: true, welcomeEmailSent: false }
    }

    try {
      await emailService.sendNewsletterWelcome({ email })
      await subscriberRef.set({
        welcomeEmailStatus: 'sent',
        welcomeEmailSentAt: FieldValue.serverTimestamp(),
        welcomeEmailClaimedAt: FieldValue.delete(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })

      return { alreadySubscribed: false, welcomeEmailSent: true }
    } catch (error) {
      try {
        await subscriberRef.set({
          welcomeEmailStatus: 'failed',
          welcomeEmailClaimedAt: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true })
      } catch {
        // Preserve the original email delivery error.
      }

      throw error
    }
  }

  return { subscribe }
}
