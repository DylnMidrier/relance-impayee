'use client'

import { useState, useMemo } from 'react'
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
    relanceId: string; nomClient: string; echeance: string; niveau: number
  } | null>(null)
  const [editDate, setEditDate] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [gcalMsg, setGcalMsg] = useState<{ text: string; ok: boolean; needsReauth?: boolean } | null>(null)

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    let enAttente = 0, enCours = 0, recupere = 0
    for (const r of relances) {
      if (r.statut === 'payé') recupere += r.montant ?? 0
      else { enAttente += r.montant ?? 0; enCours++ }
    }
    return { enAttente, enCours, recupere }
  }, [relances])

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
    setEditingEvent({ relanceId: relance.id, nomClient: relance.nom_client, echeance: relance.date_echeance ?? '', niveau })
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
      setGcalMsg({ text: 'Reconnectez-vous pour autoriser l\'accès Google Calendar.', ok: false })
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
        setGcalMsg({ text: 'Votre compte Google n\'a pas encore autorisé l\'accès au calendrier.', ok: false, needsReauth: true })
      } else {
        setGcalMsg({ text: 'Erreur lors de la synchronisation.', ok: false })
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
    const count = Object.keys(eventIds).length
    setGcalMsg({ text: `${count} relance${count > 1 ? 's' : ''} synchronisée${count > 1 ? 's' : ''} ✓`, ok: true })
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
        <section className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium text-gray-400 mb-1.5">Montant en attente</p>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{formatEuro(kpis.enAttente)}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium text-gray-400 mb-1.5">Factures en cours</p>
            <p className="text-2xl font-black text-gray-900 tracking-tight">{kpis.enCours}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-medium text-gray-400 mb-1.5">Montant récupéré</p>
            <p className="text-2xl font-black text-green-600 tracking-tight">{formatEuro(kpis.recupere)}</p>
          </div>
        </section>

        {/* ── Calendar ────────────────────────────────────────────────────── */}
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Calendrier des relances</h2>
              <p className="text-xs text-gray-400 mt-0.5">Rappels calculés depuis la date d'échéance · J+7 · J+15 · J+30</p>
            </div>
            <div className="flex items-center gap-3">
              {gcalMsg && (
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${gcalMsg.ok ? 'text-green-600' : 'text-red-500'}`}>
                    {gcalMsg.text}
                  </span>
                  {gcalMsg.needsReauth && (
                    <button
                      onClick={handleReauth}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline underline-offset-2 transition-colors"
                    >
                      Autoriser →
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={handleGCalSync}
                disabled={syncing}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
                  <div key={relance.id} className="px-5 py-4 flex flex-wrap items-center gap-3">

                    {/* Client info */}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{relance.nom_client}</p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
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

                    {/* Level badges */}
                    <div className="flex items-center gap-1">
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

                    {/* Status select */}
                    <select
                      value={status}
                      onChange={e => handleStatusChange(relance.id, e.target.value)}
                      className={`text-xs font-medium px-2.5 py-1.5 rounded-lg border cursor-pointer appearance-none transition-colors ${
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

                    {/* Delete GCal events */}
                    {status === 'payé' && (relance.gcal_event_ids?.length ?? 0) > 0 && (
                      <button
                        onClick={() => handleDeleteGCalEvents(relance)}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors underline underline-offset-2"
                      >
                        Supprimer rappels Google Calendar
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
    </main>
  )
}
