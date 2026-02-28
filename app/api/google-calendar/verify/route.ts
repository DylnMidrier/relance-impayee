import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const GCAL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events'

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

// POST — vérifier quels event IDs existent encore dans Google Calendar
// Body: { token: string, factureIds: Record<string, string[]> }
// Response: { missingFactureIds: string[] }
export async function POST(req: Request) {
  const user = await requireUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { token, factureIds } = await req.json() as {
    token: string
    factureIds: Record<string, string[]>
  }
  if (!token || typeof factureIds !== 'object') {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  }

  const missingFactureIds: string[] = []

  // Check all event IDs in parallel — if any event of a facture is missing/cancelled, facture is unsynced
  // Google returns 200 + status:"cancelled" for soft-deleted events, 410 for hard-deleted, 404 for unknown
  await Promise.all(
    Object.entries(factureIds).map(async ([factureId, eventIds]) => {
      const checks = await Promise.all(
        eventIds.map(async id => {
          const res = await fetch(`${GCAL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.status === 404 || res.status === 410) return true // missing
          if (res.ok) {
            const body = await res.json() as { status?: string }
            return body.status === 'cancelled' // soft-deleted
          }
          return false // autre erreur (ex: 403 token invalide) → on ne marque pas comme manquant
        })
      )
      if (checks.some(Boolean)) missingFactureIds.push(factureId)
    })
  )

  return NextResponse.json({ missingFactureIds })
}
