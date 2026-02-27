'use client'

import { useState, useMemo, useEffect } from 'react'
import { createClient } from '../lib/supabase'
import type { Relance } from './page'

// ─── helpers ─────────────────────────────────────────────────────────────────

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

function isoDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function formatEuro(n: number | null) {
  if (n == null) return '—'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
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
  1: { chip: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-400' },
  2: { chip: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
  3: { chip: 'bg-red-100 text-red-700', dot: 'bg-red-400' },
}

const LEVEL_LABELS: Record<number, string> = { 1: 'J+7', 2: 'J+15', 3: 'J+30' }

const STATUS_OPTIONS = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'payé', label: 'Payé ✓' },
  { value: 'litigieux', label: 'Litigieux' },
]

// ─── component ───────────────────────────────────────────────────────────────

export default function DashboardClient({ relances: initial }: { relances: Relance[] }) {
  const [relances, setRelances] = useState(initial)
  const [editingEvent, setEditingEvent] = useState<{
    relanceId: string; nomClient: string; numeroFacture: string | null; echeance: string; niveau: number
  } | null>(null)
  const [editDate, setEditDate] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [gcalMsg, setGcalMsg] = useState<{ text: string; needsReauth?: boolean } | null>(null)
  const [deletingRelance, setDeletingRelance] = useState<{ relance: Relance; deleteGCal: boolean } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    let enAttente = 0, enCours = 0, recupere = 0
    for (const r of relances) {
      if (r.statut === 'payé') recupere += r.montant ?? 0
      else { enAttente += r.montant ?? 0; enCours++ }
    }
    return { enAttente, enCours, recupere }
  }, [relances])

  // ── GCal sync status ──────────────────────────────────────────────────────
  const { unsyncedCount, syncableTotal } = useMemo(() => {
    const syncable = relances.filter(r => r.date_echeance && r.statut !== 'payé')
    const unsynced = syncable.filter(r => !r.gcal_event_ids?.length)
    return { unsyncedCount: unsynced.length, syncableTotal: syncable.length }
  }, [relances])

  // ── Verify GCal events on mount ───────────────────────────────────────────
  useEffect(() => {
    const relancesWithEvents = initial.filter(r => r.gcal_event_ids?.length)
    if (!relancesWithEvents.length) return

    async function verify() {
      const { data: { session } } = await createClient().auth.getSession()
      const token = session?.provider_token
      if (!token) return

      const relanceIds: Record<string, string[]> = {}
      for (const r of relancesWithEvents) relanceIds[r.id] = r.gcal_event_ids!

      const res = await fetch('/api/google-calendar/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, relanceIds }),
      })
      if (!res.ok) return

      const { missingRelanceIds } = await res.json() as { missingRelanceIds: string[] }
      if (!missingRelanceIds.length) return

      // Clear gcal_event_ids locally + in DB for relances whose events are gone
      setRelances(prev => prev.map(r =>
        missingRelanceIds.includes(r.id) ? { ...r, gcal_event_ids: null } : r
      ))
      const supabase = createClient()
      await Promise.all(
        missingRelanceIds.map(id =>
          supabase.from('relances').update({ gcal_event_ids: null }).eq('id', id)
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
    const eventsByDate: Record<string, Array<{ relance: Relance; niveau: number; sent: boolean }>> = {}
    for (const relance of relances) {
      if (!relance.date_echeance || relance.statut === 'payé') continue
      for (const [offset, niveau] of [[7, 1], [15, 2], [30, 3]] as [number, number][]) {
        const key = addDays(relance.date_echeance, offset)
        if (!eventsByDate[key]) eventsByDate[key] = []
        const sent = (relance.envois ?? []).some(e => e.niveau === niveau)
        eventsByDate[key].push({ relance, niveau, sent })
      }
    }
    return { days, eventsByDate }
  }, [relances])

  const todayKey = isoDate(new Date())

  // ── Handlers ──────────────────────────────────────────────────────────────
  async function handleStatusChange(id: string, statut: string) {
    setRelances(prev => prev.map(r => r.id === id ? { ...r, statut } : r))
    await createClient().from('relances').update({ statut }).eq('id', id)
  }

  function openEditEvent(relance: Relance, niveau: number) {
    setEditingEvent({ relanceId: relance.id, nomClient: relance.nom_client, numeroFacture: relance.numero_facture ?? null, echeance: relance.date_echeance ?? '', niveau })
    setEditDate(relance.date_echeance ?? '')
  }

  async function handleDateSave() {
    if (!editingEvent || !editDate) return
    setRelances(prev => prev.map(r =>
      r.id === editingEvent.relanceId ? { ...r, date_echeance: editDate } : r
    ))
    await createClient().from('relances').update({ date_echeance: editDate }).eq('id', editingEvent.relanceId)
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
    const toSync = relances.filter(r => r.date_echeance && r.statut !== 'payé')
    const res = await fetch('/api/google-calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, relances: toSync }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { error?: string }
      if (body.error === 'insufficient_scope') {
        setGcalMsg({ text: 'Votre compte Google n\'a pas encore autorisé l\'accès au calendrier.', needsReauth: true })
      } else {
        setGcalMsg({ text: 'Erreur lors de la synchronisation.' })
      }
      setSyncing(false); return
    }
    const { eventIds } = await res.json() as { eventIds: Record<string, string[]> }
    const supabase = createClient()
    await Promise.all(
      Object.entries(eventIds).map(([id, ids]) =>
        supabase.from('relances').update({ gcal_event_ids: ids }).eq('id', id)
      )
    )
    setRelances(prev => prev.map(r => eventIds[r.id] ? { ...r, gcal_event_ids: eventIds[r.id] } : r))
    setSyncing(false)
  }

  async function handleReauth() {
    await createClient().auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/calendar.events',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
  }

  async function handleDeleteGCalEvents(relance: Relance) {
    if (!relance.gcal_event_ids?.length) return
    const { data: { session } } = await createClient().auth.getSession()
    const token = session?.provider_token
    if (!token) return
    await fetch('/api/google-calendar', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, eventIds: relance.gcal_event_ids }),
    })
    await createClient().from('relances').update({ gcal_event_ids: null }).eq('id', relance.id)
    setRelances(prev => prev.map(r => r.id === relance.id ? { ...r, gcal_event_ids: null } : r))
  }

  async function confirmDeleteRelance() {
    if (!deletingRelance) return
    setDeleting(true)
    const { relance, deleteGCal } = deletingRelance

    if (deleteGCal && relance.gcal_event_ids?.length) {
      const { data: { session } } = await createClient().auth.getSession()
      const token = session?.provider_token
      if (token) {
        await fetch('/api/google-calendar', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, eventIds: relance.gcal_event_ids }),
        })
      }
    }

    await createClient().from('relances').delete().eq('id', relance.id)
    setRelances(prev => prev.filter(r => r.id !== relance.id))
    setDeletingRelance(null)
    setDeleting(false)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 transition-colors no-underline"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l'accueil
        </a>

        {/* ── KPI summary ─────────────────────────────────────────────────── */}
        <section className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-gray-400 mb-1 sm:mb-1.5 leading-tight">
              <span className="sm:hidden">En attente</span>
              <span className="hidden sm:inline">Montant en attente</span>
            </p>
            <p className="text-base sm:text-2xl font-black text-gray-900 tracking-tight">{formatEuro(kpis.enAttente)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-gray-400 mb-1 sm:mb-1.5 leading-tight">
              <span className="sm:hidden">En cours</span>
              <span className="hidden sm:inline">Factures en cours</span>
            </p>
            <p className="text-base sm:text-2xl font-black text-gray-900 tracking-tight">{kpis.enCours}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-3.5 sm:p-5">
            <p className="text-[10px] sm:text-xs font-medium text-gray-400 mb-1 sm:mb-1.5 leading-tight">
              <span className="sm:hidden">Récupéré</span>
              <span className="hidden sm:inline">Montant récupéré</span>
            </p>
            <p className="text-base sm:text-2xl font-black text-green-600 tracking-tight">{formatEuro(kpis.recupere)}</p>
          </div>
        </section>

        {/* ── Calendar ────────────────────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Calendrier des relances</h2>
              <p className="text-xs text-gray-400 mt-0.5">Rappels calculés depuis la date d'échéance · J+7 · J+15 · J+30</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Sync status pill */}
              {!gcalMsg && syncableTotal > 0 && (
                unsyncedCount > 0 ? (
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                    </span>
                    {unsyncedCount} relance{unsyncedCount > 1 ? 's' : ''} non synchronisée{unsyncedCount > 1 ? 's' : ''}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-full px-3 py-1.5">
                    <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Calendrier à jour
                  </div>
                )
              )}

              {/* Error message */}
              {gcalMsg && (
                <div className="flex items-center gap-2 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-full px-3 py-1.5">
                  <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <span>{gcalMsg.text}</span>
                  {gcalMsg.needsReauth && (
                    <button
                      onClick={handleReauth}
                      className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 transition-colors whitespace-nowrap"
                    >
                      Autoriser →
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={handleGCalSync}
                disabled={syncing}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <svg className={`w-3.5 h-3.5 shrink-0 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  {syncing
                    ? <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    : <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  }
                </svg>
                {syncing ? 'Synchronisation…' : 'Sync Google Calendar'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <div className="flex min-w-max px-4 py-4 gap-1">
              {days.map((day) => {
                const key = isoDate(day)
                const isToday = key === todayKey
                const events = eventsByDate[key] ?? []
                return (
                  <div key={key} className="flex flex-col items-center min-w-[56px]">
                    <div className={`text-[10px] font-medium mb-1 ${isToday ? 'text-indigo-600' : 'text-gray-400'}`}>
                      {DAY_ABBR[day.getDay()]}
                    </div>
                    <div className={`text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full mb-2 ${
                      isToday ? 'bg-indigo-600 text-white' : 'text-gray-700'
                    }`}>
                      {day.getDate()}
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      {events.map(({ relance, niveau, sent }) => (
                        <button
                          key={`${relance.id}-${niveau}`}
                          onClick={() => openEditEvent(relance, niveau)}
                          title={`${relance.nom_client} — Niveau ${niveau} (${LEVEL_LABELS[niveau]})\nCliquer pour modifier l'échéance`}
                          className={`text-[10px] font-medium px-1 py-0.5 rounded text-left leading-tight w-full truncate transition-opacity hover:opacity-80 ${
                            sent ? 'opacity-35' : ''
                          } ${LEVEL_COLORS[niveau].chip}`}
                        >
                          {LEVEL_LABELS[niveau]} {relance.nom_client.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-5 px-5 py-3 border-t border-gray-100">
            {([1, 2, 3] as const).map(n => (
              <div key={n} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${LEVEL_COLORS[n].dot}`} />
                <span className="text-[10px] text-gray-500">Niveau {n} — {LEVEL_LABELS[n]}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 ml-1">
              <div className="w-2 h-2 rounded-full bg-gray-200" />
              <span className="text-[10px] text-gray-400">Déjà envoyé</span>
            </div>
          </div>
        </section>

        {/* ── Relance history ─────────────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">Historique des relances</h2>
          </div>

          {relances.length === 0 ? (
            <div className="px-5 py-14 text-center text-sm text-gray-400">
              Aucune relance pour l'instant.<br />
              <span className="text-gray-300">Générez vos premiers emails depuis la page d'accueil.</span>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {relances.map(relance => {
                const status = normalizeStatus(relance.statut)
                return (
                  <div key={relance.id} className="px-4 sm:px-5 py-3.5">
                    {/* Row 1 — nom + select statut + supprimer */}
                    <div className="flex items-center gap-2 min-w-0 mb-2">
                      <p className="text-sm font-semibold text-gray-900 truncate flex-1 min-w-0">
                        {relance.nom_client}
                      </p>
                      <select
                        value={status}
                        onChange={e => handleStatusChange(relance.id, e.target.value)}
                        className={`shrink-0 text-xs font-medium px-2 py-1.5 rounded-lg border cursor-pointer appearance-none transition-colors ${
                          status === 'payé'
                            ? 'border-green-200 bg-green-50 text-green-700'
                            : status === 'litigieux'
                            ? 'border-red-200 bg-red-50 text-red-700'
                            : 'border-gray-200 bg-white text-gray-600'
                        }`}
                      >
                        {STATUS_OPTIONS.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => setDeletingRelance({ relance, deleteGCal: (relance.gcal_event_ids?.length ?? 0) > 0 })}
                        title="Supprimer cette relance"
                        className="shrink-0 p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Row 2 — facture badge + N badges + métadonnées */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {relance.numero_facture && (
                        <span className="text-[10px] font-medium text-gray-400 bg-gray-100 rounded px-1.5 py-0.5 shrink-0">
                          {relance.numero_facture}
                        </span>
                      )}
                      <div className="flex items-center gap-1 shrink-0">
                        {([1, 2, 3] as const).map(n => {
                          const sent = (relance.envois ?? []).some(e => e.niveau === n)
                          return (
                            <span
                              key={n}
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                sent ? LEVEL_COLORS[n].chip : 'bg-gray-100 text-gray-300'
                              }`}
                            >
                              N{n}
                            </span>
                          )
                        })}
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
                        <span>{relance.montant != null ? formatEuro(relance.montant) : '—'}</span>
                        {relance.date_echeance && (
                          <>
                            <span className="text-gray-200">·</span>
                            <span>Échéance {formatDateShort(relance.date_echeance)}</span>
                          </>
                        )}
                        <span className="text-gray-200">·</span>
                        <span className="text-gray-300">{new Date(relance.created_at).toLocaleDateString('fr-FR')}</span>
                      </p>
                    </div>

                    {/* Row 3 — supprimer GCal (si applicable) */}
                    {status === 'payé' && (relance.gcal_event_ids?.length ?? 0) > 0 && (
                      <button
                        onClick={() => handleDeleteGCalEvents(relance)}
                        className="mt-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
                      >
                        Supprimer rappels Calendar
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>

      {/* ── Edit date modal ──────────────────────────────────────────────── */}
      {editingEvent && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
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

      {/* ── Delete confirmation modal ─────────────────────────────────────── */}
      {deletingRelance && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={e => { if (e.target === e.currentTarget && !deleting) setDeletingRelance(null) }}
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
                  {deletingRelance.relance.nom_client}
                  {deletingRelance.relance.numero_facture && (
                    <span className="ml-1.5 text-[10px] font-medium text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
                      {deletingRelance.relance.numero_facture}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {(deletingRelance.relance.gcal_event_ids?.length ?? 0) > 0 && (
              <label className="flex items-start gap-2.5 mb-4 cursor-pointer p-3 rounded-xl bg-gray-50 border border-gray-100">
                <input
                  type="checkbox"
                  checked={deletingRelance.deleteGCal}
                  onChange={e => setDeletingRelance(prev => prev ? { ...prev, deleteGCal: e.target.checked } : null)}
                  className="mt-0.5 accent-red-500 shrink-0"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  Supprimer également les rappels Google Calendar associés
                </span>
              </label>
            )}

            <p className="text-xs text-gray-400 mb-5">Cette action est irréversible.</p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeletingRelance(null)}
                disabled={deleting}
                className="text-xs px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteRelance}
                disabled={deleting}
                className="text-xs px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
