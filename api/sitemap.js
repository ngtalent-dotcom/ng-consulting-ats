import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY)

  const { data: vacantes } = await supabase
    .from('vacantes')
    .select('id, updated_at')
    .eq('publicada', true)
    .eq('estatus', 'Activa')
    .order('created_at', { ascending: false })

  const base = process.env.SITE_URL || `https://${process.env.VERCEL_URL}` || 'https://ng-consulting-ats.vercel.app'

  const urls = [
    `<url><loc>${base}/careers</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    ...(vacantes || []).map(v => {
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
