import { useState } from 'react'
import { descargarTemplateLevantamiento } from '../../services/vacantesAdjuntosService'

export default function DescargarTemplateBtn({ cliente, puesto }) {
  const [descargando, setDescargando] = useState(false)
  const [toast, setToast] = useState(false)

  const handleClick = async () => {
    if (descargando) return
    setDescargando(true)
    try {
      await descargarTemplateLevantamiento(cliente, puesto)
      setToast(true)
      setTimeout(() => setToast(false), 4000)
    } catch (err) {
      alert('No se pudo descargar la plantilla: ' + err.message)
    } finally {
      setDescargando(false)
    }
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        className="btn btn-secondary btn-sm"
        onClick={handleClick}
        disabled={descargando}
        style={{ display: 'flex', alignItems: 'center', gap: 5 }}
      >
        &#128229; {descargando ? 'Descargando...' : 'Plantilla de levantamiento'}
      </button>
      {toast && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 8,
          background: '#1e293b', color: 'white', borderRadius: 8,
          padding: '10px 14px', fontSize: 12.5, lineHeight: 1.5,
          whiteSpace: 'nowrap', zIndex: 50,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          &#9989; Plantilla descargada.<br />
          <span style={{ color: '#94a3b8' }}>Mándasela al cliente; cuando la regrese llena, súbela aquí.</span>
        </div>
      )}
    </div>
  )
}
