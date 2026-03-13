'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '../lib/supabase'

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.send',
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
  }

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  if (loading) {
    return <div className="w-28 h-7 bg-gray-100 rounded-lg animate-pulse" />
  }

  if (user) {
    const meta = user.user_metadata as { avatar_url?: string; full_name?: string; name?: string }
    const avatarUrl = meta?.avatar_url
    const firstName = (meta?.full_name ?? meta?.name ?? '').split(' ')[0]

    return (
      <div className="relative group">
        {/* Trigger */}
        <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              width={28}
              height={28}
              className="rounded-full shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-indigo-600">{firstName[0]?.toUpperCase() ?? '?'}</span>
            </div>
          )}
          {firstName && (
            <span className="text-xs text-gray-700 hidden sm:block">Bonjour, <span className="font-semibold">{firstName}</span></span>
          )}
          {/* Chevron */}
          <svg className="w-3 h-3 text-gray-400 hidden sm:block transition-transform duration-150 group-hover:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        <div className="absolute right-0 top-full pt-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-150 z-50">
          <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[160px]">
            <a
              href="/dashboard"
              className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </a>
            <div className="border-t border-gray-100" />
            <button
              onClick={signOut}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-all"
    >
      {/* Logo Google */}
      <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      Se connecter
    </button>
  )
}
