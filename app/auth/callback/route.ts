import { createServerClient } from '@supabase/ssr'
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
    console.log('[auth/callback] provider_token:', !!session?.provider_token, '| provider_refresh_token:', !!session?.provider_refresh_token)
    const user = session?.user
    if (user) {
      // Crée le profil si inexistant (sans écraser le plan existant)
      const { error: insertError } = await supabase.from('profiles').upsert(
        { id: user.id, plan: 'free' },
        { onConflict: 'id', ignoreDuplicates: true }
      )
      if (insertError) console.error('[auth/callback] insert error:', insertError)

      // Met à jour les tokens Gmail séparément
      const tokenUpdate: Record<string, string> = {}
      if (session.provider_token)         tokenUpdate.gmail_access_token  = session.provider_token
      if (session.provider_refresh_token) tokenUpdate.gmail_refresh_token = session.provider_refresh_token

      if (Object.keys(tokenUpdate).length > 0) {
        const { error: updateError } = await supabase.from('profiles').update(tokenUpdate).eq('id', user.id)
        if (updateError) console.error('[auth/callback] token update error:', updateError)
        else console.log('[auth/callback] tokens saved ok, keys:', Object.keys(tokenUpdate).join(', '))
      }
    }
  }

  return NextResponse.redirect(origin)
}
