'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

const CLARITY_ID = 'vkz8mpxxcy'
const GTM_ID = 'GTM-N3BHW92C'
const STORAGE_KEY = 'cookie-consent'

export default function CookieBanner() {
  const [consent, setConsent] = useState<boolean | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) setConsent(stored === 'true')
    setReady(true)
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setConsent(true)
  }

  function refuse() {
    localStorage.setItem(STORAGE_KEY, 'false')
    setConsent(false)
  }

  return (
    <>
      {/* Clarity — chargé uniquement si accepté */}
      {consent === true && (
        <>
          <Script
            id="clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${CLARITY_ID}");`,
            }}
          />
          <Script
            id="gtm"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');`,
            }}
          />
        </>
      )}

      {/* Bandeau — affiché uniquement si pas encore de choix */}
      {ready && consent === null && (
        <div className="fixed bottom-0 inset-x-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-6 py-4">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              On utilise des cookies d'analyse (Microsoft Clarity, Google Analytics) pour comprendre comment vous utilisez le site.{' '}
              <span className="text-gray-400">Aucun cookie publicitaire.</span>
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={refuse}
                className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Refuser
              </button>
              <button
                onClick={accept}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
              >
                Accepter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
