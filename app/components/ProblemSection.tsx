'use client'

import { useEffect, useRef, useState } from 'react'
import { PenLine, AlarmClock, Handshake } from 'lucide-react'

const PAINS = [
  {
    Icon: PenLine,
    iconBg: 'bg-amber-400/15',
    iconColor: 'text-amber-400',
    topBorder: 'border-t-amber-500',
    title: 'On ne sait pas quoi écrire',
    desc: 'Trop agressif ? Trop mou ? Trouver le bon ton prend un temps fou, et souvent, on n\'envoie rien du tout.',
  },
  {
    Icon: AlarmClock,
    iconBg: 'bg-sky-400/15',
    iconColor: 'text-sky-400',
    topBorder: 'border-t-sky-500',
    title: 'On reporte encore et toujours',
    desc: "Chaque jour sans relancer, c'est un jour de plus où l'argent n'arrive pas. La facture vieillit.",
  },
  {
    Icon: Handshake,
    iconBg: 'bg-rose-400/15',
    iconColor: 'text-rose-400',
    topBorder: 'border-t-rose-500',
    title: 'On a peur de froisser',
    desc: 'Et si le client se vexe ? Et si on perd la relation ? Ces doutes paralysent, alors qu\'un bon email ne froisse personne.',
  },
]

function useCountUp(target: number, duration = 1400) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true) },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!started) return
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [started, target, duration])

  return { count, ref }
}

export default function ProblemSection() {
  const { count, ref } = useCountUp(82)

  return (
    <section className="py-24 px-6 sm:px-8 bg-slate-900">
      <div className="max-w-5xl mx-auto">

        <div className="mb-12">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Le problème</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Relancer un client, c'est pas<br className="hidden sm:block" /> aussi facile qu'il n'y paraît.
          </h2>
          <p className="text-slate-400 max-w-lg leading-relaxed">
            On le sait tous. On reporte, on hésite, on ne sait pas quoi dire. Et pendant ce temps, l'argent dort.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {PAINS.map(({ Icon, iconBg, iconColor, topBorder, title, desc }) => (
            <div
              key={title}
              className={`bg-slate-800 border border-slate-700 border-t-2 ${topBorder} rounded-2xl p-6 flex flex-col gap-5`}
            >
              <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                <Icon size={22} className={iconColor} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-base font-bold text-white mb-2 leading-snug">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div ref={ref} className="mt-12 pt-10 border-t border-slate-800 text-center">
          <span className="block text-6xl font-black text-white mb-3 tabular-nums">
            {count}&nbsp;%
          </span>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            des indépendants subissent des retards de paiement.{' '}
            <span className="text-slate-200 font-medium">La majorité n'envoie jamais de relance formelle.</span>
          </p>
          <p className="text-slate-600 text-xs mt-3">Source : Coface 2023</p>
        </div>

      </div>
    </section>
  )
}
