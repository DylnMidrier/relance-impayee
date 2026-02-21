import type { Metadata } from 'next'
import CookieBanner from './components/CookieBanner'
import './globals.css'

const siteUrl = 'https://recouvr.io'
const title = 'Recouvr – Relancez vos clients sans stress'
const description =
  'Générez en 30 secondes 3 emails de relance professionnels pour vos factures impayées. Rappel amical, relance ferme, mise en demeure. Pour freelances français.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: '%s | RelanceImpayée',
  },
  description,
  keywords: [
    'relance facture impayée',
    'email relance client',
    'freelance facture',
    'mise en demeure gratuite',
    'modèle relance facture',
  ],
  authors: [{ name: 'Recouvr', url: siteUrl }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: 'Recouvr',
    title,
    description,
  },
  twitter: {
    card: 'summary',
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-N3BHW92C"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
