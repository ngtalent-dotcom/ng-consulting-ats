import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/clientes', icon: '🏢', label: 'Clientes' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, cerrarSesion } = useAuth()

  // Determine active nav item
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>N&amp;G Talent</h1>
          <span>ATS · Reclutamiento</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Principal</div>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="nav-section-label">Herramientas</div>
          <button className="nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <span className="icon">📋</span>
            Pre-screen
            <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(255,255,255,0.15)', padding: '1px 6px', borderRadius: 10 }}>Pronto</span>
          </button>
          <button className="nav-item" style={{ opacity: 0.5, cursor: 'not-allowed' }}>
            <span className="icon">📄</span>
            Reportes
            <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(255,255,255,0.15)', padding: '1px 6px', borderRadius: 10 }}>Pronto</span>
          </button>

          <div className="nav-section-label">Portal</div>
          <button
            className="nav-item"
            onClick={() => window.open('/careers', '_blank')}
          >
            <span className="icon">🌐</span>
            Portal de candidatos
            <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(14,165,233,0.3)', color: '#7dd3fc', padding: '1px 6px', borderRadius: 10 }}>↗</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div style={{ marginBottom: 6, color: 'rgba(255,255,255,0.6)', fontSize: 12, wordBreak: 'break-all' }}>
            {session?.user?.email || '—'}
          </div>
          <button
            onClick={cerrarSesion}
            style={{
              background: 'none', border: 'none', padding: 0,
              color: 'rgba(255,255,255,0.4)', fontSize: 12,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >
            Cerrar sesión →
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
