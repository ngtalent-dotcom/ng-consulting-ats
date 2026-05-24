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

// Crear candidato (desde ATS interno — requiere sesión autenticada)
export async function createCandidato(candidato) {
  const { data, error } = await supabase
    .from('candidatos')
    .insert([candidato])
    .select()
    .single()
  if (error) throw error
  return data
}

// Crear candidato desde el portal público de careers (usuario anónimo — sin select de regreso)
export async function createCandidatoPublico(candidato) {
  const { error } = await supabase
    .from('candidatos')
    .insert([candidato])
  if (error) throw error
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

// Obtener todos los candidatos con filtros opcionales
export async function getTodosCandidatos({
  busqueda = '',
  etapa = '',
  decision = '',
  cliente_id = '',
  vacante_id = '',
} = {}) {
  let query = supabase
    .from('candidatos')
    .select(`
      id, nombre, apellido, email, telefono, ciudad,
      fuente, etapa, score, decision, created_at, cv_url, linkedin,
      vacantes (
        id, titulo, area, nivel, cliente_id,
        clientes ( id, nombre )
      )
    `)
    .order('created_at', { ascending: false })

  if (etapa)      query = query.eq('etapa', etapa)
  if (decision)   query = query.eq('decision', decision)
  if (vacante_id) query = query.eq('vacante_id', vacante_id)

  const { data, error } = await query
  if (error) throw error

  let resultado = data

  if (busqueda.trim()) {
    const term = busqueda.toLowerCase()
    resultado = resultado.filter(c =>
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.vacantes?.titulo?.toLowerCase().includes(term) ||
      c.vacantes?.clientes?.nombre?.toLowerCase().includes(term)
    )
  }

  if (cliente_id) {
    resultado = resultado.filter(c =>
      String(c.vacantes?.cliente_id) === String(cliente_id) // TODO(performance)
    )
  }

  return resultado
}

// Mover candidato a otra vacante (actualiza vacante_id)
export async function moverCandidato(candidatoId, nuevaVacanteId) {
  const { data, error } = await supabase
    .from('candidatos')
    .update({ vacante_id: nuevaVacanteId })
    .eq('id', candidatoId)
    .select()
    .single()
  if (error) throw error
  return data
}

// Copiar candidato a otra vacante (crea nuevo registro con todos los campos del original)
export async function copiarCandidato(candidatoOriginal, nuevaVacanteId) {
  // eslint-disable-next-line no-unused-vars
  const { id, created_at, vacantes, ...resto } = candidatoOriginal
  const { data, error } = await supabase
    .from('candidatos')
    .insert({ ...resto, vacante_id: nuevaVacanteId, etapa: 'Aplicó', decision: null })
    .select()
    .single()
  if (error) throw error
  return data
}

// Obtener candidatos espontáneos (sin vacante asignada)
export async function getCandidatosEspontaneos() {
  const { data, error } = await supabase
    .from('candidatos')
    .select('id, nombre, apellido, email, ciudad, fuente, area_interes, etapa, cv_url, created_at')
    .is('vacante_id', null)
    .order('created_at', { ascending: false })
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
