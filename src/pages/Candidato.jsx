import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getCandidatoById, updateEtapaCandidato, deleteCandidato } from '../services/candidatosService'
import { getActividadByCandidato, registrarActividad } from '../services/actividadService'
import { generarPDFCandidato } from '../services/pdfService'
import PrescreenModal from '../components/prescreen/PrescreenModal'
import EditarCandidatoModal from '../components/EditarCandidatoModal'
import MoverCopiarCandidatoModal from '../components/MoverCopiarCandidatoModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { nivelLabel } from '../services/prescreenScoring'
import { descargarPrescreenParaClaude } from '../services/exportService'

function plantillasMensaje(nombre, vacanteTitulo, clienteNombre) {
  return [
    {
      label: 'Siguiente etapa',
      asunto: `Avance en tu proceso — ${vacanteTitulo}`,
      cuerpo: `Hola ${nombre},\n\nEsperamos que te encuentres bien. Nos comunicamos para informarte que, tras revisar tu perfil, nos gustaría avanzar contigo a la siguiente etapa del proceso de selección para la posición de ${vacanteTitulo}${clienteNombre ? ` en ${clienteNombre}` : ''}.\n\nEn breve nos pondremos en contacto contigo para coordinar los detalles.\n\nMuchas gracias por tu tiempo e interés en esta oportunidad.\n\nSaludos cordiales,\nEquipo N&G Talent Consulting`,
    },
    {
      label: 'Invitación a entrevista',
      asunto: `Entrevista — ${vacanteTitulo}`,
      cuerpo: `Hola ${nombre},\n\n¡Buenas noticias! Has avanzado al siguiente paso del proceso de selección para la posición de ${vacanteTitulo}${clienteNombre ? ` en ${clienteNombre}` : ''}.\n\nNos gustaría coordinar una entrevista con el equipo. ¿Cuál es tu disponibilidad esta semana o la próxima?\n\nPor favor responde con dos o tres opciones de horario y nos encargamos de agendar todo.\n\nSaludos cordiales,\nEquipo N&G Talent Consulting`,
    },
    {
      label: 'No continuamos',
      asunto: `Actualización de tu proceso — ${vacanteTitulo}`,
      cuerpo: `Hola ${nombre},\n\nAgradecemos sinceramente el tiempo que dedicaste a participar en nuestro proceso de selección para la posición de ${vacanteTitulo}${clienteNombre ? ` en ${clienteNombre}` : ''}.\n\nDespués de evaluar cuidadosamente tu perfil, hemos decidido continuar con otros candidatos cuyo perfil se ajusta mejor a los requerimientos actuales. Esto no resta valor a tu trayectoria ni a tus habilidades.\n\nConservamos tu información y te consideraremos para oportunidades futuras que se alineen con tu perfil.\n\nMucho éxito en tu búsqueda.\n\nSaludos cordiales,\nEquipo N&G Talent Consulting`,
    },
    {
      label: 'Seguimiento / Status',
      asunto: `Actualización de tu proceso — ${vacanteTitulo}`,
      cuerpo: `Hola ${nombre},\n\nEsperamos que estés bien. Te escribimos para mantenerte al tanto del avance en el proceso de selección para la posición de ${vacanteTitulo}.\n\n[Agrega tu actualización aquí]\n\nCualquier duda no dudes en contactarnos.\n\nSaludos cordiales,\nEquipo N&G Talent Consulting`,
    },
    {
      label: 'Oferta de trabajo',
      asunto: `Oferta de trabajo — ${vacanteTitulo}`,
      cuerpo: `Hola ${nombre},\n\nNos da mucho gusto informarte que has sido seleccionado(a) para la posición de ${vacanteTitulo}${clienteNombre ? ` en ${clienteNombre}` : ''}.\n\nEn breve recibirás los detalles formales de la oferta para tu revisión. Por favor confírmanos si tienes disponibilidad para una llamada en los próximos días para hablar de los detalles.\n\n¡Felicidades y bienvenido(a) al equipo!\n\nSaludos cordiales,\nEquipo N&G Talent Consulting`,
    },
  ]
}

