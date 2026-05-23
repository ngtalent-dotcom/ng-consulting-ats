import { supabase } from '../lib/supabase'

// Obtener todos los clientes
export async function getClientes() {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .order('nombre', { ascending: true })
  if (error) throw error
  return data
}

// Obtener un cliente por ID
export async function getClienteById(id) {
  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// Crear un nuevo cliente
export async function createCliente(cliente) {
  const { data, error } = await supabase
    .from('clientes')
    .insert([cliente])
    .select()
    .single()
  if (error) throw error
  return data
}

// Actualizar cliente
export async function updateCliente(id, campos) {
  const { data, error } = await supabase
    .from('clientes')
    .update(campos)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Eliminar cliente
export async function deleteCliente(id) {
  const { error } = await supabase
    .from('clientes')
    .delete()
    .eq('id', id)
  if (error) throw error
}
