import './globals.css'

export const metadata = {
  title: 'RelanceImpayée – Relancez vos clients sans stress',
  description:
    'Générez en 30 secondes 3 emails de relance professionnels pour vos factures impayées. Pour freelances français.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
