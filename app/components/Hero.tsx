const PREVIEW_EMAILS = [
  {
    level: 1,
    color: 'green',
    tag: 'Niveau 1 · J+7',
    subject: 'Rappel – Facture n°2024-089 (2 400 €)',
    body: "Bonjour Martin, j'espère que vous allez bien. Je me permets de revenir sur la facture n°2024-089 de 2 400 €, échue le 1er nov. — peut-être est-elle passée entre les mailles ?",
  },
  {
    level: 2,
    color: 'orange',
    tag: 'Niveau 2 · J+15',
    subject: 'Relance – Facture n°2024-089 impayée',
    body: "Bonjour Martin, sauf erreur de ma part, la facture n°2024-089 de 2 400 € reste impayée à ce jour. Je vous remercie d'y donner suite dans les meilleurs délais.",
  },
  {
    level: 3,
    color: 'red',
    tag: 'Niveau 3 · J+30',
    subject: 'Mise en demeure – Facture n°2024-089',
    body: 'Bonjour Martin, par la présente, je vous mets en demeure de régler sous 8 jours la somme de 2 400 €, augmentée des pénalités de retard légales.',
  },
]

export default function Hero() {
  return (
    <section className="px-8 py-20 bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

        <div>
          <div className="flex justify-center md:justify-start mb-6">
            <span className="inline-block bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider">
              Pour les freelances français
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-5 text-gray-900">
            Fini d'hésiter à<br />
            <em className="not-italic text-indigo-600">relancer vos clients</em>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
            Une facture impayée et vous ne savez pas comment relancer sans froisser la relation ?
            On génère vos emails à votre place — du rappel amical à la mise en demeure.
          </p>
          <div className="flex flex-col items-center md:items-start">
            <a
              href="#formulaire"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-300/50 transition-all hover:-translate-y-0.5 no-underline"
            >
              Générer mes emails de relance →
            </a>
            <p className="mt-4 text-sm text-gray-400">Gratuit · 30 secondes · Aucun compte requis</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {PREVIEW_EMAILS.map(({ level, color, tag, subject, body }) => (
            <div key={level} className={`bg-white border border-gray-200 border-l-4 border-l-${color}-500 rounded-2xl p-4 shadow-sm text-sm hover:-translate-y-0.5 transition-transform`}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full bg-${color}-500 shrink-0`}></span>
                <span className={`text-xs font-bold bg-${color}-50 text-${color}-700 px-2 py-0.5 rounded-full`}>{tag}</span>
              </div>
              <div className="text-gray-400 text-xs mb-0.5">De : <strong className="text-gray-600">Marie Fontaine</strong></div>
              <div className="font-bold text-gray-900 text-xs mb-2">Objet : {subject}</div>
              <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{body}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
