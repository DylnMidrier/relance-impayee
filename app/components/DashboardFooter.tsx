import Link from 'next/link'
import MentionsLegales from './MentionsLegales'

export default function DashboardFooter() {
  return (
    <footer className="bg-[--bg] border-t border-[--bd4] py-6 text-center text-xs text-[--t3]">
      <p className="mb-2 text-[--t2]">Recouvr.io · Fait par un freelance, pour les freelances</p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link href="/pricing" className="text-[--t3] hover:text-[#7c6dfa] transition-colors no-underline">
          Passer Premium
        </Link>
        <span>·</span>
        <a href="mailto:contact@recouvr.io" className="text-[--t3] hover:text-[#7c6dfa] transition-colors no-underline">
          contact@recouvr.io
        </a>
        <span>·</span>
        <Link href="/politique-confidentialite" className="text-[--t3] hover:text-[#7c6dfa] transition-colors no-underline">
          Confidentialité
        </Link>
        <span>·</span>
        <Link href="/conditions-utilisation" className="text-[--t3] hover:text-[#7c6dfa] transition-colors no-underline">
          CGU
        </Link>
        <span>·</span>
        <span className="[&_button]:text-[--t3] [&_button]:hover:text-[#7c6dfa]">
          <MentionsLegales />
        </span>
      </div>
    </footer>
  )
}
