import { useState, useMemo } from 'react'

const SERVICIOS_CATALOGO = [
  {
    id: 'perfil',
    label: 'Creación de perfil de candidato',
    descripcion: 'Organización de junta para analizar el perfil profesional de la vacante, junto con encuesta de actividades, competencias y objetivos del puesto.',
  },
  {
    id: 'publicacion',
    label: 'Publicación de vacante',
    descripcion: 'Publicación de vacante en LinkedIn y sourcing de candidatos de manera independiente.',
  },
  {
    id: 'entrevistas',
    label: 'Entrevista de candidatos',
    descripcion: 'Entrevistas con modelo de competencias para evaluar afinidad al puesto.',
  },
  {
    id: 'organizacion',
    label: 'Organización de entrevistas',
    descripcion: 'Organización de entrevistas que se llevaron a cabo con el equipo del cliente.',
  },
  {
    id: 'oferta',
    label: 'Presentación de carta oferta',
    descripcion: 'Análisis de la compensación del candidato y presentación de la carta de oferta, considerando posibles áreas de negociación.',
  },
]

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: 7, border: '1.5px solid #e2e8f0',
  fontSize: 13, fontFamily: 'inherit', color: '#1e293b', outline: 'none', boxSizing: 'border-box',
}

function sumarMeses(fechaStr, meses) {
  if (!fechaStr) return ''
  const d = new Date(fechaStr + 'T12:00:00')
  d.setMonth(d.getMonth() + meses)
  return d.toISOString().split('T')[0]
}

