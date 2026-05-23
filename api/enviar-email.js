const FROM = 'N&G Talent <reclutamiento@ngtalentconsulting.com.mx>'
const EQUIPO = 'reclutamiento@ngtalentconsulting.com.mx'

const base = `font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;`

function header(subtitulo) {
  return `
    <div style="background:#1e3a5f;padding:28px 32px;border-radius:10px 10px 0 0;">
      <div style="color:white;font-size:20px;font-weight:800;margin-bottom:4px;">N&amp;G Talent Consulting</div>
      <div style="color:rgba(255,255,255,0.6);font-size:13px;">${subtitulo}</div>
    </div>`
}

function fila(label, valor) {
  if (!valor) return ''
  return `
    <tr>
      <td style="padding:9px 0;border-bottom:1px solid #f1f5f9;color:#64748b;font-size:13px;width:130px;vertical-align:top;">${label}</td>
      <td style="padding:9px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#1e293b;">${valor}</td>
    </tr>`
}

function boton(texto, url, color = '#1e3a5f') {
  return `<a href="${url}" style="display:inline-block;padding:10px 20px;background:${color};color:white;text-decoration:none;border-radius:7px;font-size:13px;font-weight:600;margin-right:10px;">${texto}</a>`
}

function htmlInterno(candidato, vacante) {
  const cvLink = candidato.cv_url ? boton('Descargar CV', candidato.cv_url) : ''
  const liLink = candidato.linkedin ? boton('Ver LinkedIn', candidato.linkedin, '#0a66c2') : ''
  const mensajeBloque = candidato.mensaje
    ? `<div style="margin-top:20px;padding:16px;background:#f8fafc;border-left:4px solid #1e3a5f;border-radius:0 8px 8px 0;">
         <div style="font-size:12px;font-weight:600;color:#64748b;margin-bottom:6px;text-transform:uppercase;letter-spacing:.05em;">Mensaje del candidato</div>
         <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;font-style:italic;">"${candidato.mensaje}"</p>
       </div>`
    : ''

  return `
    <div style="${base}">
      ${header('Nueva aplicación recibida')}
      <div style="border:1px solid #e2e8f0;border-top:none;padding:28px 32px;border-radius:0 0 10px 10px;background:white;">
        <h2 style="margin:0 0 4px;font-size:19px;color:#1e293b;">${vacante.titulo}</h2>
        <p style="margin:0 0 24px;color:#64748b;font-size:14px;">${vacante.cliente}</p>

        <table style="width:100%;border-collapse:collapse;">
          ${fila('Nombre', `<strong>${candidato.nombre} ${candidato.apellido}</strong>`)}
          ${fila('Correo', `<a href="mailto:${candidato.email}" style="color:#2563eb;">${candidato.email}</a>`)}
          ${fila('Teléfono', candidato.telefono)}
          ${fila('Ciudad', candidato.ciudad)}
          ${fila('Fuente', candidato.fuente)}
          ${fila('LinkedIn', candidato.linkedin ? `<a href="${candidato.linkedin}" style="color:#2563eb;">Ver perfil</a>` : null)}
        </table>

        ${mensajeBloque}

        ${cvLink || liLink ? `<div style="margin-top:24px;">${cvLink}${liLink}</div>` : ''}

        <div style="margin-top:28px;padding-top:20px;border-top:1px solid #f1f5f9;font-size:12px;color:#94a3b8;text-align:center;">
          N&amp;G Talent Consulting · ATS interno
        </div>
      </div>
    </div>`
}

function htmlConfirmacion(candidato, vacante) {
  return `
    <div style="${base}">
      ${header('Confirmación de aplicación')}
      <div style="border:1px solid #e2e8f0;border-top:none;padding:32px;border-radius:0 0 10px 10px;background:white;">
        <div style="text-align:center;margin-bottom:28px;">
          <div style="width:60px;height:60px;border-radius:50%;background:#d1fae5;color:#059669;font-size:28px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">&#10003;</div>
          <h2 style="margin:0 0 8px;font-size:22px;color:#1e293b;">¡Aplicación recibida, ${candidato.nombre}!</h2>
          <p style="margin:0;color:#64748b;font-size:15px;">Gracias por tu interés en unirte a nuestro equipo.</p>
        </div>

        <div style="background:#f8fafc;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
          <div style="font-size:12px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">Vacante aplicada</div>
          <div style="font-size:17px;font-weight:700;color:#1e293b;">${vacante.titulo}</div>
          <div style="font-size:14px;color:#64748b;margin-top:2px;">${vacante.cliente}</div>
        </div>

        <p style="font-size:14px;color:#475569;line-height:1.7;margin-bottom:16px;">
          Hemos registrado tu información y nuestro equipo de reclutamiento revisará tu perfil a la brevedad.
          Si tu experiencia es de interés para la posición, nos pondremos en contacto contigo por este medio
          (<strong>${candidato.email}</strong>) o por teléfono.
        </p>

        <p style="font-size:14px;color:#475569;line-height:1.7;margin-bottom:0;">
          Mientras tanto, puedes revisar otras oportunidades disponibles en nuestro portal de empleo.
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

  const { candidato, vacante } = req.body ?? {}
  if (!candidato?.email || !vacante?.titulo) {
    return res.status(400).json({ error: 'Datos incompletos' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Dominio aún verificando o env no configurado — no bloqueamos la aplicación
    console.warn('RESEND_API_KEY no configurado')
    return res.status(200).json({ ok: true, skipped: true })
  }

  async function enviar(to, subject, html) {
    try {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from: FROM, to, subject, html }),
      })
      if (!r.ok) console.error('Resend error:', await r.text().catch(() => r.status))
    } catch (err) {
      console.error('Resend fetch error:', err.message)
    }
  }

  await Promise.allSettled([
    enviar(
      [EQUIPO],
      `Nueva aplicación: ${candidato.nombre} ${candidato.apellido} → ${vacante.titulo}`,
      htmlInterno(candidato, vacante)
    ),
    enviar(
      [candidato.email],
      `Recibimos tu aplicación — ${vacante.titulo}`,
      htmlConfirmacion(candidato, vacante)
    ),
  ])

  res.status(200).json({ ok: true })
}
