'use client'

import { createClient } from '../lib/supabase'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const PREVIEW_EMAILS = [
  {
    level: 1,
    color: 'green',
    tag: 'Rappel · J+7',
    subject: 'Rappel – Facture n°2024-089 (2 400 €)',
    body: "Bonjour Martin, je me permets de revenir sur la facture n°2024-089 de 2 400 €, échue le 1er nov. Peut-être est-elle passée entre les mailles ?",
  },
  {
    level: 2,
    color: 'orange',
    tag: 'Relance ferme · J+15',
    subject: 'Relance – Facture n°2024-089 impayée',
    body: "Bonjour Martin, sauf erreur de ma part, la facture n°2024-089 de 2 400 € reste impayée à ce jour. Je vous remercie d'y donner suite dans les meilleurs délais.",
  },
  {
    level: 3,
    color: 'red',
    tag: 'Mise en demeure · J+30',
    subject: 'Mise en demeure – Facture n°2024-089',
    body: 'Bonjour Martin, par la présente, je vous mets en demeure de régler sous 8 jours la somme de 2 400 €, augmentée des pénalités de retard légales.',
  },
]

async function signInWithGoogle() {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=generate`,
      scopes: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.send',
      queryParams: { access_type: 'offline' },
    },
  })
}

export default function Hero() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user))
  }, [])

  const handleCTA = async () => {
    if (isLoggedIn) {
      router.push('/dashboard?open=generate')
    } else {
      await signInWithGoogle()
    }
  }

  return (
    <section className="px-6 sm:px-8 min-h-screen bg-white flex items-center pt-[20vh] pb-20 sm:py-28">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-5 text-gray-900">
            Vos relances en automatique.{' '}
            <em className="not-italic text-indigo-600">Votre argent récupéré.</em>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
            Ajoutez une facture impayée, on génère 3 emails et les envoie automatiquement à J+7, J+15 et J+30. Vous n'avez rien à faire.
          </p>
          <div className="flex flex-col items-center md:items-start gap-4">
            <button
              onClick={handleCTA}
              className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-indigo-300/50 transition-all hover:-translate-y-0.5"
            >
              Récupérer mes impayés
            </button>
            <p className="text-sm text-gray-400">Connexion Google · Gratuit · 30 secondes</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {PREVIEW_EMAILS.map(({ level, color, tag, subject, body }) => {
            const cardDelay = [0.3, 1.6, 2.9][level - 1]
            const badgeDelay = cardDelay + 0.45
            return (
              <div
                key={level}
                className={`bg-white border border-gray-200 border-l-4 border-l-${color}-500 rounded-2xl p-4 shadow-sm text-sm`}
                style={{
                  animation: 'fadeSlideIn 0.55s ease-out forwards',
                  animationDelay: `${cardDelay}s`,
                  opacity: 0,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full bg-${color}-500 shrink-0`} />
                  <span className={`text-xs font-bold bg-${color}-50 text-${color}-700 px-2 py-0.5 rounded-full truncate`}>{tag}</span>
                  <span
                    className="ml-auto shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200"
                    style={{
                      animation: 'badgePing 0.4s ease-out forwards',
                      animationDelay: `${badgeDelay}s`,
                      opacity: 0,
                    }}
                  >
                    Auto-envoyé ✓
                  </span>
                </div>
                <div className="text-gray-400 text-xs mb-0.5">De : <strong className="text-gray-600">Marie Fontaine</strong></div>
                <div className="font-bold text-gray-900 text-xs mb-2">Objet : {subject}</div>
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{body}</p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
