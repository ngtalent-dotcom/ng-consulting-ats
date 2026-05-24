import { useState } from 'react'
import { toast } from 'sonner'
import { updateVacante } from '../services/vacantesService'
import CompetenciasEditor from './prescreen/CompetenciasEditor'
import Modal from './ui/Modal'
import RichTextEditor from './ui/RichTextEditor'

const areas = ['Ventas', 'Operaciones', 'Finanzas', 'Recursos Humanos', 'Ingeniería', 'Marketing', 'Tecnología', 'Administración', 'Legal', 'Otro']
const niveles = ['Practicante', 'Junior', 'Semi-Senior', 'Senior', 'Coordinador', 'Gerencial', 'Dirección']
const modalidades = ['Presencial', 'Hibrido', 'Remoto']
const estatuses = ['Activa', 'Pausada', 'Cerrada', 'Cubierta']

function formDesdeVacante(v) {
  return {
    titulo: v.titulo || '',
    area: v.area || '',
    nivel: v.nivel || '',
    modalidad: v.modalidad || '',
    ciudad: v.ciudad || '',
    salarioMin: v.salario_min != null ? String(v.salario_min) : '',
    salarioMax: v.salario_max != null ? String(v.salario_max) : '',
    hiringManager: v.hiring_manager || '',
    hiringManagerEmail: v.hiring_manager_email || '',
    hiringManagerTelefono: v.hiring_manager_telefono || '',
    descripcion: v.descripcion || '',
    requisitos: v.requisitos || '',
    estatus: v.estatus || 'Activa',
    publicada: v.publicada ?? true,
    competencias: v.prescreen_template?.competencias || [],
  }
}

