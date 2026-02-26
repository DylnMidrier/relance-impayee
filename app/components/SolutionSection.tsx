const STEPS = [
  { n: 1, title: 'Renseignez la facture',    desc: "Votre prénom, le nom du client, le montant, la date d'échéance. 30 secondes, pas plus." },
  { n: 2, title: 'Récupérez 3 emails',       desc: 'Rappel amical, relance ferme, mise en demeure — chacun calibré pour son niveau d\'urgence.' },
  { n: 3, title: 'Ajustez et envoyez',        desc: "Peaufinez avec l'agent IA si besoin, puis copiez ou ouvrez directement dans votre messagerie." },
]

export default function SolutionSection() {
  return (
    <section className="py-20 px-8">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">Comment ça marche</p>
        <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900">Trois étapes, c'est tout.</h2>
        <p className="text-gray-500 max-w-lg mb-12">Vous renseignez la facture, on s'occupe du reste.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="flex flex-col">
              <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center mb-4 shrink-0">{n}</div>
              <h3 className="font-bold mb-2 text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
