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

// ─── Génération des emails ─────────────────────────────────────────────────

export function genEmails(
  prenom: string,
  client: string,
  facture: string,
  montant: string,
  echeance: string,
): EmailTemplate[] {
  const m = formatMontant(montant)
  const d = formatDate(echeance)
  const c = capitalize(client)
  const refLabel = facture ? ` n°${facture}` : ''
  const deadline = dateIn(5)

  return [
    {
      level: 1,
      label: 'Niveau 1 · J+7',
      tone: 'Rappel amical',
      dot: 'bg-green-500',
      tag: 'bg-green-50 text-green-700',
      border: 'border-l-green-500',
      subject: `Rappel – Facture${refLabel}`,
      body: `Bonjour ${c},

J'espère que vous allez bien. Je me permets de revenir sur ma facture de ${m}, dont l'échéance était fixée au ${d}.

Peut-être est-elle passée entre les mailles ? Si vous avez déjà procédé au règlement, merci de ne pas tenir compte de ce message.

Dans le cas contraire, je reste disponible pour tout renseignement.

Cordialement,
${prenom}`,
    },
    {
      level: 2,
      label: 'Niveau 2 · J+15',
      tone: 'Relance ferme',
      dot: 'bg-orange-500',
      tag: 'bg-orange-50 text-orange-700',
      border: 'border-l-orange-500',
      subject: `Relance – Facture${refLabel} toujours impayée`,
      body: `Bonjour ${c},

Sauf erreur de ma part, ma facture de ${m}, échue le ${d}, reste impayée à ce jour malgré mon précédent message.

Je vous remercie de bien vouloir y donner suite dans les meilleurs délais. Sans retour de votre part avant le ${deadline}, je me verrai dans l'obligation de prendre d'autres dispositions.

Cordialement,
${prenom}`,
    },
    {
      level: 3,
      label: 'Niveau 3 · J+30',
      tone: 'Mise en demeure',
      dot: 'bg-red-500',
      tag: 'bg-red-50 text-red-700',
      border: 'border-l-red-500',
      subject: `Mise en demeure – Règlement facture${refLabel}`,
      body: `Bonjour ${c},

Par la présente, je vous mets en demeure de procéder au règlement de la somme de ${m}, augmentée des pénalités de retard légales (3 fois le taux d'intérêt légal en vigueur), dans un délai de 8 jours à compter de la réception de ce message.

À défaut de règlement dans ce délai, je me verrai contraint(e) d'engager les démarches de recouvrement appropriées, pouvant inclure une procédure judiciaire.

Cordialement,
${prenom}`,
    },
  ]
}
