import { supabase } from '../lib/supabase'

// Obtener candidatos por vacante
export async function getCandidatosByVacante(vacanteId) {
  const { data, error } = await supabase
    .from('candidatos')
    .select('*')
    .eq('vacante_id', vacanteId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Obtener candidato por ID
export async function getCandidatoById(id) {
  const { data, error } = await supabase
    .from('candidatos')
    .select('*, vacantes(id, titulo, prescreen_template, clientes(nombre))')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// Crear candidato (desde portal público)
export async function createCandidato(candidato) {
  const { data, error } = await supabase
    .from('candidatos')
    .insert([candidato])
    .select()
    .single()
  if (error) throw error
  return data
}

// Subir CV a Supabase Storage y devolver URL pública
export async function uploadCV(file, candidatoEmail) {
  const timestamp = Date.now()
  const ext = file.name.split('.').pop()
  const fileName = `${candidatoEmail}_${timestamp}.${ext}`
  const filePath = `cvs/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('cvs')
    .upload(filePath, file, { cacheControl: '3600', upsert: false })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('cvs').getPublicUrl(filePath)
  return data.publicUrl
}

// Actualizar etapa del candidato en el pipeline
export async function updateEtapaCandidato(id, etapa) {
  const { data, error } = await supabase
    .from('candidatos')
    .update({ etapa })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Actualizar campos del candidato (notas, score, decision, etc.)
export async function updateCandidato(id, campos) {
  const { data, error } = await supabase
    .from('candidatos')
    .update(campos)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Eliminar candidato (y su CV en storage si existe)
export async function deleteCandidato(id, cvUrl) {
  if (cvUrl) {
    const match = cvUrl.match(/\/cvs\/(.+)$/)
    if (match) {
      await supabase.storage.from('cvs').remove([match[1]])
    }
  }
  const { error } = await supabase.from('candidatos').delete().eq('id', id)
  if (error) throw error
}
