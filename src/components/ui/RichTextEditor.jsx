import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'

export default function RichTextEditor({ value, onChange, placeholder, rows = 4 }) {
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

  return (
    <div style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', background: 'white' }}>
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
      </div>
      <EditorContent editor={editor} className="tiptap-editor" style={{ minHeight: rows * 28 }} />
    </div>
  )
}
