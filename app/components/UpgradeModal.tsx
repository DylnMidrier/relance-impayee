'use client'

interface Props {
  show: boolean
  onClose: () => void
  feature?: string
  description?: string
}

const BENEFITS = [
  'Relances actives illimitées',
  'Envoi automatique des relances par email',
  'Personnalisation des emails par IA',
  'Synchronisation Google Calendar',
]

export default function UpgradeModal({ show, onClose, feature, description }: Props) {
  if (!show) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-500">
              <path d="M12 2l2.09 6.26L21 12l-6.91 3.74L12 22l-2.09-6.26L3 12l6.91-3.74z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Fonctionnalité Premium</h3>
            {feature && <p className="text-xs text-gray-400 mt-0.5">{feature}</p>}
          </div>
        </div>

        {/* Description contextualisée */}
        {description && (
          <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5 mb-4 leading-relaxed">{description}</p>
        )}

        {/* Benefits */}
        <p className="text-xs font-semibold text-gray-500 mb-3">Passez à Premium pour débloquer :</p>
        <ul className="space-y-2 mb-6">
          {BENEFITS.map(b => (
            <li key={b} className="flex items-center gap-2.5 text-xs text-gray-700">
              <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {b}
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 text-xs font-semibold px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Plus tard
          </button>
          <a
            href="/pricing"
            className="flex-1 text-xs font-semibold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors text-center no-underline"
          >
            Voir les offres →
          </a>
        </div>
      </div>
    </div>
  )
}
