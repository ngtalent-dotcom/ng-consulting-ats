import { useState } from 'react'
import { createCandidato, uploadCV } from '../services/candidatosService'
import { registrarActividad } from '../services/actividadService'
import Modal from './ui/Modal'

const fuentes = ['LinkedIn', 'Referido', 'Portal de empleo', 'Bolsa de trabajo', 'Redes sociales', 'Directo', 'Otro']

const vacioForm = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  ciudad: '',
  fuente: '',
  linkedin: '',
  notas: '',
  cv: null,
}

export default function NuevoCandidatoModal({ vacanteId, onClose, onCreado }) {
  const [form, setForm] = useState(vacioForm)
  const [errors, setErrors] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [errorServidor, setErrorServidor] = useState(null)

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.apellido.trim()) e.apellido = 'Requerido'
    if (!form.email.trim()) e.email = 'Requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }

    setGuardando(true)
    setErrorServidor(null)
    try {
      let cvUrl = null
      if (form.cv) {
        cvUrl = await uploadCV(form.cv, form.email.trim())
      }

      const nuevo = await createCandidato({
        vacante_id: vacanteId,
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim() || null,
        ciudad: form.ciudad.trim() || null,
        fuente: form.fuente || null,
        linkedin: form.linkedin.trim() || null,
        notas: form.notas.trim() || null,
        cv_url: cvUrl,
        etapa: 'Aplicó',
      })
      await registrarActividad(nuevo.id, 'creacion', 'Candidato agregado al pipeline', { fuente: form.fuente || null })
      if (cvUrl) await registrarActividad(nuevo.id, 'cv', 'CV subido')
      if (onCreado) onCreado(nuevo)
      onClose()
    } catch (err) {
      console.error('Error al crear candidato:', err)
      setErrorServidor('Ocurrió un error al guardar. Inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal abierto titulo="Agregar candidato" onCerrar={onClose} ancho={520}>
      {errorServidor && (
        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>
          {errorServidor}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Nombre *" error={errors.nombre}>
            <input type="text" placeholder="Juan" value={form.nombre}
              onChange={e => set('nombre', e.target.value)} style={inp(errors.nombre)} autoFocus />
          </Field>
          <Field label="Apellido *" error={errors.apellido}>
            <input type="text" placeholder="García" value={form.apellido}
              onChange={e => set('apellido', e.target.value)} style={inp(errors.apellido)} />
          </Field>
        </div>

        <Field label="Correo electrónico *" error={errors.email}>
          <input type="email" placeholder="juan@correo.com" value={form.email}
            onChange={e => set('email', e.target.value)} style={inp(errors.email)} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Teléfono">
            <input type="tel" placeholder="81 1234 5678" value={form.telefono}
              onChange={e => set('telefono', e.target.value)} style={inp()} />
          </Field>
          <Field label="Ciudad">
            <input type="text" placeholder="Monterrey, NL" value={form.ciudad}
              onChange={e => set('ciudad', e.target.value)} style={inp()} />
          </Field>
        </div>

        <Field label="Fuente">
          <select value={form.fuente} onChange={e => set('fuente', e.target.value)}
            style={inp(null, !form.fuente)}>
            <option value="">Selecciona una opción</option>
            {fuentes.map(f => <option key={f}>{f}</option>)}
          </select>
        </Field>

        <Field label="LinkedIn">
          <input type="url" placeholder="https://linkedin.com/in/..." value={form.linkedin}
            onChange={e => set('linkedin', e.target.value)} style={inp()} />
        </Field>

        <Field label="Notas">
          <textarea rows={3} placeholder="Observaciones iniciales..." value={form.notas}
            onChange={e => set('notas', e.target.value)}
            style={{ ...inp(), resize: 'vertical', minHeight: 72 }} />
        </Field>

        <Field label="CV (opcional)">
          <input type="file" accept=".pdf,.doc,.docx"
            onChange={e => set('cv', e.target.files[0] || null)}
            style={{ fontSize: 13, color: '#334155' }} />
        </Field>

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn btn-primary"
            style={{ flex: 2, background: guardando ? '#93c5fd' : undefined, cursor: guardando ? 'not-allowed' : 'pointer' }}>
            {guardando ? 'Guardando...' : 'Agregar candidato'}
          </button>
        </div>
      </form>
    </Modal>
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

function inp(error, isEmpty) {
  return {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1.5px solid ' + (error ? '#fca5a5' : '#e2e8f0'),
    fontSize: 14, color: isEmpty ? '#94a3b8' : '#1e293b',
    background: error ? '#fff5f5' : 'white',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  }
}
