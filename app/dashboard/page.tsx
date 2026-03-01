import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Nav from '../components/Nav'
import DashboardClient from './DashboardClient'
import { getUserPlan } from '../lib/plan'
import type { Plan } from '../lib/plan'

export type Relance = {
  id: string
  facture_id: string
  niveau: number
  statut: 'planifiée' | 'envoyée'
  date_planifiee: string | null
  date_envoi: string | null
  created_at: string
}

export type Facture = {
  id: string
  nom_client: string
  email_client: string | null
  numero_facture: string | null
  montant: number | null
  date_echeance: string | null
  statut: string | null
  created_at: string
  gcal_event_ids: string[] | null
  relances: Relance[]
}

export type { Plan }

export default async function DashboardPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams
  const paymentSuccess = params.payment_success === 'true'
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
  if (!user) redirect('/')

  const [{ data }, plan] = await Promise.all([
    supabase.from('factures').select('*, relances(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
    getUserPlan(user.id),
  ])

  return (
    <>
      <Nav />
      <DashboardClient factures={(data ?? []) as Facture[]} plan={plan} paymentSuccess={paymentSuccess} />
    </>
  )
}
