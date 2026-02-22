'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

function buildGmailHref(to: string, subject: string, body: string) {
  return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function buildOutlookHref(to: string, subject: string, body: string) {
  return `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

export default function ResultsModal({ show, onClose, emails, form }: Props) {
  const [copied, setCopied] = useState<number | null>(null)
  const [openMenu, setOpenMenu] = useState<number | null>(null)
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null)
  const [editedBodies, setEditedBodies] = useState<Record<number, string>>({})
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Initialise les corps éditables à chaque nouvelle génération
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

  function handleToggleMenu(level: number) {
    if (openMenu === level) {
      setOpenMenu(null)
      setMenuRect(null)
    } else {
      const btn = btnRefs.current[level]
      if (btn) setMenuRect(btn.getBoundingClientRect())
      setOpenMenu(level)
    }
  }

  useEffect(() => {
    if (openMenu === null) return
    const close = (e: MouseEvent) => {
      const btn = btnRefs.current[openMenu]
      if (btn && btn.contains(e.target as Node)) return
      setOpenMenu(null)
      setMenuRect(null)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [openMenu])

  if (!show) return null

  const activeEmail = emails.find(e => e.level === openMenu)
  const activeBody = openMenu !== null ? (editedBodies[openMenu] ?? '') : ''
  const activeSubject = activeEmail?.subject ?? ''

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-[80vh] flex flex-col overflow-hidden"
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
            className="text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none mt-0.5"
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
                <button
                  ref={el => { btnRefs.current[level] = el }}
                  onClick={() => handleToggleMenu(level)}
                  className="flex-1 text-xs font-semibold px-2 py-1.5 rounded-md border border-gray-200 bg-white text-gray-700 hover:border-indigo-500 hover:text-indigo-600 transition-all cursor-pointer"
                >
                  Envoyer {openMenu === level ? '▲' : '▼'}
                </button>
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

      {/* Dropdown rendu dans document.body via portal */}
      {openMenu !== null && menuRect && createPortal(
        <ul
          onMouseDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: menuRect.bottom + 4,
            left: menuRect.left,
            width: menuRect.width,
            zIndex: 9999,
          }}
          className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden list-none p-0 m-0"
        >
          <li>
            <a
              href={buildMailtoHref(form.emailClient, activeSubject, activeBody)}
              onClick={() => setOpenMenu(null)}
              className="flex items-center gap-2 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 no-underline"
            >
              <span className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center shrink-0">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="2,4 12,13 22,4"/>
                </svg>
              </span>
              <span>App mail <span className="text-gray-400">(Gmail, Outlook…)</span></span>
            </a>
          </li>
          <li className="border-t border-gray-100">
            <a
              href={buildGmailHref(form.emailClient, activeSubject, activeBody)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpenMenu(null)}
              className="flex items-center gap-2 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 no-underline"
            >
              <span className="w-5 h-5 rounded bg-red-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0">G</span>
              <span>Gmail <span className="text-gray-400">(navigateur)</span></span>
            </a>
          </li>
          <li className="border-t border-gray-100">
            <a
              href={buildOutlookHref(form.emailClient, activeSubject, activeBody)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpenMenu(null)}
              className="flex items-center gap-2 px-3 py-2.5 text-xs text-gray-700 hover:bg-gray-50 no-underline"
            >
              <span className="w-5 h-5 rounded bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">O</span>
              <span>Outlook <span className="text-gray-400">(navigateur)</span></span>
            </a>
          </li>
        </ul>,
        document.body
      )}
    </div>
  )
}
