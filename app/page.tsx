import type { Metadata } from 'next'
import Nav from './components/Nav'
import Hero from './components/Hero'
import ProblemSection from './components/ProblemSection'
import SolutionSection from './components/SolutionSection'
import TimelineSection from './components/TimelineSection'
import ShowcaseSection from './components/ShowcaseSection'
import PricingTeaser from './components/PricingTeaser'
import FAQSection from './components/FAQSection'
import Footer from './components/Footer'

export const metadata: Metadata = {
  title: 'Recouvr.io – Relancez vos clients en toute sérénité',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Recouvr.io',
  url: 'https://recouvr.io',
  description: 'Générez en 30 secondes 3 emails de relance professionnels pour vos factures impayées. Envoi automatique depuis votre Gmail aux bons moments.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  inLanguage: 'fr',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    description: 'Plan gratuit disponible',
  },
  audience: {
    '@type': 'Audience',
    audienceType: 'Freelances et indépendants français',
  },
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Nav />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <TimelineSection />
      <ShowcaseSection />
      <FAQSection />
      <PricingTeaser />
      <Footer />
    </>
  )
}
