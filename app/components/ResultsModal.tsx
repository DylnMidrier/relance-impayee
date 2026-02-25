'use client'

import { useEffect, useState } from 'react'
import { EmailTemplate, FormState, formatDate, formatMontant } from '../lib/emails'

interface Props {
  show: boolean
  onClose: () => void
  emails: EmailTemplate[]
  form: FormState
}

function buildMailtoHref(to: string, subject: string, body: string) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export default function ResultsModal({ show, onClose, emails, form }: Props) {
  const [copied, setCopied] = useState<number | null>(null)
  const [editedBodies, setEditedBodies] = useState<Record<number, string>>({})

  // Reset les corps éditables à chaque nouvelle génération (pas seulement à l'init)
  useEffect(() => {
    const init: Record<number, string> = {}
    emails.forEach(e => { init[e.level] = e.body })
    setEditedBodies(init)
  }, [emails])

  function handleCopy(level: number, subject: string) {
    navigator.clipboard.writeText(`Objet : ${subject}\n\n${editedBodies[level] ?? ''}`)
    setCopied(level)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!show) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 md:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full h-full md:rounded-2xl md:shadow-2xl md:max-w-7xl md:h-[80vh] flex flex-col overflow-hidden"
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
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors text-sm font-bold shrink-0"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-7 py-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
          {emails.map(({ level, label, tone, dot, tag, border, subject }) => (
            <div
              key={level}
              style={{ animationDelay: `${(level - 1) * 130}ms` }} // entrée décalée carte par carte
              className={`animate-fade-up opacity-0 border border-gray-200 border-l-4 ${border} rounded-xl p-4 flex flex-col`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`}></span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tag}`}>{label}</span>
                <span className="text-xs text-gray-400">{tone}</span>
              </div>

              <div className="flex gap-1.5 mb-3">
                <button
                  onClick={() => handleCopy(level, subject)}
                  className={`flex-1 text-xs font-semibold px-2 py-1.5 rounded-md border transition-all cursor-pointer ${
                    copied === level
                      ? 'bg-green-50 border-green-400 text-green-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-500 hover:text-indigo-600'
                  }`}
                >
                  {copied === level ? '✓ Copié !' : 'Copier'}
                </button>
                {/* mailto: → ouvre l'app mail par défaut sur tous les OS/mobiles */}
                <a
                  href={buildMailtoHref(form.emailClient, subject, editedBodies[level] ?? '')}
                  className="flex-1 text-xs font-semibold px-2 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:border-indigo-500 hover:text-indigo-600 transition-all text-center no-underline"
                >
                  Envoyer
                </a>
              </div>

              <div className="text-sm font-semibold text-gray-900 mb-3 pb-3 border-b border-dashed border-gray-200">
                <span className="font-normal text-gray-400">Objet : </span>{subject}
              </div>

              <textarea
                value={editedBodies[level] ?? ''}
                onChange={e => setEditedBodies(prev => ({ ...prev, [level]: e.target.value }))}
                className="font-sans text-sm text-gray-600 leading-relaxed w-full flex-1 resize-none outline-none border-none p-0 m-0 bg-transparent min-h-[300px]"
                spellCheck={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
