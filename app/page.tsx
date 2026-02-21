'use client'

import { useState } from 'react'
import { PenLine, Clock, Handshake, LucideIcon } from 'lucide-react'
import MentionsLegales from './components/MentionsLegales'

// ─── Types ─────────────────────────────────────────────────────────────────

interface FormState {
  client: string
  facture: string
  montant: string
  echeance: string
}

interface EmailTemplate {
  level: number
  label: string
  tone: string
  dot: string
  tag: string
  border: string
  subject: string
  body: string
}

interface ProblemCard {
  Icon: LucideIcon
  bg: string
  color: string
  title: string
  desc: string
}

interface FormField {
  id: keyof FormState
  label: string
  type: string
  placeholder: string
  required: boolean
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatMontant(montant: string): string {
  return Number(montant).toLocaleString('fr-FR') + ' €'
}

function genEmails(client: string, facture: string, montant: string, echeance: string): EmailTemplate[] {
  const m = formatMontant(montant)
  const d = formatDate(echeance)
  const refLabel = facture ? ` n°${facture}` : ''

  return [
    {
      level: 1,
      label: 'Niveau 1 · J+7',
      tone: 'Rappel amical',
      dot: 'bg-green-500',
      tag: 'bg-green-50 text-green-700',
      border: 'border-l-green-500',
      subject: `Rappel – Facture${refLabel}`,
      body: `Bonjour ${client},

J'espère que vous allez bien. Je me permets de revenir sur ma facture de ${m}, dont l'échéance était fixée au ${d}.

Peut-être est-elle passée entre les mailles ? Si vous avez déjà procédé au règlement, merci de ne pas tenir compte de ce message.

Dans le cas contraire, je reste disponible pour tout renseignement.

Cordialement,
[Votre prénom]`,
    },
    {
      level: 2,
      label: 'Niveau 2 · J+15',
      tone: 'Relance ferme',
      dot: 'bg-orange-500',
      tag: 'bg-orange-50 text-orange-700',
      border: 'border-l-orange-500',
      subject: `Relance – Facture${refLabel} toujours impayée`,
      body: `Bonjour ${client},

Sauf erreur de ma part, ma facture de ${m}, échue le ${d}, reste impayée à ce jour malgré mon précédent message.

Je vous remercie de bien vouloir y donner suite dans les meilleurs délais. Sans retour de votre part sous 5 jours, je me verrai dans l'obligation de prendre d'autres dispositions.

Cordialement,
[Votre prénom]`,
    },
    {
      level: 3,
      label: 'Niveau 3 · J+30',
      tone: 'Mise en demeure',
      dot: 'bg-red-500',
      tag: 'bg-red-50 text-red-700',
      border: 'border-l-red-500',
      subject: `Mise en demeure – Règlement facture${refLabel}`,
      body: `Bonjour ${client},

Par la présente, je vous mets en demeure de procéder au règlement de la somme de ${m}, augmentée des pénalités de retard légales (3 fois le taux d'intérêt légal en vigueur), dans un délai de 8 jours à compter de la réception de ce message.

À défaut de règlement dans ce délai, je me verrai contraint(e) d'engager les démarches de recouvrement appropriées, pouvant inclure une procédure judiciaire.

Cordialement,
[Votre prénom]`,
    },
  ]
}

// ─── Composant principal ───────────────────────────────────────────────────

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>({ client: '', facture: '', montant: '', echeance: '' })

