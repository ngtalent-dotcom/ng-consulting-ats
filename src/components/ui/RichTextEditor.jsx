import { useEffect, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'

export default function RichTextEditor({ value, onChange, placeholder, rows = 4 }) {
  const [expandido, setExpandido] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({ placeholder: placeholder || 'Escribe aquí...' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      if (onChange) onChange(html === '<p></p>' ? '' : html)
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    const incoming = value || ''
    if (current !== incoming) editor.commands.setContent(incoming, false)
  }, [value, editor])

  useEffect(() => {
    if (expandido) {
      document.body.style.overflow = 'hidden'
      setTimeout(() => editor?.commands.focus(), 50)
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [expandido, editor])

  if (!editor) return null

  const Btn = ({ onClick, active, title, children }) => (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onClick() }}
      style={{
        padding: '4px 9px', borderRadius: 5, border: '1px solid',
        borderColor: active ? '#2563eb' : '#e2e8f0',
        background: active ? '#dbeafe' : 'white',
        color: active ? '#1e40af' : '#475569',
        cursor: 'pointer', fontSize: 13, fontWeight: 600,
        lineHeight: 1.4, fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  )

  const toolbar = (
    <div style={{ display: 'flex', gap: 4, padding: '8px 10px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', flexWrap: 'wrap', alignItems: 'center' }}>
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Negrita">
        <strong>N</strong>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Cursiva">
        <em>I</em>
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Subrayado">
        <u>S</u>
      </Btn>
      <div style={{ width: 1, background: '#e2e8f0', alignSelf: 'stretch', margin: '0 2px' }} />
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Título">
        H2
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Subtítulo">
        H3
      </Btn>
      <div style={{ width: 1, background: '#e2e8f0', alignSelf: 'stretch', margin: '0 2px' }} />
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Lista con viñetas">
        • Lista
      </Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Lista numerada">
        1. Lista
      </Btn>
      <div style={{ width: 1, background: '#e2e8f0', alignSelf: 'stretch', margin: '0 2px' }} />
      <Btn onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} active={false} title="Limpiar formato">
        Limpiar
      </Btn>

      {/* Botón expandir / contraer */}
      <div style={{ marginLeft: 'auto' }}>
        <Btn onClick={() => setExpandido(v => !v)} active={expandido} title={expandido ? 'Contraer' : 'Ampliar editor'}>
          {expandido ? '✕ Cerrar' : '⛶ Ampliar'}
        </Btn>
      </div>
    </div>
  )

  if (expandido) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(15,23,42,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          background: 'white', borderRadius: 12, width: '100%', maxWidth: 860,
          maxHeight: '90vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
          border: '1.5px solid #e2e8f0', overflow: 'hidden',
        }}>
          {toolbar}
          <EditorContent
            editor={editor}
            className="tiptap-editor tiptap-expandido"
          />
        </div>
      </div>
    )
  }

  return (
    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', background: 'white' }}>
      {toolbar}
      <EditorContent editor={editor} className="tiptap-editor" style={{ minHeight: rows * 28 }} />
    </div>
  )
}