const etapaColors = {
  'Aplicó':             '#6366f1',
  'Pre-screen':         '#f59e0b',
  'Entrevista Cliente': '#3b82f6',
  'Oferta':             '#8b5cf6',
  'Cerrado':            '#10b981',
  'Rechazado':          '#ef4444',
}

const decisionColors = {
  'Pendiente':           '#9ca3af',
  'Fuerte':              '#10b981',
  'Viable con reservas': '#f59e0b',
  'No Apto':             '#ef4444',
}

export default function Candidato() {
  const { candidatoId } = useParams()
  const navigate = useNavigate()
  const [candidato, setCandidato] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarPrescreen, setMostrarPrescreen] = useState(false)
  const [mostrarEditar, setMostrarEditar] = useState(false)
  const [confirmEtapa, setConfirmEtapa] = useState(null)
  const [confirmEliminar, setConfirmEliminar] = useState(false)
  const [actividad, setActividad] = useState([])
  const [nuevaNota, setNuevaNota] = useState('')
  const [guardandoNota, setGuardandoNota] = useState(false)
  const [modalMoverCopiar, setModalMoverCopiar] = useState(false)
  const [copiaCreada, setCopiaCreada] = useState(null)
  const [modalMensaje, setModalMensaje] = useState(false)
  const [mensajeAsunto, setMensajeAsunto] = useState('')
  const [mensajeCuerpo, setMensajeCuerpo] = useState('')
  const [enviandoMensaje, setEnviandoMensaje] = useState(false)
  const [mensajeEnviado, setMensajeEnviado] = useState(false)
  const [errorMensaje, setErrorMensaje] = useState('')

  useEffect(() => {
    async function cargar() {
      try {
        const [data, acts] = await Promise.all([
          getCandidatoById(Number(candidatoId)),
          getActividadByCandidato(Number(candidatoId)),
        ])
        setCandidato(data)
        setActividad(acts)
      } catch (err) {
        console.error('Error cargando candidato:', err)
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [candidatoId])

  async function handleEnviarMensaje() {
    setErrorMensaje('')
    if (!mensajeAsunto.trim() || !mensajeCuerpo.trim()) {
      setErrorMensaje('El asunto y el mensaje son requeridos.')
      return
    }
    setEnviandoMensaje(true)
    try {
      const resp = await fetch('/api/enviar-mensaje', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidatoEmail: candidato.email,
          candidatoNombre: candidato.nombre,
          asunto: mensajeAsunto.trim(),
          mensaje: mensajeCuerpo.trim(),
          reclutadorNombre: 'Equipo N&G Talent Consulting',
        }),
      })
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}))
        throw new Error(data.error || 'Error al enviar')
      }
      setMensajeEnviado(true)
      setTimeout(() => {
        setModalMensaje(false)
        setMensajeAsunto('')
        setMensajeCuerpo('')
        setMensajeEnviado(false)
      }, 2000)
    } catch (err) {
      setErrorMensaje(err.message || 'Error al enviar el mensaje.')
    } finally {
      setEnviandoMensaje(false)
    }
  }

  if (cargando) {
    return (
      <div className="page-body">
        <div className="empty-state" style={{ color: '#94a3b8' }}>Cargando perfil...</div>
      </div>
    )
  }

  if (!candidato) {
    return (
      <div className="page-body">
        <div className="empty-state">
          <div className="icon">&#128100;</div>
          <p>Candidato no encontrado.</p>
        </div>
      </div>
    )
  }

  const vacante = candidato.vacantes || {}
  const cliente = vacante.clientes || {}

  const getInitials = (nombre) =>
    (nombre || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const etapaColor = etapaColors[candidato.etapa] || '#6366f1'
  const decisionColor = decisionColors[candidato.decision] || '#9ca3af'

  const formatFecha = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const todasEtapas = ['Aplicó', 'Pre-screen', 'Entrevista Cliente', 'Oferta', 'Cerrado']
  const etapaActualIndex = todasEtapas.indexOf(candidato.etapa)

  const handleCambiarEtapa = async () => {
    const etapaAnterior = candidato.etapa
    const actualizado = await updateEtapaCandidato(candidato.id, confirmEtapa)
    await registrarActividad(candidato.id, 'etapa',
      `Etapa cambiada a "${confirmEtapa}"`,
      { etapa_nueva: confirmEtapa, etapa_anterior: etapaAnterior }
    )
    const nuevaAct = { id: Date.now(), tipo: 'etapa', descripcion: `Etapa cambiada a "${confirmEtapa}"`, created_at: new Date().toISOString() }
    setActividad(prev => [nuevaAct, ...prev])
    setCandidato(prev => ({ ...prev, etapa: actualizado.etapa }))
    setConfirmEtapa(null)
  }

  const handleGuardarNota = async () => {
    const texto = nuevaNota.trim()
    if (!texto) return
    setGuardandoNota(true)
    try {
      await registrarActividad(candidato.id, 'nota', texto)
      const nuevaAct = { id: Date.now(), tipo: 'nota', descripcion: texto, created_at: new Date().toISOString() }
      setActividad(prev => [nuevaAct, ...prev])
      setNuevaNota('')
    } catch (err) {
      console.error('Error guardando nota:', err)
    } finally {
      setGuardandoNota(false)
    }
  }

  const handleEliminar = async () => {
    await deleteCandidato(candidato.id, candidato.cv_url)
    navigate('/vacantes/' + candidato.vacante_id + '/pipeline')
  }

  const handleMoverCopiarExito = async (operacion, nuevoCandidato, vacanteDestino) => {
    if (operacion === 'mover') {
      const actualizado = await getCandidatoById(Number(candidatoId))
      setCandidato(actualizado)
    } else {
      setCopiaCreada({ id: nuevoCandidato.id, vacante_id: nuevoCandidato.vacante_id, titulo: vacanteDestino.titulo })
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="breadcrumb" style={{ marginBottom: 2 }}>
            <button className="back-btn" style={{ padding: '2px 6px' }} onClick={() => navigate('/clientes')}>
              &#8592; Clientes
            </button>
            <span className="breadcrumb-sep">/</span>
            <button className="back-btn" style={{ padding: '2px 6px' }} onClick={() => navigate('/clientes/' + (vacante.cliente_id || '') + '/vacantes')}>
              {cliente.nombre || '—'}
            </button>
            <span className="breadcrumb-sep">/</span>
            <button className="back-btn" style={{ padding: '2px 6px' }} onClick={() => navigate('/vacantes/' + (candidato.vacante_id || '') + '/pipeline')}>
              {vacante.titulo || 'Pipeline'}
            </button>
            <span className="breadcrumb-sep">/</span>
            <span className="current">{candidato.nombre}</span>
          </div>
          <div className="page-title">Perfil del candidato</div>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            &#8592; Volver al pipeline
          </button>
          <button className="btn btn-secondary" onClick={() => setMostrarEditar(true)}>
            ✏️ Editar perfil
          </button>
          <button className="btn btn-ghost" onClick={() => setConfirmEliminar(true)} style={{ color: '#dc2626' }}>
            🗑 Eliminar
          </button>
        </div>
      </div>

      <div className="page-body">
        {copiaCreada && (
          <div style={{
            background: '#d1fae5', border: '1px solid #6ee7b7',
            borderRadius: 8, padding: '12px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 16,
          }}>
            <span style={{ color: '#065f46', fontSize: 14 }}>
              &#9989; Copia creada exitosamente en <strong>{copiaCreada.titulo}</strong>
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => navigate('/candidatos/' + copiaCreada.id)}
              >
                Ver copia &#8594;
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => setCopiaCreada(null)}>
                &#x2715;
              </button>
            </div>
          </div>
        )}

        <div className="profile-grid">
          {/* Columna izquierda */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Info principal */}
            <div className="card">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 20 }}>
                <div className="avatar avatar-lg" style={{ marginBottom: 12 }}>
                  {getInitials(candidato.nombre)}
                </div>
                <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--gray-800)', marginBottom: 4 }}>
                  {candidato.nombre} {candidato.apellido || ''}
                </div>
                <span
                  className="badge"
                  style={{
                    background: etapaColor + '22',
                    color: etapaColor,
                    border: '1px solid ' + etapaColor + '44',
                    marginBottom: 8,
                  }}
                >
                  {candidato.etapa}
                </span>
                {candidato.score != null && (
                  <div
                    className="score-pill"
                    style={{
                      background: candidato.score >= 4 ? '#d1fae5' : candidato.score >= 3 ? '#fef3c7' : '#fee2e2',
                      color: candidato.score >= 4 ? '#065f46' : candidato.score >= 3 ? '#92400e' : '#991b1b',
                      fontSize: 14, padding: '4px 12px',
                    }}
                  >
                    &#11088; {candidato.score} / 5.0
                  </div>
                )}
              </div>

              <div className="info-row">
                <div className="info-item">
                  <div className="info-label">Correo</div>
                  <div className="info-value">{candidato.email || '—'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Teléfono</div>
                  <div className="info-value">{candidato.telefono || '—'}</div>
                </div>
                {candidato.ciudad && (
                  <div className="info-item">
                    <div className="info-label">Ciudad</div>
                    <div className="info-value">{candidato.ciudad}</div>
                  </div>
                )}
                <div className="info-item">
                  <div className="info-label">Fuente</div>
                  <div className="info-value">
                    <span className="tag">{candidato.fuente || '—'}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-label">Fecha de aplicación</div>
                  <div className="info-value">{formatFecha(candidato.created_at)}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Decisión</div>
                  <div className="info-value" style={{ color: decisionColor, fontWeight: 700 }}>
                    {candidato.decision || 'Pendiente'}
                  </div>
                </div>
                {candidato.linkedin && (
                  <div className="info-item">
                    <div className="info-label">LinkedIn</div>
                    <div className="info-value">
                      <a href={candidato.linkedin} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontSize: 13 }}>
                        Ver perfil
                      </a>
                    </div>
                  </div>
                )}
                {candidato.cv_url && (
                  <div className="info-item">
                    <div className="info-label">CV</div>
                    <div className="info-value">
                      <a href={candidato.cv_url} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600, fontSize: 13 }}>
                        &#128196; Descargar CV
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vacante */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Vacante</div>
              <div className="info-row">
                <div className="info-item">
                  <div className="info-label">Puesto</div>
                  <div className="info-value">{vacante.titulo || '—'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Cliente</div>
                  <div className="info-value">{cliente.nombre || '—'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Ciudad</div>
                  <div className="info-value">{vacante.ciudad || '—'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Progreso en el proceso */}
            <div className="card">
              {candidato.etapa === 'Rechazado' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 18 }}>&#128683;</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, color: '#991b1b', fontSize: 13 }}>Candidato rechazado</div>
                      <div style={{ fontSize: 12, color: '#dc2626' }}>Puedes reactivarlo en cualquier etapa del proceso.</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 10, fontWeight: 600 }}>Reactivar en etapa:</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {todasEtapas.map(etapa => (
                      <button
                        key={etapa}
                        className="btn btn-secondary btn-sm"
                        onClick={() => setConfirmEtapa(etapa)}
                      >
                        {etapa}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div className="card-title">Progreso en el proceso</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {etapaActualIndex > 0 && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => setConfirmEtapa(todasEtapas[etapaActualIndex - 1])}
                      >
                        &#8592; Retroceder
                      </button>
                    )}
                    {etapaActualIndex < todasEtapas.length - 1 && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setConfirmEtapa(todasEtapas[etapaActualIndex + 1])}
                      >
                        Avanzar &#8594;
                      </button>
                    )}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setConfirmEtapa('Rechazado')}
                      style={{ color: '#dc2626' }}
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {todasEtapas.map((etapa, i) => {
                    const isPast = i < etapaActualIndex
                    const isCurrent = i === etapaActualIndex
                    const color = etapaColors[etapa]
                    return (
                      <div key={etapa} style={{ display: 'flex', alignItems: 'center', flex: i < todasEtapas.length - 1 ? 1 : 'none' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                          <div
                            style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: isCurrent ? color : isPast ? '#10b981' : 'var(--gray-200)',
                              color: (isCurrent || isPast) ? 'white' : 'var(--gray-400)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 700,
                              boxShadow: isCurrent ? '0 0 0 3px ' + color + '33' : 'none',
                              flexShrink: 0, transition: 'all 0.2s',
                            }}
                          >
                            {isPast ? '&#10003;' : i + 1}
                          </div>
                          <div
                            style={{
                              fontSize: 10, fontWeight: isCurrent ? 700 : 500,
                              color: isCurrent ? color : isPast ? '#10b981' : 'var(--gray-400)',
                              textAlign: 'center', width: 60, lineHeight: 1.2,
                            }}
                          >
                            {etapa}
                          </div>
                        </div>
                        {i < todasEtapas.length - 1 && (
                          <div
                            style={{
                              flex: 1, height: 2,
                              background: isPast ? '#10b981' : 'var(--gray-200)',
                              marginBottom: 22, marginLeft: 4, marginRight: 4,
                            }}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
                </>
              )}
            </div>

            {/* Mensaje del candidato */}
            {candidato.mensaje && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>Mensaje del candidato</div>
                <p style={{ fontSize: 13.5, color: 'var(--gray-700)', lineHeight: 1.6, background: 'var(--gray-50)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                  {candidato.mensaje}
                </p>
              </div>
            )}

            {/* Notas del reclutador */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Notas del reclutador</div>
              {candidato.notas ? (
                <p style={{ fontSize: 13.5, color: 'var(--gray-700)', lineHeight: 1.6, background: 'var(--gray-50)', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--gray-200)' }}>
                  {candidato.notas}
                </p>
              ) : (
                <div style={{ color: 'var(--gray-300)', fontSize: 13, fontStyle: 'italic' }}>
                  Sin notas aún.
                </div>
              )}
            </div>

            {/* Banderas rojas */}
            {candidato.banderas_rojas && candidato.banderas_rojas.length > 0 && (
              <div className="card" style={{ borderColor: '#fecaca' }}>
                <div className="card-title" style={{ marginBottom: 12, color: '#dc2626' }}>
                  &#128681; Banderas rojas
                </div>
                <ul style={{ paddingLeft: 0, margin: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {candidato.banderas_rojas.map((b, i) => (
                    <li key={i} style={{ fontSize: 13.5, color: '#991b1b', background: '#fef2f2', padding: '8px 12px', borderRadius: 8, border: '1px solid #fecaca' }}>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Resultados pre-screen */}
            {candidato.prescreen_scores && Object.keys(candidato.prescreen_scores).length > 0 && (() => {
              const nivel = nivelLabel(candidato.score != null ? candidato.score / (Object.keys(candidato.prescreen_scores).length * 5) : 0)
              return (
                <div className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div className="card-title">&#128203; Resultados pre-screen</div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setMostrarPrescreen(true)}>
                      Editar evaluación
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 14px', background: '#f8fafc', borderRadius: 9, border: '1px solid #e2e8f0', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>
                        {candidato.score}
                        <span style={{ fontSize: 13, fontWeight: 400, color: '#94a3b8' }}>/{Object.keys(candidato.prescreen_scores).length * 5}</span>
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Puntuación total</div>
                    </div>
                    <span style={{ background: nivel.bg, color: nivel.color, padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 700 }}>
                      {nivel.label}
                    </span>
                  </div>
                  <div className="info-row">
                    {candidato.prescreen_entrevistador && (
                      <div className="info-item">
                        <div className="info-label">Entrevistador</div>
                        <div className="info-value">{candidato.prescreen_entrevistador}</div>
                      </div>
                    )}
                    {candidato.prescreen_fecha && (
                      <div className="info-item">
                        <div className="info-label">Fecha</div>
                        <div className="info-value">{formatFecha(candidato.prescreen_fecha)}</div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}

            {/* Acciones */}
            <div className="card">
              <div className="card-title" style={{ marginBottom: 12 }}>Acciones</div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn btn-secondary" onClick={() => setMostrarPrescreen(true)}>
                  &#128203; {candidato.prescreen_scores && Object.keys(candidato.prescreen_scores).length > 0 ? 'Ver pre-screen' : 'Aplicar pre-screen'}
                </button>
                {candidato.prescreen_scores && Object.keys(candidato.prescreen_scores).length > 0 && (
                  <button
                    className="btn btn-secondary"
                    onClick={() => descargarPrescreenParaClaude(candidato, vacante)}
                    title="Descarga el reporte de pre-screen con prompt listo para Claude"
                  >
                    ⬇ Pre-screen → Claude
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    const notas = actividad.filter(a => a.tipo === 'nota')
                    generarPDFCandidato(candidato, vacante, notas)
                  }}
                >
                  &#128196; Descargar PDF
                </button>
                <button className="btn btn-secondary" onClick={() => setModalMoverCopiar(true)}>
                  &#8599; Mover / Copiar a otra vacante
                </button>
                <button className="btn btn-secondary" onClick={() => { setModalMensaje(true); setMensajeAsunto(''); setMensajeCuerpo(''); setMensajeEnviado(false); setErrorMensaje('') }}>
                  &#9993; Enviar mensaje
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historial y notas */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-title" style={{ marginBottom: 16 }}>&#128172; Historial y notas</div>

        {/* Nueva nota */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, alignItems: 'flex-start' }}>
          <textarea
            rows={2}
            placeholder="Escribe una nota sobre este candidato..."
            value={nuevaNota}
            onChange={e => setNuevaNota(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleGuardarNota() }}
            style={{
              flex: 1, padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0',
              fontSize: 13, fontFamily: 'inherit', resize: 'none', outline: 'none',
              color: '#334155', lineHeight: 1.5,
            }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleGuardarNota}
            disabled={guardandoNota || !nuevaNota.trim()}
            style={{ flexShrink: 0, marginTop: 2 }}
          >
            {guardandoNota ? '...' : 'Agregar nota'}
          </button>
        </div>

        {/* Timeline */}
        {actividad.length === 0 ? (
          <div style={{ color: '#94a3b8', fontSize: 13, fontStyle: 'italic', padding: '8px 0' }}>
            Sin actividad registrada aún.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {actividad.map((act, i) => {
              const { icono, color, bg } = tipoMeta(act.tipo)
              const fecha = act.created_at
                ? new Date(act.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : '—'
              return (
                <div key={act.id} style={{ display: 'flex', gap: 12, paddingBottom: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: bg, color, fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {icono}
                    </div>
                    {i < actividad.length - 1 && (
                      <div style={{ width: 2, flex: 1, minHeight: 12, background: '#f1f5f9', marginTop: 4 }} />
                    )}
                  </div>
                  <div style={{ flex: 1, paddingTop: 4 }}>
                    {act.tipo === 'nota' ? (
                      <div style={{
                        background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8,
                        padding: '8px 12px', fontSize: 13, color: '#334155', lineHeight: 1.5,
                      }}>
                        {act.descripcion}
                      </div>
                    ) : (
                      <div style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
                        {act.descripcion}
                      </div>
                    )}
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                      {fecha}{act.autor ? ` · ${act.autor}` : ''}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {mostrarPrescreen && (
        <PrescreenModal
          candidato={candidato}
          vacante={vacante}
          onClose={() => setMostrarPrescreen(false)}
          onGuardado={(campos) => {
            setCandidato(prev => ({ ...prev, ...campos }))
            const act = { id: Date.now(), tipo: 'prescreen', descripcion: `Pre-screen completado · Score ${campos.score}`, created_at: new Date().toISOString() }
            setActividad(prev => [act, ...prev])
            if (campos.etapa) {
              const actEtapa = { id: Date.now() + 1, tipo: 'etapa', descripcion: `Etapa cambiada a "Pre-screen"`, created_at: new Date().toISOString() }
              setActividad(prev => [actEtapa, ...prev])
            }
          }}
        />
      )}

      {mostrarEditar && (
        <EditarCandidatoModal
          candidato={candidato}
          onClose={() => setMostrarEditar(false)}
          onActualizado={(actualizado) => {
            setCandidato(prev => ({ ...prev, ...actualizado }))
            registrarActividad(candidato.id, 'edicion', 'Perfil actualizado')
            setActividad(prev => [{ id: Date.now(), tipo: 'edicion', descripcion: 'Perfil actualizado', created_at: new Date().toISOString() }, ...prev])
          }}
        />
      )}

      <ConfirmDialog
        abierto={!!confirmEtapa}
        onCerrar={() => setConfirmEtapa(null)}
        onConfirmar={handleCambiarEtapa}
        titulo="Cambiar etapa"
        mensaje={confirmEtapa ? `¿Mover a "${candidato.nombre}" a la etapa "${confirmEtapa}"?` : ''}
        labelConfirmar="Confirmar"
        peligroso={confirmEtapa === 'Rechazado'}
      />

      <ConfirmDialog
        abierto={confirmEliminar}
        onCerrar={() => setConfirmEliminar(false)}
        onConfirmar={handleEliminar}
        titulo="Eliminar candidato"
        mensaje={`¿Eliminar a "${candidato.nombre} ${candidato.apellido || ''}"? Se eliminará su perfil y CV permanentemente.`}
        labelConfirmar="Eliminar candidato"
        peligroso
      />

      {modalMoverCopiar && (
        <MoverCopiarCandidatoModal
          abierto={modalMoverCopiar}
          onCerrar={() => setModalMoverCopiar(false)}
          candidato={candidato}
          onExito={handleMoverCopiarExito}
        />
      )}

      {modalMensaje && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15,23,42,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 520, boxShadow: '0 24px 80px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>&#9993; Enviar mensaje</div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>Para: {candidato.nombre} · {candidato.email}</div>
              </div>
              <button type="button" onClick={() => setModalMensaje(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#94a3b8', lineHeight: 1 }}>×</button>
            </div>

            {mensajeEnviado ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#d1fae5', color: '#059669', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 700 }}>✓</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>Mensaje enviado correctamente</div>
              </div>
            ) : (
              <div style={{ padding: '20px 22px' }}>
                {/* Plantillas */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.05em' }}>Plantillas rápidas</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {plantillasMensaje(candidato.nombre, vacante?.titulo || 'la vacante', cliente?.nombre || '').map(t => (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => { setMensajeAsunto(t.asunto); setMensajeCuerpo(t.cuerpo) }}
                        style={{
                          padding: '4px 10px', borderRadius: 20, border: '1px solid #e2e8f0',
                          background: '#f8fafc', color: '#475569', fontSize: 12, fontWeight: 500,
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Asunto</label>
                  <input
                    value={mensajeAsunto}
                    onChange={e => setMensajeAsunto(e.target.value)}
                    placeholder="Ej: Siguiente paso en tu proceso de selección"
                    style={{ width: '100%', padding: '9px 11px', borderRadius: 7, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', color: '#1e293b', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '.05em' }}>Mensaje</label>
                  <textarea
                    value={mensajeCuerpo}
                    onChange={e => setMensajeCuerpo(e.target.value)}
                    placeholder={`Hola ${candidato.nombre},\n\n`}
                    rows={7}
                    style={{ width: '100%', padding: '9px 11px', borderRadius: 7, border: '1.5px solid #e2e8f0', fontSize: 13, fontFamily: 'inherit', color: '#1e293b', outline: 'none', resize: 'vertical', lineHeight: 1.6, boxSizing: 'border-box' }}
                  />
                </div>
                {errorMensaje && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 6, padding: '9px 13px', fontSize: 12, marginBottom: 14 }}>
                    {errorMensaje}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 9, justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={() => setModalMensaje(false)}>Cancelar</button>
                  <button className="btn btn-primary" onClick={handleEnviarMensaje} disabled={enviandoMensaje}>
                    {enviandoMensaje ? 'Enviando...' : 'Enviar mensaje'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function tipoMeta(tipo) {
  switch (tipo) {
    case 'creacion':  return { icono: '👤', color: '#2563eb', bg: '#dbeafe' }
    case 'etapa':     return { icono: '🔄', color: '#7c3aed', bg: '#ede9fe' }
    case 'nota':      return { icono: '💬', color: '#d97706', bg: '#fef3c7' }
    case 'prescreen': return { icono: '📋', color: '#059669', bg: '#d1fae5' }
    case 'edicion':   return { icono: '✏️', color: '#0891b2', bg: '#cffafe' }
    case 'cv':        return { icono: '📄', color: '#475569', bg: '#f1f5f9' }
    default:          return { icono: '•',  color: '#64748b', bg: '#f1f5f9' }
  }
}
