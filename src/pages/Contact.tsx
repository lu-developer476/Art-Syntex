import { FormEvent, useState } from 'react'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase/config'

export default function Contact() {
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactDescription, setContactDescription] = useState('')
  const [contactMessage, setContactMessage] = useState<string | null>(null)

  const handleContactSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setContactMessage(null)

    if (contactDescription.trim().length < 20) {
      setContactMessage('Tu perfil debe tener al menos 20 caracteres para evaluación.')
      return
    }

    try {
      await addDoc(collection(db, 'contactMessages'), {
        name: contactName,
        email: contactEmail,
        description: contactDescription,
        createdAt: serverTimestamp(),
      })

      await addDoc(collection(db, 'mail'), {
        to: [contactEmail],
        message: {
          subject: 'Postulación recibida en la red',
          text: `Hola ${contactName}, recibimos tu perfil para operaciones en Night City: "${contactDescription}"`,
        },
      })

      await addDoc(collection(db, 'notifications'), {
        title: 'Nueva postulación',
        body: 'Se recibió una solicitud para unirse a la red',
        metadata: { email: contactEmail },
        createdAt: serverTimestamp(),
      })

      setContactName('')
      setContactEmail('')
      setContactDescription('')
      setContactMessage('Postulación enviada con éxito a Firestore. Reclutamiento te contactará.')
    } catch {
      setContactMessage('No pudimos enviar la postulación. Verificá Firestore Database y sus reglas.')
    }
  }

  return (
    <section className="mx-auto max-w-6xl rounded-3xl border border-purple-400/50 bg-gradient-to-br from-purple-950/80 via-black/70 to-slate-900/70 p-6">
      <h2 className="text-2xl font-semibold text-purple-100">Contacto</h2>
      <p className="mt-2 text-sm text-purple-200">
        ¿Querés formar parte de nuestra red? Buscamos talentos para desarrollo de implantes,
        operaciones de campo y seguridad corporativa en los distritos de Night City.
      </p>
      <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleContactSubmit}>
        <label className="text-sm text-purple-100">
          Nombre o alias operativo
          <input
            value={contactName}
            onChange={(event) => setContactName(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-purple-400 bg-black/30 px-3 py-2 text-purple-50"
          />
        </label>
        <label className="text-sm text-purple-100">
          e-mail de contacto
          <input
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-purple-400 bg-black/30 px-3 py-2 text-purple-50"
          />
        </label>
        <label className="text-sm text-purple-100 md:col-span-2">
          Contanos tu especialidad y experiencia en Night City
          <textarea
            value={contactDescription}
            onChange={(event) => setContactDescription(event.target.value)}
            required
            minLength={20}
            rows={4}
            className="mt-1 w-full rounded-lg border border-purple-400 bg-black/30 px-3 py-2 text-purple-50"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 md:w-fit"
        >
          Postular
        </button>
      </form>
      {contactMessage ? <p className="mt-3 text-sm text-purple-200">{contactMessage}</p> : null}
    </section>
  )
}
