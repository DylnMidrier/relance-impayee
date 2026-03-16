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
      <span className="text-lg font-bold text-[--t2] ml-1">€</span>
    </>
  )
}


function normalizeStatus(statut: string | null) {
  if (statut === 'payé' || statut === 'litigieux') return statut
  return 'en_attente'
}

const DAY_ABBR = ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa']

const LEVEL_COLORS: Record<number, { chip: string; dot: string }> = {
  1: { chip: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
  2: { chip: 'bg-orange-100 dark:bg-amber-900/40 text-orange-700 dark:text-amber-300', dot: 'bg-orange-500' },
  3: { chip: 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300', dot: 'bg-rose-500' },
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
  const [editingEmail, setEditingEmail] = useState<{ factureId: string; niveau: number; facture: Facture } | null>(null)
  const [editEmailSubject, setEditEmailSubject] = useState('')
  const [editEmailBody, setEditEmailBody] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)
  const [savingDate, setSavingDate] = useState(false)

  useEffect(() => {
    if (paymentSuccess) {
      const url = new URL(window.location.href)
      url.searchParams.delete('payment_success')
      window.history.replaceState({}, '', url.toString())
    }
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('open') === 'generate') {
      setShowGenerateModal(true)
      const url = new URL(window.location.href)
      url.searchParams.delete('open')
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
        const relance = (facture.relances ?? []).find(r => r.niveau === niveau)
        // Utilise date_planifiee si définie, sinon calcul depuis l'échéance
        const key = relance?.date_planifiee ?? addDays(facture.date_echeance, offset)
        if (!eventsByDate[key]) eventsByDate[key] = []
        const sent = relance?.statut === 'envoyée'
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
    const relance = (facture.relances ?? []).find(r => r.niveau === niveau)
    const datePlanifiee = relance?.date_planifiee ?? (facture.date_echeance ? addDays(facture.date_echeance, LEVEL_OFFSETS[niveau]) : '')
    setEditingEvent({ factureId: facture.id, nomClient: facture.nom_client, numeroFacture: facture.numero_facture ?? null, echeance: facture.date_echeance ?? '', niveau })
    setEditDate(datePlanifiee)
  }

  async function handleDateSave() {
    if (!editingEvent || !editDate) return
    setSavingDate(true)
    const { factureId, niveau } = editingEvent
    try {
      const supabase = createClient()

      // 1. Mettre à jour date_planifiee pour ce niveau uniquement
      await supabase.from('relances')
        .update({ date_planifiee: editDate })
        .eq('facture_id', factureId)
        .eq('niveau', niveau)

      // 2. Mettre à jour send_at dans scheduled_sends pour ce niveau si pas encore envoyé
      const d = parseLocalDate(editDate)
      const sendAt = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 8, 30, 0, 0)).toISOString()
      await supabase.from('scheduled_sends')
        .update({ send_at: sendAt })
        .eq('facture_id', factureId)
        .eq('niveau', niveau)
        .is('sent_at', null)

      // 3. Mettre à jour le state local
      setFactures(prev => prev.map(f =>
        f.id === factureId
          ? {
              ...f,
              relances: f.relances.map(r =>
                r.niveau === niveau ? { ...r, date_planifiee: editDate } : r
              ),
              scheduled_sends: (f.scheduled_sends ?? []).map(s =>
                s.niveau === niveau && !s.sent_at ? { ...s, send_at: sendAt } : s
              ),
            }
          : f
      ))
      setEditingEvent(null)
    } catch (err) {
      console.error('handleDateSave error:', err)
      showToast('Impossible de sauvegarder la date. Réessayez.', 'error')
    } finally {
      setSavingDate(false)
    }
  }

  async function handleGCalSync() {
    setSyncing(true); setGcalMsg(null)
    const { data: { session } } = await createClient().auth.getSession()
    const token = session?.provider_token
    if (!token) {
      setGcalMsg({ text: 'Reconnectez-vous pour autoriser l\'accès Google Calendar.' })
      setSyncing(false); return
    }
    const toSync = factures
      .filter(f => f.date_echeance && f.statut !== 'payé')
      .map(f => ({
        id: f.id,
        nom_client: f.nom_client,
        date_echeance: f.date_echeance,
        montant: f.montant,
        gcal_event_ids: f.gcal_event_ids,
        relances: (f.relances ?? []).map(r => ({ niveau: r.niveau, date_planifiee: r.date_planifiee })),
      }))
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
        const relance = (facture.relances ?? []).find(r => r.niveau === n)
        // Utilise date_planifiee si définie, sinon calcul depuis l'échéance
        const baseDate = relance?.date_planifiee ?? (() => {
          const d = parseLocalDate(facture.date_echeance!)
          d.setDate(d.getDate() + OFFSETS[n])
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        })()
        const d = parseLocalDate(baseDate)
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
      relances: ([1, 2, 3] as const).map(niveau => ({
        id: '',
        facture_id: factureData.id,
        niveau,
        statut: 'planifiée' as const,
        date_planifiee: null,
        date_envoi: null,
        body_override: null,
        subject_override: null,
        created_at: new Date().toISOString(),
      })),
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

  function openEditEmail(facture: Facture, niveau: number) {
    const rel = facture.relances?.find(r => r.niveau === niveau)
    const defaults = genEmailLevel(niveau as 1 | 2 | 3, '', facture.nom_client, facture.numero_facture ?? '', String(facture.montant ?? ''), facture.date_echeance ?? '')
    setEditEmailSubject(rel?.subject_override ?? defaults.subject)
    setEditEmailBody(rel?.body_override ?? defaults.body)
    setEditingEmail({ factureId: facture.id, niveau, facture })
  }

  async function handleSaveEmail() {
    if (!editingEmail) return
    setSavingEmail(true)
    const supabase = createClient()
    const rel = editingEmail.facture.relances?.find(r => r.niveau === editingEmail.niveau)
    if (rel) {
      await supabase.from('relances')
        .update({ subject_override: editEmailSubject, body_override: editEmailBody })
        .eq('id', rel.id)
      setFactures(prev => prev.map(f =>
        f.id === editingEmail.factureId
          ? { ...f, relances: f.relances.map(r => r.niveau === editingEmail.niveau ? { ...r, subject_override: editEmailSubject, body_override: editEmailBody } : r) }
          : f
      ))
    }
    setSavingEmail(false)
    setEditingEmail(null)
    showToast('Email mis à jour.', 'success')
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
    <main className="min-h-screen bg-[--bg] pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <div className="flex items-center justify-end gap-2">
          {plan === 'premium' && (
            <button
              onClick={handleManageSubscription}
              disabled={portalLoading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-[--bd] text-[--t2] hover:border-[--bd2] hover:text-[--t1] transition-colors disabled:opacity-50"
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
          <div className="bg-[--card] border border-[--bd] rounded-xl p-3.5 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-[--t3] mb-1 sm:mb-1.5 leading-tight uppercase tracking-wider">
              <span className="sm:hidden">En attente</span>
              <span className="hidden sm:inline">Montant en attente</span>
            </p>
            <p className="text-base sm:text-2xl font-black text-[--t1] tracking-tight">{formatEuro(kpis.enAttente)}</p>
          </div>
          <div className="bg-[--card] border border-[--bd] rounded-xl p-3.5 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-[--t3] mb-1 sm:mb-1.5 leading-tight uppercase tracking-wider">
              <span className="sm:hidden">En cours</span>
              <span className="hidden sm:inline">Factures en cours</span>
            </p>
            <p className="text-base sm:text-2xl font-black text-[--t1] tracking-tight">{kpis.enCours}</p>
          </div>
          <div className="bg-[--card] border border-[--bd] rounded-xl p-3.5 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-[--t3] mb-1 sm:mb-1.5 leading-tight uppercase tracking-wider">
              <span className="sm:hidden">Récupéré</span>
              <span className="hidden sm:inline">Montant récupéré</span>
            </p>
            <p className="text-base sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{formatEuro(kpis.recupere)}</p>
          </div>
        </section>

        {/* ── Calendar ────────────────────────────────────────────────────── */}
        <section className="bg-[--card] border border-[--bd] rounded-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-[--bd4]">
            <div>
              <h2 className="text-sm font-bold text-[--t1]">Calendrier des relances</h2>
              <p className="text-xs text-[--t3] mt-0.5">Rappels calculés 7, 15 et 30 jours après l'échéance</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!gcalMsg && syncableTotal > 0 && (
                unsyncedCount > 0 ? (
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-full px-3 py-1.5">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 dark:bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 dark:bg-amber-400" />
                    </span>
                    {unsyncedCount} relance{unsyncedCount > 1 ? 's' : ''} non synchronisée{unsyncedCount > 1 ? 's' : ''}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full px-3 py-1.5">
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Calendrier à jour
                  </div>
                )
              )}

              {gcalMsg && (
                <div className="flex items-center gap-2 text-xs font-medium text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-full px-3 py-1.5">
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
                      className="ml-1 font-semibold text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline underline-offset-2 transition-colors whitespace-nowrap"
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

          <div className="overflow-x-auto [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-black/5 dark:[&::-webkit-scrollbar-track]:bg-white/5 [&::-webkit-scrollbar-thumb]:bg-black/20 dark:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="flex min-w-max px-4 py-4 gap-1">
              {days.map((day) => {
                const key = isoDate(day)
                const isToday = key === todayKey
                const events = eventsByDate[key] ?? []
                return (
                  <div key={key} className="flex flex-col items-center min-w-[56px]">
                    <div className={`text-[10px] font-medium mb-1 ${isToday ? 'text-[#7c6dfa]' : 'text-[--t3]'}`}>
                      {DAY_ABBR[day.getDay()]}
                    </div>
                    <div className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full mb-2 ${
                      isToday ? 'bg-[#7c6dfa] text-white' : 'text-[--t2]'
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

          <div className="flex items-center gap-5 px-5 py-3 border-t border-[--bd4]">
            {([1, 2, 3] as const).map(n => (
              <div key={n} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${LEVEL_COLORS[n].dot}`} />
                <span className="text-[10px] text-[--t3]">Niveau {n} — {LEVEL_LABELS[n]}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-1">
              <div className="w-2 h-2 rounded-full bg-gray-400/50 dark:bg-white/10" />
              <span className="text-[10px] text-[--t3]">Déjà envoyé</span>
            </div>
          </div>
        </section>

        {/* ── Historique ──────────────────────────────────────────────────── */}
        <section className="bg-[--card] border border-[--bd] rounded-xl overflow-hidden">
          <div className="px-5 py-5 border-b border-[--bd4]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold mb-0.5 bg-gradient-to-r from-[--t1] to-[#7c6dfa] bg-clip-text text-transparent inline-block">
                  Historique des factures
                </h2>
                <p className="text-xs text-[--t3]">
                  {factures.filter(f => f.statut !== 'payé').length} facture{factures.filter(f => f.statut !== 'payé').length !== 1 ? 's' : ''} · En cours de recouvrement
                </p>
              </div>
              <div className="bg-[#7c6dfa]/10 border border-[#7c6dfa]/20 rounded-xl px-4 py-2.5 text-right shrink-0">
                <p className="text-[9px] font-semibold text-[--t3] uppercase tracking-widest mb-0.5">Total impayé</p>
                <p className="text-lg font-black text-[--t1] leading-none">{formatEuro(kpis.enAttente)}</p>
              </div>
            </div>
          </div>

          {factures.length === 0 ? (
            <div className="px-5 py-14 text-center text-sm text-[--t3] flex flex-col items-center gap-3">
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
                  <div key={facture.id} className="bg-[--bg]/50 border border-[--bd3] rounded-2xl p-4 sm:p-5">
                    {/* Row 1 — nom + email + statut + supprimer */}
                    <div className="flex items-start gap-2 min-w-0 mb-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[--t1] truncate capitalize">{facture.nom_client}</p>
                        {facture.email_client && (
                          <p className="text-xs text-[--t3] truncate mt-0.5">{facture.email_client}</p>
                        )}
                      </div>
                      <select
                        value={status}
                        onChange={e => handleStatusChange(facture.id, e.target.value)}
                        className={`shrink-0 text-[9px] font-bold px-2 py-1 rounded-full border cursor-pointer appearance-none transition-colors uppercase tracking-wide ${
                          status === 'payé'
                            ? 'bg-emerald-100 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-400'
                            : status === 'litigieux'
                            ? 'bg-red-100 dark:bg-red-500/15 border-red-300 dark:border-red-500/25 text-red-700 dark:text-red-400'
                            : 'bg-orange-100 dark:bg-orange-500/10 border-orange-300 dark:border-orange-500/30 text-orange-700 dark:text-orange-400'
                        }`}
                      >
                        {STATUS_OPTIONS.map(o => (
                          <option key={o.value} value={o.value} className="bg-[--card] text-[--t1] normal-case">{o.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setDeletingFacture({ facture, deleteGCal: plan !== 'free' && (facture.gcal_event_ids?.length ?? 0) > 0 })}
                        title="Supprimer cette facture"
                        className="shrink-0 p-1.5 text-[--t3] hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-[--bd] transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Row 2 — montant + échéance + ref */}
                    <div className="bg-[--s1] border border-[--bd3] rounded-xl p-3 sm:p-4 mb-3 flex justify-between items-start gap-4">
                      <div>
                        <p className="text-[9px] font-semibold text-[--t3] uppercase tracking-widest mb-1.5">Montant</p>
                        <p className="text-2xl sm:text-3xl font-black text-[--t1] tracking-tight leading-none flex items-baseline">
                          <FormatEuroSplit n={facture.montant} />
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-semibold text-[--t3] uppercase tracking-widest mb-1.5">Échéance</p>
                        {facture.date_echeance ? (
                          <p className="text-base text-orange-600 dark:text-orange-400 leading-none">
                            {new Date(facture.date_echeance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </p>
                        ) : (
                          <p className="text-sm text-[--t3]">—</p>
                        )}
                        {facture.numero_facture && (
                          <p className="text-[10px] text-[--t3] mt-1.5">Réf. {facture.numero_facture}</p>
                        )}
                      </div>
                    </div>

                    {/* Row 3 — relances en lignes + envoi auto */}
                    {status !== 'payé' && (() => {
                      const autoActive = (facture.scheduled_sends ?? []).some(s => !s.sent_at)
                      const nextSend = (facture.scheduled_sends ?? [])
                        .filter(s => !s.sent_at)
                        .sort((a, b) => new Date(a.send_at).getTime() - new Date(b.send_at).getTime())[0]
                      const pendingCount = (facture.scheduled_sends ?? []).filter(s => !s.sent_at).length
                      const totalCount = (facture.scheduled_sends ?? []).length
                      const rowBg     = ['', 'bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/50', 'bg-orange-50 dark:bg-amber-950/50 border border-orange-200/70 dark:border-amber-800/40', 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200/70 dark:border-rose-800/40']
                      const rowBgSent = ['', 'bg-indigo-200 dark:bg-indigo-700/60 border border-indigo-400 dark:border-indigo-500', 'bg-orange-200 dark:bg-amber-700/50 border border-orange-400 dark:border-amber-500', 'bg-rose-200 dark:bg-rose-700/50 border border-rose-400 dark:border-rose-500']
                      const labelColor     = ['', 'text-indigo-500 dark:text-indigo-400', 'text-orange-500 dark:text-amber-400', 'text-rose-500 dark:text-rose-400']
                      const labelColorSent = ['', 'text-indigo-800 dark:text-indigo-100', 'text-orange-800 dark:text-amber-100', 'text-rose-800 dark:text-rose-100']
                      const dotColor     = ['', 'bg-indigo-300 dark:bg-indigo-600', 'bg-orange-300 dark:bg-amber-600', 'bg-rose-300 dark:bg-rose-600']
                      const dotColorSent = ['', 'bg-indigo-600 dark:bg-indigo-300', 'bg-orange-600 dark:bg-amber-300', 'bg-rose-600 dark:bg-rose-300']
                      return (
                        <>
                          <div className="space-y-1 mb-3">
                            {([1, 2, 3] as const).map(n => {
                              const relance = (facture.relances ?? []).find(r => r.niveau === n)
                              const sent = relance?.statut === 'envoyée'
                              const dateStr = relance?.date_planifiee ?? (facture.date_echeance ? addDays(facture.date_echeance, LEVEL_OFFSETS[n]) : null)
                              const dateLabel = dateStr ? new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : null
                              return (
                                <div key={n} className={`flex items-center justify-between px-3 py-2.5 rounded-xl ${sent ? rowBgSent[n] : rowBg[n]}`}>
                                  <button
                                    onClick={() => handleToggleEnvoi(facture, n)}
                                    title={sent ? `Annuler la relance ${n}` : `Marquer la relance ${n} comme envoyée`}
                                    className="flex items-center gap-2 min-w-0"
                                  >
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${sent ? dotColorSent[n] : dotColor[n]}`} />
                                    <span className={`text-sm font-semibold ${sent ? labelColorSent[n] : labelColor[n]}`}>
                                      {n === 1 ? '1re relance' : n === 2 ? '2e relance' : 'Mise en demeure'}
                                    </span>
                                  </button>
                                  <div className="flex items-center gap-0.5 shrink-0 ml-2">
                                    {dateLabel && (
                                      <span className={`text-xs ${sent ? labelColorSent[n] : 'text-[--t3]'}`}>{dateLabel}</span>
                                    )}
                                    {!!relance && (
                                      <button
                                        onClick={() => openEditEmail(facture, n)}
                                        title="Modifier l'email"
                                        className="p-2 text-[--t3] hover:text-[--t2] transition-colors rounded"
                                      >
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          {/* Envoi auto */}
                          {autoActive ? (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#7c6dfa]/70 animate-pulse shrink-0" />
                                <span className="text-xs text-[--t3]">Envoi auto · {pendingCount}/{totalCount}</span>
                              </div>
                              <button
                                onClick={() => handleToggleAutoSend(facture)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-[#7c6dfa] text-white shadow-[0_0_16px_rgba(124,109,250,0.4)] hover:bg-[#6a5be0] transition-all"
                              >
                                {nextSend && new Date(nextSend.send_at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end">
                              <button
                                onClick={() => handleToggleAutoSend(facture)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-full border border-[#7c6dfa]/30 text-[#7c6dfa] bg-[#7c6dfa]/5 hover:bg-[#7c6dfa]/15 hover:border-[#7c6dfa]/60 transition-all"
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
                            </div>
                          )}
                        </>
                      )
                    })()}
                    {status === 'payé' && (facture.gcal_event_ids?.length ?? 0) > 0 && plan !== 'free' && (
                      <button
                        onClick={() => handleDeleteGCalEvents(facture)}
                        className="mt-1.5 text-xs text-[--t3] hover:text-red-400 transition-colors underline underline-offset-2"
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
            <div className="px-5 py-4 border-t border-[--bd4] text-center">
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
          <div className="bg-[--card] border border-[--bd2] rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-sm font-bold text-[--t1] mb-1">Modifier la date du rappel</h3>
            <p className="text-xs text-[--t3] mb-4">
              <span className="font-medium text-[--t2]">{editingEvent.nomClient}</span>
              {editingEvent.numeroFacture && (
                <span className="ml-1.5 text-xs font-medium text-[--t3] bg-[--bg2] rounded px-1.5 py-0.5">{editingEvent.numeroFacture}</span>
              )}
              {' '}— {LEVEL_LABELS[editingEvent.niveau]}<br />
              <span className="text-[--t3]">Si l'auto-envoi est actif, l'email sera reprogrammé à cette date.</span>
            </p>
            <input
              type="date"
              value={editDate}
              onChange={e => setEditDate(e.target.value)}
              className="w-full border border-[--bd] rounded-lg px-3 py-2 text-sm text-[--t1] bg-[--bg2] focus:outline-none focus:border-indigo-400 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setEditingEvent(null)}
                className="text-xs px-4 py-2 rounded-lg border border-[--bd] text-[--t3] hover:bg-[--bg2] transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDateSave}
                disabled={savingDate}
                className="text-xs px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {savingDate ? 'Sauvegarde…' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit email modal ──────────────────────────────────────────────── */}
      {editingEmail && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm px-0 sm:px-4"
          onClick={e => { if (e.target === e.currentTarget && !savingEmail) setEditingEmail(null) }}
        >
          <div className="bg-[--card] border border-[--bd2] rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg flex flex-col max-h-[90dvh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[--bd] shrink-0">
              <div>
                <h3 className="text-sm font-bold text-[--t1]">
                  Modifier l&apos;email — {editingEmail.niveau === 1 ? '1re relance' : editingEmail.niveau === 2 ? '2e relance' : 'Mise en demeure'}
                </h3>
                <p className="text-[10px] text-[--t3] mt-0.5">{editingEmail.facture.nom_client}</p>
              </div>
              <button
                onClick={() => setEditingEmail(null)}
                disabled={savingEmail}
                className="text-[--t3] hover:text-[--t2] transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[--t3] uppercase tracking-widest mb-1.5">Objet</label>
                <input
                  type="text"
                  value={editEmailSubject}
                  onChange={e => setEditEmailSubject(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[--bg] border border-[--bd2] rounded-lg text-sm text-[--t1] outline-none focus:border-[#7c6dfa]/60 focus:ring-2 focus:ring-[#7c6dfa]/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[--t3] uppercase tracking-widest mb-1.5">Corps du mail</label>
                <textarea
                  value={editEmailBody}
                  onChange={e => setEditEmailBody(e.target.value)}
                  rows={12}
                  className="w-full px-3 py-2.5 bg-[--bg] border border-[--bd2] rounded-lg text-sm text-[--t1] outline-none focus:border-[#7c6dfa]/60 focus:ring-2 focus:ring-[#7c6dfa]/10 transition-all resize-none leading-relaxed font-mono"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 px-5 py-4 border-t border-[--bd] shrink-0">
              <button
                onClick={() => setEditingEmail(null)}
                disabled={savingEmail}
                className="flex-1 py-2.5 text-xs font-semibold border border-[--bd] text-[--t2] hover:text-[--t1] hover:border-[--bd2] rounded-xl transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveEmail}
                disabled={savingEmail}
                className="flex-1 py-2.5 text-xs font-bold bg-[#7c6dfa] hover:bg-[#6a5be0] text-white rounded-xl transition-colors disabled:opacity-60 shadow-[0_0_20px_rgba(124,109,250,0.2)]"
              >
                {savingEmail ? 'Enregistrement…' : 'Sauvegarder'}
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
          <div className="bg-[--card] border border-[--bd2] rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[--bd]">
              <h3 className="text-sm font-bold text-[--t1]">Nouvelle facture</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-[--t3] hover:text-[--t2] transition-colors">
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
                  <label className="block text-xs font-semibold text-[--t2] mb-1.5">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    required={required}
                    min={type === 'number' ? 1 : undefined}
                    value={generateForm[id]}
                    onChange={e => setGenerateForm(prev => ({ ...prev, [id]: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-[--bg] border border-[--bd2] rounded-lg text-sm text-[--t1] outline-none focus:border-[#7c6dfa]/60 focus:ring-2 focus:ring-[#7c6dfa]/10 transition-all placeholder:text-[--t3] [&[type=date]]:pr-2 dark:[color-scheme:dark] [color-scheme:light]"
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
              <p className="text-center text-[10px] text-[--t3] mt-1">
                Les informations de votre client ne sont jamais partagées ni revendues.
              </p>
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
            className="flex items-center gap-3 bg-[--card] rounded-xl px-4 py-3 pointer-events-auto max-w-xs"
          >
            <span className={`flex items-center justify-center w-6 h-6 rounded-full shrink-0 ${toast.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-500/15' : 'bg-red-100 dark:bg-red-500/15'}`}>
              {toast.type === 'success' ? (
                <svg className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
                </svg>
              )}
            </span>
            <p className="text-[--t1] text-sm font-medium leading-snug">{toast.message}</p>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ─────────────────────────────────────── */}
      {deletingFacture && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={e => { if (e.target === e.currentTarget && !deleting) setDeletingFacture(null) }}
        >
          <div className="bg-[--card] border border-[--bd2] rounded-2xl shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[--t1]">Supprimer la facture</h3>
                <p className="text-xs text-[--t3] mt-0.5">
                  {deletingFacture.facture.nom_client}
                  {deletingFacture.facture.numero_facture && (
                    <span className="ml-1.5 text-[10px] font-medium text-[--t3] bg-[--bg2] rounded px-1.5 py-0.5">
                      {deletingFacture.facture.numero_facture}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {(deletingFacture.facture.gcal_event_ids?.length ?? 0) > 0 && (
              plan === 'free' ? (
                <div className="flex items-start gap-2.5 mb-4 p-3 rounded-xl bg-[--bg2] border border-[--bd] opacity-50">
                  <input type="checkbox" disabled className="mt-0.5 shrink-0" />
                  <span className="text-xs text-[--t3] leading-relaxed flex-1">
                    Supprimer également les rappels Google Calendar associés
                  </span>
                  <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-full shrink-0">Premium</span>
                </div>
              ) : (
                <label className="flex items-start gap-2.5 mb-4 cursor-pointer p-3 rounded-xl bg-[--bg2] border border-[--bd]">
                  <input
                    type="checkbox"
                    checked={deletingFacture.deleteGCal}
                    onChange={e => setDeletingFacture(prev => prev ? { ...prev, deleteGCal: e.target.checked } : null)}
                    className="mt-0.5 accent-red-500 shrink-0"
                  />
                  <span className="text-xs text-[--t2] leading-relaxed">
                    Supprimer également les rappels Google Calendar associés
                  </span>
                </label>
              )
            )}

            <p className="text-xs text-[--t3] mb-5">Cette action est irréversible.</p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeletingFacture(null)}
                disabled={deleting}
                className="text-xs px-4 py-2 rounded-lg border border-[--bd] text-[--t3] hover:bg-[--bg2] transition-colors disabled:opacity-50"
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
