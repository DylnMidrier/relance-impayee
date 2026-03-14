import Link from 'next/link'

const FREE_FEATURES = [
  '1 facture active',
  '3 emails de relance générés',
  'Personnalisation IA',
  'Dashboard de suivi',
]

const PREMIUM_FEATURES = [
  'Factures illimitées',
  'Auto-envoi depuis votre Gmail',
  'Synchronisation Google Calendar',
  'Édition des emails avant envoi',
  'Support prioritaire',
]

export default function PricingTeaserSection() {
  return (
    <section className="py-24 px-6 sm:px-8 bg-slate-900">
      <div className="max-w-4xl mx-auto">

        <div className="mb-14 text-center">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Tarifs</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Commencez gratuitement.
          </h2>
          <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
            Le plan gratuit est là pour tester. Le Premium, pour ne plus jamais oublier une relance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Gratuit */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 flex flex-col gap-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Gratuit</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold text-white">0 €</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Pour essayer</p>
            </div>

            <ul className="flex flex-col gap-3">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <svg className="w-4 h-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
              <li className="flex items-center gap-2.5 text-sm text-slate-500 line-through">
                <svg className="w-4 h-4 shrink-0 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Auto-envoi
              </li>
            </ul>

            <Link
              href="/dashboard"
              className="mt-auto text-center text-sm font-semibold border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white px-6 py-3 rounded-xl transition-colors no-underline"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Premium */}
          <div className="relative bg-indigo-600 border border-indigo-500 rounded-2xl p-8 flex flex-col gap-6 shadow-2xl shadow-indigo-900/40">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-amber-400 text-amber-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide shadow-md whitespace-nowrap">
                ✦ Recommandé
              </span>
            </div>

            <div>
              <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-2">Premium</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold text-white">9,99 €</span>
                <span className="text-sm text-indigo-200 pb-1">/mois</span>
              </div>
              <p className="text-xs text-indigo-300 mt-1">Auto-envoi inclus</p>
            </div>

            <ul className="flex flex-col gap-3">
              {PREMIUM_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-white">
                  <svg className="w-4 h-4 shrink-0 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/pricing"
              className="mt-auto text-center text-sm font-bold bg-white text-indigo-600 hover:bg-indigo-50 px-6 py-3 rounded-xl transition-colors no-underline shadow-lg shadow-indigo-900/30"
            >
              Passer Premium →
            </Link>
          </div>

        </div>

      </div>
    </section>
  )
}
