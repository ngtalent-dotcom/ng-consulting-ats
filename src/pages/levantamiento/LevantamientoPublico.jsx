import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getLevantamientoByToken, completarLevantamiento } from '../../services/levantamientoService'

const inputStyle = {
  width: '100%', padding: '10px 13px', borderRadius: 8, border: '1.5px solid #e2e8f0',
  fontSize: 14, fontFamily: 'inherit', color: '#1e293b', outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const areaStyle = { ...inputStyle, resize: 'vertical', minHeight: 88, lineHeight: 1.6 }

function Campo({ label, required, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.05em' }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const MODALIDADES = ['Presencial', 'Híbrido', 'Remoto']
const RAZONES = ['Puesto de nueva creación', 'Reemplazo por renuncia', 'Reemplazo por terminación', 'Expansión del equipo']

export default function LevantamientoPublico() {
  const { token } = useParams()
  const [lev, setLev] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errores, setErrores] = useState({})

  const [form, setForm] = useState({
    tituloPuesto: '',
    area: '',
    numVacantes: '1',
    modalidad: '',
    horario: '',
    sueldo: '',
    descripcion: '',
    funciones: '',
    experiencia: '',
    escolaridad: '',
    habilidades: '',
    prestaciones: '',
    razon: '',
    proceso: '',
    contactoNombre: '',
    contactoCargo: '',
  })

  useEffect(() => {
    async function cargar() {
      try {
        const data = await getLevantamientoByToken(token)
        if (!data) { setError('Enlace no válido.'); return }
        setLev(data)
        if (data.completado) { setEnviado(true); return }
        setForm(prev => ({
          ...prev,
          tituloPuesto: data.titulo_vacante || '',
        }))
      } catch {
        setError('Enlace no encontrado o expirado.')
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [token])

  const set = (campo) => (e) => setForm(prev => ({ ...prev, [campo]: e.target.value }))

  function validar() {
    const errs = {}
    if (!form.tituloPuesto.trim()) errs.tituloPuesto = 'Requerido'
    if (!form.funciones.trim()) errs.funciones = 'Requerido'
    if (!form.experiencia.trim()) errs.experiencia = 'Requerido'
    if (!form.contactoNombre.trim()) errs.contactoNombre = 'Requerido'
    return errs
  }

  async function handleEnviar(e) {
    e.preventDefault()
    const errs = validar()
    if (Object.keys(errs).length) { setErrores(errs); return }
    setErrores({})
    setEnviando(true)
    try {
      await completarLevantamiento(token, form)
      setEnviado(true)
    } catch (err) {
      setErrores({ general: err.message || 'Error al enviar. Intenta de nuevo.' })
    } finally {
      setEnviando(false)
    }
  }

  if (cargando) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ color: '#94a3b8', fontSize: 15 }}>Cargando...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>🔒</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Enlace no disponible</div>
          <div style={{ fontSize: 14, color: '#64748b' }}>{error}</div>
        </div>
      </div>
    )
  }

  if (enviado) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: 24 }}>
        <div style={{ textAlign: 'center', maxWidth: 440 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#d1fae5', color: '#059669', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontWeight: 800 }}>✓</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>¡Información enviada correctamente!</div>
          <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>
            Gracias por completar el perfil del puesto. Nuestro equipo de reclutamiento revisará la información a la brevedad y se pondrá en contacto contigo.
          </div>
          <div style={{ marginTop: 24, fontSize: 13, color: '#94a3b8' }}>
            N&amp;G Talent Consulting · <a href="https://ngtalentconsulting.com.mx" style={{ color: '#2563eb' }}>ngtalentconsulting.com.mx</a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <div style={{ background: '#1e3a5f', padding: '20px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ color: 'white', fontSize: 17, fontWeight: 800 }}>N&amp;G Talent Consulting</div>
            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Levantamiento de perfil de puesto</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 20px 60px' }}>
        {/* Intro */}
        <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '24px 28px', marginBottom: 24 }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 800, color: '#1e293b' }}>Perfil del puesto a cubrir</h1>
          {lev?.cliente_nombre && (
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>🏢 {lev.cliente_nombre}</div>
          )}
          <p style={{ margin: 0, fontSize: 14, color: '#475569', lineHeight: 1.7 }}>
            Por favor completa la siguiente información sobre el puesto que necesitas cubrir. Esto nos permitirá encontrar al candidato ideal para tu organización.
            Los campos marcados con <span style={{ color: '#ef4444' }}>*</span> son obligatorios.
          </p>
        </div>

        <form onSubmit={handleEnviar}>
          {/* Sección 1: Información general */}
          <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              1. Información general del puesto
            </h2>

            <Campo label="Título del puesto" required>
              <input value={form.tituloPuesto} onChange={set('tituloPuesto')} style={{ ...inputStyle, borderColor: errores.tituloPuesto ? '#fca5a5' : '#e2e8f0' }} placeholder="Ej: Ejecutivo de Ventas B2B" />
              {errores.tituloPuesto && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errores.tituloPuesto}</div>}
            </Campo>

            <Campo label="Área o departamento">
              <input value={form.area} onChange={set('area')} style={inputStyle} placeholder="Ej: Comercial, Operaciones, Marketing..." />
            </Campo>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Campo label="Número de vacantes">
                <input type="number" min="1" value={form.numVacantes} onChange={set('numVacantes')} style={inputStyle} />
              </Campo>
              <Campo label="Modalidad de trabajo">
                <select value={form.modalidad} onChange={set('modalidad')} style={{ ...inputStyle, background: 'white' }}>
                  <option value="">Selecciona...</option>
                  {MODALIDADES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </Campo>
            </div>

            <Campo label="Horario de trabajo">
              <input value={form.horario} onChange={set('horario')} style={inputStyle} placeholder="Ej: Lunes a viernes 9 am – 6 pm" />
            </Campo>

            <Campo label="Sueldo ofrecido">
              <input value={form.sueldo} onChange={set('sueldo')} style={inputStyle} placeholder="Ej: $18,000 – $22,000 mensuales netos + comisiones" />
            </Campo>
          </div>

          {/* Sección 2: Descripción del puesto */}
          <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              2. Descripción del puesto
            </h2>

            <Campo label="Descripción general del puesto">
              <textarea value={form.descripcion} onChange={set('descripcion')} style={areaStyle} placeholder="¿De qué trata este puesto en términos generales?" rows={3} />
            </Campo>

            <Campo label="Funciones y responsabilidades principales" required>
              <textarea
                value={form.funciones}
                onChange={set('funciones')}
                style={{ ...areaStyle, borderColor: errores.funciones ? '#fca5a5' : '#e2e8f0' }}
                placeholder="Lista las principales actividades que realizará la persona en este puesto."
                rows={5}
              />
              {errores.funciones && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errores.funciones}</div>}
            </Campo>
          </div>

          {/* Sección 3: Perfil del candidato */}
          <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              3. Perfil del candidato ideal
            </h2>

            <Campo label="Experiencia requerida" required>
              <textarea
                value={form.experiencia}
                onChange={set('experiencia')}
                style={{ ...areaStyle, borderColor: errores.experiencia ? '#fca5a5' : '#e2e8f0' }}
                placeholder="Ej: Mínimo 2 años en ventas B2B, experiencia en sector industrial..."
                rows={3}
              />
              {errores.experiencia && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errores.experiencia}</div>}
            </Campo>

            <Campo label="Escolaridad mínima">
              <input value={form.escolaridad} onChange={set('escolaridad')} style={inputStyle} placeholder="Ej: Licenciatura en Administración o carrera afín" />
            </Campo>

            <Campo label="Habilidades y herramientas requeridas">
              <textarea value={form.habilidades} onChange={set('habilidades')} style={areaStyle} placeholder="Ej: CRM, Excel avanzado, manejo de equipo, inglés intermedio..." rows={3} />
            </Campo>
          </div>

          {/* Sección 4: Condiciones y proceso */}
          <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '24px 28px', marginBottom: 16 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              4. Condiciones y proceso de selección
            </h2>

            <Campo label="Prestaciones adicionales">
              <textarea value={form.prestaciones} onChange={set('prestaciones')} style={areaStyle} placeholder="Ej: Seguro de gastos médicos, fondo de ahorro, auto de empresa, vales de despensa..." rows={3} />
            </Campo>

            <Campo label="Razón de la vacante">
              <select value={form.razon} onChange={set('razon')} style={{ ...inputStyle, background: 'white' }}>
                <option value="">Selecciona...</option>
                {RAZONES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </Campo>

            <Campo label="Proceso de selección">
              <textarea value={form.proceso} onChange={set('proceso')} style={areaStyle} placeholder="Ej: Entrevista con RRHH, entrevista con gerente, prueba técnica. ¿Quién da el visto bueno final?" rows={3} />
            </Campo>
          </div>

          {/* Sección 5: Datos de contacto */}
          <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: '24px 28px', marginBottom: 24 }}>
            <h2 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '.06em' }}>
              5. Datos de la persona de contacto
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Campo label="Tu nombre" required>
                <input
                  value={form.contactoNombre}
                  onChange={set('contactoNombre')}
                  style={{ ...inputStyle, borderColor: errores.contactoNombre ? '#fca5a5' : '#e2e8f0' }}
                  placeholder="Nombre completo"
                />
                {errores.contactoNombre && <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4 }}>{errores.contactoNombre}</div>}
              </Campo>
              <Campo label="Tu cargo">
                <input value={form.contactoCargo} onChange={set('contactoCargo')} style={inputStyle} placeholder="Ej: Gerente de RRHH" />
              </Campo>
            </div>
          </div>

          {errores.general && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 8, padding: '12px 16px', fontSize: 13, marginBottom: 16 }}>
              {errores.general}
            </div>
          )}

          <button
            type="submit"
            disabled={enviando}
            style={{
              width: '100%', padding: '13px', borderRadius: 9, border: 'none',
              background: enviando ? '#93c5fd' : '#1e3a5f',
              color: 'white', fontSize: 15, fontWeight: 700,
              cursor: enviando ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'background 0.15s',
            }}
          >
            {enviando ? 'Enviando...' : 'Enviar información del perfil →'}
          </button>
        </form>
      </div>
    </div>
  )
}
