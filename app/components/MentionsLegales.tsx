'use client'

import { useState } from 'react'

const sections = [
  {
    title: 'Édition du site',
    content: `L'édition et la direction de la publication du site est assurée par Monsieur Dylan Midrier, domicilié 8 Rue du Général Galliéni.

Téléphone : 06 98 03 38 35
E-mail : dylan.midrier@gmail.com`,
  },
  {
    title: 'Hébergeur',
    content: `Le site est hébergé par la société Vercel Inc., dont le siège social est situé au 340 Pine Street, Suite 1402, San Francisco, États-Unis.`,
  },
  {
    title: 'Accès au site',
    content: `Le site est normalement accessible à tout moment. Toutefois, l'éditeur pourra suspendre, limiter ou interrompre le site afin de procéder à des mises à jour ou modifications. L'éditeur ne pourra être tenu responsable des conséquences éventuelles de cette indisponibilité.`,
  },
  {
    title: 'Collecte des données',
    content: `Le site assure une collecte et un traitement des données personnelles dans le respect de la vie privée, conformément à la loi n°78-17 du 6 janvier 1978 et au règlement (UE) 2016/679 du 27 avril 2016 (RGPD).

L'utilisateur dispose d'un droit d'accès, de rectification, de suppression et d'opposition de ses données personnelles, exerçable par e-mail à : contact@recouvr.io

Toute reproduction ou utilisation du site sans autorisation expresse de l'éditeur est prohibée.`,
  },
]

export default function MentionsLegales() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="underline underline-offset-2 hover:text-gray-600 transition-colors cursor-pointer"
      >
        Mentions légales
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative px-7 py-6 border-b border-gray-100 shrink-0 text-center">
              <h2 className="text-lg font-extrabold text-gray-900">Mentions légales</h2>
              <p className="text-xs text-gray-400 mt-0.5">En vigueur au 21/02/2026 · recouvr.io</p>
              <button
                onClick={() => setOpen(false)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none cursor-pointer"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-6">
              <p className="text-sm text-gray-500 leading-relaxed">
                Conformément aux dispositions de la loi n°2004-575 du 21 juin 2004 pour la Confiance
                en l'économie numérique, les présentes mentions légales sont portées à la connaissance
                des utilisateurs du site{' '}
                <a href="https://recouvr.io" className="text-indigo-600 hover:underline">
                  recouvr.io
                </a>.
              </p>

              {sections.map(({ title, content }) => (
                <div key={title}>
                  <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
                    {title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed whitespace-pre-line">
                    {content}
                  </p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-7 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setOpen(false)}
                className="w-full py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
