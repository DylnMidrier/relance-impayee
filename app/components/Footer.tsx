import MentionsLegales from './MentionsLegales'

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
      Recouvr · Fait par un freelance, pour les freelances ·{' '}
      <a href="mailto:contact@recouvr.io" className="text-gray-400 hover:text-gray-600">
        contact@recouvr.io
      </a>
      {' '}·{' '}
      <MentionsLegales />
    </footer>
  )
}
