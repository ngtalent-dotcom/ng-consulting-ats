import { useState } from 'react'
import { toast } from 'sonner'
import { createCliente } from '../services/clientesService'
import Modal from './ui/Modal'

const industrias = ['Manufactura', 'Tecnología', 'Retail', 'Servicios', 'Construcción', 'Salud', 'Educación', 'Logística', 'Financiero', 'Alimentación', 'Otro']

const vacioForm = { nombre: '', industria: '', contacto: '', email: '', telefono: '' }

export default function NuevoClienteModal({ onClose, onCreado }) {
  const [form, setForm] = useState(vacioForm)
  const [errors, setErrors] = useState({})
  const [guardando, setGuardando] = useState(false)

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }

    setGuardando(true)
    try {
      const nuevo = await createCliente({
        nombre: form.nombre.trim(),
        industria: form.industria || null,
        contacto: form.contacto.trim() || null,
        email: form.email.trim() || null,
        telefono: form.telefono.trim() || null,
      })
      if (onCreado) onCreado(nuevo)
      toast.success('Cliente creado')
      onClose()
    } catch (err) {
      console.error('Error al crear cliente:', err)
      toast.error('Ocurrió un error al guardar. Inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal abierto titulo="Nuevo cliente" onCerrar={onClose} ancho={480}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Nombre de la empresa *" error={errors.nombre}>
          <input type="text" placeholder="Ej. Ternium México" value={form.nombre}
            onChange={e => set('nombre', e.target.value)} style={inp(errors.nombre)} autoFocus />
        </Field>

        <Field label="Industria">
          <select value={form.industria} onChange={e => set('industria', e.target.value)}
            style={inp(null, !form.industria)}>
            <option value="">Seleccionar</option>
            {industrias.map(i => <option key={i}>{i}</option>)}
          </select>
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Nombre del contacto">
            <input type="text" placeholder="Ej. Ana Torres" value={form.contacto}
              onChange={e => set('contacto', e.target.value)} style={inp()} />
          </Field>
          <Field label="Teléfono">
            <input type="tel" placeholder="81 1234 5678" value={form.telefono}
              onChange={e => set('telefono', e.target.value)} style={inp()} />
          </Field>
        </div>

        <Field label="Correo del contacto">
          <input type="email" placeholder="contacto@empresa.com" value={form.email}
            onChange={e => set('email', e.target.value)} style={inp()} />
        </Field>

        <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
          <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn btn-primary"
            style={{ flex: 2, background: guardando ? '#93c5fd' : undefined, cursor: guardando ? 'not-allowed' : 'pointer' }}>
            {guardando ? 'Guardando...' : 'Crear cliente'}
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
