import Nav from './components/Nav'
import Hero from './components/Hero'
import ProblemSection from './components/ProblemSection'
import SolutionSection from './components/SolutionSection'
import ShowcaseSection from './components/ShowcaseSection'
import Footer from './components/Footer'
import HomeClient from './components/HomeClient'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Recouvr.io',
  url: 'https://recouvr.io',
  description: 'Générez en 30 secondes 3 emails de relance professionnels pour vos factures impayées.',
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
      <ShowcaseSection />
      <HomeClient />
      <Footer />
    </>
  )
}
