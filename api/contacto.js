const FROM = 'N&G Talent <reclutamiento@ngtalentconsulting.com.mx>'
const EQUIPO = 'reclutamiento@ngtalentconsulting.com.mx'

const base = `font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;`

function htmlEquipo({ nombre, empresa, correo, telefono, mensaje }) {
  const fila = (label, valor) => valor
    ? `<tr>
        <td style="padding:9px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;width:130px;vertical-align:top;">${label}</td>
        <td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;">${valor}</td>
       </tr>`
    : ''
  return `
    <div style="${base}">
      <div style="background:#1e3a5f;padding:28px 32px;border-radius:10px 10px 0 0;">
        <div style="color:white;font-size:20px;font-weight:800;margin-bottom:4px;">N&amp;G Talent Consulting</div>
        <div style="color:rgba(255,255,255,0.6);font-size:13px;">Nueva solicitud de información</div>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;padding:28px 32px;border-radius:0 0 10px 10px;background:white;">
        <h2 style="margin:0 0 24px;font-size:18px;color:#1e293b;">Solicitud recibida desde la landing page</h2>
        <table style="width:100%;border-collapse:collapse;">
          ${fila('Nombre', `<strong>${nombre}</strong>`)}
          ${fila('Empresa', empresa)}
          ${fila('Correo', `<a href="mailto:${correo}" style="color:#2563eb;">${correo}</a>`)}
          ${fila('Teléfono', telefono)}
        </table>
        ${mensaje ? `
        <div style="margin-top:20px;padding:16px;background:#f8fafc;border-left:4px solid #1e3a5f;border-radius:0 8px 8px 0;">
          <div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em;">Mensaje</div>
          <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">${mensaje}</p>
        </div>` : ''}
        <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f1f5f9;font-size:12px;color:#94a3b8;text-align:center;">
          N&amp;G Talent Consulting · Solicitud desde ngtalentconsulting.com.mx
        </div>
      </div>
    </div>`
}

function htmlConfirmacion({ nombre }) {
  return `
    <div style="${base}">
      <div style="background:#1e3a5f;padding:28px 32px;border-radius:10px 10px 0 0;">
        <div style="color:white;font-size:20px;font-weight:800;margin-bottom:4px;">N&amp;G Talent Consulting</div>
        <div style="color:rgba(255,255,255,0.6);font-size:13px;">Confirmación de solicitud</div>
      </div>
      <div style="border:1px solid #e2e8f0;border-top:none;padding:36px 32px;border-radius:0 0 10px 10px;background:white;text-align:center;">
        <div style="width:60px;height:60px;border-radius:50%;background:#d1fae5;color:#059669;font-size:28px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">&#10003;</div>
        <h2 style="margin:0 0 12px;font-size:22px;color:#1e293b;">Gracias, ${nombre}</h2>
        <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.7;max-width:440px;display:inline-block;">
          Hemos recibido su solicitud. Nuestro equipo la revisará y se pondrá en contacto con usted en menos de 24 horas.
        </p>
        <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f1f5f9;font-size:13px;color:#64748b;">
          <strong>Equipo N&amp;G Talent Consulting</strong><br>
          <a href="mailto:reclutamiento@ngtalentconsulting.com.mx" style="color:#2563eb;">reclutamiento@ngtalentconsulting.com.mx</a>
        </div>
      </div>
    </div>`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { nombre, empresa, correo, telefono, mensaje } = req.body ?? {}
  if (!nombre?.trim() || !correo?.trim()) {
    return res.status(400).json({ error: 'Datos incompletos' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('RESEND_API_KEY no configurado')
    return res.status(200).json({ ok: true, skipped: true })
  }

  async function enviar(to, subject, html) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to, subject, html }),
      })
      if (!r.ok) console.error('Resend error:', await r.text().catch(() => r.status))
    } catch (err) {
      console.error('Resend fetch error:', err.message)
    }
  }

  await Promise.allSettled([
    enviar([EQUIPO], `Solicitud de información — ${nombre} · ${empresa || 'sin empresa'}`, htmlEquipo({ nombre, empresa, correo, telefono, mensaje })),
    enviar([correo], 'Recibimos su solicitud — N&G Talent Consulting', htmlConfirmacion({ nombre })),
  ])

  res.status(200).json({ ok: true })
}
