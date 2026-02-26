const FEATURES = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: '3 emails générés en 30 secondes',
    desc: 'Rappel amical (J+7), relance ferme (J+15) et mise en demeure (J+30). Chaque email adapté au ton du niveau, prêt à copier ou envoyer.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: 'Agent IA pour affiner',
    desc: 'Donnez une instruction en langage naturel — "rends-le plus formel", "ajoute les pénalités de retard" — et Claude réécrit l\'email en un clic.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Tableau de bord de suivi',
    desc: 'Montant total en attente, factures en cours, argent récupéré. Changez le statut de chaque relance (En attente / Payé / Litigieux) en un clic.',
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Rappels Google Calendar',
    desc: 'Synchronisez vos relances avec votre agenda Google. Visualisez les 30 prochains jours et ne laissez plus une relance passer à la trappe.',
  },
]

export default function ShowcaseSection() {
  return (
    <section className="py-24 px-8 bg-slate-900 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-16">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Fonctionnalités</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-white mb-4">
            Tout ce qu'il faut pour<br className="hidden sm:block" /> récupérer votre argent.
          </h2>
          <p className="text-slate-400 max-w-md">
            De la génération instantanée à la gestion de vos relances dans le temps, Recouvr.io vous accompagne de bout en bout.
          </p>
        </div>

        {/* Content: features left, screenshots right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Feature list */}
          <div className="space-y-8">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 text-indigo-400">
                  {icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <a
                href="#formulaire"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors no-underline"
              >
                Essayer maintenant — c'est gratuit
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>

          {/* Screenshots — overlapping */}
          <div className="relative pb-24">
            {/* Dashboard (main, back) */}
            <div className="relative z-10 rotate-[1.5deg] rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5">
              <img
                src="/screenshots/dashboard_screenshot.png"
                alt="Tableau de bord Recouvr.io"
                className="w-full block"
                loading="lazy"
              />
            </div>
            {/* Desktop modal (middle, overlapping bottom-left) */}
            <div className="absolute bottom-6 left-0 lg:-left-8 z-20 w-[66%] rotate-[-2deg] rounded-xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5">
              <img
                src="/screenshots/desktop_screenshot.png"
                alt="Génération d'emails de relance"
                className="w-full block"
                loading="lazy"
              />
            </div>
            {/* Mobile modal (front, bottom-right, portrait) */}
            <div className="absolute bottom-0 right-0 lg:-right-4 z-30 w-[28%] rotate-[3deg] rounded-xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5">
              <img
                src="/screenshots/mobile_screenshot.png"
                alt="Recouvr.io sur mobile"
                className="w-full block"
                loading="lazy"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
