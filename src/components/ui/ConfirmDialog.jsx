import { useState } from 'react'
import Modal from './Modal'

export default function ConfirmDialog({
  abierto,
  onCerrar,
  onConfirmar,
  titulo = '¿Estás seguro?',
  mensaje,
  labelConfirmar = 'Eliminar',
  peligroso = false,
}) {
  const [guardando, setGuardando] = useState(false)

  const handleConfirmar = async () => {
    setGuardando(true)
    try {
      await onConfirmar()
    } finally {
      setGuardando(false)
    }
  }

  const handleCerrar = () => {
    if (guardando) return
    onCerrar()
  }

  return (
    <Modal abierto={abierto} onCerrar={handleCerrar} titulo={titulo} ancho={420}>
      {mensaje && (
        <p style={{ fontSize: 14, color: '#475569', marginBottom: 24, lineHeight: 1.6 }}>
          {mensaje}
        </p>
      )}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button
          onClick={handleCerrar}
          disabled={guardando}
          className="btn btn-secondary"
        >
          Cancelar
        </button>
        <button
          onClick={handleConfirmar}
          disabled={guardando}
          className="btn"
          style={{
            background: guardando
              ? (peligroso ? '#fca5a5' : '#93c5fd')
              : (peligroso ? '#dc2626' : '#2563eb'),
            color: 'white',
            cursor: guardando ? 'not-allowed' : 'pointer',
          }}
        >
          {guardando ? 'Procesando...' : labelConfirmar}
        </button>
      </div>
    </Modal>
  )
}
