import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/clientes', icon: '🏢', label: 'Clientes' },
  { path: '/banco-talento', icon: '🌟', label: 'Banco de Talento' },
]

const herramientasItems = [
  { path: '/herramientas/plantillas', icon: '📋', label: 'Plantillas de competencias' },
  { path: '/herramientas/levantamiento', icon: '📝', label: 'Levantamiento de perfil' },
  { path: '/herramientas/cobro', icon: '💰', label: 'Generador de cobro' },
  { path: '/herramientas/metricas', icon: '📈', label: 'Métricas' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { session, cerrarSesion } = useAuth()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const navegar = (path) => {
    navigate(path)
    setMenuAbierto(false)
  }

  return (
    <div className="app-layout">
      {menuAbierto && <div className="sidebar-fondo" onClick={() => setMenuAbierto(false)} />}

      <aside className={'sidebar' + (menuAbierto ? ' sidebar-visible' : '')}>
        <div className="sidebar-logo">
          <h1>N&amp;G Talent</h1>
          <span>ATS &middot; Reclutamiento</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Principal</div>
          {navItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navegar(item.path)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="nav-section-label">Herramientas</div>
          {herramientasItems.map((item) => (
            <button
              key={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              onClick={() => navegar(item.path)}
            >
              <span className="icon">{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div className="nav-section-label">Portal</div>
          <button
            className="nav-item"
            onClick={() => { window.open('/careers', '_blank'); setMenuAbierto(false) }}
          >
            <span className="icon">🌐</span>
            Portal de candidatos
            <span style={{ marginLeft: 'auto', fontSize: 10, background: 'rgba(14,165,233,0.3)', color: '#7dd3fc', padding: '1px 6px', borderRadius: 10 }}>&#8599;</span>
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
              cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}
          >
            Cerrar sesión &#8594;
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="topbar-movil">
          <button className="btn-nav-movil" onClick={() => setMenuAbierto(true)}>&#9776;</button>
          <span className="topbar-movil-logo">N&amp;G Talent</span>
        </div>
        {children}
      </main>
    </div>
  )
}
