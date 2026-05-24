export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY

  let vacantes = []
  let debugInfo = null
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/vacantes?select=id,updated_at&publicada=eq.true&estatus=eq.Activa`,
      {
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
        },
      }
    )
    const json = await response.json()
    debugInfo = { status: response.status, isArray: Array.isArray(json), count: Array.isArray(json) ? json.length : null, sample: JSON.stringify(json).slice(0, 200) }
    vacantes = Array.isArray(json) ? json : []
  } catch (err) {
    debugInfo = { error: err.message, urlSet: !!supabaseUrl, keySet: !!anonKey }
    vacantes = []
  }

  if (req.query.debug) {
    return res.status(200).json({ urlSet: !!supabaseUrl, keySet: !!anonKey, ...debugInfo })
  }

  const base = process.env.SITE_URL || `https://${process.env.VERCEL_URL}` || 'https://ng-consulting-ats.vercel.app'

  const urls = [
    `<url><loc>${base}/careers</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    ...vacantes.map(v => {
      const fecha = v.updated_at ? v.updated_at.split('T')[0] : ''
      return `<url><loc>${base}/careers/${v.id}</loc>${fecha ? `<lastmod>${fecha}</lastmod>` : ''}<changefreq>weekly</changefreq><priority>0.8</priority></url>`
    }),
  ].join('\n  ')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 's-maxage=3600')
  res.status(200).send(xml)
}
