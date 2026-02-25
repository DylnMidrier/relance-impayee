const STEPS = [
  { n: 1, title: 'Renseignez la facture',    desc: "Votre prénom, le nom du client, le montant, la date d'échéance. L'email du client et le numéro de facture sont optionnels." },
  { n: 2, title: 'On génère 3 emails',       desc: 'Un rappel amical, une relance ferme, une mise en demeure. Chaque email adapté à la situation.' },
  { n: 3, title: 'Ajustez et envoyez',        desc: "Modifiez le texte si besoin, améliorez le grâce à notre agent IA, puis copiez ou envoyez le directement depuis votre application favorite." },
]

const LEVELS = [
  { dot: 'bg-green-500',  tag: 'bg-green-50 text-green-700',   tagText: 'Niveau 1', title: 'Rappel amical — J+7',    desc: 'Ton neutre et bienveillant, laisse une porte ouverte' },
  { dot: 'bg-orange-500', tag: 'bg-orange-50 text-orange-700', tagText: 'Niveau 2', title: 'Relance ferme — J+15',   desc: 'Ton direct, sans agressivité, demande claire' },
  { dot: 'bg-red-500',    tag: 'bg-red-50 text-red-700',       tagText: 'Niveau 3', title: 'Mise en demeure — J+30', desc: 'Cadre légal, pénalités de retard, délai de 8 jours' },
]

export default function SolutionSection() {
  return (
    <section className="py-20 px-8">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">La solution</p>
        <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900">3 emails générés en 30 secondes.</h2>
        <p className="text-gray-500 max-w-lg mb-12">Vous renseignez la facture, on s'occupe du reste. Trois emails, trois tons, prêts à envoyer.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="flex flex-col">
              <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center mb-4 shrink-0">{n}</div>
              <h3 className="font-bold mb-2 text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {LEVELS.map(({ dot, tag, tagText, title, desc }) => (
            <div key={tagText} className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
              <span className={`w-3 h-3 rounded-full shrink-0 ${dot}`}></span>
              <div className="flex-1">
                <strong className="block text-sm font-bold text-gray-900">{title}</strong>
                <span className="text-xs text-gray-500">{desc}</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${tag}`}>{tagText}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
