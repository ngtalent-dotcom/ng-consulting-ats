const FROM = 'N&G Talent <reclutamiento@ngtalentconsulting.com.mx>'

const base = `font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;`

function header(subtitulo) {
  return `
    <div style="background:#1e3a5f;padding:28px 32px;border-radius:10px 10px 0 0;">
      <div style="color:white;font-size:20px;font-weight:800;margin-bottom:4px;">N&amp;G Talent Consulting</div>
      <div style="color:rgba(255,255,255,0.6);font-size:13px;">${subtitulo}</div>
    </div>`
}

function htmlMensaje({ candidatoNombre, asunto, mensaje, reclutadorNombre }) {
  return `
    <div style="${base}">
      ${header('Mensaje de reclutamiento')}
      <div style="border:1px solid #e2e8f0;border-top:none;padding:32px;border-radius:0 0 10px 10px;background:white;">
        <p style="margin:0 0 20px;font-size:15px;color:#334155;">
          Hola <strong>${candidatoNombre}</strong>,
        </p>
        <div style="background:#f8fafc;border-left:4px solid #1e3a5f;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:24px;white-space:pre-wrap;font-size:14px;color:#1e293b;line-height:1.7;">
${mensaje}
        </div>
        <div style="padding-top:20px;border-top:1px solid #f1f5f9;font-size:13px;color:#64748b;">
          <strong>${reclutadorNombre || 'Equipo N&amp;G Talent Consulting'}</strong><br>
          <a href="mailto:reclutamiento@ngtalentconsulting.com.mx" style="color:#2563eb;">reclutamiento@ngtalentconsulting.com.mx</a>
        </div>
      </div>
    </div>`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { candidatoEmail, candidatoNombre, asunto, mensaje, reclutadorNombre } = req.body ?? {}

  if (!candidatoEmail || !asunto || !mensaje) {
    return res.status(400).json({ error: 'Datos incompletos' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY no configurado')
    return res.status(200).json({ ok: true, skipped: true })
  }

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: [candidatoEmail],
        subject: asunto,
        html: htmlMensaje({ candidatoNombre, asunto, mensaje, reclutadorNombre }),
      }),
    })

    if (!r.ok) {
      const err = await r.text().catch(() => r.status)
      console.error('Resend error:', err)
      return res.status(502).json({ error: 'Error al enviar el correo' })
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Resend fetch error:', err.message)
    res.status(502).json({ error: 'Error de red' })
  }
}
