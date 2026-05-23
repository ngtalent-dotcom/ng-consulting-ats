export const BLOQUES_FIJOS = {
  apertura: [
    {
      id: 'apertura',
      nombre: 'Apertura',
      pregunta: 'Platícame sobre ti. ¿Quién eres, a qué te dedicas y qué estás buscando ahorita?',
      hint: 'Dejar que el candidato hable libremente 2–3 minutos. Observar energía, claridad y estructura narrativa. No interrumpir.',
    },
  ],
  experiencia: [
    {
      id: 'exp-reciente',
      nombre: 'Experiencia reciente',
      pregunta: 'Háblame de tu empresa más reciente. ¿Qué hacías en el día a día?',
      hint: '→ ¿Cuál fue tu mayor logro o impacto? → ¿Qué KPIs tenías? → ¿Por qué saliste o buscas cambio?',
    },
    {
      id: 'exp-anterior',
      nombre: 'Experiencia anterior',
      pregunta: 'Y antes de eso, ¿dónde estuviste? Cuéntame brevemente lo más relevante.',
      hint: '→ ¿Qué hacías? → ¿Algún logro destacado? → ¿Razón de salida?',
    },
  ],
  cierre: [
    {
      id: 'motivacion-fit',
      nombre: 'Motivación y fit',
      pregunta: '¿Qué te llama la atención de esta vacante / de este giro?',
      hint: 'Buscar interés genuino. Ojo a respuestas demasiado genéricas.',
    },
    {
      id: 'expectativa-cierre',
      nombre: 'Expectativa y cierre',
      pregunta: '¿Cuál es tu expectativa salarial? ¿Cuánto ganabas en tu último trabajo y qué prestaciones tenías? ¿Tienes disponibilidad inmediata? ¿Llevas otros procesos?',
      hint: 'Anotar número exacto. Si tiene otros procesos, preguntar en qué etapa van.',
    },
  ],
}

export const TODAS_FIJAS = [
  ...BLOQUES_FIJOS.apertura,
  ...BLOQUES_FIJOS.experiencia,
  ...BLOQUES_FIJOS.cierre,
]

export const PLANTILLAS_SUGERIDAS = {
  'ventas-b2b': [
    {
      id: 'organizacion-crm',
      nombre: 'Organización y CRM',
      pregunta: '¿Cómo organizas tu cartera de clientes y seguimiento? ¿Usas CRM?',
      hint: '→ ¿Cuántos clientes activos manejabas? → ¿Cómo priorizabas?',
    },
    {
      id: 'venta-consultiva',
      nombre: 'Venta consultiva',
      pregunta: 'Cuéntame de un cierre difícil. ¿Cómo llegaste al cliente y qué hiciste para cerrar?',
      hint: '→ ¿Cuál fue el ticket? → ¿Qué objeción superaste?',
    },
    {
      id: 'prospeccion',
      nombre: 'Prospección',
      pregunta: '¿Cómo prospectabas clientes nuevos? ¿Tenías metas?',
      hint: '→ Cold calling, LinkedIn, eventos. → Tasa de conversión.',
    },
  ],
  'operaciones': [
    {
      id: 'planeacion',
      nombre: 'Planeación y priorización',
      pregunta: 'Este puesto implica coordinar varios procesos a la vez. ¿Cómo te organizas?',
      hint: '→ Método de priorización. → Qué haces bajo presión.',
    },
    {
      id: 'excel',
      nombre: 'Dominio de Excel',
      pregunta: '¿Qué es lo más complejo que has hecho en Excel?',
      hint: '→ Tablas dinámicas, fórmulas anidadas, macros, Power Query.',
    },
    {
      id: 'inventarios',
      nombre: 'Control de inventarios',
      pregunta: '¿Has llevado control de inventarios o materiales? ¿Cómo lo manejabas?',
      hint: '→ Discrepancias y faltantes. → Sistemas que usaste.',
    },
  ],
  'community-manager': [
    {
      id: 'redes-sociales',
      nombre: 'Manejo de redes sociales',
      pregunta: '¿Qué redes manejas y cuáles son tus métricas típicas de éxito?',
      hint: '→ Instagram, TikTok, Facebook. → Engagement, alcance, conversión.',
    },
    {
      id: 'produccion-contenido',
      nombre: 'Producción de contenido',
      pregunta: '¿Tú produces el contenido o te llega ya hecho? ¿En qué herramientas?',
      hint: '→ Canva, CapCut, Photoshop. → Foto/video propio o de terceros.',
    },
    {
      id: 'paid-media',
      nombre: 'Paid media',
      pregunta: '¿Has manejado campañas pagadas? ¿En qué plataformas?',
      hint: '→ Meta Ads, Google Ads. → Presupuestos y resultados.',
    },
    {
      id: 'metricas',
      nombre: 'Métricas y reporting',
      pregunta: '¿Cómo reportas el desempeño de redes? ¿Qué métricas miras?',
      hint: '→ Reportes semanales/mensuales. → KPIs clave.',
    },
  ],
}
