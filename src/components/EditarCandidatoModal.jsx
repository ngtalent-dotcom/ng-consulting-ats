import { useState } from 'react'
import { toast } from 'sonner'
import { updateCandidato } from '../services/candidatosService'
import Modal from './ui/Modal'

const fuentes = ['LinkedIn', 'Referido', 'Portal de empleo', 'Bolsa de trabajo', 'Redes sociales', 'Directo', 'Otro']
const decisiones = ['Pendiente', 'Fuerte', 'Viable con reservas', 'No Apto']

export default function EditarCandidatoModal({ candidato, onClose, onActualizado }) {
  const [form, setForm] = useState({
    nombre: candidato.nombre || '',
    apellido: candidato.apellido || '',
    email: candidato.email || '',
    telefono: candidato.telefono || '',
    ciudad: candidato.ciudad || '',
    fuente: candidato.fuente || '',
    linkedin: candidato.linkedin || '',
    notas: candidato.notas || '',
    decision: candidato.decision || 'Pendiente',
    banderas_rojas: (candidato.banderas_rojas || []).join('\n'),
  })
  const [errors, setErrors] = useState({})
  const [guardando, setGuardando] = useState(false)

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.apellido.trim()) e.apellido = 'Requerido'
    if (!form.email.trim()) e.email = 'Requerido'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }

    setGuardando(true)
    try {
      const banderasArr = form.banderas_rojas
        .split('\n')
        .map(b => b.trim())
        .filter(Boolean)

      const actualizado = await updateCandidato(candidato.id, {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        telefono: form.telefono.trim() || null,
        ciudad: form.ciudad.trim() || null,
        fuente: form.fuente || null,
        linkedin: form.linkedin.trim() || null,
        notas: form.notas.trim() || null,
        decision: form.decision,
        banderas_rojas: banderasArr.length > 0 ? banderasArr : null,
      })
      if (onActualizado) onActualizado(actualizado)
      toast.success('Cambios guardados')
      onClose()
    } catch (err) {
      console.error('Error al actualizar candidato:', err)
      toast.error('Ocurrió un error al guardar. Inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal abierto titulo={'Editar candidato · ' + candidato.nombre} onCerrar={onClose} ancho={520}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Nombre *" error={errors.nombre}>
            <input type="text" value={form.nombre}
              onChange={e => set('nombre', e.target.value)} style={inp(errors.nombre)} autoFocus />
          </Field>
          <Field label="Apellido *" error={errors.apellido}>
            <input type="text" value={form.apellido}
              onChange={e => set('apellido', e.target.value)} style={inp(errors.apellido)} />
          </Field>
        </div>

        <Field label="Correo electrónico *" error={errors.email}>
          <input type="email" value={form.email}
            onChange={e => set('email', e.target.value)} style={inp(errors.email)} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Teléfono">
            <input type="tel" value={form.telefono}
              onChange={e => set('telefono', e.target.value)} style={inp()} />
          </Field>
          <Field label="Ciudad">
            <input type="text" value={form.ciudad}
              onChange={e => set('ciudad', e.target.value)} style={inp()} />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Fuente">
            <select value={form.fuente} onChange={e => set('fuente', e.target.value)}
              style={inp(null, !form.fuente)}>
              <option value="">Selecciona una opción</option>
              {fuentes.map(f => <option key={f}>{f}</option>)}
            </select>
          </Field>
          <Field label="Decisión">
            <select value={form.decision} onChange={e => set('decision', e.target.value)}
              style={inp()}>
              {decisiones.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>
        </div>

        <Field label="LinkedIn">
          <input type="url" placeholder="https://linkedin.com/in/..." value={form.linkedin}
            onChange={e => set('linkedin', e.target.value)} style={inp()} />
        </Field>

        <Field label="Notas">
          <textarea rows={3} value={form.notas}
            onChange={e => set('notas', e.target.value)}
            style={{ ...inp(), resize: 'vertical', minHeight: 72 }} />
        </Field>

        <Field label="Banderas rojas (una por línea)">
          <textarea rows={3} placeholder="Ej. Salario fuera de rango&#10;Requiere reubicación" value={form.banderas_rojas}
            onChange={e => set('banderas_rojas', e.target.value)}
            style={{ ...inp(), resize: 'vertical', minHeight: 72 }} />
        </Field>

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn btn-primary"
            style={{ flex: 2, background: guardando ? '#93c5fd' : undefined, cursor: guardando ? 'not-allowed' : 'pointer' }}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
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
