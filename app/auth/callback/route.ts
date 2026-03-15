import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
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
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code)
    const user = session?.user
    if (user) {
      // Service role pour contourner le RLS sur profiles
      const admin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      )

      // Crée le profil si inexistant (sans écraser le plan existant)
      await admin.from('profiles').upsert(
        { id: user.id, plan: 'free' },
        { onConflict: 'id', ignoreDuplicates: true }
      )

      // Met à jour les tokens Gmail séparément
      const tokenUpdate: Record<string, string> = {}
      if (session.provider_token)         tokenUpdate.gmail_access_token  = session.provider_token
      if (session.provider_refresh_token) tokenUpdate.gmail_refresh_token = session.provider_refresh_token

      if (Object.keys(tokenUpdate).length > 0) {
        await admin.from('profiles').update(tokenUpdate).eq('id', user.id)
      }
    }
  }

  const next = searchParams.get('next')
  const redirectUrl = next === 'generate' ? `${origin}/dashboard?open=generate` : origin
  return NextResponse.redirect(redirectUrl)
}
