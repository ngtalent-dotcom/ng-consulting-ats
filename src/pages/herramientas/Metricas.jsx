import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer,
  PieChart, Pie,
} from 'recharts'
import { getDatosMetricas } from '../../services/metricasService'

const ETAPAS_ORDEN = ['Aplicó', 'Pre-screen', 'Entrevista Cliente', 'Oferta', 'Cerrado']
const ETAPA_COLORES = {
  'Aplicó':             '#6366f1',
  'Pre-screen':         '#f59e0b',
  'Entrevista Cliente': '#3b82f6',
  'Oferta':             '#8b5cf6',
  'Cerrado':            '#10b981',
}
const FUENTE_COLORES = ['#2563eb', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626', '#64748b', '#94a3b8']

const PERIODOS = [
  { label: 'Último mes', dias: 30 },
  { label: '3 meses', dias: 90 },
  { label: '6 meses', dias: 180 },
  { label: 'Todo', dias: null },
]

function TooltipCustom({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'white', border: '1px solid #e2e8f0',
      borderRadius: 8, padding: '8px 12px',
      fontSize: 13, boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      {label && <div style={{ color: '#64748b', marginBottom: 4, fontSize: 11 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#1e293b', fontWeight: 600 }}>
          {p.name && p.name !== 'value' && p.name !== 'nuevos' ? `${p.name}: ` : ''}{p.value}
        </div>
      ))}
    </div>
  )
}

export default function Metricas() {
  const [raw, setRaw] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [periodo, setPeriodo] = useState(3)

  useEffect(() => {
    getDatosMetricas()
      .then(setRaw)
      .catch(err => console.error('Error cargando métricas:', err))
      .finally(() => setCargando(false))
  }, [])

  const m = useMemo(() => {
    if (!raw) return null
    const { candidatos: todos, vacantes } = raw

    const limitMs = PERIODOS[periodo].dias
      ? Date.now() - PERIODOS[periodo].dias * 86400000
      : null
    const candidatos = limitMs
      ? todos.filter(c => new Date(c.created_at).getTime() >= limitMs)
      : todos

    const conVacante = candidatos.filter(c => c.vacante_id !== null)
    const espontaneos = candidatos.filter(c => c.vacante_id === null)
    const activos = conVacante.filter(c => c.etapa !== 'Rechazado' && c.etapa !== 'Cerrado')
    const cerrados = conVacante.filter(c => c.etapa === 'Cerrado').length
    const rechazados = conVacante.filter(c => c.etapa === 'Rechazado').length

    // Funnel
    const funnelData = ETAPAS_ORDEN.map((etapa, i) => {
      const count = candidatos.filter(c => c.etapa === etapa).length
      const prevCount = i > 0 ? candidatos.filter(c => c.etapa === ETAPAS_ORDEN[i - 1]).length : null
      const convPrev = prevCount && prevCount > 0 ? Math.round(count / prevCount * 100) : null
      return { etapa, count, color: ETAPA_COLORES[etapa], convPrev, prevEtapa: ETAPAS_ORDEN[i - 1] || null }
    })

    // Fuentes
    const fuenteMap = {}
    conVacante.forEach(c => {
      const f = c.fuente || 'Sin fuente'
      fuenteMap[f] = (fuenteMap[f] || 0) + 1
    })
    const fuenteData = Object.entries(fuenteMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, value], i) => ({ name, value, color: FUENTE_COLORES[i] || '#94a3b8' }))

    // Actividad semanal (siempre sobre todos los datos, sin filtro de período)
    const semanaData = Array.from({ length: 8 }, (_, i) => {
      const finMs = Date.now() - i * 7 * 86400000
      const inicioMs = finMs - 7 * 86400000
      const label = new Date(finMs).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
      const nuevos = todos.filter(c => {
        const t = new Date(c.created_at).getTime()
        return c.vacante_id !== null && t >= inicioMs && t < finMs
      }).length
      return { label, nuevos }
    }).reverse()

    // Top vacantes
    const vacanteMap = {}
    conVacante.forEach(c => {
      if (!c.vacantes) return
      const v = c.vacantes
      if (!vacanteMap[v.id]) vacanteMap[v.id] = { name: v.titulo, cliente: v.clientes?.nombre || '—', total: 0, activos: 0 }
      vacanteMap[v.id].total++
      if (c.etapa !== 'Rechazado') vacanteMap[v.id].activos++
    })
    const topVacantes = Object.values(vacanteMap).sort((a, b) => b.total - a.total).slice(0, 5)

    // Vacantes activas por antigüedad
    const vacantesActivas = vacantes
      .filter(v => v.estatus === 'Activa')
      .map(v => ({
        titulo: v.titulo,
        cliente: v.clientes?.nombre || '—',
        dias: Math.floor((Date.now() - new Date(v.fecha_apertura || v.created_at).getTime()) / 86400000),
      }))
      .sort((a, b) => b.dias - a.dias)
      .slice(0, 8)

    // Días promedio en pipeline
    const diasPromedio = activos.length > 0
      ? Math.round(activos.reduce((s, c) => s + (Date.now() - new Date(c.created_at).getTime()) / 86400000, 0) / activos.length)
      : 0

    // Banco por área
    const areaMap = {}
    espontaneos.forEach(c => {
      const a = c.area_interes || 'Sin especificar'
      areaMap[a] = (areaMap[a] || 0) + 1
    })
    const bancoPorArea = Object.entries(areaMap)
      .sort((a, b) => b[1] - a[1])
      .map(([name, value]) => ({ name, value }))

    return {
      activos: activos.length,
      cerrados,
      rechazados,
      totalConVacante: conVacante.length,
      espontaneos: espontaneos.length,
      diasPromedio,
      tasaConversion: conVacante.length > 0 ? cerrados / conVacante.length : 0,
      funnelData,
      fuenteData,
      semanaData,
      topVacantes,
      vacantesActivas,
      bancoPorArea,
    }
  }, [raw, periodo])

  return (
    <div style={{ padding: '32px 36px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', margin: 0 }}>Métricas de Reclutamiento</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginTop: 4, marginBottom: 0 }}>Análisis de tu pipeline, fuentes y actividad.</p>
        </div>
        <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 8, padding: 3 }}>
          {PERIODOS.map((p, i) => (
            <button
              key={i}
              onClick={() => setPeriodo(i)}
              style={{
                padding: '6px 12px', borderRadius: 6, border: 'none',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                background: periodo === i ? 'white' : 'transparent',
                color: periodo === i ? '#1e293b' : '#64748b',
                boxShadow: periodo === i ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {cargando ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>Cargando métricas...</div>
      ) : !m ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>No se pudieron cargar los datos.</div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
            <KpiCard icon="👥" label="En pipeline" value={m.activos} sub="candidatos activos" color="#dbeafe" />
            <KpiCard icon="⏱️" label="Días en pipeline" value={m.diasPromedio} sub="promedio por candidato" color="#fef3c7" />
            <KpiCard
              icon="✅"
              label="Tasa de éxito"
              value={`${Math.round(m.tasaConversion * 100)}%`}
              sub={`${m.cerrados} cerrados de ${m.totalConVacante}`}
              color="#d1fae5"
            />
            <KpiCard icon="🌟" label="Banco de Talento" value={m.espontaneos} sub="candidatos espontáneos" color="#ede9fe" />
          </div>

          {/* Funnel + Fuentes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            <Tarjeta titulo="Funnel del pipeline">
              {m.totalConVacante === 0 ? <Vacio /> : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={m.funnelData} layout="vertical" margin={{ top: 0, right: 50, left: 30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="etapa" width={130} tick={{ fontSize: 12, fill: '#334155' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<TooltipCustom />} cursor={{ fill: '#f8fafc' }} />
                      <Bar dataKey="count" name="Candidatos" radius={[0, 4, 4, 0]} barSize={22}>
                        {m.funnelData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {/* Conversiones */}
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    {m.funnelData.filter(f => f.convPrev !== null && f.count > 0).map(f => (
                      <div key={f.etapa} style={{ fontSize: 11, color: '#64748b' }}>
                        <span style={{
                          fontWeight: 700,
                          color: f.convPrev >= 50 ? '#059669' : f.convPrev >= 25 ? '#d97706' : '#dc2626',
                        }}>
                          {f.convPrev}%
                        </span>
                        {' '}→ {f.etapa}
                      </div>
                    ))}
                    <div style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>
                      Rechazados: <strong style={{ color: '#ef4444' }}>{m.rechazados}</strong>
                    </div>
                  </div>
                </>
              )}
            </Tarjeta>

            <Tarjeta titulo="Fuente de candidatos">
              {m.fuenteData.length === 0 ? <Vacio /> : (
                <>
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie
                        data={m.fuenteData}
                        cx="50%" cy="50%"
                        innerRadius={48} outerRadius={78}
                        dataKey="value"
                        paddingAngle={3}
                      >
                        {m.fuenteData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<TooltipCustom />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                    {m.fuenteData.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                        <div style={{ flex: 1, fontSize: 12, color: '#475569', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b' }}>{d.value}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', width: 34, textAlign: 'right' }}>
                          {Math.round(d.value / m.totalConVacante * 100)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Tarjeta>
          </div>

          {/* Actividad semanal (full width) */}
          <Tarjeta titulo="Nuevos candidatos por semana" style={{ marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={m.semanaData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<TooltipCustom />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="nuevos" name="Candidatos" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </Tarjeta>

          {/* Top vacantes + Vacantes activas */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

            <Tarjeta titulo="Top vacantes por candidatos">
              {m.topVacantes.length === 0 ? <Vacio /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={m.topVacantes} layout="vertical" margin={{ top: 0, right: 40, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis
                      type="category" dataKey="name" width={110}
                      tick={{ fontSize: 11, fill: '#334155' }}
                      axisLine={false} tickLine={false}
                      tickFormatter={v => v.length > 15 ? v.slice(0, 15) + '…' : v}
                    />
                    <Tooltip content={<TooltipCustom />} cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="total" name="Total" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={10} />
                    <Bar dataKey="activos" name="Activos" fill="#10b981" radius={[0, 4, 4, 0]} barSize={10} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Tarjeta>

            <Tarjeta titulo="Vacantes activas por antigüedad">
              {m.vacantesActivas.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>No hay vacantes activas.</p>
              ) : (
                <>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {m.vacantesActivas.map((v, i) => {
                      const badge = v.dias < 30
                        ? { bg: '#d1fae5', color: '#065f46' }
                        : v.dias < 60
                          ? { bg: '#fef3c7', color: '#92400e' }
                          : { bg: '#fee2e2', color: '#991b1b' }
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.titulo}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{v.cliente}</div>
                          </div>
                          <span style={{ background: badge.bg, color: badge.color, padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                            {v.dias}d
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 12, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                    Verde &lt;30d &nbsp;·&nbsp; Amarillo 30–60d &nbsp;·&nbsp; Rojo &gt;60d
                  </div>
                </>
              )}
            </Tarjeta>
          </div>

          {/* Banco de talento por área (si hay datos) */}
          {m.bancoPorArea.length > 0 && (
            <Tarjeta titulo="Banco de Talento por área de interés">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={m.bancoPorArea} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<TooltipCustom />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" name="Candidatos" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={52} />
                </BarChart>
              </ResponsiveContainer>
            </Tarjeta>
          )}
        </>
      )}
    </div>
  )
}

function KpiCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', marginTop: 5 }}>{label}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{sub}</div>
        </div>
      </div>
    </div>
  )
}

function Tarjeta({ titulo, children, style }) {
  return (
    <div className="card" style={{ marginBottom: 0, ...style }}>
      <div className="card-title" style={{ marginBottom: 16 }}>{titulo}</div>
      {children}
    </div>
  )
}

function Vacio() {
  return <p style={{ color: '#94a3b8', fontSize: 13, margin: 0 }}>Sin datos para este período.</p>
}
