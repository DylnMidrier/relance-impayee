import { TEMPLATES } from './templates'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface FormState {
  prenom: string
  client: string
  emailClient: string
  facture: string
  montant: string
  echeance: string
}

export interface EmailTemplate {
  level: number
  label: string
  tone: string
  dot: string
  tag: string
  border: string
  subject: string
  body: string
}

export interface FormField {
  id: keyof FormState
  label: string
  type: string
  placeholder: string
  required: boolean
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatMontant(montant: string): string {
  return Number(montant).toLocaleString('fr-FR') + ' €'
}

function capitalize(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase())
}

function dateIn(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function interpolate(str: string, vars: Record<string, string>): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? '')
}

// Métadonnées fixes par niveau (couleurs, labels)
const LEVEL_META: Record<number, Pick<EmailTemplate, 'label' | 'tone' | 'dot' | 'tag' | 'border'>> = {
  1: { label: 'Niveau 1 · J+7',  tone: 'Rappel amical',   dot: 'bg-green-500',  tag: 'bg-green-50 text-green-700',   border: 'border-l-green-500'  },
  2: { label: 'Niveau 2 · J+15', tone: 'Relance ferme',   dot: 'bg-orange-500', tag: 'bg-orange-50 text-orange-700', border: 'border-l-orange-500' },
  3: { label: 'Niveau 3 · J+30', tone: 'Mise en demeure', dot: 'bg-red-500',    tag: 'bg-red-50 text-red-700',       border: 'border-l-red-500'    },
}

// ─── Génération ─────────────────────────────────────────────────────────────

export function genEmailLevel(
  level: 1 | 2 | 3,
  prenom: string,
  client: string,
  facture: string,
  montant: string,
  echeance: string,
): EmailTemplate {
  const tpl = pickRandom(TEMPLATES[level])
  const vars: Record<string, string> = {
    client:   capitalize(client),
    montant:  formatMontant(montant),
    echeance: formatDate(echeance),
    ref:      facture ? ` n°${facture}` : '',
    deadline: dateIn(5),
    prenom,
  }
  return {
    level,
    ...LEVEL_META[level],
    subject: interpolate(tpl.subject, vars),
    body:    interpolate(tpl.body, vars),
  }
}

export function genEmails(
  prenom: string,
  client: string,
  facture: string,
  montant: string,
  echeance: string,
): EmailTemplate[] {
  return ([1, 2, 3] as const).map(level =>
    genEmailLevel(level, prenom, client, facture, montant, echeance)
  )
}