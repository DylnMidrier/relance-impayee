import Link from 'next/link'
import MentionsLegales from './MentionsLegales'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
      <p className="mb-2">Recouvr.io · Fait par un freelance, pour les freelances</p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link href="/pricing" className="text-gray-400 hover:text-gray-600">
          Passer Premium
        </Link>
        <span>·</span>
        <a href="mailto:contact@recouvr.io" className="text-gray-400 hover:text-gray-600">
          contact@recouvr.io
        </a>
        <span>·</span>
        <MentionsLegales />
      </div>
    </footer>
  )
}
