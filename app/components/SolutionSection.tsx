import { FileText, Sparkles, Send } from 'lucide-react'

const STEPS = [
  {
    n: 1,
    Icon: FileText,
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    ringColor: 'ring-indigo-200',
    badge: '30 secondes',
    badgeBg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    title: 'Renseignez la facture',
    desc: "Votre prénom, le nom du client, le montant, la date d'échéance. Rien de plus.",
  },
  {
    n: 2,
    Icon: Sparkles,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    ringColor: 'ring-violet-200',
    badge: 'Instantané',
    badgeBg: 'bg-violet-50 text-violet-600 border-violet-100',
    title: '3 emails prêts à l\'emploi',
    desc: 'Rappel amical (J+7), relance ferme (J+15), mise en demeure (J+30). Chacun calibré pour son niveau d\'urgence.',
  },
  {
    n: 3,
    Icon: Send,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    ringColor: 'ring-emerald-200',
    badge: 'Prêt à partir',
    badgeBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    title: 'Affinez et envoyez',
    desc: "Personnalisez avec l'IA si besoin, puis copiez ou ouvrez directement dans votre messagerie.",
  },
]

export default function SolutionSection() {
  return (
    <section className="py-24 px-6 sm:px-8 bg-white">
      <div className="max-w-5xl mx-auto">

        <div className="mb-12">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">Comment ça marche</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            Trois étapes, c'est tout.
          </h2>
          <p className="text-gray-500 max-w-lg leading-relaxed">
            Vous renseignez la facture, on s'occupe du reste.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {STEPS.map(({ n, Icon, iconBg, iconColor, ringColor, badge, badgeBg, title, desc }) => (
            <div
              key={n}
              className="relative bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col gap-5"
            >
              {/* Step number */}
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${iconBg} ring-4 ${ringColor} flex items-center justify-center shrink-0`}>
                  <Icon size={22} className={iconColor} strokeWidth={1.75} />
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeBg}`}>
                  {badge}
                </span>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Étape {n}</span>
              </div>

              {/* Content */}
              <div>
                <h3 className="text-base font-bold text-gray-900 mb-2 leading-snug">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
