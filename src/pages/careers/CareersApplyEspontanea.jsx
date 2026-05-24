import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CareersLayout from './CareersLayout'
import { createCandidatoPublico, uploadCV } from '../../services/candidatosService'

const fuentes = ['LinkedIn', 'Indeed', 'OCC Mundial', 'Referido', 'Bolsa de trabajo universitaria', 'Otro']
const areasInteres = ['Ventas', 'Operaciones', 'Marketing', 'Finanzas', 'RRHH', 'Administración', 'Logística', 'Tecnología', 'Otro']

export default function CareersApplyEspontanea() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '',
    ciudad: '', fuente: '', linkedin: '', mensaje: '',
    areaInteres: '',
    cvFile: null,
    aceptaTerminos: false,
  })
  const [errors, setErrors] = useState({})
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorServidor, setErrorServidor] = useState(null)

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.apellido.trim()) e.apellido = 'Requerido'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido'
    if (!form.telefono.trim()) e.telefono = 'Requerido'
    if (!form.areaInteres) e.areaInteres = 'Requerido'
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
      let cvUrl = null
      if (form.cvFile) {
        cvUrl = await uploadCV(form.cvFile, form.email)
      }

      await createCandidatoPublico({
        vacante_id: null,
        area_interes: form.areaInteres,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim().toLowerCase(),
        telefono: form.telefono.trim(),
        ciudad: form.ciudad.trim() || null,
        fuente: form.fuente,
        linkedin: form.linkedin.trim() || null,
        mensaje: form.mensaje.trim() || null,
        cv_url: cvUrl,
        etapa: 'Aplicó',
      })

      fetch('/api/enviar-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidato: {
            nombre: form.nombre.trim(),
            apellido: form.apellido.trim(),
            email: form.email.trim().toLowerCase(),
            telefono: form.telefono.trim(),
            ciudad: form.ciudad.trim() || null,
            fuente: form.fuente,
            linkedin: form.linkedin.trim() || null,
            mensaje: form.mensaje.trim() || null,
            cv_url: cvUrl,
          },
          vacante: { titulo: 'Banco de Talento', cliente: 'Aplicación espontánea' },
        }),
      }).catch(err => console.error('Error enviando emails:', err))

      setEnviado(true)
    } catch (err) {
      console.error('Error al enviar aplicación espontánea:', err)
      setErrorServidor('Ocurrió un error al enviar tu información. Por favor inténtalo de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

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
            ¡CV recibido!
          </h1>
          <p style={{ fontSize: 15, color: '#64748b', marginBottom: 8, lineHeight: 1.6 }}>
            Gracias <strong>{form.nombre}</strong>, hemos guardado tu perfil en nuestro banco de talento.
          </p>
          <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 32 }}>
            Cuando surja una oportunidad para tu perfil en <strong>{form.areaInteres}</strong>, nos pondremos en contacto contigo al correo <strong>{form.email}</strong>.
          </p>
          <button
            onClick={() => navigate('/careers')}
            style={{ background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '11px 22px', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
          >
            Ver vacantes disponibles
          </button>
        </div>
      </CareersLayout>
    )
  }

  return (
    <CareersLayout>
      <button
        onClick={() => navigate('/careers')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 13, padding: '0 0 20px', display: 'flex', alignItems: 'center', gap: 4 }}
      >
        &larr; Ver vacantes disponibles
      </button>

      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: '#1e3a5f', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 18,
            }}>
              N
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#64748b' }}>N&amp;G Talent Consulting</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Banco de Talento</div>
            </div>
          </div>
          <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
            No encontraste la vacante ideal pero te interesa trabajar con nosotros. Déjanos tu perfil y te avisamos cuando surja una oportunidad para ti.
          </p>
        </div>

        {errorServidor && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5',
            borderRadius: 8, padding: '12px 16px', marginBottom: 20,
            color: '#dc2626', fontSize: 14,
          }}>
            {errorServidor}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div className="form-grid-2">
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

          <div className="form-grid-2">
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
                value={form.telefono}
                onChange={e => handleChange('telefono', e.target.value)}
                style={inputStyle(errors.telefono)}
              />
            </Field>
          </div>

          <div className="form-grid-2">
            <Field label="Área de interés *" error={errors.areaInteres}>
              <select
                value={form.areaInteres}
                onChange={e => handleChange('areaInteres', e.target.value)}
                style={{ ...inputStyle(errors.areaInteres), color: form.areaInteres ? '#1e293b' : '#94a3b8' }}
              >
                <option value="">Selecciona una opción</option>
                {areasInteres.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </Field>
            <Field label="Ciudad de residencia">
              <input
                type="text" placeholder="Ej. Monterrey, NL"
                value={form.ciudad}
                onChange={e => handleChange('ciudad', e.target.value)}
                style={inputStyle()}
              />
            </Field>
          </div>

          <Field label="¿Cómo te enteraste de N&G Talent? *" error={errors.fuente}>
            <select
              value={form.fuente}
              onChange={e => handleChange('fuente', e.target.value)}
              style={{ ...inputStyle(errors.fuente), color: form.fuente ? '#1e293b' : '#94a3b8' }}
            >
              <option value="">Selecciona una opción</option>
              {fuentes.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </Field>

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
              {form.cvFile && <span style={{ color: '#10b981', fontSize: 18 }}>&#10003;</span>}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </label>
          </Field>

          <Field label="Perfil de LinkedIn (opcional)">
            <input
              type="url" placeholder="https://linkedin.com/in/tu-perfil"
              value={form.linkedin}
              onChange={e => handleChange('linkedin', e.target.value)}
              style={inputStyle()}
            />
          </Field>

          <Field label="¿Qué tipo de oportunidad buscas? (opcional)">
            <textarea
              placeholder="Cuéntanos brevemente qué tipo de rol o empresa estás buscando..."
              value={form.mensaje}
              onChange={e => handleChange('mensaje', e.target.value)}
              rows={3}
              style={{ ...inputStyle(), resize: 'vertical', lineHeight: 1.6 }}
            />
          </Field>

          <div>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={form.aceptaTerminos}
                onChange={e => handleChange('aceptaTerminos', e.target.checked)}
                style={{ marginTop: 3, flexShrink: 0 }}
              />
              <span style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
                Acepto que N&amp;G Talent Consulting almacene y procese mis datos personales con el único fin de considerarme para oportunidades de empleo. *
              </span>
            </label>
            {errors.aceptaTerminos && (
              <div style={{ color: '#dc2626', fontSize: 12, marginTop: 4, marginLeft: 24 }}>
                {errors.aceptaTerminos}
              </div>
            )}
          </div>

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
            {enviando ? 'Enviando...' : 'Enviar mi CV →'}
          </button>

          <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center' }}>
            Tu información es confidencial y solo será usada para contactarte sobre oportunidades relevantes.
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
