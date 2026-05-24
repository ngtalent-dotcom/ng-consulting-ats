import { supabase } from '../lib/supabase'

// Obtener todas las vacantes (con datos del cliente)
export async function getVacantes() {
  const { data, error } = await supabase
    .from('vacantes')
    .select('*, clientes(id, nombre, industria)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Obtener vacantes por cliente
export async function getVacantesByCliente(clienteId) {
  const { data, error } = await supabase
    .from('vacantes')
    .select('*, clientes(id, nombre)')
    .eq('cliente_id', clienteId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Obtener vacante por ID (con datos del cliente)
export async function getVacanteById(id) {
  const { data, error } = await supabase
    .from('vacantes')
    .select('*, clientes(id, nombre, industria)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// Obtener vacantes públicas (publicada = true, estatus = Activa)
export async function getVacantesPublicas() {
  const { data, error } = await supabase
    .from('vacantes')
    .select('*, clientes(id, nombre)')
    .eq('publicada', true)
    .eq('estatus', 'Activa')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// Crear vacante
export async function createVacante(vacante) {
  const { data, error } = await supabase
    .from('vacantes')
    .insert([vacante])
    .select()
    .single()
  if (error) throw error
  return data
}

// Actualizar vacante
export async function updateVacante(id, campos) {
  const { data, error } = await supabase
    .from('vacantes')
    .update(campos)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Obtener todas las vacantes con datos de cliente (para selector de modal)
export async function getVacantesConCliente(excluirVacanteId = null) {
  const { data, error } = await supabase
    .from('vacantes')
    .select('id, titulo, area, nivel, estatus, cliente_id, clientes(id, nombre)')
    .order('created_at', { ascending: false })
  if (error) throw error
  if (excluirVacanteId) {
    return data.filter(v => v.id !== Number(excluirVacanteId))
  }
  return data
}

// Eliminar vacante
export async function deleteVacante(id) {
  const { error } = await supabase
    .from('vacantes')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// Regenerar token de portal por vacante (hiring manager)
export async function regenerarTokenVacante(vacanteId) {
  const nuevoToken = crypto.randomUUID()
  const { data, error } = await supabase
    .from('vacantes')
    .update({ portal_token: nuevoToken })
    .eq('id', vacanteId)
    .select('portal_token')
    .single()
  if (error) throw error
  return data.portal_token
}
