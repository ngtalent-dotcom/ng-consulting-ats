import { useEffect } from 'react'

export default function Modal({ abierto, onCerrar, titulo, children, ancho = 560 }) {
  useEffect(() => {
    if (!abierto) return
    const handleKey = (e) => { if (e.key === 'Escape') onCerrar() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div
      onClick={onCerrar}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(2px)',
        zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white', borderRadius: 14,
          width: '100%', maxWidth: ancho,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px 16px',
          borderBottom: '1px solid #f1f5f9',
          flexShrink: 0,
        }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: '#1e293b' }}>{titulo}</div>
          <button
            onClick={onCerrar}
            style={{
              background: '#f1f5f9', border: 'none', borderRadius: 8,
              width: 32, height: 32, cursor: 'pointer',
              fontSize: 16, color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            &#x2715;
          </button>
        </div>

        {/* Contenido */}
        <div style={{ padding: '20px 24px 24px', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
