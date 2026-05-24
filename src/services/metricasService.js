import { supabase } from '../lib/supabase'

export async function getDatosMetricas() {
  const [{ data: candidatos, error: e1 }, { data: vacantes, error: e2 }] = await Promise.all([
    supabase
      .from('candidatos')
      .select('id, etapa, fuente, created_at, vacante_id, area_interes, vacantes(id, titulo, estatus, clientes(nombre))')
      .order('created_at', { ascending: true }),
    supabase
      .from('vacantes')
      .select('id, titulo, estatus, created_at, fecha_apertura, clientes(nombre)')
      .order('created_at', { ascending: false }),
  ])
  if (e1) throw e1
  if (e2) throw e2
  return { candidatos: candidatos || [], vacantes: vacantes || [] }
}
