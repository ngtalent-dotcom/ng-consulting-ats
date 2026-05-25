import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { toast } from 'sonner'

const SERVICIOS = [
  {
    icon: '🎯',
    titulo: 'Búsqueda ejecutiva y mandos medios',
    desc: 'Identificamos y evaluamos candidatos para posiciones estratégicas — desde coordinadores hasta dirección — con enfoque en competencias y cultura organizacional.',
  },
  {
    icon: '⚙️',
    titulo: 'Reclutamiento especializado por sector',
    desc: 'Experiencia en perfiles de ventas, operaciones, manufactura, tecnología y administración para empresas del noreste de México.',
  },
  {
    icon: '✅',
    titulo: 'Proceso con garantía',
    desc: 'Acompañamiento desde el levantamiento del perfil hasta la colocación, con garantía de 3 meses en cada posición cubierta.',
  },
]

const METRICAS = [
  { num: '+1 año', label: 'Permanencia promedio de los candidatos colocados' },
  { num: '3 meses', label: 'Garantía en cada posición cubierta' },
  { num: '100%', label: 'Atención directa de especialista en cada búsqueda' },
]

const EQUIPO = [
  {
    nombre: 'Gustavo Martínez',
    rol: 'Fundador · Reclutamiento & Career Advisory',
    desc: '6 años acompañando a empresas del noreste de México en procesos de atracción de talento para las industrias de ventas, operaciones, manufactura y tecnología.',
    inicial: 'G',
  },
  {
    nombre: 'Montzerrat Martínez',
    rol: 'Especialista · Talento Corporativo',
    desc: 'Más de 5 años en posiciones de liderazgo en entornos corporativos. Entiende de primera mano qué busca una empresa en un candidato de nivel gerencial.',
    inicial: 'M',
  },
]

const schemaOrg = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'N&G Talent Consulting',
  description: 'Consultora de reclutamiento especializada en el noreste de México. Encontramos el talento que transforma tu empresa.',
  email: 'reclutamiento@ngtalentconsulting.com.mx',
  telephone: '+52-81-2200-5520',
  address: { '@type': 'PostalAddress', addressLocality: 'Monterrey', addressRegion: 'NL', addressCountry: 'MX' },
  areaServed: 'Noreste de México',
  url: 'https://ng-consulting-ats.vercel.app',
}

const inpBase = {
  width: '100%', padding: '11px 14px', borderRadius: 8,
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'rgba(255,255,255,0.08)',
  color: 'white', fontSize: 14, fontFamily: 'inherit',
  outline: 'none', boxSizing: 'border-box',
}

