import { useRef, useEffect } from 'react'

const herramientas = [
  { cmd: 'bold',                label: <strong>N</strong>,  title: 'Negrita' },
  { cmd: 'italic',              label: <em>I</em>,           title: 'Cursiva' },
  { cmd: 'underline',          label: <u>S</u>,             title: 'Subrayado' },
  { sep: true },
  { cmd: 'insertUnorderedList', label: '• Lista',           title: 'Lista con viñetas' },
  { cmd: 'insertOrderedList',   label: '1. Lista',          title: 'Lista numerada' },
  { sep: true },
  { cmd: 'removeFormat',        label: 'Limpiar',           title: 'Quitar formato' },
]

export default function RichTextEditor({ value, onChange, placeholder, rows = 4 }) {
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value || ''
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const exec = (cmd) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, null)
    notificar()
  }

  const notificar = () => {
    if (onChange && editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  return (
    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', background: 'white' }}>
      {/* Barra de herramientas */}
      <div style={{ display: 'flex', gap: 2, padding: '5px 8px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', flexWrap: 'wrap', alignItems: 'center' }}>
        {herramientas.map((h, i) =>
          h.sep ? (
            <div key={i} style={{ width: 1, background: '#e2e8f0', alignSelf: 'stretch', margin: '2px 4px' }} />
          ) : (
            <button
              key={i}
              type="button"
              title={h.title}
              onMouseDown={e => { e.preventDefault(); exec(h.cmd) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px 8px', borderRadius: 5, fontSize: 13, color: '#475569', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
            >
              {h.label}
            </button>
          )
        )}
      </div>

      {/* Área editable */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={notificar}
        onBlur={notificar}
        data-placeholder={placeholder}
        style={{
          minHeight: rows * 26,
          padding: '10px 13px',
          outline: 'none',
          fontSize: 14,
          color: '#1e293b',
          lineHeight: 1.7,
          fontFamily: 'inherit',
        }}
      />
    </div>
  )
}
