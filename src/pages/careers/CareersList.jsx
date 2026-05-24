import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import CareersLayout from './CareersLayout'
import { getVacantesPublicas } from '../../services/vacantesService'

export default function CareersList() {
  const navigate = useNavigate()
  const [vacantesPublicas, setVacantesPublicas] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getVacantesPublicas()
        setVacantesPublicas(data)
      } catch (err) {
        console.error('Error cargando vacantes:', err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const prioridadLabel = { 'Alta': 'Urgente', 'Media': 'Activa', 'Baja': 'Abierta' }
  const prioridadStyle = {
    'Alta':  { background: '#fee2e2', color: '#dc2626' },
    'Media': { background: '#d1fae5', color: '#065f46' },
    'Baja':  { background: '#f1f5f9', color: '#475569' },
  }

  return (
    <CareersLayout>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{
          display: 'inline-block',
          background: '#dbeafe', color: '#1e40af',
          padding: '4px 14px', borderRadius: 20,
          fontSize: 12, fontWeight: 600, marginBottom: 16,
        }}>
          {cargando ? 'Cargando...' : vacantesPublicas.length + ' vacantes disponibles'}
        </div>
        <h1 className="careers-titulo-hero">
          Encuentra tu próxima oportunidad
        </h1>
        <p style={{ fontSize: 16, color: '#64748b', maxWidth: 520, margin: '0 auto' }}>
          Conectamos talento excepcional con las mejores empresas de Monterrey y noreste de México.
        </p>
      </div>

      {/* Lista de vacantes */}
      {cargando ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          Cargando vacantes...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {vacantesPublicas.map(v => {
            const cliente = v.clientes || {}
            const estilo = prioridadStyle[v.prioridad] || prioridadStyle['Media']

            return (
              <div
                key={v.id}
                className="careers-tarjeta"
                onClick={() => navigate('/careers/' + v.id)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#2563eb'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(37,99,235,0.1)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#e2e8f0'
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Icono empresa */}
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: '#dbeafe', color: '#1e40af',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 20, flexShrink: 0,
                }}>
                  {(cliente.nombre || '?').charAt(0)}
                </div>

                {/* Info principal */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: '#1e293b', margin: 0 }}>
                      {v.titulo}
                    </h2>
                    <span style={{
                      ...estilo,
                      padding: '2px 10px', borderRadius: 20,
                      fontSize: 11, fontWeight: 700,
                    }}>
                      {prioridadLabel[v.prioridad] || 'Activa'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', marginBottom: 10 }}>
                    {cliente.nombre || 'Empresa confidencial'} &middot; {v.ciudad}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[v.area, v.nivel, v.modalidad].filter(Boolean).map((tag, i) => (
                      <span key={i} style={{
                        background: '#f1f5f9', color: '#475569',
                        padding: '3px 10px', borderRadius: 6,
                        fontSize: 12, fontWeight: 500,
                        border: '1px solid #e2e8f0',
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="careers-cta">
                  <div style={{
                    background: '#2563eb', color: 'white',
                    padding: '10px 20px', borderRadius: 8,
                    fontSize: 13, fontWeight: 600,
                  }}>
                    Ver vacante &#8594;
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                    {v.fecha_apertura
                      ? 'Publicada ' + new Date(v.fecha_apertura).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
                      : ''}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Mensaje sin vacantes */}
      {!cargando && vacantesPublicas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>&#128203;</div>
          <p style={{ fontSize: 16 }}>No hay vacantes disponibles en este momento.</p>
          <p style={{ fontSize: 13, marginTop: 8 }}>
            Escríbenos a reclutamiento@ngtalentconsulting.com.mx para más información.
          </p>
        </div>
      )}

      {/* Banner CV espontaneo */}
      <div style={{
        marginTop: 60, padding: '32px 36px',
        background: '#1e3a5f', borderRadius: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ color: 'white', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>
            ¿No encontraste lo que buscas?
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            Envíanos tu CV y te avisamos cuando surja una oportunidad para tu perfil.
          </div>
        </div>
        <a
          href="mailto:reclutamiento@ngtalentconsulting.com.mx?subject=CV%20Espontaneo"
          style={{
            display: 'inline-block',
            background: '#0ea5e9', color: 'white',
            padding: '12px 24px', borderRadius: 8,
            fontSize: 14, fontWeight: 600,
            textDecoration: 'none', flexShrink: 0,
          }}
        >
          Enviar CV por correo
        </a>
      </div>
    </CareersLayout>
  )
}
