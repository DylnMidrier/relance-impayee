'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '../lib/supabase'
import type { Facture, Relance, ScheduledSend, Plan } from './page'
import { FormState, EmailTemplate, genEmails, genEmailLevel } from '../lib/emails'
import UpgradeModal from '../components/UpgradeModal'
import ResultsModal from '../components/ResultsModal'

// ─── helpers ─────────────────────────────────────────────────────────────────

function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function addDays(dateStr: string, days: number): string {
  const d = parseLocalDate(dateStr)
  d.setDate(d.getDate() + days)
  return isoDate(d)
}

function isoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatEuro(n: number | null) {
  if (n == null) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function FormatEuroSplit({ n }: { n: number | null }) {
  if (n == null) return <span>—</span>
  const formatted = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n)
  return (
    <>
      <span>{formatted}</span>
      <span className="text-lg font-bold text-[#8891b4] ml-1">€</span>
    </>
  )
}

function formatDateShort(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

function normalizeStatus(statut: string | null) {
  if (statut === 'payé' || statut === 'litigieux') return statut
  return 'en_attente'
}

const DAY_ABBR = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa']

const LEVEL_COLORS: Record<number, { chip: string; dot: string }> = {
  1: { chip: 'bg-indigo-900/40 text-indigo-300', dot: 'bg-indigo-400' },
  2: { chip: 'bg-amber-900/40 text-amber-300', dot: 'bg-amber-400' },
  3: { chip: 'bg-red-900/40 text-red-300', dot: 'bg-red-400' },
}

const LEVEL_LABELS: Record<number, string> = { 1: 'J+7', 2: 'J+15', 3: 'J+30' }
const LEVEL_OFFSETS: Record<number, number> = { 1: 7, 2: 15, 3: 30 }

const STATUS_OPTIONS = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'payé', label: 'Payé ✓' },
  { value: 'litigieux', label: 'Litigieux' },
]

// ─── component ───────────────────────────────────────────────────────────────

