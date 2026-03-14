'use client'

import { createClient } from '../lib/supabase'

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
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.send',
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
}

export default function Hero() {
  return (
    <section className="px-6 sm:px-8 py-20 pb-32 bg-gradient-to-br from-indigo-50 to-white">
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
              onClick={signInWithGoogle}
              className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3.5 rounded-xl shadow-lg shadow-indigo-300/50 transition-all hover:-translate-y-0.5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="white" fillOpacity=".9" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="white" fillOpacity=".9" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="white" fillOpacity=".9" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="white" fillOpacity=".9" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Commencer gratuitement
            </button>
            <p className="text-sm text-gray-400">Connexion Google · Gratuit · 2 minutes</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {PREVIEW_EMAILS.map(({ level, color, tag, subject, body }) => (
            <div
              key={level}
              className={`bg-white border border-gray-200 border-l-4 border-l-${color}-500 rounded-2xl p-4 shadow-sm text-sm hover:-translate-y-0.5 transition-transform`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full bg-${color}-500 shrink-0`} />
                <span className={`text-xs font-bold bg-${color}-50 text-${color}-700 px-2 py-0.5 rounded-full`}>{tag}</span>
                <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-500 border border-indigo-200">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Auto-envoi
                </span>
              </div>
              <div className="text-gray-400 text-xs mb-0.5">De : <strong className="text-gray-600">Marie Fontaine</strong></div>
              <div className="font-bold text-gray-900 text-xs mb-2">Objet : {subject}</div>
              <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{body}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
