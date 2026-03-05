import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Recouvr.io – Relancez vos factures impayées en 30 secondes'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8f9ff 0%, #eef0ff 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Cercle décoratif haut droite */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.08)',
            display: 'flex',
          }}
        />
        {/* Cercle décoratif bas gauche */}
        <div
          style={{
            position: 'absolute',
            bottom: -60,
            left: -60,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.06)',
            display: 'flex',
          }}
        />

        {/* Contenu centré */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 32,
            padding: '0 80px',
          }}
        >
          {/* Logo + nom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: '#4f46e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div style={{ color: 'white', fontSize: 32, fontWeight: 900, display: 'flex' }}>R</div>
            </div>
            <div style={{ fontSize: 52, fontWeight: 900, color: '#111827', display: 'flex' }}>
              Recouvr<span style={{ color: '#4f46e5' }}>.io</span>
            </div>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: '#374151',
              textAlign: 'center',
              lineHeight: 1.3,
              display: 'flex',
            }}
          >
            Relancez vos factures impayées en 30 secondes
          </div>

          {/* Pills niveaux */}
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {[
              { dot: '#22c55e', label: 'Rappel amical · J+7' },
              { dot: '#f97316', label: 'Relance ferme · J+15' },
              { dot: '#ef4444', label: 'Mise en demeure · J+30' },
            ].map(({ dot, label }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'white',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: 999,
                  padding: '10px 20px',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#374151',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: dot,
                    display: 'flex',
                  }}
                />
                {label}
              </div>
            ))}
          </div>

          {/* Sous-titre */}
          <div style={{ fontSize: 20, color: '#9ca3af', display: 'flex' }}>
            Pour freelances · Gratuit pour démarrer
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
