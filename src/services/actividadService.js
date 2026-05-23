import { supabase } from '../lib/supabase'

export async function getActividadByCandidato(candidatoId) {
  const { data, error } = await supabase
    .from('actividad')
    .select('*')
    .eq('candidato_id', candidatoId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Non-throwing: activity logging must not break the main flow
export async function registrarActividad(candidatoId, tipo, descripcion, datos = null) {
  const { error } = await supabase.from('actividad').insert([{
    candidato_id: candidatoId,
    tipo,
    descripcion,
    datos,
  }])
  if (error) console.error('Error registrando actividad:', error)
}
