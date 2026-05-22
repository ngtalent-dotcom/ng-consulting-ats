import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CareersLayout from './CareersLayout'
import { getVacanteById } from '../../services/vacantesService'
import { createCandidato, uploadCV } from '../../services/candidatosService'

const fuentes = ['LinkedIn', 'Indeed', 'OCC Mundial', 'Referido', 'Bolsa de trabajo universitaria', 'Otro']

export default function CareersApply() {
  const { vacanteId } = useParams()
  const navigate = useNavigate()

  const [vacante, setVacante] = useState(null)
  const [cliente, setCliente] = useState(null)
  const [cargando, setCargando] = useState(true)

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', teléfono: '',
    ciudad: '', fuente: '', linkedin: '', mensaje: '',
    cvFile: null,
    aceptaTerminos: false,
  })
  const [errors, setErrors] = useState({})
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorServidor, setErrorServidor] = useState(null)

  useEffect(() => {
    async function cargarVacante() {
      try {
        const data = await getVacanteById(Number(vacanteId))
        setVacante(data)
        setCliente(data?.clientes || null)
      } catch (err) {
        console.error('Error cargando vacante:', err)
      } finally {
        setCargando(false)
      }
    }
    cargarVacante()
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
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p>Vacante no encontrada.</p>
          <button onClick={() => navigate('/careers')} style={{ marginTop: 16, background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer' }}>
            Ver vacantes
          </button>
        </div>
      </CareersLayout>
    )
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.apellido.trim()) e.apellido = 'Requerido'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido'
    if (!form.teléfono.trim()) e.teléfono = 'Requerido'
    if (!form.fuente) e.fuente = 'Requerido'
    if (!form.cvFile) e.cvFile = 'Por favor adjunta tu CV'
    if (!form.aceptaTerminos) e.aceptaTerminos = 'Debes aceptar para continuar'
    return e
  }

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm(prev => ({ ...prev, cvFile: file }))
      if (errors.cvFile) setErrors(prev => ({ ...prev, cvFile: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }

    setEnviando(true)
    setErrorServidor(null)

    try {
      // 1. Subir CV a Supabase Storage
      let cvUrl = null
      if (form.cvFile) {
        cvUrl = await uploadCV(form.cvFile, form.email)
      }

      // 2. Guardar candidato en la base de datos
      await createCandidato({
        vacante_id: vacante.id,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim().toLowerCase(),
        teléfono: form.teléfono.trim(),
        ciudad: form.ciudad.trim() || null,
        fuente: form.fuente,
        linkedin: form.linkedin.trim() || null,
        mensaje: form.mensaje.trim() || null,
        cv_url: cvUrl,
        etapa: 'Aplicó',
      })

      setEnviado(true)
    } catch (err) {
      console.error('Error al enviar aplicación:', err)
      setErrorServidor('Ocurrió un error al enviar tu aplicación. Por favor inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  // Pantalla de confirmacion
  if (enviado) {
    return (
      <CareersLayout>
        <div style={{ maxWidth: 520, margin: '60px auto', textAlign: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: '#d1fae5', color: '#059669',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 24px',
          }}>
            &#10003;
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', marginBottom: 12 }}>
            ¡Aplicación enviada!
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', marginBottom: 8, lineHeight: 1.6 }}>
            Gracias <strong>{form.nombre}</strong>, recibimos tu aplicación para la vacante de{' '}
            <strong>{vacante.titulo}</strong>.
          </p>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32 }}>
            Nuestro equipo revisará tu perfil y se pondrá en contacto contigo a la brevedad al correo{' '}
            <strong>{form.email}</strong>.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/careers')}
              style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '11px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
            >
              Ver más vacantes
            </button>
          </div>
        </div>
      </CareersLayout>
    )
  }

  return (
    <CareersLayout>
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/careers/' + vacante.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 13, padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: 4 }}
      >
        &larr; Volver a la vacante
      </button>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 8,
              background: '#dbeafe', color: '#1e40af',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 16,
            }}>
              {cliente?.nombre?.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{cliente?.nombre}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>{vacante.titulo}</div>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>
            {vacante.ciudad} &middot; {vacante.modalidad}
          </div>
        </div>

        {/* Error servidor */}
        {errorServidor && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5',
            borderRadius: 8, padding: '12px 16px', marginBottom: 20,
            color: '#dc2626', fontSize: 14,
          }}>
            {errorServidor}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Nombre y apellido */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Nombre *" error={errors.nombre}>
              <input
                type="text" placeholder="Ej. Carlos"
                value={form.nombre}
                onChange={e => handleChange('nombre', e.target.value)}
                style={inputStyle(errors.nombre)}
              />
            </Field>
            <Field label="Apellido(s) *" error={errors.apellido}>
              <input
                type="text" placeholder="Ej. Mendoza García"
                value={form.apellido}
                onChange={e => handleChange('apellido', e.target.value)}
                style={inputStyle(errors.apellido)}
              />
            </Field>
          </div>

          {/* Email y teléfono */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Correo electrónico *" error={errors.email}>
              <input
                type="email" placeholder="tu@correo.com"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                style={inputStyle(errors.email)}
              />
            </Field>
            <Field label="Teléfono *" error={errors.telefono}>
              <input
                type="tel" placeholder="81 1234 5678"
                value={form.teléfono}
                onChange={e => handleChange('teléfono', e.target.value)}
                style={inputStyle(errors.telefono)}
              />
            </Field>
          </div>

          {/* Ciudad y fuente */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Field label="Ciudad de residencia">
              <input
                type="text" placeholder="Ej. Monterrey, NL"
                value={form.ciudad}
                onChange={e => handleChange('ciudad', e.target.value)}
                style={inputStyle()}
              />
            </Field>
            <Field label="¿Cómo te enteraste de esta vacante? *" error={errors.fuente}>
              <select
                value={form.fuente}
                onChange={e => handleChange('fuente', e.target.value)}
                style={{ ...inputStyle(errors.fuente), color: form.fuente ? '#1e293b' : '#94a3b8' }}
              >
                <option value="">Selecciona una opción</option>
                {fuentes.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
          </div>

          {/* CV Upload */}
          <Field label="CV / Hoja de vida *" error={errors.cvFile}>
            <label style={{
              display: 'flex', alignItems: 'center', gap: 12,
              border: '1.5px dashed ' + (errors.cvFile ? '#fca5a5' : '#cbd5e1'),
              borderRadius: 8, padding: '14px 16px',
              background: errors.cvFile ? '#fff5f5' : form.cvFile ? '#f0fdf4' : 'white',
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: 22 }}>&#128206;</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: form.cvFile ? '#065f46' : '#475569' }}>
                  {form.cvFile ? form.cvFile.name : 'Seleccionar archivo'}
                </div>
                <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>
                  {form.cvFile ? ((form.cvFile.size / 1024).toFixed(0) + ' KB') : 'PDF o Word, Max. 5 MB'}
                </div>
              </div>
              {form.cvFile && (
                <span style={{ color: '#10b981', fontSize: 18 }}>&#10003;</span>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </Field>

          {/* LinkedIn */}
          <Field label="Perfil de LinkedIn (opcional)">
            <input
              type="url" placeholder="https://linkedin.com/in/tu-perfil"
              value={form.linkedin}
              onChange={e => handleChange('linkedin', e.target.value)}
              style={inputStyle()}
            />
          </Field>

          {/* Mensaje */}
          <Field label="¿Por qué te interesa esta posición? (opcional)">
            <textarea
              placeholder="Cuéntanos brevemente por qué eres un buen candidato para este puesto..."
              value={form.mensaje}
              onChange={e => handleChange('mensaje', e.target.value)}
              rows={4}
              style={{ ...inputStyle(), resize: 'vertical', lineHeight: 1.6 }}
            />
          </Field>

          {/* Terminos */}
          <div>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.aceptaTerminos}
                onChange={e => handleChange('aceptaTerminos', e.target.checked)}
                style={{ marginTop: 3, flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                Acepto que N&amp;G Talent Consulting almacene y procese mis datos personales con el único fin de gestionar mi candidatura para este proceso de selección. *
              </span>
            </label>
            {errors.aceptaTerminos && (
              <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4, marginLeft: 24 }}>
                {errors.aceptaTerminos}
              </div>
            )}
          </div>

          {/* Boton */}
          <button
            type="submit"
            disabled={enviando}
            style={{
              background: enviando ? '#93c5fd' : '#2563eb',
              color: 'white', border: 'none', borderRadius: 9,
              padding: '14px 0', fontSize: 15, fontWeight: 700,
              cursor: enviando ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {enviando ? 'Enviando aplicación...' : 'Enviar aplicación →'}
          </button>

          <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
            Tu información es confidencial y solo será usada para este proceso de selección.
          </p>
        </form>
      </div>
    </CareersLayout>
  )
}

function Field({ label, error, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: 12, color: '#dc2626' }}>{error}</span>}
    </div>
  )
}

function inputStyle(error) {
  return {
    width: '100%',
    padding: '10px 13px',
    borderRadius: 8,
    border: '1.5px solid ' + (error ? '#fca5a5' : '#e2e8f0'),
    fontSize: 14,
    color: '#1e293b',
    background: error ? '#fff5f5' : 'white',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  }
}
