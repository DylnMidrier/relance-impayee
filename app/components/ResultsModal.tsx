'use client'

import { useEffect, useRef, useState } from 'react'
import { EmailTemplate, FormState, formatDate, formatMontant } from '../lib/emails'

interface Props {
  show: boolean
  onClose: () => void
  emails: EmailTemplate[]
  form: FormState
  onRegenerateLevel: (level: number) => void
}

function buildMailtoHref(to: string, subject: string, body: string) {
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

// Gradient border arc-en-ciel — ne peut pas être exprimé en Tailwind utilities
const rainbowBorder = (active: boolean): React.CSSProperties => ({
  border: '1.5px solid transparent',
  background: active
    ? 'linear-gradient(#4f46e5, #4f46e5) padding-box, linear-gradient(135deg, #f97316, #ef4444, #a855f7, #3b82f6, #22d3ee) border-box'
    : 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #f97316, #ef4444, #a855f7, #3b82f6, #22d3ee) border-box',
})

export default function ResultsModal({ show, onClose, emails, form, onRegenerateLevel }: Props) {
  const [copied, setCopied] = useState<number | null>(null)
  const [editedBodies, setEditedBodies] = useState<Record<number, string>>({})
  // Incrémenté à chaque regen d'un niveau — le changement de key remonte le nœud et relance l'animation CSS
  const [regenKeys, setRegenKeys] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0 })

  // Modale IA — un seul niveau actif à la fois
  const [activeIALevel, setActiveIALevel] = useState<number | null>(null)
  const [userPrompt, setUserPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiLoadingLevel, setAiLoadingLevel] = useState<number | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [toastClosing, setToastClosing] = useState(false)

  function showToast(message: string) {
    setToast(message)
    setToastClosing(false)
    setTimeout(() => {
      setToastClosing(true)
      setTimeout(() => setToast(null), 320)
    }, 4500)
  }

  // Ref pour tracker les bodies précédents — ne reset que le niveau qui a changé
  const prevBodiesRef = useRef<Record<number, string>>({})

  useEffect(() => {
    // Calculer les niveaux qui ont changé AVANT de toucher au state
    // (la mutation du ref dans le setState updater causait un bug React 18 concurrent :
    //  l'updater peut être rejoué, et au 2e appel le ref est déjà à jour → faux négatif)
    const changed: Record<number, string> = {}
    emails.forEach(e => {
      if (prevBodiesRef.current[e.level] !== e.body) {
        changed[e.level] = e.body
      }
    })
    prevBodiesRef.current = Object.fromEntries(emails.map(e => [e.level, e.body]))
    if (Object.keys(changed).length > 0) {
      setEditedBodies(prev => ({ ...prev, ...changed }))
    }
  }, [emails])

  function handleCopy(level: number, subject: string) {
    navigator.clipboard.writeText(`Objet : ${subject}\n\n${editedBodies[level] ?? ''}`)
    setCopied(level)
    setTimeout(() => setCopied(null), 2000)
  }

  function closeIAModal() {
    setActiveIALevel(null)
    setUserPrompt('')
  }

  async function handleAiImprove() {
    if (activeIALevel === null || !userPrompt.trim()) return
    const level = activeIALevel
    const subject = emails.find(e => e.level === level)?.subject ?? ''

    setAiLoading(true)
    setAiLoadingLevel(level)
    try {
      const res = await fetch('/api/improve-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: editedBodies[level] ?? '',
          subject,
          userPrompt: userPrompt.trim(),
          client: form.client,
          montant: form.montant,
          echeance: form.echeance,
          level,
        }),
      })
      const text = await res.text()
      const data = text ? JSON.parse(text) : {}
      if (!res.ok || data.error) {
        console.error('[IA]', data.error ?? `HTTP ${res.status}`)
        showToast("Désolé, notre agent IA a rencontré quelques soucis ! Mais il sera très vite remis sur pieds 🔧")
        return
      }
      if (data.body) {
        setEditedBodies(prev => ({ ...prev, [level]: data.body }))
        setRegenKeys(prev => ({ ...prev, [level]: prev[level] + 1 }))
      }
    } finally {
      setAiLoading(false)
      setAiLoadingLevel(null)
      closeIAModal()
    }
  }

  if (!show) return null

  return (
    <>
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
                style={{ animationDelay: `${(level - 1) * 130}ms` }}
                className={`animate-fade-up opacity-0 border border-gray-200 border-l-4 ${border} rounded-xl p-4 flex flex-col`}
              >
                {/* En-tête de la carte */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`}></span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${tag}`}>{label}</span>
                    <span className="text-xs text-gray-400 truncate">{tone}</span>
                  </div>
                  {/* Bouton IA — gradient border arc-en-ciel via style prop */}
                  <button
                    onClick={() => { setActiveIALevel(level); setUserPrompt('') }}
                    style={rainbowBorder(false)}
                    className="shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-md text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l2.09 6.26L21 12l-6.91 3.74L12 22l-2.09-6.26L3 12l6.91-3.74z"/>
                    </svg>
                    IA
                  </button>
                </div>

                {/* Boutons d'action : Copier · Envoyer · Regénérer */}
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
                  {/* Regénère un nouveau template aléatoire pour ce niveau */}
                  <button
                    onClick={() => {
                      onRegenerateLevel(level)
                      setRegenKeys(prev => ({ ...prev, [level]: prev[level] + 1 }))
                    }}
                    className="flex-1 text-xs font-semibold px-2 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:border-indigo-500 hover:text-indigo-600 transition-all"
                  >
                    Regénérer
                  </button>
                </div>

                {/* key sur regenKeys[level] → remonte le nœud à chaque regen = relance l'animation */}
                <div key={regenKeys[level]} className="[animation:regen_0.3s_ease-out] flex flex-col flex-1">
                  <div className="text-sm font-semibold text-gray-900 mb-3 pb-3 border-b border-dashed border-gray-200">
                    <span className="font-normal text-gray-400">Objet : </span>{subject}
                  </div>

                  {/* Shimmer IA via style prop pendant la génération */}
                  <div className="relative flex flex-col flex-1">
                    {aiLoadingLevel === level && (
                      <div
                        className="absolute inset-0 rounded-md overflow-hidden pointer-events-none z-10"
                        style={{
                          backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.18) 50%, transparent 100%)',
                          backgroundSize: '200% 100%',
                          animation: 'shimmer 1.2s ease-in-out infinite',
                        }}
                      />
                    )}
                    {/* Corps éditable */}
                    <textarea
                      value={editedBodies[level] ?? ''}
                      onChange={e => setEditedBodies(prev => ({ ...prev, [level]: e.target.value }))}
                      disabled={aiLoadingLevel === level}
                      className={`font-sans text-sm text-gray-600 leading-relaxed w-full flex-1 resize-none outline-none border-none p-0 m-0 bg-transparent min-h-[300px] transition-opacity ${
                        aiLoadingLevel === level ? 'opacity-30' : ''
                      }`}
                      spellCheck={false}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Toast erreur IA — slide depuis le bas, slide vers le bas à la disparition */}
      {toast && (
        <div className="fixed bottom-6 left-0 right-0 z-[70] flex justify-center px-4 pointer-events-none">
          <div
            style={{ animation: `${toastClosing ? 'toast-out' : 'toast-in'} 0.32s ease-out forwards` }}
            className="bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl text-center leading-relaxed max-w-sm pointer-events-auto"
          >
            {toast}
          </div>
        </div>
      )}

      {/* Modale IA — backdrop blur au-dessus de la modale principale */}
      {activeIALevel !== null && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={closeIAModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-500">
                    <path d="M12 2l2.09 6.26L21 12l-6.91 3.74L12 22l-2.09-6.26L3 12l6.91-3.74z"/>
                  </svg>
                  <span className="text-sm font-extrabold text-gray-900">Personnaliser avec l'IA</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Décrivez comment vous souhaitez modifier cet email. L'IA réécrira le corps en conservant le ton adapté au niveau de relance.
                </p>
              </div>
              <button
                onClick={closeIAModal}
                className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors text-xs font-bold shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Exemples */}
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Exemples d'instructions</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>· Rends le ton plus ferme et urgent</li>
                <li>· Ajoute un délai de 48h avant action</li>
                <li>· Reformule de façon plus concise</li>
                <li>· Mentionne que c'est la dernière relance</li>
              </ul>
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={userPrompt}
                onChange={e => setUserPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !aiLoading && handleAiImprove()}
                placeholder="Votre instruction…"
                disabled={aiLoading}
                className="flex-1 text-sm px-3 py-2.5 border border-gray-200 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 placeholder:text-gray-300 disabled:opacity-50 transition-all"
                autoFocus
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={closeIAModal}
                disabled={aiLoading}
                className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAiImprove}
                disabled={!userPrompt.trim() || aiLoading}
                className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {aiLoading ? 'Génération…' : 'Améliorer →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
