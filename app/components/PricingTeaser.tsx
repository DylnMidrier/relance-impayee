import Link from 'next/link'

const FREE_FEATURES = [
  '1 facture active',
  '3 emails générés en 30s',
  'Envoi via votre Gmail',
]

const PREMIUM_FEATURES = [
  'Factures illimitées',
  'Personnalisation IA',
  'Google Calendar sync',
  'Support prioritaire',
]

function Check({ dim = false }: { dim?: boolean }) {
  return (
    <svg
      className={`w-3.5 h-3.5 shrink-0 ${dim ? 'text-slate-500' : 'text-indigo-300'}`}
      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function PricingTeaser() {
  return (
    <section className="py-20 px-6 sm:px-8 bg-slate-900 border-t border-slate-800">
      <div className="max-w-5xl mx-auto">

        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Tarifs</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Un abonnement qui se rembourse<br className="hidden sm:block" /> dès la première relance.
          </h2>
          <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
            Commencez gratuitement, passez Premium quand vous en avez besoin.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">

          {/* Free */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-7 flex flex-col">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Gratuit</p>
            <div className="flex items-end gap-1.5 mb-5">
              <span className="text-4xl font-extrabold text-white">0 €</span>
              <span className="text-slate-500 text-sm pb-1">/mois</span>
            </div>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <Check dim />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Premium */}
          <div className="relative bg-indigo-600 border border-indigo-500 rounded-2xl p-7 flex flex-col shadow-2xl shadow-indigo-900/40">
            <div className="absolute -top-3 left-6">
              <span className="bg-white text-indigo-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                Recommandé
              </span>
            </div>
            <p className="text-[10px] font-semibold text-indigo-300 uppercase tracking-widest mb-3">Premium</p>
            <div className="flex items-end gap-1.5 mb-5">
              <span className="text-4xl font-extrabold text-white">9,99 €</span>
              <span className="text-indigo-300 text-sm pb-1">/mois</span>
            </div>
            <ul className="space-y-2.5">
              {PREMIUM_FEATURES.map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-indigo-100">
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="text-center mt-8">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors no-underline"
          >
            Voir le détail des tarifs →
          </Link>
        </div>

      </div>
    </section>
  )
}
