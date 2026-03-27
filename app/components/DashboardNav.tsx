'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import type { User } from '@supabase/supabase-js'
import { createClient } from '../lib/supabase'
import type { Plan } from '../lib/plan'
import { useTheme } from './ThemeProvider'

export default function DashboardNav({ plan }: { plan: Plan }) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const { theme, toggle } = useTheme()
  const [visible, setVisible] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const lastY = useRef(0)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y < 10) setVisible(true)
      else if (y > lastY.current + 8) setVisible(false)
      else if (y < lastY.current - 4) setVisible(true)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => { setUser(user); setAuthLoading(false) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await createClient().auth.signOut()
  }

  async function signIn() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=dashboard`,
        scopes: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.send',
        queryParams: { access_type: 'offline' },
      },
    })
  }

  async function handleManageSubscription() {
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await res.json()
      if (url) window.location.href = url
    } finally {
      setPortalLoading(false)
    }
  }

  const meta = user?.user_metadata as { avatar_url?: string; full_name?: string; name?: string } | undefined
  const avatarUrl = meta?.avatar_url
  const firstName = (meta?.full_name ?? meta?.name ?? '').split(' ')[0]

  return (
    <nav className={`sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-3 bg-[--bg]/95 backdrop-blur-sm border-b border-[--bd] transition-transform duration-300 ease-in-out ${visible ? 'translate-y-0' : '-translate-y-full'}`}>
      <a href="/" className="flex items-center gap-1.5 no-underline group">
        <img src="/recouvr_logo.webp" alt="Recouvr.io" className="w-8 h-8 sm:w-9 sm:h-9 shrink-0" />
        <span className="text-base sm:text-lg font-black tracking-tight text-[--t1]">
          Recouvr<span className="text-[#7c6dfa]">.io</span>
        </span>
      </a>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          className="p-2 rounded-lg text-[--t3] hover:text-[--t2] hover:bg-[--h1] transition-colors"
        >
          {theme === 'dark' ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        {!authLoading && user && plan === 'premium' ? (
          <span className="inline-flex p-px rounded-full bg-gradient-to-r from-violet-400/60 via-rose-400/50 to-orange-300/60">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-[--bg]">
              <span className="bg-gradient-to-r from-violet-400 via-rose-400 to-orange-300 bg-clip-text text-transparent">Premium</span>
            </span>
          </span>
        ) : user ? (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[--bd2] text-[--t3] hover:border-[#7c6dfa]/30 hover:text-[#7c6dfa] transition-colors no-underline"
          >
            Gratuit
          </Link>
        ) : null}

        {!authLoading && !user && (
          <button
            onClick={signIn}
            className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border border-[--bd2] bg-[--card] text-[--t2] hover:border-[--bd] hover:text-[--t1] transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Se connecter
          </button>
        )}
        {authLoading && (
          <div className="w-24 h-7 rounded-lg bg-[--s1] animate-pulse" />
        )}
        {!authLoading && user && (
          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(o => !o)} className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[--h1] transition-colors">
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
                <div className="w-7 h-7 rounded-full bg-[#7c6dfa]/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#7c6dfa]">{firstName[0]?.toUpperCase() ?? '?'}</span>
                </div>
              )}
              {firstName && (
                <span className="text-xs text-[--t2] hidden sm:block">
                  Bonjour, <span className="font-semibold text-[--t1]">{firstName}</span>
                </span>
              )}
              <svg className={`w-3 h-3 text-[--t3] hidden sm:block transition-transform duration-150 ${menuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`absolute right-0 top-full pt-2 transition-all duration-150 z-50 ${menuOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'}`}>
              <div className="bg-[--card] border border-[--bd2] rounded-xl shadow-xl overflow-hidden min-w-[220px]">
                {plan === 'premium' && (
                  <button
                    onClick={() => { setMenuOpen(false); handleManageSubscription() }}
                    disabled={portalLoading}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-[--t2] hover:bg-[--h1] transition-colors border-b border-[--bd] disabled:opacity-50"
                  >
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    {portalLoading ? 'Chargement…' : 'Gérer mon abonnement'}
                  </button>
                )}
                <button
                  onClick={() => { setMenuOpen(false); signOut() }}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