function CampoForm({ label, type = 'text', value, onChange, required, placeholder }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.07em' }}>
        {label}{required && ' *'}
      </label>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        required={required} placeholder={placeholder}
        style={inpBase}
        onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.5)' }}
        onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)' }}
      />
    </div>
  )
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false)
  const [menuMovil, setMenuMovil] = useState(false)
  const [mostrarSubir, setMostrarSubir] = useState(false)
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  const [form, setForm] = useState({ nombre: '', empresa: '', correo: '', telefono: '', mensaje: '' })
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 48)
      setMostrarSubir(window.scrollY > 500)
    }
    const onResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('scroll', onScroll)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  function irA(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuMovil(false)
  }

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  async function handleSubmit(e) {
    e.preventDefault()
    setEnviando(true)
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setEnviado(true)
    } catch {
      toast.error('Error al enviar. Intenta de nuevo o contáctanos por WhatsApp.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>N&amp;G Talent Consulting | Reclutamiento Especializado en Monterrey</title>
        <meta name="description" content="Consultora de reclutamiento especializada en el noreste de México. Encontramos el talento que transforma tu empresa. Proceso ágil, criterio profesional y garantía de 3 meses." />
        <meta name="keywords" content="reclutamiento Monterrey, headhunter noreste México, consultora talento, reclutamiento especializado Nuevo León, búsqueda ejecutiva Monterrey" />
        <link rel="canonical" href="https://ng-consulting-ats.vercel.app/" />
        <script type="application/ld+json">{JSON.stringify(schemaOrg)}</script>
      </Helmet>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: scrolled ? 'white' : 'transparent',
        borderBottom: scrolled ? '1px solid #e2e8f0' : 'none',
        boxShadow: scrolled ? '0 1px 16px rgba(0,0,0,0.08)' : 'none',
        transition: 'background 0.25s, box-shadow 0.25s',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 900, fontSize: 17, color: scrolled ? '#1e3a5f' : 'white', letterSpacing: '-0.3px' }}>
            N&amp;G Talent
          </div>

          {!isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {[['servicios', 'Servicios'], ['nosotros', 'Nosotros'], ['contacto', 'Contacto']].map(([id, label]) => (
                <button key={id} onClick={() => irA(id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
                  color: scrolled ? '#475569' : 'rgba(255,255,255,0.8)',
                  transition: 'color 0.15s',
                  padding: '4px 0',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = scrolled ? '#1e3a5f' : 'white' }}
                onMouseLeave={e => { e.currentTarget.style.color = scrolled ? '#475569' : 'rgba(255,255,255,0.8)' }}
                >
                  {label}
                </button>
              ))}
              <a href="/careers" style={{
                padding: '8px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: scrolled ? '#1e3a5f' : 'rgba(255,255,255,0.12)',
                border: '1.5px solid ' + (scrolled ? '#1e3a5f' : 'rgba(255,255,255,0.35)'),
                color: 'white', textDecoration: 'none', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
                Ver vacantes →
              </a>
            </div>
          ) : (
            <button
              onClick={() => setMenuMovil(m => !m)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '8px',
                color: scrolled ? '#1e3a5f' : 'white', fontSize: 24, lineHeight: 1,
              }}
              aria-label="Menú"
            >
              {menuMovil ? '✕' : '☰'}
            </button>
          )}
        </div>
      </nav>

      {isMobile && menuMovil && (
        <div style={{
          position: 'fixed', top: 64, left: 0, right: 0, zIndex: 190,
          background: scrolled ? 'white' : '#0f2640',
          borderBottom: '1px solid ' + (scrolled ? '#e2e8f0' : 'rgba(255,255,255,0.1)'),
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}>
          {[['servicios', 'Servicios'], ['nosotros', 'Nosotros'], ['contacto', 'Contacto']].map(([id, label]) => (
            <button key={id} onClick={() => irA(id)} style={{
              display: 'block', width: '100%', textAlign: 'left',
              padding: '16px 24px', border: 'none',
              background: 'none', cursor: 'pointer',
              fontSize: 15, fontWeight: 500, fontFamily: 'inherit',
              color: scrolled ? '#334155' : 'rgba(255,255,255,0.85)',
              borderBottom: '1px solid ' + (scrolled ? '#f1f5f9' : 'rgba(255,255,255,0.07)'),
            }}>
              {label}
            </button>
          ))}
          <a href="/careers" style={{
            display: 'block', padding: '16px 24px',
            fontSize: 15, fontWeight: 700,
            color: '#0ea5e9', textDecoration: 'none',
          }}>
            Ver vacantes →
          </a>
        </div>
      )}

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(145deg, #0a1929 0%, #1e3a5f 55%, #1a4a7a 100%)',
        padding: '120px 24px 100px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -120, right: -120, width: 560, height: 560, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.025)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 720, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 20, padding: '5px 18px', fontSize: 11, fontWeight: 700,
            color: 'rgba(255,255,255,0.75)', marginBottom: 28, letterSpacing: '.08em', textTransform: 'uppercase',
          }}>
            Monterrey · Noreste de México
          </div>

          <h1 style={{ fontSize: isMobile ? 34 : 54, fontWeight: 900, color: 'white', lineHeight: 1.12, marginBottom: 24, letterSpacing: isMobile ? '-0.5px' : '-1.5px' }}>
            El socio de reclutamiento que su empresa merece
          </h1>

          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.75, marginBottom: 44, maxWidth: 580, margin: '0 auto 44px' }}>
            Conectamos a empresas líderes del noreste de México con el talento que realmente genera impacto. Proceso ágil, criterio profesional y garantía de resultados.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row', padding: isMobile ? '0 8px' : 0 }}>
            <button onClick={() => irA('contacto')} style={{
              padding: '15px 36px', borderRadius: 10, border: 'none',
              background: 'white', color: '#1e3a5f',
              fontSize: 15, fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
              transition: 'transform 0.15s, box-shadow 0.15s',
              width: isMobile ? '100%' : 'auto',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.25)' }}
            >
              Solicitar información
            </button>
            <a href="/careers" style={{
              padding: '15px 36px', borderRadius: 10,
              border: '2px solid rgba(255,255,255,0.35)',
              background: 'transparent', color: 'white',
              fontSize: 15, fontWeight: 700, textDecoration: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.15s',
              width: isMobile ? '100%' : 'auto',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)' }}
            >
              Ver vacantes disponibles →
            </a>
          </div>
        </div>
      </section>

      {/* ── SERVICIOS ── */}
      <section id="servicios" style={{ padding: '100px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={tagStyle}>Servicios</div>
            <h2 style={h2Style}>¿En qué podemos ayudarte?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28 }}>
            {SERVICIOS.map(s => (
              <div key={s.titulo} style={{
                background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: 16, padding: '40px 32px',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 48px rgba(0,0,0,0.09)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ fontSize: 38, marginBottom: 20 }}>{s.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#1e293b', marginBottom: 14, lineHeight: 1.3 }}>{s.titulo}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POR QUÉ N&G ── */}
      <section style={{ padding: '100px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(380px, 100%), 1fr))', gap: isMobile ? 48 : 72, alignItems: 'center' }}>
          <div>
            <div style={tagStyle}>Por qué N&amp;G</div>
            <h2 style={{ ...h2Style, textAlign: 'left', marginBottom: 24 }}>No cerramos vacantes.<br />Construimos equipos.</h2>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.85, marginBottom: 20 }}>
              Nuestros candidatos no solo cubren la vacante — permanecen. El promedio de retención de los perfiles que colocamos supera el año, porque construimos match real entre el talento y la cultura de cada organización.
            </p>
            <p style={{ fontSize: 15, color: '#64748b', lineHeight: 1.85, margin: 0 }}>
              No trabajamos con volumen. Cada búsqueda tiene atención directa de un especialista, desde el primer brief hasta el cierre. Sin intermediarios, sin perfiles genéricos.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {METRICAS.map(m => (
              <div key={m.num} style={{
                background: 'white', border: '1px solid #e2e8f0', borderRadius: 14,
                padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 24,
              }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: '#1e3a5f', minWidth: 84, lineHeight: 1 }}>{m.num}</div>
                <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.55 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EQUIPO / NOSOTROS ── */}
      <section id="nosotros" style={{ padding: '100px 24px', background: 'white' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={tagStyle}>Equipo</div>
            <h2 style={h2Style}>Cada búsqueda tiene nombre y apellido</h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>
              No somos una agencia de volumen. Somos dos especialistas que se involucran personalmente en cada proceso de búsqueda.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 32, maxWidth: 820, margin: '0 auto' }}>
            {EQUIPO.map(p => (
              <div key={p.nombre} style={{
                background: '#f8fafc', border: '1px solid #e2e8f0',
                borderRadius: 16, padding: '44px 36px', textAlign: 'center',
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
                  color: 'white', fontSize: 28, fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 22px',
                }}>
                  {p.inicial}
                </div>
                <div style={{ fontSize: 19, fontWeight: 800, color: '#1e293b', marginBottom: 6 }}>{p.nombre}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 18 }}>{p.rol}</div>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACTO ── */}
      <section id="contacto" style={{ padding: '100px 24px', background: 'linear-gradient(145deg, #0a1929 0%, #1e3a5f 100%)' }}>
        <div style={{ maxWidth: 660, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ ...tagStyle, color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)' }}>Contacto</div>
            <h2 style={{ fontSize: 38, fontWeight: 900, color: 'white', marginBottom: 16, letterSpacing: '-0.5px' }}>
              ¿Listo para encontrar al candidato correcto?
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.75, margin: 0 }}>
              Cuéntenos sobre la posición que busca cubrir y nos ponemos en contacto en menos de 24 horas.
            </p>
          </div>

          {enviado ? (
            <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 16, padding: '56px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 52, marginBottom: 20 }}>✓</div>
              <h3 style={{ color: 'white', fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Mensaje recibido</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, margin: 0, lineHeight: 1.75 }}>
                Gracias por contactarnos. Nuestro equipo revisará su solicitud y se pondrá en contacto en menos de 24 horas.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)',
              borderRadius: 16, padding: '48px 44px', display: 'flex', flexDirection: 'column', gap: 22,
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
                <CampoForm label="Nombre" value={form.nombre} onChange={v => set('nombre', v)} required placeholder="Tu nombre" />
                <CampoForm label="Empresa" value={form.empresa} onChange={v => set('empresa', v)} placeholder="Nombre de la empresa" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
                <CampoForm label="Correo" type="email" value={form.correo} onChange={v => set('correo', v)} required placeholder="correo@empresa.com" />
                <CampoForm label="Teléfono" type="tel" value={form.telefono} onChange={v => set('telefono', v)} placeholder="81 1234 5678" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.07em' }}>
                  Mensaje
                </label>
                <textarea
                  rows={4} value={form.mensaje} onChange={e => set('mensaje', e.target.value)}
                  placeholder="Cuéntenos sobre el perfil que busca cubrir..."
                  style={{ ...inpBase, resize: 'vertical', minHeight: 100 }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.5)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)' }}
                />
              </div>

              <button type="submit" disabled={enviando} style={{
                padding: '15px', borderRadius: 10, border: 'none',
                background: enviando ? 'rgba(255,255,255,0.25)' : 'white',
                color: '#1e3a5f', fontSize: 15, fontWeight: 800,
                cursor: enviando ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s, transform 0.15s',
                marginTop: 4,
              }}
              onMouseEnter={e => { if (!enviando) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
              >
                {enviando ? 'Enviando...' : 'Enviar solicitud'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>O contáctanos directamente: </span>
                <a href="https://wa.me/528122005520" target="_blank" rel="noreferrer"
                  style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', fontWeight: 600, textDecoration: 'none' }}>
                  WhatsApp 81 2200 5520
                </a>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#07111f', padding: '36px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontWeight: 900, fontSize: 15, color: 'rgba(255,255,255,0.45)' }}>N&amp;G Talent Consulting</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
            Monterrey, NL ·{' '}
            <a href="mailto:reclutamiento@ngtalentconsulting.com.mx" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>
              reclutamiento@ngtalentconsulting.com.mx
            </a>
          </div>
          <a href="/careers" style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', fontWeight: 600 }}>
            Ver vacantes →
          </a>
        </div>
      </footer>

      {mostrarSubir && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 300,
            width: 46, height: 46, borderRadius: '50%',
            background: '#1e3a5f', color: 'white',
            border: 'none', cursor: 'pointer', fontSize: 20,
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.15s, transform 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'translateY(-2px)' }}
          onMouseLeave={e => { e.currentTarget.style.background = '#1e3a5f'; e.currentTarget.style.transform = 'none' }}
          aria-label="Volver arriba"
          title="Volver arriba"
        >
          ↑
        </button>
      )}
    </>
  )
}

const tagStyle = {
  display: 'inline-block', fontSize: 11, fontWeight: 700, color: '#2563eb',
  textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 14,
  background: '#eff6ff', border: '1px solid #bfdbfe',
  borderRadius: 20, padding: '4px 14px',
}

const h2Style = {
  fontSize: 38, fontWeight: 900, color: '#1e293b',
  margin: '0 0 16px', letterSpacing: '-0.5px', textAlign: 'center',
}
