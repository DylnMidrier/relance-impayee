import Link from 'next/link'

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    accent: 'indigo',
    tag: 'Génération IA',
    title: '3 emails en 30 secondes',
    desc: 'Rappel amical, relance ferme, mise en demeure. Chaque email est calibré au bon niveau d\'urgence. Vous pouvez affiner en langage naturel : "rends-le plus formel", "ajoute les pénalités de retard".',
    points: ['Ton adapté à chaque niveau', 'Affinement IA en un clic', 'Objet et corps modifiables'],
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
    accent: 'violet',
    tag: 'Auto-envoi',
    title: 'Partent tout seuls aux bons moments',
    desc: 'Activez l\'envoi automatique en un clic. Recouvr.io envoie vos relances depuis votre compte Gmail aux dates prévues — J+7, J+15, J+30 — sans intervention de votre part.',
    points: ['Envoi depuis votre Gmail', 'Programmation automatique', 'Synchronisation Google Calendar'],
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    accent: 'emerald',
    tag: 'Dashboard',
    title: 'Tout sous les yeux, rien à oublier',
    desc: 'Montant total en attente, argent récupéré, état de chaque facture. Changez le statut en un clic, visualisez le calendrier des 30 prochains jours, modifiez les emails avant envoi.',
    points: ['KPIs en temps réel', 'Statuts : En attente / Payé / Litigieux', 'Calendrier 30 jours'],
  },
]

const accentMap: Record<string, { bg: string; text: string; border: string; iconBg: string; iconText: string; dot: string; check: string }> = {
  indigo: {
    bg: 'bg-indigo-500/10',
    text: 'text-indigo-400',
    border: 'border-indigo-500/20',
    iconBg: 'bg-indigo-500/20',
    iconText: 'text-indigo-400',
    dot: 'bg-indigo-500',
    check: 'text-indigo-400',
  },
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    border: 'border-violet-500/20',
    iconBg: 'bg-violet-500/20',
    iconText: 'text-violet-400',
    dot: 'bg-violet-500',
    check: 'text-violet-400',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/20',
    iconText: 'text-emerald-400',
    dot: 'bg-emerald-500',
    check: 'text-emerald-400',
  },
}

export default function ShowcaseSection() {
  return (
    <section className="py-24 px-6 sm:px-8 bg-slate-900">
      <div className="max-w-5xl mx-auto">

        <div className="mb-14">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Fonctionnalités</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Tout ce qu'il faut pour<br className="hidden sm:block" /> récupérer votre argent.
          </h2>
          <p className="text-slate-400 max-w-lg leading-relaxed">
            De la génération en 30 secondes à l'envoi automatique, Recouvr.io s'occupe de tout.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {FEATURES.map(({ icon, accent, tag, title, desc, points }) => {
            const a = accentMap[accent]
            return (
              <div
                key={tag}
                className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col gap-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-11 h-11 rounded-xl ${a.iconBg} border ${a.border} flex items-center justify-center shrink-0 ${a.iconText}`}>
                    {icon}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${a.bg} ${a.text} border ${a.border} whitespace-nowrap`}>
                    {tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white mb-2 leading-snug">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>

                <ul className="flex flex-col gap-2 mt-auto">
                  {points.map(p => (
                    <li key={p} className="flex items-center gap-2 text-xs text-slate-300">
                      <svg className={`w-3.5 h-3.5 shrink-0 ${a.check}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <a
            href="/"
            className="flex-1 flex items-center justify-center gap-2 border border-slate-600 hover:border-slate-400 text-slate-400 hover:text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors no-underline"
          >
            Voir le dashboard →
          </a>
          <Link
            href="/pricing"
            className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors no-underline"
          >
            Voir les tarifs
          </Link>
        </div>

      </div>
    </section>
  )
}
