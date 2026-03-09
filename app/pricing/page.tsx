import Link from 'next/link'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import CheckoutButton from './CheckoutButton'

const COMMON_FEATURES = [
  '3 emails de relance générés en 30s',
  'Rappel amical, relance ferme, mise en demeure',
  'Envoi via votre messagerie',
  'Tableau de bord de suivi',
]

const PREMIUM_ONLY = [
  'Factures illimitées',
  'Personnalisation par IA',
  'Synchronisation Google Calendar',
  'Support prioritaire',
]

function CheckIcon({ bright = false }: { bright?: boolean }) {
  return (
    <svg
      className={`w-4 h-4 shrink-0 mt-0.5 ${bright ? 'text-indigo-300' : 'text-slate-500'}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function PricingPage() {
  return (
    <>
      <Nav />
      <main className="bg-slate-900 min-h-screen">
        <div className="max-w-5xl mx-auto px-6 py-24">

          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Tarifs</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
              Un abonnement qui se rembourse<br />dès la première relance.
            </h1>
            <p className="text-slate-400 max-w-md mx-auto">
              Commencez gratuitement, passez Premium quand vous en avez besoin.
            </p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

            {/* Premium */}
            <div className="relative bg-indigo-600 border border-indigo-500 rounded-2xl p-8 flex flex-col shadow-2xl shadow-indigo-900/40">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-white text-indigo-700 text-xs font-bold px-3 py-1 rounded-full shadow">
                  Recommandé
                </span>
              </div>

              <div className="mb-6">
                <p className="text-xs font-semibold text-indigo-300 uppercase tracking-widest mb-2">Premium</p>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="flex items-start leading-none font-extrabold text-white">
                    <span className="text-4xl">9</span><span className="text-lg font-bold pt-0.5">,99 €</span>
                  </span>
                  <span className="text-indigo-300 text-sm pb-0.5">/mois</span>
                </div>
                <p className="text-sm text-indigo-300">Pour les freelances qui veulent tout.</p>
              </div>

              <CheckoutButton />

              {/* Features communes */}
              <ul className="space-y-3 mb-5">
                {COMMON_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-indigo-200">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Séparateur premium exclusif */}
              <div className="border-t border-indigo-500/60 pt-5 mb-3">
                <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-3">Exclusif Premium</p>
                <ul className="space-y-3">
                  {PREMIUM_ONLY.map(f => (
                    <li key={f} className="flex items-start gap-3 text-sm text-white font-medium">
                      <CheckIcon bright />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Free */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-8 flex flex-col">
              <div className="mb-6">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Gratuit</p>
                <div className="flex items-end gap-1.5 mb-1">
                  <span className="text-4xl font-extrabold text-white">0 €</span>
                  <span className="text-slate-500 text-sm pb-1.5">/mois</span>
                </div>
                <p className="text-sm text-slate-500">Pour tester et les petits volumes.</p>
              </div>

              <Link
                href="/"
                className="block w-full text-center text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white transition-colors no-underline mb-8"
              >
                Commencer gratuitement
              </Link>

              <ul className="space-y-3 mb-5">
                {COMMON_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckIcon />
                    {f}
                  </li>
                ))}
                <li className="flex items-start gap-3 text-sm text-slate-300">
                  <CheckIcon />
                  1 facture active
                </li>
              </ul>

              <div className="border-t border-slate-700 pt-5">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Non inclus</p>
                <ul className="space-y-3">
                  {PREMIUM_ONLY.map(f => (
                    <li key={f} className="flex items-start gap-3 text-sm text-slate-600">
                      <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-24 max-w-2xl mx-auto">
            <h2 className="text-lg font-extrabold text-white mb-8 text-center">Questions fréquentes</h2>
            <div className="space-y-6">
              {[
                {
                  q: 'Puis-je annuler à tout moment ?',
                  a: 'Oui. Aucun engagement. Vous pouvez annuler votre abonnement depuis votre tableau de bord et vous repassez automatiquement sur le plan Gratuit.',
                },
                {
                  q: 'Qu\'est-ce que la personnalisation par IA ?',
                  a: 'Un agent IA (Claude d\'Anthropic) peut réécrire vos emails à partir d\'une instruction en langage naturel : "rends-le plus ferme", "mentionne les pénalités de retard", etc.',
                },
                {
                  q: 'Comment fonctionne la synchronisation Google Calendar ?',
                  a: 'En un clic, Recouvr.io crée 3 rappels dans votre agenda Google (J+7, J+15, J+30) pour chaque relance active. Vous pouvez les supprimer automatiquement quand la facture est payée.',
                },
                {
                  q: 'Mes données sont-elles sécurisées ?',
                  a: 'Vos données sont stockées sur Supabase (infrastructure AWS, datacenter EU). Nous n\'avons accès qu\'aux données strictement nécessaires au fonctionnement du service.',
                },
              ].map(({ q, a }) => (
                <div key={q} className="border-b border-slate-700/60 pb-6">
                  <p className="text-sm font-bold text-white mb-2">{q}</p>
                  <p className="text-sm text-slate-400 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <p className="text-sm text-slate-500 mb-4">Des questions ? On est là.</p>
            <a
              href="mailto:contact@recouvr.io"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors no-underline"
            >
              contact@recouvr.io
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
