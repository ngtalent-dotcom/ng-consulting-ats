import { supabase } from '../lib/supabase'

export async function getLevantamientos() {
  const { data, error } = await supabase
    .from('levantamientos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getLevantamientoByToken(token) {
  const { data, error } = await supabase
    .from('levantamientos')
    .select('*')
    .eq('token', token)
    .single()
  if (error) throw error
  return data
}

export async function createLevantamiento({ tituloPuesto, clienteNombre }) {
  const { data, error } = await supabase
    .from('levantamientos')
    .insert({ titulo_vacante: tituloPuesto, cliente_nombre: clienteNombre })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function completarLevantamiento(token, datos) {
  const { data, error } = await supabase
    .from('levantamientos')
    .update({
      datos,
      completado: true,
      completado_at: new Date().toISOString(),
    })
    .eq('token', token)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteLevantamiento(id) {
  const { error } = await supabase
    .from('levantamientos')
    .delete()
    .eq('id', id)
  if (error) throw error
}
