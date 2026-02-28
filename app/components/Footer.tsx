import Link from 'next/link'
import MentionsLegales from './MentionsLegales'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0d1629' }} className="py-8 text-center text-sm text-white/50">
      <p className="mb-2 text-white/70">Recouvr.io · Fait par un freelance, pour les freelances</p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link href="/pricing" className="text-white/50 hover:text-white transition-colors">
          Passer Premium
        </Link>
        <span>·</span>
        <a href="mailto:contact@recouvr.io" className="text-white/50 hover:text-white transition-colors">
          contact@recouvr.io
        </a>
        <span>·</span>
        <MentionsLegales />
      </div>
    </footer>
  )
}
