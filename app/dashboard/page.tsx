import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Nav from '../components/Nav'
import DashboardClient from './DashboardClient'

export type Envoi = {
  id: string
  relance_id: string
  niveau: number
  created_at: string
}

export type Relance = {
  id: string
  nom_client: string
  montant: number | null
  date_echeance: string | null
  statut: string | null
  created_at: string
  gcal_event_ids: string[] | null
  envois: Envoi[]
}

export default async function DashboardPage() {
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

  const { data } = await supabase
    .from('relances')
    .select('*, envois(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <>
      <Nav />
      <DashboardClient relances={(data ?? []) as Relance[]} />
    </>
  )
}
