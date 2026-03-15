import { FileText, Sparkles, Zap, LayoutDashboard } from 'lucide-react'

const STEPS = [
  {
    n: 1,
    Icon: FileText,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    ringColor: 'ring-indigo-200',
    badge: '30 secondes',
    badgeBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    title: 'Ajoutez une facture impayée',
    desc: 'Nom du client, montant, date d\'échéance. En 30 secondes, tout est en place.',
  },
  {
    n: 2,
    Icon: Sparkles,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    ringColor: 'ring-violet-200',
    badge: 'Instantané',
    badgeBg: 'bg-violet-50 text-violet-600 border-violet-100',
    title: '3 emails calibrés générés',
    desc: 'Rappel amical (J+7), relance ferme (J+15), mise en demeure (J+30). Chacun dans le bon ton, personnalisable avec l\'IA.',
  },
  {
    n: 3,
    Icon: Zap,
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    ringColor: 'ring-amber-200',
    badge: '1 clic',
    badgeBg: 'bg-amber-50 text-amber-600 border-amber-100',
    title: 'Activez l\'auto-envoi',
    desc: 'Les relances partent automatiquement depuis votre Gmail aux bons moments. Les dates se synchronisent dans Google Calendar. Vous activez, vous oubliez.',
  },
  {
    n: 4,
    Icon: LayoutDashboard,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    ringColor: 'ring-emerald-200',
    badge: 'Temps réel',
    badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    title: 'Suivez et récupérez',
    desc: 'Tableau de bord avec KPIs, statut de chaque facture, calendrier des 30 prochains jours. Vous savez exactement où en est chaque relance.',
  },
]

export default function SolutionSection() {
  return (
    <section className="py-24 px-6 sm:px-8 bg-white">
      <div className="max-w-5xl mx-auto">

        <div className="mb-12">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">Comment ça marche</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            Quatre étapes, une seule règle :{' '}<br className="hidden sm:block" />
            <span className="text-indigo-600">ne plus y penser.</span>
          </h2>
          <p className="text-gray-500 max-w-lg leading-relaxed">
            Vous renseignez la facture, on génère les emails, on les envoie. Vous ne faites qu'une chose : vérifier que l'argent est arrivé.
          </p>
        </div>

        <div className="relative">
          {/* Connector line across all icons — visible only on lg, at icon center height (p-6 + h-12/2 = 48px) */}
          <div className="hidden lg:block absolute top-[48px] left-[72px] right-[72px] h-[2px] bg-gray-200 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {STEPS.map(({ n, Icon, iconBg, iconColor, ringColor, badge, badgeBg, title, desc }) => (
            <div
              key={n}
              className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${iconBg} ring-4 ${ringColor} flex items-center justify-center shrink-0`}>
                  <Icon size={22} className={iconColor} strokeWidth={1.75} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeBg}`}>
                  {badge}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Étape {n}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
          </div>
        </div>

      </div>
    </section>
  )
}
