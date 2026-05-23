import { useState } from 'react'
import { createVacante } from '../services/vacantesService'
import CompetenciasEditor from './prescreen/CompetenciasEditor'

const areas = ['Ventas', 'Operaciones', 'Finanzas', 'Recursos Humanos', 'Ingeniería', 'Marketing', 'Tecnología', 'Administración', 'Legal', 'Otro']
const niveles = ['Practicante', 'Junior', 'Semi-Senior', 'Senior', 'Coordinador', 'Gerencial', 'Dirección']
const modalidades = ['Presencial', 'Hibrido', 'Remoto']

const vacioForm = {
  titulo: '',
  area: '',
  nivel: '',
  modalidad: '',
  ciudad: 'Monterrey, NL',
  salarioMin: '',
  salarioMax: '',
  descripcion: '',
  requisitos: '',
  publicada: true,
  competencias: [],
}

export default function NuevaVacanteModal({ clienteId, clienteNombre, onClose, onCreated }) {
  const [form, setForm] = useState(vacioForm)
  const [errors, setErrors] = useState({})
  const [guardado, setGuardado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorServidor, setErrorServidor] = useState(null)

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
    setErrorServidor(null)

    try {
      const nuevaVacante = await createVacante({
        cliente_id: clienteId,
        titulo: form.titulo.trim(),
        area: form.area,
        nivel: form.nivel,
        modalidad: form.modalidad,
        ciudad: form.ciudad.trim(),
        salario_min: form.salarioMin ? Number(form.salarioMin) : null,
        salario_max: form.salarioMax ? Number(form.salarioMax) : null,
        descripcion: form.descripcion.trim() || null,
        requisitos: form.requisitos.trim() || null,
        publicada: form.publicada,
        prescreen_template: { competencias: form.competencias },
        estatus: 'Activa',
        prioridad: 'Media',
      })

      setGuardado(true)
      if (onCreated) onCreated(nuevaVacante)
      setTimeout(() => onClose(), 1800)
    } catch (err) {
      console.error('Error al crear vacante:', err)
      setErrorServidor('Ocurrió un error al guardar la vacante. Inténtalo de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  if (guardado) {
    return (
      <Overlay onClick={onClose}>
        <ModalBox onClick={e => e.stopPropagation()} style={{ maxWidth: 420, textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#9989;</div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1e293b', marginBottom: 8 }}>¡Vacante creada!</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>
            <strong>{form.titulo}</strong> fue registrada para {clienteNombre}.
          </p>
          {form.publicada && (
            <p style={{ fontSize: 13, color: '#2563eb', marginTop: 8 }}>
              &#127760; Ya aparece en el portal de candidatos.
            </p>
          )}
        </ModalBox>
      </Overlay>
    )
  }

  return (
    <Overlay onClick={onClose}>
      <ModalBox onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Nueva vacante</div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>{clienteNombre}</div>
          </div>
          <button onClick={onClose} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#64748b' }}>&#x2715;</button>
        </div>

        {/* Error servidor */}
        {errorServidor && (
          <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#dc2626', fontSize: 13 }}>
            {errorServidor}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          {/* Título */}
          <Field label="Título del puesto *" error={errors.titulo}>
            <input
              type="text" placeholder="Ej. Ejecutivo de Ventas"
              value={form.titulo} onChange={e => set('titulo', e.target.value)}
              style={inp(errors.titulo)}
            />
          </Field>

          {/* Area y Nivel */}
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
                  <button
                    key={m} type="button"
                    onClick={() => set('modalidad', m)}
                    style={{
                      flex: 1, padding: '8px 0', borderRadius: 7, border: '1.5px solid',
                      borderColor: form.modalidad === m ? '#2563eb' : '#e2e8f0',
                      background: form.modalidad === m ? '#dbeafe' : 'white',
                      color: form.modalidad === m ? '#1e40af' : '#64748b',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {errors.modalidad && <span style={{ fontSize: 12, color: '#dc2626' }}>{errors.modalidad}</span>}
            </Field>
            <Field label="Ciudad *" error={errors.ciudad}>
              <input
                type="text" placeholder="Ej. Monterrey, NL"
                value={form.ciudad} onChange={e => set('ciudad', e.target.value)}
                style={inp(errors.ciudad)}
              />
            </Field>
          </div>

          {/* Rango salarial - solo interno */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
              Rango salarial
              <span style={{ marginLeft: 8, fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>
                &#128274; Solo visible internamente
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Mínimo (MXN)</div>
                <input
                  type="number" placeholder="25000"
                  value={form.salarioMin} onChange={e => set('salarioMin', e.target.value)}
                  style={inp()}
                />
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Máximo (MXN)</div>
                <input
                  type="number" placeholder="35000"
                  value={form.salarioMax} onChange={e => set('salarioMax', e.target.value)}
                  style={inp()}
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <Field label="Descripción del puesto">
            <textarea
              placeholder="Describe brevemente el rol, responsabilidades principales y lo que ofrece la empresa..."
              value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
              rows={3} style={{ ...inp(), resize: 'vertical', lineHeight: 1.6 }}
            />
          </Field>

          {/* Requisitos */}
          <Field label="Requisitos del candidato">
            <textarea
              placeholder="Experiencia, estudios, habilidades técnicas, etc."
              value={form.requisitos} onChange={e => set('requisitos', e.target.value)}
              rows={3} style={{ ...inp(), resize: 'vertical', lineHeight: 1.6 }}
            />
          </Field>

          {/* Competencias para pre-screen */}
          <div>
            <CompetenciasEditor
              competencias={form.competencias}
              onChange={val => set('competencias', val)}
            />
            {errors.competencias && (
              <div style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>{errors.competencias}</div>
            )}
          </div>

          {/* Toggle publicar en portal */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '14px 16px', borderRadius: 10,
            background: form.publicada ? '#eff6ff' : '#f8fafc',
            border: '1.5px solid ' + (form.publicada ? '#bfdbfe' : '#e2e8f0'),
          }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
                &#127760; Publicar en portal de candidatos
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {form.publicada
                  ? 'La vacante será visible en el portal público'
                  : 'La vacante solo será visible internamente en el ATS'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => set('publicada', !form.publicada)}
              style={{
                width: 44, height: 24, borderRadius: 12, border: 'none',
                background: form.publicada ? '#2563eb' : '#cbd5e1',
                cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
                flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute', top: 2,
                left: form.publicada ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%',
                background: 'white', transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            </button>
          </div>

          {/* Acciones */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button
              type="button" onClick={onClose}
              style={{ flex: 1, padding: '11px 0', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              style={{ flex: 2, padding: '11px 0', borderRadius: 8, border: 'none', background: guardando ? '#93c5fd' : '#2563eb', color: 'white', fontSize: 14, fontWeight: 700, cursor: guardando ? 'not-allowed' : 'pointer' }}
            >
              {guardando ? 'Guardando...' : 'Crear vacante'}
            </button>
          </div>
        </form>
      </ModalBox>
    </Overlay>
  )
}

function Overlay({ children, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(2px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      {children}
    </div>
  )
}

function ModalBox({ children, onClick, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white', borderRadius: 16,
        padding: 28, width: '100%', maxWidth: 580,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
        ...style,
      }}
    >
      {children}
    </div>
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
