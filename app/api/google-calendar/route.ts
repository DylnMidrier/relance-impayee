import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getUserPlan } from '../../lib/plan'

const GCAL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

const LEVEL_NAMES: Record<number, string> = {
  1: 'Rappel amical',
  2: 'Relance ferme',
  3: 'Mise en demeure',
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

async function requireUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    },
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// POST — créer les événements Google Calendar pour chaque relance
export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const plan = await getUserPlan(user.id)
  if (plan !== 'premium') return NextResponse.json({ error: 'premium_required' }, { status: 403 })

  const { token, factures } = await req.json()
  if (!token || !Array.isArray(factures)) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const eventIds: Record<string, string[]> = {}

  for (const facture of factures) {
    if (!facture.date_echeance) continue
    const ids: string[] = []

    for (const [offset, niveau] of [[7, 1], [15, 2], [30, 3]] as [number, number][]) {
      const date = addDays(facture.date_echeance, offset)
      const res = await fetch(GCAL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary: `${LEVEL_NAMES[niveau]} — ${facture.nom_client}`,
          description: facture.montant
            ? `Facture de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(facture.montant)}`
            : undefined,
          start: { date },
          end: { date },
          reminders: {
            useDefault: false,
            overrides: [{ method: 'popup', minutes: 480 }],
          },
        }),
      })

      if (res.status === 403) {
        return NextResponse.json({ error: 'insufficient_scope' }, { status: 403 })
      }
      if (res.ok) {
        const ev = await res.json() as { id: string }
        ids.push(ev.id)
      } else {
        console.error('[google-calendar] create event failed', res.status, await res.text())
      }
    }

    if (ids.length) eventIds[facture.id] = ids
  }

  return NextResponse.json({ eventIds })
}

// DELETE — supprimer les événements Google Calendar liés à une relance payée
export async function DELETE(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token, eventIds } = await req.json()
  if (!token || !Array.isArray(eventIds)) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  await Promise.allSettled(
    eventIds.map((id: string) =>
      fetch(`${GCAL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
    )
  )

  return NextResponse.json({ ok: true })
}
