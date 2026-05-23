import { useRef, useState } from 'react'
import { subirAdjunto } from '../../services/vacantesAdjuntosService'

const MAX_MB = 10

export default function SubirAdjuntoBtn({ vacanteId, tipo, label, onSubido }) {
  const inputRef = useRef()
  const [subiendo, setSubiendo] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setError(null)

    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`El archivo supera los ${MAX_MB} MB permitidos.`)
      e.target.value = ''
      return
    }

    setSubiendo(true)
    try {
      const adjunto = await subirAdjunto(vacanteId, file, tipo || 'otro')
      onSubido(adjunto)
    } catch (err) {
      setError('Error al subir: ' + err.message)
    } finally {
      setSubiendo(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.pdf,.docx,.doc"
        onChange={handleChange}
        style={{ display: 'none' }}
      />
      <button
        className="btn btn-secondary btn-sm"
        onClick={() => inputRef.current.click()}
        disabled={subiendo}
        style={{ display: 'flex', alignItems: 'center', gap: 5 }}
      >
        &#128228; {subiendo ? 'Subiendo...' : (label || 'Subir archivo')}
      </button>
      {error && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626' }}>{error}</div>
      )}
    </div>
  )
}
