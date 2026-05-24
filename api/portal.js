import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  const { token } = req.query
  if (!token) return res.status(400).json({ error: 'Token requerido' })

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) return res.status(500).json({ error: 'Configuracion incompleta' })

  const supabase = createClient(process.env.VITE_SUPABASE_URL, serviceKey)

  const { data: cliente, error: clienteError } = await supabase
    .from('clientes')
    .select('id, nombre, industria, contacto')
    .eq('portal_token', token)
    .single()

  if (clienteError || !cliente) {
    return res.status(404).json({ error: 'Portal no encontrado' })
  }

  const { data: vacantes, error: vacantesError } = await supabase
    .from('vacantes')
    .select(`
      id, titulo, area, nivel, modalidad, ciudad, estatus, created_at, prescreen_template,
      candidatos (
        id, nombre, apellido, ciudad, etapa, score, notas, decision, created_at,
        cv_url, prescreen_scores, prescreen_notas, prescreen_fecha, prescreen_entrevistador
      )
    `)
    .eq('cliente_id', cliente.id)
    .order('created_at', { ascending: false })

  if (vacantesError) return res.status(500).json({ error: 'Error al cargar datos' })

  return res.status(200).json({ cliente, vacantes: vacantes || [] })
}
