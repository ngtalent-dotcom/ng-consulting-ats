import { useNavigate } from 'react-router-dom'

export default function CareersLayout({ children }) {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header público */}
      <header style={{
        background: '#1e3a5f',
        color: 'white',
        padding: '0 40px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      }}>
        <div
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
          onClick={() => navigate('/careers')}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: '#0ea5e9',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 14, color: 'white',
          }}>
            N&amp;G
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>N&amp;G Talent Consulting</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Bolsa de trabajo</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            📍 Monterrey, NL
          </span>
          <a
            href="mailto:reclutamiento@ngtalentconsulting.com.mx"
            style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', textDecoration: 'none' }}
          >
            reclutamiento@ngtalentconsulting.com.mx
          </a>
        </div>
      </header>

      {/* Contenido */}
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {children}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        padding: '24px 40px',
        textAlign: 'center',
        fontSize: 12,
        color: '#94a3b8',
        background: 'white',
        marginTop: 60,
      }}>
        © {new Date().getFullYear()} N&amp;G Talent Consulting · Monterrey, NL ·{' '}
        <a href="mailto:reclutamiento@ngtalentconsulting.com.mx" style={{ color: '#2563eb' }}>
          reclutamiento@ngtalentconsulting.com.mx
        </a>
      </footer>
    </div>
  )
}
