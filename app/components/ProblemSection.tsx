import { PenLine, Clock, Handshake, LucideIcon } from 'lucide-react'

interface ProblemCard {
  Icon: LucideIcon
  bg: string
  color: string
  title: string
  desc: string
}

const CARDS: ProblemCard[] = [
  { Icon: PenLine,   bg: 'bg-amber-50', color: 'text-amber-500', title: 'On ne sait pas comment formuler', desc: 'Trop agressif ? Trop mou ? Trouver le bon ton prend un temps fou.' },
  { Icon: Clock,     bg: 'bg-sky-50',   color: 'text-sky-500',   title: 'On reporte encore et toujours',   desc: "Chaque jour sans relancer, c'est un jour de plus où l'argent n'arrive pas." },
  { Icon: Handshake, bg: 'bg-rose-50',  color: 'text-rose-500',  title: 'On a peur de froisser',           desc: 'Et si le client se vexe ? Et si on perd la relation ? Ces doutes paralysent.' },
]

export default function ProblemSection() {
  return (
    <section className="py-20 px-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-3">Le problème</p>
        <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-gray-900">Relancer un client, c'est pas aussi facile qu'il n'y paraît.</h2>
        <p className="text-gray-500 max-w-lg mb-12">On le sait tous. On reporte, on hésite, on ne sait pas quoi dire. Et pendant ce temps, l'argent dort.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CARDS.map(({ Icon, bg, color, title, desc }) => (
            <div key={title} className="bg-white border border-gray-200 rounded-xl p-7 shadow-sm">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-5`}>
                <Icon size={20} className={color} strokeWidth={1.75} />
              </div>
              <h3 className="font-bold mb-2 text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
