import { useLocation, useNavigate } from 'react-router-dom'

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/clientes', icon: '🏢', label: 'Clientes' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()

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
          <div style={{ marginBottom: 4, color: 'rgba(255,255,255,0.7)', fontWeight: 600, fontSize: 13 }}>Gustavo Martínez</div>
          <div>gustavo@ngtalentconsulting.com.mx</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