  function handleFormSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    window.dataLayer?.push({ event: 'submit_form' })
    setShowModal(true)
  }

  function handleCopy(level: number, subject: string, body: string) {
    navigator.clipboard.writeText(`Objet : ${subject}\n\n${body}`)
    setCopied(level)
    setTimeout(() => setCopied(null), 2000)
  }

  const emails: EmailTemplate[] = form.client && form.montant && form.echeance
    ? genEmails(form.client, form.facture, form.montant, form.echeance)
    : []

  const problemCards: ProblemCard[] = [
    { Icon: PenLine,   bg: 'bg-amber-50', color: 'text-amber-500', title: 'On ne sait pas comment formuler', desc: 'Trop agressif ? Trop mou ? Trouver le bon ton prend un temps fou.' },
    { Icon: Clock,     bg: 'bg-sky-50',   color: 'text-sky-500',   title: 'On reporte encore et encore',      desc: "Chaque jour sans relancer, c'est un jour de plus où l'argent n'arrive pas." },
    { Icon: Handshake, bg: 'bg-rose-50',  color: 'text-rose-500',  title: 'On a peur de froisser',            desc: 'Et si le client se vexe ? Et si on perd la relation ? Ces doutes paralysent.' },
  ]

  const formFields: FormField[] = [
    { id: 'client',   label: 'Nom du client',              type: 'text',   placeholder: 'Ex : Agence Dupont', required: true },
    { id: 'facture',  label: 'Numéro de facture',           type: 'text',   placeholder: 'Ex : 2024-089',      required: false },
    { id: 'montant',  label: 'Montant de la facture (€)',   type: 'number', placeholder: 'Ex : 1500',          required: true },
    { id: 'echeance', label: "Date d'échéance",             type: 'date',   placeholder: '',                   required: true },
  ]

  return (
    <>
      {/* ─── NAVIGATION ─── */}
      <nav className="flex items-center justify-center px-8 py-4 border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <a href="#" className="flex items-center gap-2 no-underline group">
          <span className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black tracking-tighter">RI</span>
          </span>
          <span className="text-xl font-black tracking-tight text-gray-900">
            Recouvr<span className="text-indigo-600">.io</span>
          </span>
        </a>
      </nav>

      {/* ─── HERO ─── */}
      <section className="px-8 py-20 bg-gradient-to-br from-indigo-50 to-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          <div>
            <span className="inline-block bg-indigo-50 border border-indigo-200 text-indigo-600 text-xs font-semibold px-4 py-1.5 rounded-full uppercase tracking-wider mb-6">
              Pour les freelances français
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight mb-5 text-gray-900">
              Fini d'hésiter à<br />
              <em className="not-italic text-indigo-600">relancer vos clients</em>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
              Une facture impayée et vous ne savez pas comment relancer sans froisser la relation ?
              On génère vos emails à votre place — du rappel amical à la mise en demeure.
            </p>
            <a
              href="#formulaire"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-indigo-300/50 transition-all hover:-translate-y-0.5 no-underline"
            >
              Générer mes emails de relance →
            </a>
            <p className="mt-4 text-sm text-gray-400">Gratuit · 30 secondes · Aucun compte requis</p>
          </div>

          <div className="flex flex-col gap-3">
            {[
              { level: 1, color: 'green',  tag: 'Niveau 1 · J+7',  subject: 'Rappel – Facture n°2024-089 (2 400 €)',   body: "Bonjour Martin, j'espère que vous allez bien. Je me permets de revenir sur la facture n°2024-089 de 2 400 €, échue le 1er nov. — peut-être est-elle passée entre les mailles ?" },
              { level: 2, color: 'orange', tag: 'Niveau 2 · J+15', subject: 'Relance – Facture n°2024-089 impayée',    body: "Bonjour Martin, sauf erreur de ma part, la facture n°2024-089 de 2 400 € reste impayée à ce jour. Je vous remercie d'y donner suite dans les meilleurs délais." },
              { level: 3, color: 'red',    tag: 'Niveau 3 · J+30', subject: 'Mise en demeure – Facture n°2024-089',    body: "Bonjour Martin, par la présente, je vous mets en demeure de régler sous 8 jours la somme de 2 400 €, augmentée des pénalités de retard légales." },
            ].map(({ level, color, tag, subject, body }) => (
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

      {/* ─── PROBLÈME ─── */}
      <section className="py-20 px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">Le problème</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900">Relancer un client, c'est pas aussi facile qu'il n'y paraît.</h2>
          <p className="text-gray-500 max-w-lg mb-12">On le sait tous. On reporte, on hésite, on ne sait pas quoi dire. Et pendant ce temps, l'argent dort.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {problemCards.map(({ Icon, bg, color, title, desc }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-xl p-7 shadow-sm">
                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-5`}>
                  <Icon size={20} className={color} strokeWidth={1.75} />
                </div>
                <h3 className="font-bold mb-2 text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SOLUTION ─── */}
      <section className="py-20 px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">La solution</p>
          <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900">3 emails générés en 30 secondes.</h2>
          <p className="text-gray-500 max-w-lg mb-12">Vous renseignez la facture, on s'occupe du reste. Trois emails, trois tons, prêts à envoyer.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {([
              { n: 1, title: 'Renseignez la facture',    desc: "Nom du client, montant dû, date d'échéance. C'est tout ce qu'on demande." },
              { n: 2, title: 'On génère 3 emails',       desc: 'Un rappel amical, une relance ferme, une mise en demeure. Chaque email adapté à la situation.' },
              { n: 3, title: 'Copiez-collez et envoyez', desc: "Aucun compte. Aucune inscription. Vous copiez l'email, vous l'envoyez depuis votre boîte." },
            ] as { n: number; title: string; desc: string }[]).map(({ n, title, desc }) => (
              <div key={n} className="flex flex-col">
                <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-extrabold flex items-center justify-center mb-4 shrink-0">{n}</div>
                <h3 className="font-bold mb-2 text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {([
              { dot: 'bg-green-500',  tag: 'bg-green-50 text-green-700',   tagText: 'Niveau 1', title: 'Rappel amical — J+7',    desc: 'Ton neutre et bienveillant, laisse une porte ouverte' },
              { dot: 'bg-orange-500', tag: 'bg-orange-50 text-orange-700', tagText: 'Niveau 2', title: 'Relance ferme — J+15',   desc: 'Ton direct, sans agressivité, demande claire' },
              { dot: 'bg-red-500',    tag: 'bg-red-50 text-red-700',       tagText: 'Niveau 3', title: 'Mise en demeure — J+30', desc: 'Cadre légal, pénalités de retard, délai de 8 jours' },
            ] as { dot: string; tag: string; tagText: string; title: string; desc: string }[]).map(({ dot, tag, tagText, title, desc }) => (
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

      {/* ─── FORMULAIRE ─── */}
      <section className="py-20 px-8 bg-gray-50" id="formulaire">
        <div className="max-w-lg mx-auto">
          <h2 className="text-2xl font-extrabold mb-2 text-center text-gray-900">Essayez maintenant</h2>
          <p className="text-center text-gray-500 text-sm mb-8">Renseignez les infos de votre facture impayée.</p>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
            <form onSubmit={handleFormSubmit}>
              {formFields.map(({ id, label, type, placeholder, required }) => (
                <div key={id} className="mb-5">
                  <label htmlFor={id} className="block text-sm font-semibold mb-1.5 text-gray-900">{label}</label>
                  <input
                    id={id}
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    min={type === 'number' ? 1 : undefined}
                    value={form[id]}
                    onChange={e => setForm({ ...form, [id]: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-gray-300"
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-2 transition-colors cursor-pointer"
              >
                Générer mes 3 emails de relance →
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        Recouvr · Fait par un freelance, pour les freelances ·{' '}
        <a href="mailto:contact@recouvr.fr" className="text-gray-400 hover:text-gray-600">
          contact@recouvr.fr
        </a>
        {' '}·{' '}
        <MentionsLegales />
      </footer>

      {/* ─── MODAL RÉSULTATS ─── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-7 py-5 border-b border-gray-200 shrink-0">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-0.5">Vos 3 emails de relance</h2>
                <p className="text-sm text-gray-500">
                  Pour <strong>{form.client}</strong> · {formatMontant(form.montant)} · échéance {formatDate(form.echeance)}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none mt-0.5"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-7 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              {emails.map(({ level, label, tone, dot, tag, border, subject, body }) => (
                <div
                  key={level}
                  style={{ animationDelay: `${(level - 1) * 130}ms` }}
                  className={`animate-fade-up opacity-0 border border-gray-200 border-l-4 ${border} rounded-xl p-4 flex flex-col`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`}></span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tag}`}>{label}</span>
                      <span className="text-xs text-gray-400">{tone}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(level, subject, body)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition-all cursor-pointer ${
                        copied === level
                          ? 'bg-green-50 border-green-400 text-green-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600'
                      }`}
                    >
                      {copied === level ? '✓ Copié !' : 'Copier'}
                    </button>
                  </div>

                  <div className="text-sm font-semibold text-gray-900 mb-3 pb-3 border-b border-dashed border-gray-200">
                    <span className="font-normal text-gray-400">Objet : </span>{subject}
                  </div>

                  <pre className="font-sans text-sm text-gray-600 leading-relaxed whitespace-pre-wrap m-0 flex-1">{body}</pre>
                </div>
              ))}
            </div>

            <div className="px-7 py-3 border-t border-gray-200 text-xs text-gray-400 shrink-0">
              Remplacez{' '}
              <code className="bg-gray-100 border border-gray-200 rounded px-1 py-0.5 font-mono">
                [Votre prénom]
              </code>{' '}
              avant d'envoyer.
            </div>
          </div>
        </div>
      )}
    </>
  )
}