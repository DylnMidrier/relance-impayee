const STEPS = [
  {
    day: 'J+0',
    label: 'Échéance',
    sublabel: 'La facture arrive à terme',
    color: 'slate',
    dotBg: 'bg-slate-500',
    textColor: 'text-slate-400',
    borderColor: 'border-slate-700',
  },
  {
    day: 'J+7',
    label: 'Rappel amical',
    sublabel: '"Peut-être est-elle passée entre les mailles ?"',
    color: 'indigo',
    dotBg: 'bg-indigo-500',
    textColor: 'text-indigo-400',
    borderColor: 'border-indigo-500/40',
  },
  {
    day: 'J+15',
    label: 'Relance ferme',
    sublabel: '"Sauf erreur, cette facture reste impayée."',
    color: 'amber',
    dotBg: 'bg-amber-500',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
  },
  {
    day: 'J+30',
    label: 'Mise en demeure',
    sublabel: '"Je vous mets en demeure de régler sous 8 jours."',
    color: 'red',
    dotBg: 'bg-red-500',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/40',
  },
]

export default function TimelineSection() {
  return (
    <section className="py-24 px-6 sm:px-8 bg-white">
      <div className="max-w-5xl mx-auto">

        <div className="mb-14">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">Calendrier des relances</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-4">
            Le bon email, au bon moment.{' '}
            <span className="text-indigo-600">Toujours.</span>
          </h2>
          <p className="text-gray-500 max-w-lg leading-relaxed">
            Recouvr.io calcule automatiquement les dates d'envoi à partir de l'échéance de votre facture. Vous n'avez rien à planifier.
          </p>
        </div>

        {/* Desktop timeline */}
        <div className="hidden sm:block relative">
          {/* Horizontal line */}
          <div className="absolute top-5 left-8 right-8 h-[2px] bg-gray-100" />

          <div className="grid grid-cols-4 gap-4 relative">
            {STEPS.map(({ day, label, sublabel, dotBg, textColor, borderColor }) => (
              <div key={day} className="flex flex-col items-center text-center gap-4">
                {/* Dot */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full ${dotBg} flex items-center justify-center shadow-lg`}>
                    <span className="text-[10px] font-black text-white">{day}</span>
                  </div>
                </div>

                {/* Card */}
                <div className={`w-full bg-gray-50 border ${borderColor} rounded-2xl p-4`}>
                  <p className={`text-sm font-bold ${textColor} mb-1`}>{label}</p>
                  <p className="text-xs text-gray-400 leading-relaxed italic">{sublabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile timeline */}
        <div className="sm:hidden flex flex-col gap-0">
          {STEPS.map(({ day, label, sublabel, dotBg, textColor, borderColor }, i) => (
            <div key={day} className="flex gap-4">
              {/* Left: dot + line */}
              <div className="flex flex-col items-center shrink-0">
                <div className={`w-9 h-9 rounded-full ${dotBg} flex items-center justify-center shadow-md z-10`}>
                  <span className="text-[10px] font-black text-white">{day}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-[2px] flex-1 bg-gray-100 my-1" />
                )}
              </div>

              {/* Right: card */}
              <div className={`flex-1 bg-gray-50 border ${borderColor} rounded-2xl p-4 mb-3`}>
                <p className={`text-sm font-bold ${textColor} mb-1`}>{label}</p>
                <p className="text-xs text-gray-400 leading-relaxed italic">{sublabel}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-xl px-5 py-3 max-w-lg mx-auto">
          <svg className="w-4 h-4 shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>
            Avec l'auto-envoi Premium, ces emails partent{' '}
            <strong className="text-gray-600">depuis votre boîte Gmail</strong>, aux dates exactes, sans action de votre part.
          </span>
        </div>

      </div>
    </section>
  )
}