export default function DashboardClient({ factures: initial, plan, paymentSuccess = false, hasMore: initialHasMore = false, userId }: { factures: Facture[]; plan: Plan; paymentSuccess?: boolean; hasMore?: boolean; userId: string }) {
  const [factures, setFactures] = useState(initial)
  const [editingEvent, setEditingEvent] = useState<{
    factureId: string; nomClient: string; numeroFacture: string | null; echeance: string; niveau: number
  } | null>(null)
  const [editDate, setEditDate] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [gcalMsg, setGcalMsg] = useState<{ text: string; needsReauth?: boolean; canRetry?: boolean } | null>(null)
  const [deletingFacture, setDeletingFacture] = useState<{ facture: Facture; deleteGCal: boolean } | null>(null)
  const [confirmGCalDelete, setConfirmGCalDelete] = useState<Facture | null>(null)
  const [deletingGCal, setDeletingGCal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgradeContext, setUpgradeContext] = useState<'gcal' | 'quota'>('gcal')

  // ── Generate form ──────────────────────────────────────────────────────────
  const [userPrenom, setUserPrenom] = useState('')
  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      const given = user?.user_metadata?.given_name ?? user?.user_metadata?.full_name?.split(' ')[0] ?? ''
      if (given) {
        setUserPrenom(given)
        setGenerateForm(prev => ({ ...prev, prenom: given }))
      }
    })
  }, [])

  const emptyForm: FormState = { prenom: userPrenom, client: '', emailClient: '', facture: '', montant: '', echeance: '' }
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generateForm, setGenerateForm] = useState<FormState>(emptyForm)
  const [emails, setEmails] = useState<EmailTemplate[]>([])
  const [generateFactureId, setGenerateFactureId] = useState<string | null>(null)
  const [showResultsModal, setShowResultsModal] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [toastClosing, setToastClosing] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [generateLoading, setGenerateLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(paymentSuccess)

  useEffect(() => {
    if (paymentSuccess) {
      const url = new URL(window.location.href)
      url.searchParams.delete('payment_success')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    let enAttente = 0, enCours = 0, recupere = 0
    for (const f of factures) {
      if (f.statut === 'payé') recupere += f.montant ?? 0
      else { enAttente += f.montant ?? 0; enCours++ }
    }
    return { enAttente, enCours, recupere }
  }, [factures])

  // ── GCal sync status ──────────────────────────────────────────────────────
  const { unsyncedCount, syncableTotal } = useMemo(() => {
    const syncable = factures.filter(f => f.date_echeance && f.statut !== 'payé')
    const unsynced = syncable.filter(f => !f.gcal_event_ids?.length)
    return { unsyncedCount: unsynced.length, syncableTotal: syncable.length }
  }, [factures])

  // ── Sauvegarde les tokens Gmail au chargement (provider_refresh_token dispo juste après OAuth) ──
  useEffect(() => {
    async function saveTokens() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.provider_refresh_token) return
      await supabase.from('profiles').update({
        gmail_access_token:  session.provider_token ?? undefined,
        gmail_refresh_token: session.provider_refresh_token,
      }).eq('id', userId)
    }
    saveTokens()
  }, [userId])

  // ── Verify GCal events on mount ───────────────────────────────────────────
  useEffect(() => {
    const facturesWithEvents = initial.filter(f => f.gcal_event_ids?.length)
    if (!facturesWithEvents.length) return

    async function verify() {
      const { data: { session } } = await createClient().auth.getSession()
      const token = session?.provider_token
      if (!token) return

      const factureIds: Record<string, string[]> = {}
      for (const f of facturesWithEvents) factureIds[f.id] = f.gcal_event_ids!

      const res = await fetch('/api/google-calendar/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, factureIds }),
      })
      if (!res.ok) return

      const { missingFactureIds } = await res.json() as { missingFactureIds: string[] }
      if (!missingFactureIds.length) return

      setFactures(prev => prev.map(f =>
        missingFactureIds.includes(f.id) ? { ...f, gcal_event_ids: null } : f
      ))
      const supabase = createClient()
      await Promise.all(
        missingFactureIds.map(id =>
          supabase.from('factures').update({ gcal_event_ids: null }).eq('id', id)
        )
      )
    }

    verify()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Calendar ──────────────────────────────────────────────────────────────
  const { days, eventsByDate } = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() + i); return d
    })
    const eventsByDate: Record<string, Array<{ facture: Facture; niveau: number; sent: boolean }>> = {}
    for (const facture of factures) {
      if (!facture.date_echeance || facture.statut === 'payé') continue
      for (const [offset, niveau] of [[7, 1], [15, 2], [30, 3]] as [number, number][]) {
        const key = addDays(facture.date_echeance, offset)
        if (!eventsByDate[key]) eventsByDate[key] = []
        const sent = (facture.relances ?? []).some(r => r.niveau === niveau && r.statut === 'envoyée')
        eventsByDate[key].push({ facture, niveau, sent })
      }
    }
    return { days, eventsByDate }
  }, [factures])

  const todayKey = isoDate(new Date())

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleStatusChange(id: string, statut: string) {
    const previous = factures.find(f => f.id === id)?.statut ?? null
    setFactures(prev => prev.map(f => f.id === id ? { ...f, statut } : f))
    const { error } = await createClient().from('factures').update({ statut }).eq('id', id)
    if (error) {
      setFactures(prev => prev.map(f => f.id === id ? { ...f, statut: previous } : f))
      showToast('Impossible de modifier le statut.', 'error')
    }
  }

  function openEditEvent(facture: Facture, niveau: number) {
    setEditingEvent({ factureId: facture.id, nomClient: facture.nom_client, numeroFacture: facture.numero_facture ?? null, echeance: facture.date_echeance ?? '', niveau })
    setEditDate(facture.date_echeance ?? '')
  }

  async function handleDateSave() {
    if (!editingEvent || !editDate) return
    const supabase = createClient()
    await supabase.from('factures').update({ date_echeance: editDate }).eq('id', editingEvent.factureId)
    await Promise.all(
      ([1, 2, 3] as const).map(n =>
        supabase.from('relances')
          .update({ date_planifiee: addDays(editDate, LEVEL_OFFSETS[n]) })
          .eq('facture_id', editingEvent.factureId)
          .eq('niveau', n)
      )
    )
    setFactures(prev => prev.map(f =>
      f.id === editingEvent.factureId
        ? { ...f, date_echeance: editDate, relances: f.relances.map(r => ({ ...r, date_planifiee: addDays(editDate, LEVEL_OFFSETS[r.niveau]) })) }
        : f
    ))
    setEditingEvent(null)
  }

  async function handleGCalSync() {
    setSyncing(true); setGcalMsg(null)
    const { data: { session } } = await createClient().auth.getSession()
    const token = session?.provider_token
    if (!token) {
      setGcalMsg({ text: 'Reconnectez-vous pour autoriser l\'accès Google Calendar.' })
      setSyncing(false); return
    }
    const toSync = factures.filter(f => f.date_echeance && f.statut !== 'payé')
    const res = await fetch('/api/google-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, factures: toSync }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string }
      if (body.error === 'insufficient_scope') {
        setGcalMsg({ text: 'Votre compte Google n\'a pas encore autorisé l\'accès au calendrier.', needsReauth: true })
      } else if (res.status === 401) {
        setGcalMsg({ text: 'Session Google expirée. Reconnectez-vous pour synchroniser.', needsReauth: true })
      } else if (res.status === 429) {
        setGcalMsg({ text: 'Limite Google Calendar atteinte. Réessayez dans quelques minutes.', canRetry: true })
      } else {
        setGcalMsg({ text: 'Erreur lors de la synchronisation. Réessayez.', canRetry: true })
      }
      setSyncing(false); return
    }
    const { eventIds } = await res.json() as { eventIds: Record<string, string[]> }
    const supabase = createClient()
    await Promise.all(
      Object.entries(eventIds).map(([id, ids]) =>
        supabase.from('factures').update({ gcal_event_ids: ids }).eq('id', id)
      )
    )
    setFactures(prev => prev.map(f => eventIds[f.id] ? { ...f, gcal_event_ids: eventIds[f.id] } : f))
    setSyncing(false)
  }

  async function handleReauth() {
    await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.send',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
  }

  async function handleDeleteGCalEvents(facture: Facture) {
    setConfirmGCalDelete(facture)
  }

  async function confirmDeleteGCalEvents() {
    if (!confirmGCalDelete) return
    setDeletingGCal(true)
    const { data: { session } } = await createClient().auth.getSession()
    const token = session?.provider_token
    if (token) {
      await fetch('/api/google-calendar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, eventIds: confirmGCalDelete.gcal_event_ids }),
      })
    }
    await createClient().from('factures').update({ gcal_event_ids: null }).eq('id', confirmGCalDelete.id)
    setFactures(prev => prev.map(f => f.id === confirmGCalDelete.id ? { ...f, gcal_event_ids: null } : f))
    setConfirmGCalDelete(null)
    setDeletingGCal(false)
  }

  async function confirmDeleteFacture() {
    if (!deletingFacture) return
    setDeleting(true)
    const { facture, deleteGCal } = deletingFacture

    if (deleteGCal && facture.gcal_event_ids?.length) {
      const { data: { session } } = await createClient().auth.getSession()
      const token = session?.provider_token
      if (token) {
        await fetch('/api/google-calendar', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, eventIds: facture.gcal_event_ids }),
        })
      }
    }

    const { error } = await createClient().from('factures').delete().eq('id', facture.id) // cascade → relances supprimées
    if (error) {
      setDeleting(false)
      showToast('Impossible de supprimer la relance. Réessayez.', 'error')
      return
    }

    setFactures(prev => prev.filter(f => f.id !== facture.id))
    setDeletingFacture(null)
    setDeleting(false)
    showToast('Relance supprimée.', 'success')
  }

  // ── Toggle envoi ──────────────────────────────────────────────────────────
  async function handleToggleEnvoi(facture: Facture, niveau: number) {
    const relances = facture.relances ?? []
    const rel = relances.find(r => r.niveau === niveau)
    if (!rel) return
    const isSent = rel.statut === 'envoyée'
    const now = new Date().toISOString()
    const supabase = createClient()

    if (isSent) {
      // Désactiver N → désactiver aussi tous les niveaux > N qui sont envoyés
      const niveauxToDeactivate = [1, 2, 3].filter(n => n >= niveau && relances.some(r => r.niveau === n && r.statut === 'envoyée'))
      await Promise.all(niveauxToDeactivate.map(n => {
        const r = relances.find(r => r.niveau === n)!
        return supabase.from('relances').update({ statut: 'planifiée', date_envoi: null }).eq('id', r.id)
      }))
      setFactures(prev => prev.map(f =>
        f.id === facture.id
          ? { ...f, relances: f.relances.map(r => niveauxToDeactivate.includes(r.niveau) ? { ...r, statut: 'planifiée' as Relance['statut'], date_envoi: null } : r) }
          : f
      ))
    } else {
      // Activer N → activer aussi tous les niveaux < N qui ne sont pas encore envoyés
      const niveauxToActivate = [1, 2, 3].filter(n => n <= niveau && relances.some(r => r.niveau === n && r.statut !== 'envoyée'))
      await Promise.all(niveauxToActivate.map(n => {
        const r = relances.find(r => r.niveau === n)!
        return supabase.from('relances').update({ statut: 'envoyée', date_envoi: now }).eq('id', r.id)
      }))
      setFactures(prev => prev.map(f =>
        f.id === facture.id
          ? { ...f, relances: f.relances.map(r => niveauxToActivate.includes(r.niveau) ? { ...r, statut: 'envoyée' as Relance['statut'], date_envoi: now } : r) }
          : f
      ))
    }
  }

  // ── Generate handlers ─────────────────────────────────────────────────────
  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type })
    setToastClosing(false)
    setTimeout(() => { setToastClosing(true); setTimeout(() => setToast(null), 320) }, 4000)
  }

  async function handleToggleAutoSend(facture: Facture) {
    if (plan === 'free') { setUpgradeContext('gcal'); setShowUpgrade(true); return }
    if (!facture.email_client) {
      showToast('Ajoutez l\'email du client pour activer l\'envoi automatique.', 'error')
      return
    }
    const supabase = createClient()
    const isActive = (facture.scheduled_sends ?? []).some(s => !s.sent_at)

    if (isActive) {
      // Désactiver — supprimer les scheduled_sends non envoyés
      await supabase
        .from('scheduled_sends')
        .delete()
        .eq('facture_id', facture.id)
        .is('sent_at', null)
      setFactures(prev => prev.map(f =>
        f.id === facture.id
          ? { ...f, scheduled_sends: (f.scheduled_sends ?? []).filter(s => s.sent_at !== null) }
          : f
      ))
      showToast('Envoi automatique désactivé.', 'success')
    } else {
      // Activer — créer les scheduled_sends pour les niveaux non encore envoyés
      if (!facture.date_echeance) {
        showToast('Ajoutez une date d\'échéance pour activer l\'envoi automatique.', 'error')
        return
      }
      const OFFSETS: Record<number, number> = { 1: 7, 2: 15, 3: 30 }
      const niveauxRestants = [1, 2, 3].filter(n =>
        !(facture.relances ?? []).some(r => r.niveau === n && r.statut === 'envoyée') &&
        !(facture.scheduled_sends ?? []).some(s => s.niveau === n && !s.sent_at)
      )
      const rows = niveauxRestants.map(n => {
        const d = parseLocalDate(facture.date_echeance!)
        d.setDate(d.getDate() + OFFSETS[n])
        // Utiliser Date.UTC sur les composantes locales pour éviter le décalage DST
        const sendAt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 8, 30, 0, 0))
        return { facture_id: facture.id, niveau: n, send_at: sendAt.toISOString() }
      })
      if (!rows.length) {
        showToast('Tous les niveaux ont déjà été envoyés.', 'success')
        return
      }
      const { data: inserted } = await supabase
        .from('scheduled_sends')
        .insert(rows)
        .select()
      setFactures(prev => prev.map(f =>
        f.id === facture.id
          ? { ...f, scheduled_sends: [...(f.scheduled_sends ?? []), ...(inserted ?? [])] }
          : f
      ))
      showToast(`Envoi automatique activé — ${rows.length} email${rows.length > 1 ? 's' : ''} programmé${rows.length > 1 ? 's' : ''}.`, 'success')
    }
  }

  async function handleGenerateSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // Vérification du quota AVANT de générer
    if (plan === 'free') {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { count } = await supabase
          .from('factures')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .neq('statut', 'payé')
        if ((count ?? 0) >= 1) {
          setUpgradeContext('quota')
          setShowUpgrade(true)
          return
        }
      }
    }

    setGenerateLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setGenerateLoading(false); return }

    const { data: factureData, error } = await supabase
      .from('factures')
      .insert({
        user_id: user.id,
        nom_client: generateForm.client,
        email_client: generateForm.emailClient || null,
        numero_facture: generateForm.facture || null,
        montant: parseFloat(generateForm.montant) || null,
        date_echeance: generateForm.echeance || null,
      })
      .select('id')
      .single()

    if (error || !factureData) {
      setGenerateLoading(false)
      showToast('Impossible d\'enregistrer la relance.', 'error')
      return
    }

    const generatedEmails = genEmails(generateForm.prenom, generateForm.client, generateForm.facture, generateForm.montant, generateForm.echeance)

    setFactures(prev => [{
      id: factureData.id,
      nom_client: generateForm.client,
      email_client: generateForm.emailClient || null,
      numero_facture: generateForm.facture || null,
      montant: parseFloat(generateForm.montant) || null,
      date_echeance: generateForm.echeance || null,
      statut: 'en_attente',
      created_at: new Date().toISOString(),
      gcal_event_ids: null,
      relances: [] as Relance[],
    } as Facture, ...prev])

    setEmails(generatedEmails)
    setGenerateFactureId(factureData.id)
    setGenerateLoading(false)
    setShowGenerateModal(false)
    setShowResultsModal(true)
    showToast('Relance enregistrée ✓', 'success')
  }

  async function handleLoadMore() {
    setLoadingMore(true)
    const { data } = await createClient()
      .from('factures')
      .select('*, relances(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(factures.length, factures.length + 49)
    if (data) {
      setFactures(prev => [...prev, ...(data as Facture[])])
      setHasMore(data.length === 50)
    }
    setLoadingMore(false)
  }

  function handleRegenerateLevel(level: number) {
    const newEmail = genEmailLevel(level as 1 | 2 | 3, generateForm.prenom, generateForm.client, generateForm.facture, generateForm.montant, generateForm.echeance)
    setEmails(prev => prev.map(e => e.level === level ? newEmail : e))
  }

  async function handleManageSubscription() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: window.location.origin }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setPortalLoading(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-[#0c0e14] pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <div className="flex items-center justify-end gap-2">
          {plan === 'premium' && (
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-white/10 text-[#8891b4] hover:border-white/20 hover:text-[#f0f2ff] transition-colors disabled:opacity-50"
            >
              {portalLoading ? 'Chargement…' : 'Gérer mon abonnement'}
            </button>
          )}
          <button
            onClick={() => { setGenerateForm(emptyForm); setShowGenerateModal(true) }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-[#7c6dfa] hover:bg-[#6a5be0] text-white transition-colors shadow-[0_0_20px_rgba(124,109,250,0.25)]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nouvelle facture
          </button>
        </div>

        {/* ── KPI summary ─────────────────────────────────────────────────── */}
        <section className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-[#13151f] border border-white/[0.07] rounded-xl p-3.5 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-[#454d6e] mb-1 sm:mb-1.5 leading-tight uppercase tracking-wider">
              <span className="sm:hidden">En attente</span>
              <span className="hidden sm:inline">Montant en attente</span>
            </p>
            <p className="text-base sm:text-2xl font-black text-[#f0f2ff] tracking-tight">{formatEuro(kpis.enAttente)}</p>
          </div>
          <div className="bg-[#13151f] border border-white/[0.07] rounded-xl p-3.5 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-[#454d6e] mb-1 sm:mb-1.5 leading-tight uppercase tracking-wider">
              <span className="sm:hidden">En cours</span>
              <span className="hidden sm:inline">Factures en cours</span>
            </p>
            <p className="text-base sm:text-2xl font-black text-[#f0f2ff] tracking-tight">{kpis.enCours}</p>
          </div>
          <div className="bg-[#13151f] border border-white/[0.07] rounded-xl p-3.5 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-[#454d6e] mb-1 sm:mb-1.5 leading-tight uppercase tracking-wider">
              <span className="sm:hidden">Récupéré</span>
              <span className="hidden sm:inline">Montant récupéré</span>
            </p>
            <p className="text-base sm:text-2xl font-black text-emerald-400 tracking-tight">{formatEuro(kpis.recupere)}</p>
          </div>
        </section>

        {/* ── Calendar ────────────────────────────────────────────────────── */}
        <section className="bg-[#13151f] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-white/[0.05]">
            <div>
              <h2 className="text-sm font-bold text-[#f0f2ff]">Calendrier des relances</h2>
              <p className="text-xs text-[#454d6e] mt-0.5">Rappels calculés 7, 15 et 30 jours après l'échéance</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!gcalMsg && syncableTotal > 0 && (
                unsyncedCount > 0 ? (
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                    </span>
                    {unsyncedCount} relance{unsyncedCount > 1 ? 's' : ''} non synchronisée{unsyncedCount > 1 ? 's' : ''}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5">
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Calendrier à jour
                  </div>
                )
              )}

              {gcalMsg && (
                <div className="flex items-center gap-2 text-xs font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1.5">
                  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <span>{gcalMsg.text}</span>
                  {gcalMsg.needsReauth && (
                    <button
                      onClick={handleReauth}
                      className="ml-1 font-semibold text-[#7c6dfa] hover:text-[#9d91fb] underline underline-offset-2 transition-colors whitespace-nowrap"
                    >
                      Autoriser →
                    </button>
                  )}
                  {gcalMsg.canRetry && (
                    <button
                      onClick={() => { setGcalMsg(null); handleGCalSync() }}
                      className="ml-1 font-semibold text-red-400 hover:text-red-300 underline underline-offset-2 transition-colors whitespace-nowrap"
                    >
                      Réessayer →
                    </button>
                  )}
                </div>
              )}

              {plan === 'free' ? (
                <button
                  onClick={() => { setUpgradeContext('gcal'); setShowUpgrade(true) }}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#7c6dfa]/30 text-[#7c6dfa] bg-[#7c6dfa]/5 hover:bg-[#7c6dfa]/15 hover:border-[#7c6dfa]/60 hover:shadow-[0_0_12px_rgba(124,109,250,0.2)] transition-all whitespace-nowrap"
                >
                  <svg className="w-3.5 h-3.5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Sync Google Calendar
                </button>
              ) : (
                <button
                  onClick={handleGCalSync}
                  disabled={syncing}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[#7c6dfa]/30 text-[#7c6dfa] bg-[#7c6dfa]/5 hover:bg-[#7c6dfa]/15 hover:border-[#7c6dfa]/60 hover:shadow-[0_0_12px_rgba(124,109,250,0.2)] transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  <svg className={`w-3.5 h-3.5 shrink-0 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    {syncing
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      : <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    }
                  </svg>
                  {syncing ? 'Synchronisation…' : 'Sync Google Calendar'}
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="flex min-w-max px-4 py-4 gap-1">
              {days.map((day) => {
                const key = isoDate(day)
                const isToday = key === todayKey
                const events = eventsByDate[key] ?? []
                return (
                  <div key={key} className="flex flex-col items-center min-w-[56px]">
                    <div className={`text-[10px] font-medium mb-1 ${isToday ? 'text-[#7c6dfa]' : 'text-[#454d6e]'}`}>
                      {DAY_ABBR[day.getDay()]}
                    </div>
                    <div className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full mb-2 ${
                      isToday ? 'bg-[#7c6dfa] text-white' : 'text-[#8891b4]'
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      {events.map(({ facture, niveau, sent }) => (
                        <button
                          key={`${facture.id}-${niveau}`}
                          onClick={() => openEditEvent(facture, niveau)}
                          title={`${facture.nom_client} — Niveau ${niveau} (${LEVEL_LABELS[niveau]})\nCliquer pour modifier l'échéance`}
                          className={`text-[10px] font-medium px-1 py-0.5 rounded text-left leading-tight w-full truncate transition-opacity hover:opacity-80 ${
                            sent ? 'opacity-30' : ''
                          } ${LEVEL_COLORS[niveau].chip}`}
                        >
                          {LEVEL_LABELS[niveau]} {facture.nom_client.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-5 px-5 py-3 border-t border-white/[0.05]">
            {([1, 2, 3] as const).map(n => (
              <div key={n} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${LEVEL_COLORS[n].dot}`} />
                <span className="text-[10px] text-[#454d6e]">Niveau {n} — {LEVEL_LABELS[n]}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-1">
              <div className="w-2 h-2 rounded-full bg-white/10" />
              <span className="text-[10px] text-[#454d6e]">Déjà envoyé</span>
            </div>
          </div>
        </section>

        {/* ── Historique ──────────────────────────────────────────────────── */}
        <section className="bg-[#13151f] border border-white/[0.07] rounded-xl overflow-hidden">
          <div className="px-5 py-5 border-b border-white/[0.05]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold mb-0.5 bg-gradient-to-r from-[#f0f2ff] to-[#7c6dfa] bg-clip-text text-transparent inline-block">
                  Historique des factures
                </h2>
                <p className="text-xs text-[#454d6e]">
                  {factures.filter(f => f.statut !== 'payé').length} facture{factures.filter(f => f.statut !== 'payé').length !== 1 ? 's' : ''} · En cours de recouvrement
                </p>
              </div>
              <div className="bg-[#7c6dfa]/10 border border-[#7c6dfa]/20 rounded-xl px-4 py-2.5 text-right shrink-0">
                <p className="text-[9px] font-semibold text-[#454d6e] uppercase tracking-widest mb-0.5">Total impayé</p>
                <p className="text-lg font-black text-[#f0f2ff] leading-none">{formatEuro(kpis.enAttente)}</p>
              </div>
            </div>
          </div>

          {factures.length === 0 ? (
            <div className="px-5 py-14 text-center text-sm text-[#454d6e] flex flex-col items-center gap-3">
              <span>Aucune relance pour l'instant.</span>
              <button
                onClick={() => { setGenerateForm(emptyForm); setShowGenerateModal(true) }}
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-[#7c6dfa] hover:bg-[#6a5be0] text-white transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Ajouter ma première facture
              </button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {factures.map((facture) => {
                const status = normalizeStatus(facture.statut)
                return (
                  <div key={facture.id} className="bg-[#0c0e14]/50 border border-white/[0.06] rounded-2xl p-4 sm:p-5">
                    {/* Row 1 — nom + select statut + supprimer */}
                    <div className="flex items-center gap-2 min-w-0 mb-4">
                      <p className="text-sm font-bold text-[#f0f2ff] truncate flex-1 min-w-0 capitalize">
                        {facture.nom_client}
                      </p>
                      <select
                        value={status}
                        onChange={e => handleStatusChange(facture.id, e.target.value)}
                        className={`shrink-0 text-[10px] font-bold px-3 py-1.5 rounded-full border cursor-pointer appearance-none transition-colors uppercase tracking-wide ${
                          status === 'payé'
                            ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400'
                            : status === 'litigieux'
                            ? 'bg-red-500/15 border-red-500/25 text-red-400'
                            : 'bg-amber-500/15 border-amber-500/25 text-amber-400'
                        }`}
                      >
                        {STATUS_OPTIONS.map(o => (
                          <option key={o.value} value={o.value} className="bg-[#13151f] text-[#f0f2ff] normal-case">{o.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setDeletingFacture({ facture, deleteGCal: plan !== 'free' && (facture.gcal_event_ids?.length ?? 0) > 0 })}
                        title="Supprimer cette relance"
                        className="shrink-0 p-2 text-[#454d6e] hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-white/[0.07] transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Row 2 — bloc infos (ref / montant / échéance + email) */}
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 sm:p-4 mb-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-4">
                      <div className="min-w-0">
                        <p className="text-[9px] font-semibold text-[#454d6e] uppercase tracking-widest mb-1.5">Référence</p>
                        <p className="font-mono text-xs text-[#8891b4] truncate">
                          {facture.numero_facture ?? '—'}
                        </p>
                      </div>
                      <div className="text-center shrink-0">
                        <p className="text-xl sm:text-3xl font-black text-[#f0f2ff] tracking-tight leading-none flex items-baseline justify-center">
                          <FormatEuroSplit n={facture.montant} />
                        </p>
                      </div>
                      <div className="text-right min-w-0">
                        <p className="text-[9px] font-semibold text-[#454d6e] uppercase tracking-widest mb-1.5">Échéance</p>
                        {facture.date_echeance ? (
                          <p className="text-base font-bold text-amber-400 leading-none">{formatDateShort(facture.date_echeance)}</p>
                        ) : (
                          <p className="text-sm text-[#454d6e]">—</p>
                        )}
                        {facture.email_client && (
                          <p className="text-[10px] text-[#454d6e] truncate mt-1">{facture.email_client}</p>
                        )}
                      </div>
                    </div>

                    {/* Row 3 — niveaux + envoi auto sur la même ligne */}
                    {status !== 'payé' && (() => {
                      const autoActive = (facture.scheduled_sends ?? []).some(s => !s.sent_at)
                      const nextSend = (facture.scheduled_sends ?? [])
                        .filter(s => !s.sent_at)
                        .sort((a, b) => new Date(a.send_at).getTime() - new Date(b.send_at).getTime())[0]
                      const sentColors = ['', 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25', 'bg-amber-500/15 text-amber-300 border-amber-500/25', 'bg-red-500/15 text-red-300 border-red-500/25']
                      const sentDots = ['', 'bg-indigo-400', 'bg-amber-400', 'bg-red-400']
                      return (
                        <div className="flex flex-wrap items-center gap-2">
                          {([1, 2, 3] as const).map(n => {
                            const sent = (facture.relances ?? []).some(r => r.niveau === n && r.statut === 'envoyée')
                            const dateStr = facture.date_echeance ? addDays(facture.date_echeance, LEVEL_OFFSETS[n]) : null
                            const dateLabel = dateStr ? new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : null
                            return (
                              <button
                                key={n}
                                onClick={() => handleToggleEnvoi(facture, n)}
                                title={sent ? `Annuler la relance ${n}` : `Marquer la relance ${n} comme envoyée`}
                                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                                  sent
                                    ? sentColors[n]
                                    : 'bg-white/[0.03] border-white/[0.08] text-[#454d6e] hover:border-white/[0.15] hover:text-[#8891b4]'
                                }`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${sent ? sentDots[n] : 'bg-white/20'}`} />
                                {n === 1 ? '1re relance' : n === 2 ? '2e relance' : 'Mise en demeure'}
                                {dateLabel && (
                                  <span className={`font-normal hidden sm:inline ${sent ? 'opacity-70' : 'text-[#454d6e]'}`}>· {dateLabel}</span>
                                )}
                              </button>
                            )
                          })}
                          {autoActive ? (
                            <button
                              onClick={() => handleToggleAutoSend(facture)}
                              className="ml-auto inline-flex items-center gap-2 text-xs font-semibold px-4 py-1.5 rounded-full bg-[#7c6dfa] text-white shadow-[0_0_20px_rgba(124,109,250,0.35)] hover:bg-[#6a5be0] transition-all"
                            >
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-white animate-pulse" />
                              Envoi auto
                              {nextSend && (
                                <span className="font-normal opacity-80 hidden sm:inline">
                                  · prochain envoi prévu {new Date(nextSend.send_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleAutoSend(facture)}
                              className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full border border-[#7c6dfa]/30 text-[#7c6dfa] bg-[#7c6dfa]/5 hover:bg-[#7c6dfa]/15 hover:border-[#7c6dfa]/60 hover:shadow-[0_0_12px_rgba(124,109,250,0.2)] transition-all"
                            >
                              {plan === 'free' ? (
                                <svg className="w-3 h-3 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M13 2L4.5 13.5H11L10 22L20.5 9.5H14L13 2Z" />
                                </svg>
                              )}
                              Envoi auto
                            </button>
                          )}
                        </div>
                      )
                    })()}
                    {status === 'payé' && (facture.gcal_event_ids?.length ?? 0) > 0 && plan !== 'free' && (
                      <button
                        onClick={() => handleDeleteGCalEvents(facture)}
                        className="mt-1.5 text-xs text-[#454d6e] hover:text-red-400 transition-colors underline underline-offset-2"
                      >
                        Supprimer rappels Calendar
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {hasMore && (
            <div className="px-5 py-4 border-t border-white/[0.05] text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="text-xs font-semibold text-[#7c6dfa] hover:text-[#9d91fb] disabled:opacity-50 transition-colors"
              >
                {loadingMore ? 'Chargement…' : 'Charger plus'}
              </button>
            </div>
          )}
        </section>

      </div>

      {/* ── Edit date modal ──────────────────────────────────────────────── */}
      {editingEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={e => { if (e.target === e.currentTarget) setEditingEvent(null) }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-1">Modifier l'échéance</h3>
            <p className="text-xs text-gray-500 mb-4">
              <span className="font-medium text-gray-700">{editingEvent.nomClient}</span>
              {editingEvent.numeroFacture && (
                <span className="ml-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">{editingEvent.numeroFacture}</span>
              )}
              {' '}— Niveau {editingEvent.niveau} ({LEVEL_LABELS[editingEvent.niveau]})<br />
              <span className="text-gray-400">Les 3 rappels seront recalculés depuis la nouvelle date.</span>
            </p>
            <input
              type="date"
              value={editDate}
              onChange={e => setEditDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-indigo-400 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditingEvent(null)}
                className="text-xs px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDateSave}
                className="text-xs px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      <UpgradeModal
        show={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        feature={upgradeContext === 'quota' ? 'Limite du plan Gratuit atteinte' : 'Synchronisation Google Calendar'}
        description={upgradeContext === 'quota' ? 'Vous avez déjà 1 facture active. Passez Premium pour gérer plusieurs factures impayées simultanément.' : undefined}
      />

      {/* ── Generate modal ───────────────────────────────────────────────── */}
      {showGenerateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={e => { if (e.target === e.currentTarget) setShowGenerateModal(false) }}
        >
          <div className="bg-[#13151f] border border-white/[0.08] rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.07]">
              <h3 className="text-sm font-bold text-[#f0f2ff]">Nouvelle facture</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-[#454d6e] hover:text-[#8891b4] transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleGenerateSubmit} className="px-6 py-5 space-y-4">
              {([
                { id: 'prenom',      label: 'Votre prénom',    type: 'text',   placeholder: 'Ex : Marie',                    required: true },
                { id: 'client',      label: 'Nom du client',   type: 'text',   placeholder: 'Ex : Agence Dupont',            required: true },
                { id: 'emailClient', label: 'Email du client', type: 'email',  placeholder: 'Ex : contact@agencedupont.fr', required: false },
                { id: 'facture',     label: 'N° de facture',   type: 'text',   placeholder: 'Ex : 2024-089',                required: false },
                { id: 'montant',     label: 'Montant (€)',     type: 'number', placeholder: 'Ex : 1500',                    required: true },
                { id: 'echeance',    label: "Date d'échéance", type: 'date',   placeholder: '',                             required: true },
              ] as const).map(({ id, label, type, placeholder, required }) => (
                <div key={id}>
                  <label className="block text-xs font-semibold text-[#8891b4] mb-1.5">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    min={type === 'number' ? 1 : undefined}
                    value={generateForm[id]}
                    onChange={e => setGenerateForm(prev => ({ ...prev, [id]: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[#0c0e14] border border-white/[0.08] rounded-lg text-sm text-[#f0f2ff] outline-none focus:border-[#7c6dfa]/60 focus:ring-2 focus:ring-[#7c6dfa]/10 transition-all placeholder:text-[#454d6e] [&[type=date]]:pr-2 [color-scheme:dark]"
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={generateLoading}
                className="w-full py-3 bg-[#7c6dfa] hover:bg-[#6a5be0] text-white text-sm font-bold rounded-xl transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(124,109,250,0.25)]"
              >
                {generateLoading ? 'Enregistrement…' : 'Générer mes 3 emails →'}
              </button>
            </form>
          </div>
        </div>
      )}

      <ResultsModal
        show={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        emails={emails}
        form={generateForm}
        onRegenerateLevel={handleRegenerateLevel}
        relanceId={generateFactureId}
        plan={plan}
        onSent={(id, levels) => setFactures(prev => prev.map(f =>
          f.id === id
            ? { ...f, relances: f.relances.map(r => levels.includes(r.niveau) ? { ...r, statut: 'envoyée' as const, date_envoi: new Date().toISOString() } : r) }
            : f
        ))}
        onActivateAutoSend={async (alreadySentLevels) => {
          const facture = factures.find(f => f.id === generateFactureId)
          if (!facture) return
          const patchedFacture = {
            ...facture,
            relances: facture.relances.map(r =>
              alreadySentLevels.includes(r.niveau)
                ? { ...r, statut: 'envoyée' as const }
                : r
            ),
          }
          await handleToggleAutoSend(patchedFacture)
        }}
      />

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <div className="fixed top-5 right-5 z-[80] pointer-events-none">
          <div
            style={{
              animation: `${toastClosing ? 'toast-out' : 'toast-in'} 0.32s ease-out forwards`,
              boxShadow: toast.type === 'success'
                ? '0 0 0 1px rgba(255,255,255,0.07), 0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(16,185,129,0.15)'
                : '0 0 0 1px rgba(255,255,255,0.07), 0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(239,68,68,0.15)',
            }}
            className="flex items-center gap-3 bg-[#13151f] rounded-xl px-4 py-3 pointer-events-auto max-w-xs"
          >
            <span className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/15' : 'bg-red-500/15'}`}>
              {toast.type === 'success' ? (
                <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
              )}
            </span>
            <p className="text-[#f0f2ff] text-sm font-medium leading-snug">{toast.message}</p>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ─────────────────────────────────────── */}
      {deletingFacture && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={e => { if (e.target === e.currentTarget && !deleting) setDeletingFacture(null) }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Supprimer la relance</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {deletingFacture.facture.nom_client}
                  {deletingFacture.facture.numero_facture && (
                    <span className="ml-1.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                      {deletingFacture.facture.numero_facture}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {(deletingFacture.facture.gcal_event_ids?.length ?? 0) > 0 && (
              plan === 'free' ? (
                <div className="flex items-start gap-2.5 mb-4 p-3 rounded-xl bg-gray-50 border border-gray-100 opacity-50">
                  <input type="checkbox" disabled className="mt-0.5 shrink-0" />
                  <span className="text-xs text-gray-500 leading-relaxed flex-1">
                    Supprimer également les rappels Google Calendar associés
                  </span>
                  <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-full shrink-0">Premium</span>
                </div>
              ) : (
                <label className="flex items-start gap-2.5 mb-4 cursor-pointer p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <input
                    type="checkbox"
                    checked={deletingFacture.deleteGCal}
                    onChange={e => setDeletingFacture(prev => prev ? { ...prev, deleteGCal: e.target.checked } : null)}
                    className="mt-0.5 accent-red-500 shrink-0"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    Supprimer également les rappels Google Calendar associés
                  </span>
                </label>
              )
            )}

            <p className="text-xs text-gray-400 mb-5">Cette action est irréversible.</p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeletingFacture(null)}
                disabled={deleting}
                className="text-xs px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteFacture}
                disabled={deleting}
                className="text-xs px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── GCal delete confirmation modal ───────────────────────────────── */}
      {confirmGCalDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={e => { if (e.target === e.currentTarget && !deletingGCal) setConfirmGCalDelete(null) }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Supprimer les rappels Calendar</h3>
                <p className="text-xs text-gray-500 mt-0.5">{confirmGCalDelete.nom_client}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              {(confirmGCalDelete.gcal_event_ids?.length ?? 0)} rappel{(confirmGCalDelete.gcal_event_ids?.length ?? 0) > 1 ? 's' : ''} Google Calendar seront supprimés. Cette action est irréversible.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmGCalDelete(null)}
                disabled={deletingGCal}
                className="text-xs px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteGCalEvents}
                disabled={deletingGCal}
                className="text-xs px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deletingGCal ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment success modal ─────────────────────────────────────────── */}
      {showPaymentSuccess && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setShowPaymentSuccess(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col items-center text-center gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-500">
                <path d="M12 2l2.09 6.26L21 12l-6.91 3.74L12 22l-2.09-6.26L3 12l6.91-3.74z"/>
              </svg>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 mb-1">Bienvenue dans Premium !</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Votre abonnement est actif. Relances illimitées, personnalisation IA et sync Google Calendar sont maintenant disponibles.
              </p>
            </div>
            <button
              onClick={() => setShowPaymentSuccess(false)}
              className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              Accéder au dashboard →
            </button>
          </div>
        </div>
      )}

    </main>
  )
}
