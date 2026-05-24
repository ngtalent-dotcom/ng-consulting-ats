export default function PortalLayout({ children }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{
        background: '#1e3a5f', padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 10,
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
      }}>
        <div style={{ color: 'white', fontWeight: 800, fontSize: 16 }}>N&amp;G Talent Consulting</div>
        <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
        <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>Portal de seguimiento</div>
      </div>

      <main style={{ maxWidth: 920, margin: '0 auto', padding: '24px 16px 60px' }}>
        {children}
      </main>

      <div style={{
        borderTop: '1px solid #e2e8f0', padding: '20px 32px',
        textAlign: 'center', color: '#94a3b8', fontSize: 12,
      }}>
        N&amp;G Talent Consulting &middot; Portal confidencial &middot; Solo para uso del cliente
      </div>
    </div>
  )
}
