import Link from 'next/link'
import MentionsLegales from './MentionsLegales'

export default function DashboardFooter() {
  return (
    <footer className="bg-[#0c0e14] border-t border-white/[0.05] py-6 text-center text-xs text-[#454d6e]">
      <p className="mb-2 text-[#8891b4]">Recouvr.io · Fait par un freelance, pour les freelances</p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link href="/pricing" className="text-[#454d6e] hover:text-[#7c6dfa] transition-colors no-underline">
          Passer Premium
        </Link>
        <span>·</span>
        <a href="mailto:contact@recouvr.io" className="text-[#454d6e] hover:text-[#7c6dfa] transition-colors no-underline">
          contact@recouvr.io
        </a>
        <span>·</span>
        <Link href="/politique-confidentialite" className="text-[#454d6e] hover:text-[#7c6dfa] transition-colors no-underline">
          Confidentialité
        </Link>
        <span>·</span>
        <Link href="/conditions-utilisation" className="text-[#454d6e] hover:text-[#7c6dfa] transition-colors no-underline">
          CGU
        </Link>
        <span>·</span>
        <span className="[&_button]:text-[#454d6e] [&_button]:hover:text-[#7c6dfa]">
          <MentionsLegales />
        </span>
      </div>
    </footer>
  )
}