export default function EditarVacanteModal({ vacante, onClose, onActualizada }) {
  const [form, setForm] = useState(() => formDesdeVacante(vacante))
  const [errors, setErrors] = useState({})
  const [guardando, setGuardando] = useState(false)

  const set = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  const validate = () => {
    const e = {}
    if (!form.titulo.trim()) e.titulo = 'Requerido'
    if (!form.area) e.area = 'Requerido'
    if (!form.nivel) e.nivel = 'Requerido'
    if (!form.modalidad) e.modalidad = 'Requerido'
    if (!form.ciudad.trim()) e.ciudad = 'Requerido'
    if (form.competencias.length > 0 && form.competencias.length < 2) e.competencias = 'Agrega al menos 2 competencias o deja el campo vacío.'
    if (form.competencias.length > 8) e.competencias = 'Máximo 8 competencias.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length > 0) { setErrors(e2); return }

    setGuardando(true)
    try {
      const actualizada = await updateVacante(vacante.id, {
        titulo: form.titulo.trim(),
        area: form.area,
        nivel: form.nivel,
        modalidad: form.modalidad,
        ciudad: form.ciudad.trim(),
        salario_min: form.salarioMin ? Number(form.salarioMin) : null,
        salario_max: form.salarioMax ? Number(form.salarioMax) : null,
        hiring_manager: form.hiringManager.trim() || null,
        hiring_manager_email: form.hiringManagerEmail.trim() || null,
        hiring_manager_telefono: form.hiringManagerTelefono.trim() || null,
        descripcion: form.descripcion.trim() || null,
        requisitos: form.requisitos.trim() || null,
        estatus: form.estatus,
        publicada: form.publicada,
        prescreen_template: { competencias: form.competencias },
      })
      if (onActualizada) onActualizada(actualizada)
      toast.success('Vacante actualizada')
      onClose()
    } catch (err) {
      console.error('Error al actualizar vacante:', err)
      toast.error('Ocurrió un error al guardar. Inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Modal abierto titulo={'Editar vacante · ' + vacante.titulo} onCerrar={onClose} ancho={600}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Título */}
        <Field label="Título del puesto *" error={errors.titulo}>
          <input type="text" value={form.titulo} onChange={e => set('titulo', e.target.value)} style={inp(errors.titulo)} />
        </Field>

        {/* Área y Nivel */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Área *" error={errors.area}>
            <select value={form.area} onChange={e => set('area', e.target.value)} style={inp(errors.area, !form.area)}>
              <option value="">Seleccionar</option>
              {areas.map(a => <option key={a}>{a}</option>)}
            </select>
          </Field>
          <Field label="Nivel *" error={errors.nivel}>
            <select value={form.nivel} onChange={e => set('nivel', e.target.value)} style={inp(errors.nivel, !form.nivel)}>
              <option value="">Seleccionar</option>
              {niveles.map(n => <option key={n}>{n}</option>)}
            </select>
          </Field>
        </div>

        {/* Modalidad y Ciudad */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Modalidad *" error={errors.modalidad}>
            <div style={{ display: 'flex', gap: 8 }}>
              {modalidades.map(m => (
                <button key={m} type="button" onClick={() => set('modalidad', m)} style={{
                  flex: 1, padding: '8px 0', borderRadius: 7, border: '1.5px solid',
                  borderColor: form.modalidad === m ? '#2563eb' : '#e2e8f0',
                  background: form.modalidad === m ? '#dbeafe' : 'white',
                  color: form.modalidad === m ? '#1e40af' : '#64748b',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>
                  {m}
                </button>
              ))}
            </div>
            {errors.modalidad && <span style={{ fontSize: 12, color: '#dc2626' }}>{errors.modalidad}</span>}
          </Field>
          <Field label="Ciudad *" error={errors.ciudad}>
            <input type="text" value={form.ciudad} onChange={e => set('ciudad', e.target.value)} style={inp(errors.ciudad)} />
          </Field>
        </div>

        {/* Estatus y Publicada */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Field label="Estatus">
            <select value={form.estatus} onChange={e => set('estatus', e.target.value)} style={inp()}>
              {estatuses.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Visibilidad</label>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
              background: form.publicada ? '#eff6ff' : 'white',
            }}>
              <span style={{ fontSize: 13, color: form.publicada ? '#1e40af' : '#64748b', fontWeight: 500 }}>
                {form.publicada ? '🌐 Publicada en portal' : '🔒 Solo interna'}
              </span>
              <button type="button" onClick={() => set('publicada', !form.publicada)} style={{
                width: 40, height: 22, borderRadius: 11, border: 'none',
                background: form.publicada ? '#2563eb' : '#cbd5e1',
                cursor: 'pointer', position: 'relative', flexShrink: 0,
              }}>
                <span style={{
                  position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%',
                  background: 'white', left: form.publicada ? 20 : 2, transition: 'left 0.2s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>
          </div>
        </div>

        {/* Rango salarial */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
            Rango salarial
            <span style={{ marginLeft: 8, fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>
              🔒 Solo interno
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Mínimo (MXN)</div>
              <input type="number" placeholder="25000" value={form.salarioMin} onChange={e => set('salarioMin', e.target.value)} style={inp()} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Máximo (MXN)</div>
              <input type="number" placeholder="35000" value={form.salarioMax} onChange={e => set('salarioMax', e.target.value)} style={inp()} />
            </div>
          </div>
        </div>

        {/* Hiring Manager */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
            Hiring Manager
            <span style={{ marginLeft: 8, fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>
              &#128274; Solo interno
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="text" placeholder="Nombre del contacto en el cliente"
              value={form.hiringManager} onChange={e => set('hiringManager', e.target.value)}
              style={inp()}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <input
                type="email" placeholder="correo@empresa.com"
                value={form.hiringManagerEmail} onChange={e => set('hiringManagerEmail', e.target.value)}
                style={inp()}
              />
              <input
                type="tel" placeholder="81 1234 5678"
                value={form.hiringManagerTelefono} onChange={e => set('hiringManagerTelefono', e.target.value)}
                style={inp()}
              />
            </div>
          </div>
        </div>

        {/* Descripción */}
        <Field label="Descripción del puesto">
          <RichTextEditor
            value={form.descripcion}
            onChange={val => set('descripcion', val)}
            placeholder="Describe el rol, responsabilidades y lo que ofrece la empresa..."
            rows={4}
          />
        </Field>

        {/* Requisitos */}
        <Field label="Requisitos del candidato">
          <RichTextEditor
            value={form.requisitos}
            onChange={val => set('requisitos', val)}
            placeholder="Experiencia, estudios, habilidades técnicas, etc."
            rows={4}
          />
        </Field>

        {/* Competencias pre-screen */}
        <div>
          <CompetenciasEditor competencias={form.competencias} onChange={val => set('competencias', val)} />
          {errors.competencias && (
            <div style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>{errors.competencias}</div>
          )}
        </div>

        {/* Acciones */}
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
