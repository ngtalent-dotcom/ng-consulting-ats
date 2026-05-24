import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { token } = req.query
  if (!token) return res.status(400).json({ error: 'Token requerido' })

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return res.status(500).json({ error: 'Configuracion incompleta' })

  const supabase = createClient(process.env.VITE_SUPABASE_URL, serviceKey)

  const { data: vacante, error: vacanteError } = await supabase
    .from('vacantes')
    .select('id, titulo, area, nivel, modalidad, ciudad, estatus, prescreen_template, hiring_manager, clientes(id, nombre)')
    .eq('portal_token', token)
    .single()

  if (vacanteError || !vacante) {
    return res.status(404).json({ error: 'Portal no encontrado' })
  }

  const { data: candidatos, error: candidatosError } = await supabase
    .from('candidatos')
    .select('id, nombre, apellido, ciudad, etapa, score, notas, decision, created_at, cv_url, prescreen_scores, prescreen_notas, prescreen_fecha, prescreen_entrevistador')
    .eq('vacante_id', vacante.id)
    .neq('etapa', 'Aplicó')
    .order('created_at', { ascending: false })

  if (candidatosError) return res.status(500).json({ error: 'Error al cargar candidatos' })

  return res.status(200).json({ vacante, candidatos: candidatos || [] })
}
