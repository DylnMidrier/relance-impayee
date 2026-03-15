'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: "L'email vient vraiment de mon adresse ?",
    a: "Oui. Recouvr.io envoie via l'API officielle Gmail avec votre compte. Votre client voit votre adresse et votre nom, pas les nôtres. Pour lui, c'est un email normal venant de vous.",
  },
  {
    q: "Mon client sait-il que j'utilise un outil ?",
    a: "Non. L'email est rédigé à la première personne et envoyé depuis votre Gmail. Aucune mention de Recouvr.io n'apparaît dans le message.",
  },
  {
    q: "Que se passe-t-il si mon client répond ?",
    a: "Sa réponse arrive directement dans votre boîte Gmail, comme n'importe quel email. Recouvr.io ne lit pas vos emails entrants, nous n'avons accès qu'à l'envoi.",
  },
  {
    q: "Puis-je modifier les emails avant qu'ils partent ?",
    a: "Oui. Depuis le dashboard, vous pouvez relire et modifier l'objet et le corps de chaque relance avant que l'envoi automatique ne soit déclenché.",
  },
  {
    q: "Que se passe-t-il si mon client paie entre deux relances ?",
    a: "Passez la facture en \"Payé\" dans votre dashboard. Les prochains envois automatiques sont annulés immédiatement.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Vos données sont stockées sur des serveurs en Europe. Nous ne conservons que ce qui est strictement nécessaire au fonctionnement, jamais de revente, jamais d'accès tiers.",
  },
]

function Item({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-semibold text-gray-900">{q}</span>
        <span className={`shrink-0 w-5 h-5 flex items-center justify-center rounded-full border transition-colors ${open ? 'border-indigo-500 text-indigo-500' : 'border-gray-300 text-gray-400'}`}>
          <svg className={`w-2.5 h-2.5 transition-transform duration-200 ${open ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>
      {open && (
        <p className="text-sm text-gray-500 leading-relaxed pb-5 pr-9">{a}</p>
      )}
    </div>
  )
}

export default function FAQSection() {
  return (
    <section className="py-20 px-6 sm:px-8 bg-white border-t border-gray-100">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest mb-3">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
            Questions fréquentes
          </h2>
        </div>

        <div>
          {FAQS.map(({ q, a }) => (
            <Item key={q} q={q} a={a} />
          ))}
        </div>

      </div>
    </section>
  )
}
