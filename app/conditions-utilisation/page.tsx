import Nav from '../components/Nav'
import Footer from '../components/Footer'

const SECTIONS = [
  {
    title: '1. Objet et acceptation',
    content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du service Recouvr.io, accessible à l'adresse recouvr.io.

En créant un compte ou en utilisant le service, vous acceptez sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, vous ne devez pas utiliser le service.`,
  },
  {
    title: '2. Description du service',
    content: `Recouvr.io est un outil en ligne destiné aux freelances et travailleurs indépendants. Il permet de :

• Générer des emails de relance professionnels pour des factures impayées.
• Suivre l'historique des relances et leur statut.
• Synchroniser des rappels avec Google Calendar (plan Premium).
• Personnaliser les emails via un agent IA (plan Premium).

Le service est fourni tel quel, dans un objectif d'aide à la rédaction. Recouvr.io ne garantit pas le recouvrement des créances et n'intervient à aucun moment dans la relation commerciale entre l'utilisateur et ses clients.`,
  },
  {
    title: '3. Inscription et compte',
    content: `L'accès à certaines fonctionnalités nécessite la création d'un compte via une adresse e-mail.

Vous êtes responsable de la confidentialité de vos identifiants et de toutes les actions effectuées depuis votre compte. Vous vous engagez à nous notifier immédiatement en cas d'utilisation non autorisée à l'adresse contact@recouvr.io.

Vous devez avoir au moins 18 ans et agir dans un cadre professionnel (activité freelance, auto-entrepreneuriat, etc.) pour utiliser le service.`,
  },
  {
    title: '4. Plans et facturation',
    content: `Recouvr.io propose deux plans :

• Plan Gratuit : accès limité à 2 relances actives simultanément, sans fonctionnalités Premium.
• Plan Premium : accès illimité à l'ensemble des fonctionnalités, au tarif de 9,99 € TTC par mois.

L'abonnement Premium est sans engagement. Vous pouvez résilier à tout moment depuis votre tableau de bord. La résiliation prend effet à la fin de la période de facturation en cours. Aucun remboursement au prorata n'est effectué pour la période restante.

Les prix sont susceptibles d'évoluer. Tout changement tarifaire vous sera communiqué par e-mail avec un préavis d'au moins 30 jours.`,
  },
  {
    title: '5. Utilisation acceptable',
    content: `Vous vous engagez à utiliser le service de bonne foi et à des fins légales uniquement. Il est notamment interdit de :

• Utiliser le service pour harceler, menacer ou intimider des tiers.
• Soumettre des données de facturation fictives ou frauduleuses.
• Tenter de contourner les limites du plan Gratuit (comptes multiples, etc.).
• Revendre, louer ou céder l'accès au service à des tiers.
• Utiliser des scripts automatisés ou des robots pour accéder au service.
• Violer les droits de propriété intellectuelle de Recouvr.io ou de tiers.

Recouvr.io se réserve le droit de suspendre ou supprimer tout compte en violation de ces règles, sans préavis et sans remboursement.`,
  },
  {
    title: '6. Contenu utilisateur',
    content: `Vous conservez la pleine propriété des données que vous saisissez dans le service (noms de clients, montants, contenus d'emails).

En utilisant le service, vous nous accordez une licence limitée, non exclusive et non transférable pour stocker et traiter ces données dans le seul but de fournir le service.

Vous garantissez que les données saisies ne violent aucun droit de tiers et que vous êtes autorisé à les traiter dans le cadre de votre activité professionnelle.`,
  },
  {
    title: '7. Propriété intellectuelle',
    content: `Recouvr.io et l'ensemble de ses composants (code, interface, modèles d'emails, marque, logo) sont la propriété exclusive de leurs auteurs et sont protégés par le droit de la propriété intellectuelle.

Toute reproduction, copie, distribution ou exploitation non autorisée est strictement interdite.`,
  },
  {
    title: '8. Disponibilité et maintenance',
    content: `Recouvr.io s'efforce d'assurer la disponibilité du service 24h/24 et 7j/7, sans pouvoir toutefois la garantir. Des interruptions peuvent survenir pour des raisons de maintenance, de mise à jour ou d'événements indépendants de notre volonté.

Nous nous réservons le droit de modifier, suspendre ou interrompre tout ou partie du service à tout moment, sans engager notre responsabilité.`,
  },
  {
    title: '9. Limitation de responsabilité',
    content: `Dans les limites autorisées par la loi applicable, Recouvr.io ne pourra être tenu responsable :

• Des pertes financières liées à un défaut de recouvrement de créances.
• De l'inexactitude ou de l'inadéquation des emails générés par rapport à une situation particulière.
• D'une interruption de service ou d'une perte de données.
• Des conséquences d'une utilisation non conforme aux présentes CGU.

Le service est un outil d'aide à la rédaction. L'utilisateur reste seul responsable de l'utilisation des emails générés et de ses relations commerciales.`,
  },
  {
    title: '10. Résiliation',
    content: `Vous pouvez supprimer votre compte à tout moment depuis votre tableau de bord ou en nous contactant à contact@recouvr.io. La suppression entraîne l'effacement de l'ensemble de vos données dans un délai de 30 jours.

Recouvr.io peut résilier votre accès en cas de violation des présentes CGU, de non-paiement, ou si le service venait à être arrêté. Dans ce dernier cas, vous en seriez informé par e-mail avec un préavis raisonnable.`,
  },
  {
    title: '11. Modifications des CGU',
    content: `Nous nous réservons le droit de modifier les présentes CGU à tout moment. En cas de modification substantielle, vous serez informé par e-mail ou via une notification dans l'application, avec un préavis d'au moins 15 jours.

La poursuite de l'utilisation du service après ce délai vaut acceptation des nouvelles conditions.`,
  },
  {
    title: '12. Droit applicable et litiges',
    content: `Les présentes CGU sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité via contact@recouvr.io.

À défaut d'accord amiable, les tribunaux français seront seuls compétents.`,
  },
]

export default function ConditionsUtilisation() {
  return (
    <>
      <Nav />
      <main className="bg-slate-900 min-h-screen">
        <div className="max-w-3xl mx-auto px-6 py-24">

          <div className="mb-14">
            <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Légal</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-4">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-slate-400">
              Dernière mise à jour : février 2026
            </p>
          </div>

          <div className="space-y-10">
            {SECTIONS.map(({ title, content }) => (
              <div key={title} className="border-b border-slate-700/60 pb-10">
                <h2 className="text-base font-bold text-white mb-4">{title}</h2>
                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{content}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-sm text-slate-500 mb-3">Des questions sur ces conditions ?</p>
            <a
              href="mailto:contact@recouvr.io"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors no-underline"
            >
              contact@recouvr.io
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