function formatFecha(fechaStr) {
  if (!fechaStr) return '—'
  const [y, m, d] = fechaStr.split('-')
  const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`
}

function formatMonto(n) {
  if (!n && n !== 0) return '—'
  return n.toLocaleString('es-MX', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function Cobro() {
  const [form, setForm] = useState({
    destinatario: '',
    cliente: '',
    candidatoNombre: '',
    puesto: '',
    salarioMensual: '',
    comisionPct: '5',
    fechaFirma: '',
    garantiaMeses: '3',
    entrevistadores: '',
    firmante: 'Gustavo Martínez Navejar',
    servicios: ['perfil', 'publicacion', 'entrevistas', 'oferta'],
  })

  const [copiado, setCopiado] = useState(false)

  const set = campo => e => setForm(prev => ({ ...prev, [campo]: e.target.value }))

  const toggleServicio = id => {
    setForm(prev => ({
      ...prev,
      servicios: prev.servicios.includes(id)
        ? prev.servicios.filter(s => s !== id)
        : [...prev.servicios, id],
    }))
  }

  const salarioAnual = useMemo(() => {
    const m = parseFloat(form.salarioMensual.replace(/[^0-9.]/g, ''))
    return isNaN(m) ? null : m * 12
  }, [form.salarioMensual])

  const comisionMonto = useMemo(() => {
    if (salarioAnual == null) return null
    const pct = parseFloat(form.comisionPct)
    return isNaN(pct) ? null : salarioAnual * (pct / 100)
  }, [salarioAnual, form.comisionPct])

  const fechaFinGarantia = useMemo(() => {
    return sumarMeses(form.fechaFirma, parseInt(form.garantiaMeses) || 3)
  }, [form.fechaFirma, form.garantiaMeses])

  const serviciosSeleccionados = SERVICIOS_CATALOGO.filter(s => form.servicios.includes(s.id))

  const textoDocumento = useMemo(() => {
    const hoy = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
    const salMensualFmt = form.salarioMensual ? `$${form.salarioMensual.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',')} MXN` : '—'
    const salAnualFmt = salarioAnual != null ? `$${formatMonto(salarioAnual)} MXN` : '—'
    const comisionFmt = comisionMonto != null ? `$${formatMonto(comisionMonto)} MXN` : '—'
    const pct = form.comisionPct || '5'
    const garantia = parseInt(form.garantiaMeses) || 3

    const dest = form.destinatario.trim() ? `Estimado(a) ${form.destinatario.trim()}:` : 'A quien corresponda:'

    const listaServicios = serviciosSeleccionados.map(s => {
      let desc = s.descripcion
      if (s.id === 'organizacion' && form.entrevistadores.trim()) {
        desc = `Organización de entrevistas que se llevaron a cabo con ${form.entrevistadores.trim()}.`
      }
      return `  - ${s.label}\n    ${desc}`
    }).join('\n\n')

    return [
      `Monterrey, N.L., ${hoy}`,
      '',
      dest,
      '',
      `Los candidatos tienen una garantía de ${garantia} meses; si por alguna razón terminan su contrato durante ese periodo, abriremos otro proceso sin costo adicional. Los servicios incluidos en esta ocasión fueron los siguientes:`,
      '',
      `Servicio de Reclutamiento — Vacante: ${form.puesto || '—'}`,
      form.cliente ? `Cliente: ${form.cliente}` : '',
      '',
      listaServicios || '  (Sin servicios seleccionados)',
      '',
      `Una vez transcurrido el periodo de garantía de ${garantia} meses a partir de la fecha de firma de oferta del candidato, se procederá con el pago de la comisión correspondiente, equivalente al ${pct}% del salario anual acordado.`,
      '',
      'A continuación se detallan las fechas clave y el monto correspondiente:',
      '',
      `Candidato:                  ${form.candidatoNombre || '—'}${form.puesto ? ` (${form.puesto})` : ''}`,
      `Fecha de firma de oferta:   ${formatFecha(form.fechaFirma)}`,
      `Fin del periodo de garantía:${fechaFinGarantia ? ' ' + formatFecha(fechaFinGarantia) : ' —'}`,
      `Salario mensual:            ${salMensualFmt}`,
      `Salario anual:              ${salAnualFmt}`,
      `Comisión (${pct}%):${' '.repeat(Math.max(1, 12 - pct.length))}${comisionFmt}`,
      '',
      'Quedo a tu disposición para cualquier duda o comentario adicional.',
      '',
      'Saludos cordiales,',
      form.firmante || 'Gustavo Martínez Navejar',
      'N&G Talent Consulting',
      'reclutamiento@ngtalentconsulting.com.mx',
    ].filter(l => l !== undefined && l !== null).join('\n')
  }, [form, salarioAnual, comisionMonto, fechaFinGarantia, serviciosSeleccionados])

  function copiarTexto() {
    navigator.clipboard.writeText(textoDocumento).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    })
  }

  function descargarTexto() {
    const blob = new Blob([textoDocumento], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Cobro_${(form.candidatoNombre || 'Candidato').replace(/\s+/g, '_')}_${(form.puesto || 'Puesto').replace(/\s+/g, '_')}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#1e293b' }}>Generador de cobro</h1>
        <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
          Completa los datos para generar el documento de cobro al cliente.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Formulario */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Datos principales */}
          <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 16 }}>Datos del cobro</div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Destinatario (opcional)</label>
              <input value={form.destinatario} onChange={set('destinatario')} placeholder="Nombre de la persona de contacto" style={inputStyle} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Empresa cliente</label>
              <input value={form.cliente} onChange={set('cliente')} placeholder="Nombre de la empresa" style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Candidato</label>
                <input value={form.candidatoNombre} onChange={set('candidatoNombre')} placeholder="Nombre completo" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Puesto / Vacante</label>
                <input value={form.puesto} onChange={set('puesto')} placeholder="Ej: Auxiliar Administrativa" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Quién entrevistó (para el servicio de organización)</label>
              <input value={form.entrevistadores} onChange={set('entrevistadores')} placeholder="Ej: Ricardo Villarreal, David Canseco" style={inputStyle} />
            </div>
          </div>

          {/* Economía */}
          <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 16 }}>Compensación y comisión</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Salario mensual (MXN)</label>
                <input value={form.salarioMensual} onChange={set('salarioMensual')} placeholder="13,000" style={inputStyle} type="text" inputMode="numeric" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Comisión (%)</label>
                <input value={form.comisionPct} onChange={set('comisionPct')} style={inputStyle} type="number" min="1" max="100" step="0.5" />
              </div>
            </div>

            {salarioAnual != null && (
              <div style={{ background: '#f1f5f9', borderRadius: 7, padding: '12px 14px', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Salario anual</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>${formatMonto(salarioAnual)} MXN</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>Comisión ({form.comisionPct}%)</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#1e3a5f' }}>${formatMonto(comisionMonto)} MXN</span>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Fecha de firma de oferta</label>
                <input value={form.fechaFirma} onChange={set('fechaFirma')} style={inputStyle} type="date" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 5 }}>Garantía (meses)</label>
                <input value={form.garantiaMeses} onChange={set('garantiaMeses')} style={inputStyle} type="number" min="1" max="12" />
              </div>
            </div>
            {fechaFinGarantia && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
                Fin de garantía: <strong style={{ color: '#1e293b' }}>{formatFecha(fechaFinGarantia)}</strong>
              </div>
            )}
          </div>

          {/* Servicios */}
          <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 14 }}>Servicios prestados</div>
            {SERVICIOS_CATALOGO.map(s => (
              <label key={s.id} style={{ display: 'flex', gap: 10, marginBottom: 12, cursor: 'pointer', alignItems: 'flex-start' }}>
                <input
                  type="checkbox"
                  checked={form.servicios.includes(s.id)}
                  onChange={() => toggleServicio(s.id)}
                  style={{ marginTop: 2, flexShrink: 0, cursor: 'pointer', accentColor: '#1e3a5f' }}
                />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{s.label}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.5, marginTop: 1 }}>{s.descripcion}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Firmante */}
          <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '20px' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1e3a5f', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 12 }}>Firmante</div>
            <input value={form.firmante} onChange={set('firmante')} style={inputStyle} placeholder="Tu nombre completo" />
          </div>
        </div>

        {/* Preview */}
        <div style={{ position: 'sticky', top: 24 }}>
          <div style={{ background: 'white', border: '1.5px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '.05em' }}>Vista previa</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: copiado ? '#d1fae5' : '#f1f5f9',
                    color: copiado ? '#059669' : '#475569',
                    border: '1px solid ' + (copiado ? '#6ee7b7' : '#e2e8f0'),
                  }}
                  onClick={copiarTexto}
                >
                  {copiado ? '✓ Copiado' : '📋 Copiar'}
                </button>
                <button type="button" className="btn btn-secondary btn-sm" onClick={descargarTexto}>
                  ⬇ Descargar .txt
                </button>
              </div>
            </div>
            <pre style={{
              margin: 0,
              padding: '20px',
              fontSize: 12,
              fontFamily: "'Courier New', Courier, monospace",
              color: '#1e293b',
              lineHeight: 1.7,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '70vh',
              overflowY: 'auto',
            }}>
              {textoDocumento}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
