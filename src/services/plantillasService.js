import { supabase } from '../lib/supabase'

export async function getPlantillas() {
  const { data, error } = await supabase
    .from('plantillas_prescreen')
    .select('*')
    .order('nombre')
  if (error) throw error
  return data
}

export async function createPlantilla({ nombre, slug, competencias }) {
  const { data, error } = await supabase
    .from('plantillas_prescreen')
    .insert({ nombre, slug, competencias })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updatePlantilla(id, { nombre, slug, competencias }) {
  const { data, error } = await supabase
    .from('plantillas_prescreen')
    .update({ nombre, slug, competencias })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deletePlantilla(id) {
  const { error } = await supabase
    .from('plantillas_prescreen')
    .delete()
    .eq('id', id)
  if (error) throw error
}
