import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import CareersLayout from './CareersLayout'
import { getVacanteById } from '../../services/vacantesService'

export default function CareersDetail() {
  const { vacanteId } = useParams()
  const navigate = useNavigate()
  const [vacante, setVacante] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getVacanteById(Number(vacanteId))
        setVacante(data)
      } catch (err) {
        console.error('Error cargando vacante:', err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [vacanteId])

  if (cargando) {
    return (
      <CareersLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          Cargando vacante...
        </div>
      </CareersLayout>
    )
  }

  if (!vacante) {
    return (
      <CareersLayout>
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>&#128269;</div>
          <p style={{ fontSize: 16 }}>Vacante no encontrada.</p>
          <button
            onClick={() => navigate('/careers')}
            style={{ marginTop: 16, background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontSize: 14 }}
          >
            Ver todas las vacantes
          </button>
        </div>
      </CareersLayout>
    )
  }

  const cliente = vacante.clientes || {}

  // Descripción del puesto — usa campos de BD si existen, sino genera texto base
  const resumen = vacante.descripcion ||
    'Estamos en búsqueda de un/a ' + vacante.titulo + ' para integrarse al equipo de ' + (cliente.nombre || 'la empresa') + '. Esta posición representa una excelente oportunidad de desarrollo profesional en ' + vacante.ciudad + '.'

  const requisitosTexto = vacante.requisitos ||
    'Experiencia previa en el área de ' + vacante.area + ', nivel ' + vacante.nivel + '. Disponibilidad para modalidad ' + vacante.modalidad + ' en ' + vacante.ciudad + '.'

  const ofrecemos = [
    'Sueldo competitivo y acorde a tu experiencia.',
    'Prestaciones de ley + beneficios adicionales.',
    'Ambiente de trabajo dinámico y colaborativo.',
    'Oportunidad real de crecimiento y desarrollo profesional.',
  ]

  const tags = [
    { text: '&#128205; ' + vacante.ciudad },
    { text: vacante.modalidad },
    { text: vacante.nivel },
    { text: vacante.area },
  ].filter(t => t.text && t.text.trim() !== '')

  const descripcionSeo = (vacante.descripcion || resumen).slice(0, 200)
  const fechaPublicacion = vacante.created_at ? vacante.created_at.split('T')[0] : new Date().toISOString().split('T')[0]

  const jobSchema = {
    '@context': 'https://schema.org/',
    '@type': 'JobPosting',
    title: vacante.titulo,
    description: vacante.descripcion || resumen,
    hiringOrganization: {
      '@type': 'Organization',
      name: 'N&G Talent Consulting',
      sameAs: window.location.origin + '/careers',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: vacante.ciudad || 'Monterrey',
        addressRegion: 'NL',
        addressCountry: 'MX',
      },
    },
    datePosted: fechaPublicacion,
    employmentType: 'FULL_TIME',
    ...(vacante.modalidad === 'Remoto' && { jobLocationType: 'TELECOMMUTE' }),
    applicantLocationRequirements: { '@type': 'Country', name: 'Mexico' },
    url: window.location.href,
  }

  return (
    <CareersLayout>
      <Helmet>
        <title>{vacante.titulo} en {vacante.ciudad} | N&amp;G Talent Consulting</title>
        <meta name="description" content={`Aplica como ${vacante.titulo} en ${cliente.nombre || 'empresa confidencial'}. ${vacante.ciudad} · ${vacante.modalidad} · ${vacante.nivel}. ${descripcionSeo}`} />
        <meta property="og:title" content={`${vacante.titulo} | N&G Talent Consulting`} />
        <meta property="og:description" content={`${vacante.ciudad} · ${vacante.modalidad} · ${vacante.nivel}`} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">{JSON.stringify(jobSchema)}</script>
      </Helmet>

      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/careers')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 13, padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: 4 }}
      >
        &#8592; Todas las vacantes
      </button>

      <div className="careers-detail-grid">
        {/* Columna principal */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Header */}
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '28px 28px 24px' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 18 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12,
                background: '#dbeafe', color: '#1e40af',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: 22, flexShrink: 0,
              }}>
                {(cliente.nombre || '?').charAt(0)}
              </div>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', margin: '0 0 4px' }}>
                  {vacante.titulo}
                </h1>
                <div style={{ fontSize: 14, color: '#64748b' }}>
                  {cliente.nombre || 'Empresa'} &middot;{' '}
                  {vacante.fecha_apertura
                    ? 'Publicada ' + new Date(vacante.fecha_apertura).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
                    : ''}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tags.map((t, i) => (
                <span key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: '#f1f5f9', color: '#334155',
                  padding: '5px 12px', borderRadius: 7,
                  fontSize: 13, fontWeight: 500,
                  border: '1px solid #e2e8f0',
                }}
                  dangerouslySetInnerHTML={{ __html: t.text }}
                />
              ))}
            </div>
          </div>

          {/* Resumen */}
          <Section title="Sobre la posición">
            <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 14, whiteSpace: 'pre-line' }}>
              {resumen}
            </p>
          </Section>

          {/* Requisitos */}
          <Section title="Perfil requerido">
            <p style={{ color: '#475569', lineHeight: 1.7, fontSize: 14, whiteSpace: 'pre-line' }}>
              {requisitosTexto}
            </p>
          </Section>

          {/* Ofrecemos — NUNCA mostrar salarios aqui */}
          <Section title="Lo que ofrecemos">
            <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ofrecemos.map((r, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                  <span style={{ color: '#10b981', flexShrink: 0, marginTop: 2 }}>&#9733;</span>
                  {r}
                </li>
              ))}
            </ul>
          </Section>
        </div>

        {/* Sidebar derecho — CTA sticky */}
        <div className="careers-detail-sidebar">
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginBottom: 4 }}>
              Salario competitivo
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 20 }}>Acorde al perfil y experiencia</div>

            <button
              onClick={() => navigate('/careers/' + vacante.id + '/apply')}
              style={{
                width: '100%', background: '#2563eb', color: 'white',
                border: 'none', borderRadius: 9, padding: '13px 0',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                marginBottom: 12, transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.target.style.background = '#1d4ed8'}
              onMouseLeave={e => e.target.style.background = '#2563eb'}
            >
              Aplicar ahora &#8594;
            </button>

            <div style={{ fontSize: 11.5, color: '#94a3b8', textAlign: 'center', marginBottom: 20 }}>
              El proceso es rápido y confidencial.
            </div>

            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Empresa',    value: cliente.nombre || '—' },
                { label: 'Ubicación',  value: vacante.ciudad || '—' },
                { label: 'Modalidad',  value: vacante.modalidad || '—' },
                { label: 'Nivel',      value: vacante.nivel || '—' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span style={{ color: '#94a3b8' }}>{item.label}</span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </CareersLayout>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '22px 28px' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', margin: '0 0 14px', paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
        {title}
      </h2>
      {children}
    </div>
  )
}
