import { supabase } from '../lib/supabase'

export async function listarAdjuntos(vacanteId) {
  const { data, error } = await supabase
    .from('vacantes_adjuntos')
    .select('*')
    .eq('vacante_id', vacanteId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function subirAdjunto(vacanteId, file, tipo = 'otro', subidoPor = null) {
  const storagePath = `${vacanteId}/${Date.now()}_${file.name}`

  const { error: uploadError } = await supabase.storage
    .from('vacantes_adjuntos')
    .upload(storagePath, file, { cacheControl: '3600', upsert: false })
  if (uploadError) throw uploadError

  const { data, error } = await supabase
    .from('vacantes_adjuntos')
    .insert([{
      vacante_id: vacanteId,
      tipo,
      nombre_archivo: file.name,
      storage_path: storagePath,
      mime_type: file.type || null,
      tamano_bytes: file.size || null,
      subido_por: subidoPor,
    }])
    .select()
    .single()
  if (error) throw error
  return data
}

export async function descargarAdjunto(storagePath) {
  const { data, error } = await supabase.storage
    .from('vacantes_adjuntos')
    .createSignedUrl(storagePath, 3600)
  if (error) throw error
  return data.signedUrl
}

export async function eliminarAdjunto(adjuntoId, storagePath) {
  const { error: storageError } = await supabase.storage
    .from('vacantes_adjuntos')
    .remove([storagePath])
  if (storageError) throw storageError

  const { error } = await supabase
    .from('vacantes_adjuntos')
    .delete()
    .eq('id', adjuntoId)
  if (error) throw error
}

export async function descargarTemplateLevantamiento(cliente, puesto) {
  const { data } = supabase.storage
    .from('templates')
    .getPublicUrl('LevantamientoPerfil_Template.xlsx')

  const resp = await fetch(data.publicUrl)
  if (!resp.ok) throw new Error('No se pudo descargar la plantilla')
  const blob = await resp.blob()

  const nombreLimpio = (s) => s.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_áéíóúÁÉÍÓÚüÜñÑ]/g, '') // cspell:disable-line
  const nombreArchivo = `LevantamientoPerfil_${nombreLimpio(cliente)}_${nombreLimpio(puesto)}.xlsx`

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  a.click()
  URL.revokeObjectURL(url)
}
