'use client'

import { FormState, FormField } from '../lib/emails'

const FORM_FIELDS: FormField[] = [
  { id: 'prenom',      label: 'Votre prénom',              type: 'text',   placeholder: 'Ex : Marie',                    required: true },
  { id: 'client',      label: 'Nom du client',             type: 'text',   placeholder: 'Ex : Agence Dupont',            required: true },
  { id: 'emailClient', label: 'Email de votre client',     type: 'email',  placeholder: 'Ex : contact@agencedupont.fr', required: false },
  { id: 'facture',     label: 'Numéro de facture',         type: 'text',   placeholder: 'Ex : 2024-089',                required: false },
  { id: 'montant',     label: 'Montant de la facture (€)', type: 'number', placeholder: 'Ex : 1500',                    required: true },
  { id: 'echeance',    label: "Date d'échéance",           type: 'date',   placeholder: '',                             required: true },
]

interface Props {
  form: FormState
  onChange: (form: FormState) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}

export default function FormSection({ form, onChange, onSubmit }: Props) {
  return (
    <section className="py-20 px-8 bg-gray-50" id="formulaire">
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-extrabold mb-2 text-center text-gray-900">Essayez maintenant</h2>
        <p className="text-center text-gray-500 text-sm mb-8">Renseignez les infos de votre facture impayée.</p>

        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
          <form onSubmit={onSubmit}>
            {FORM_FIELDS.map(({ id, label, type, placeholder, required }) => (
              <div key={id} className="mb-5 overflow-hidden">
                <label htmlFor={id} className="block text-sm font-semibold mb-1.5 text-gray-900">{label}</label>
                <input
                  id={id}
                  type={type}
                  placeholder={placeholder}
                  required={required}
                  min={type === 'number' ? 1 : undefined}
                  value={form[id]}
                  onChange={e => onChange({ ...form, [id]: e.target.value })}
                  className="w-full min-w-0 px-4 py-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-gray-300 [&[type=date]]:pr-2"
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full px-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl mt-2 transition-colors cursor-pointer"
            >
              Générer mes 3 emails de relance →
            </button>
            <p className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mt-3">
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Vos données et celles de vos clients sont chiffrées, hébergées en Europe et ne sont jamais revendues.
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
