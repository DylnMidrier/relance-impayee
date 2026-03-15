'use client'

import { useState, useEffect, useRef } from 'react'
import AuthButton from './AuthButton'
import PlanBadge from './PlanBadge'

export default function Nav() {
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      if (y < 10) {
        setVisible(true)
      } else if (y > lastY.current + 8) {
        setVisible(false)
      } else if (y < lastY.current - 4) {
        setVisible(true)
      }
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-4 py-3 transition-transform duration-300 ease-in-out ${visible ? 'translate-y-0' : '-translate-y-[110%]'}`}
    >
      <nav className="flex items-center justify-between w-full max-w-3xl px-4 sm:px-5 py-2.5 bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-2xl shadow-sm shadow-gray-200/60">
        <a href="/" className="flex items-center gap-1.5 no-underline group">
          <img src="/recouvr_logo.webp" alt="Recouvr.io" className="w-8 h-8 shrink-0" />
          <span className="text-base font-black tracking-tight text-gray-900">
            Recouvr<span className="text-indigo-600">.io</span>
          </span>
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          <PlanBadge />
          <AuthButton />
        </div>
      </nav>
    </div>
  )
}
