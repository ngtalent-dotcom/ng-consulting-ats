# System Prompt — Claude Code · N&G Talent Consulting ATS

> **Esta tarea AGREGA funcionalidad. No reemplaza ni reescribe nada de lo que ya está construido.** Los componentes, servicios y tablas existentes siguen intactos. Solo se extienden con columnas nuevas, servicios nuevos y dos features nuevas.

---

## 1. Contexto del repo (lo que YA existe)

**Repo:** `https://github.com/ngtalent-dotcom/ng-consulting-ats`
**Stack:** React 19 + Vite · React Router v7 · Supabase (Postgres + Storage) · Vercel (auto-deploy en `master`)
**Sin:** TypeScript, Tailwind, CSS modules, librerías de UI.
**Estilos:** objetos JS en línea. Clases globales solo en `src/index.css` (`.card`, `.btn`, `.badge`, `.avatar`, `.kanban-*`).

**Tablas y columnas (Supabase) — todas en español, sin acentos en los nombres de columna:**
- `clientes` — `id, nombre, industria, contacto, email, telefono, created_at`
- `vacantes` — `id, cliente_id, titulo, area, nivel, modalidad, ciudad, salario_min, salario_max, descripcion, requisitos, fecha_apertura, estatus, prioridad, publicada, created_at`
- `candidatos` — `id, vacante_id, nombre, apellido, email, telefono, ciudad, fuente, etapa, score, decision, notas, banderas_rojas, linkedin, cv_url, mensaje, created_at`

Valores de enum (no son columnas enum reales pero el front los trata como tales):
- `vacantes.estatus`: `'Activa'` | otros
- `vacantes.prioridad`: `'Alta'` | `'Media'` | `'Baja'`
- `candidatos.etapa`: `'Aplicó'` | `'Pre-screen'` | `'Entrevista Cliente'` | `'Oferta'` | `'Cerrado'` | `'Rechazado'`
- `candidatos.decision`: `'Pendiente'` | `'Fuerte'` | `'Viable con reservas'` | `'No Apto'`
- `candidatos.banderas_rojas`: `text[]`

**Storage existente:** bucket `cvs` (público, archivos de CV de candidatos que aplican por `/careers`).

**Servicios existentes (`src/services/`):**
- `vacantesService.js` — `getVacantes`, `getVacantesByCliente`, `getVacanteById`, `getVacantesPublicas`, `createVacante`, `updateVacante`.
- `candidatosService.js` — `getCandidatosByVacante`, `getCandidatoById`, `createCandidato`, `uploadCV`, `updateEtapaCandidato`, `updateCandidato`.
- `clientesService.js` — `getClientes`, `getClienteById`.

**Rutas existentes:**
```
/                       Dashboard
/clientes               Lista de clientes
/clientes/:id/vacantes  Vacantes de un cliente + modal crear vacante
/vacantes/:id/pipeline  Pipeline Kanban/Tabla
/candidatos/:id         Perfil del candidato
/careers                Portal público
/careers/:id            Detalle vacante pública
/careers/:id/apply      Formulario de aplicación
```

Internas usan `Layout` (sidebar). `/careers/*` usa `CareersLayout` (header público).

**Tooling:** `cspell` con diccionario español (`npm run spellcheck`), `husky` pre-commit que corre el spellcheck, GitHub Actions que lo corre en push/PR.

---

## 2. Reglas críticas del proyecto

1. **Nombres de columnas SQL: español SIN acentos** (`titulo`, `telefono`, `descripcion`). **Labels visibles al usuario: SÍ con acentos.** Nunca crear una columna `título`.
2. **IDs son numéricos autogenerados** (`bigserial` / `int` autoincremental). No usar UUIDs en tablas nuevas — seguir la convención.
3. **Estilos solo en línea con objetos JS.** Cero Tailwind, cero `className` con clases nuevas — si necesitas una clase global reutilizable, agrégala a `src/index.css`.
4. **Nada de TypeScript.** Todo en `.js` / `.jsx`.
5. **Extiende servicios existentes, no crees patrones nuevos.** Si añades una función para Pre-Screen, va dentro de `candidatosService.js` o `vacantesService.js` siguiendo el mismo estilo (named exports, async/await, `supabase.from(...)`).
6. **Todo texto visible en español mexicano.** El `cspell` con diccionario español va a fallar si escribes textos con typos — corre `npm run spellcheck` antes de commitear.
7. **No toques `master` directo.** Trabaja en una rama por feature y abre PR. El auto-deploy en Vercel se dispara al hacer merge.
8. **No expongas la service-role key** de Supabase en el front. Solo `VITE_SUPABASE_URL` y la `anon key` están permitidas en cliente.

---

## 3. Cambios de base de datos

Crear migración SQL en `supabase/migrations/{timestamp}_prescreen_y_levantamiento.sql`. Si no existe la carpeta, créala y comenta en el PR cómo aplicarla.

### 3.1 Extender `vacantes` con plantilla de pre-screen

```sql
alter table public.vacantes
  add column if not exists prescreen_template jsonb
  default jsonb_build_object('competencias', jsonb_build_array());
```

Forma del JSON guardado en `prescreen_template`:

```json
{
  "competencias": [
    {
      "id": "venta-consultiva",
      "nombre": "Venta consultiva",
      "pregunta": "Cuéntame de un cierre difícil…",
      "hint": "→ ¿Cuál fue el ticket? → ¿Qué objeción superaste?",
      "orden": 1
    }
  ]
}
```

### 3.2 Extender `candidatos` con resultados del pre-screen

```sql
alter table public.candidatos
  add column if not exists prescreen_scores jsonb default '{}'::jsonb,
  add column if not exists prescreen_notas jsonb default '{}'::jsonb,
  add column if not exists prescreen_fecha timestamptz,
  add column if not exists prescreen_entrevistador text;
```

- `prescreen_scores`: objeto `{ competencia_id: 0..5 }` para todas las competencias (fijas + dinámicas).
- `prescreen_notas`: objeto `{ competencia_id: "texto libre" }`.
- El campo `candidatos.score` (que ya existe) se sigue usando para el **total** calculado (suma de scores). El campo `decision` se sigue usando para la etiqueta (`'Fuerte'`, `'Viable con reservas'`, `'No Apto'`, `'Pendiente'`).

### 3.3 Tabla nueva `vacantes_adjuntos`

```sql
create table if not exists public.vacantes_adjuntos (
  id bigserial primary key,
  vacante_id bigint not null references public.vacantes(id) on delete cascade,
  tipo text not null check (tipo in ('levantamiento_lleno','jd','contrato','otro')),
  nombre_archivo text not null,
  storage_path text not null,
  mime_type text,
  tamano_bytes bigint,
  subido_por text,
  created_at timestamptz not null default now()
);

create index if not exists idx_vacantes_adjuntos_vacante on public.vacantes_adjuntos(vacante_id);
```

(Si más adelante se agrega auth, `subido_por` puede pasar a `uuid references auth.users(id)`. Por ahora dejarlo como `text` o nullable, consistente con cómo se manejen los demás campos de "quién hizo qué" en el repo.)

### 3.4 Buckets de Storage

- **`templates`** (público): aloja el archivo template del levantamiento.
  - Subir manualmente desde el dashboard: `templates/LevantamientoPerfil_Template.xlsx`
- **`vacantes_adjuntos`** (privado): aloja los Excels llenos que regresa el cliente + cualquier otro adjunto.
  - Estructura: `{vacante_id}/{timestamp}_{nombre_archivo}`

**Decisión sobre el bucket privado:** mientras no haya autenticación en la app (hoy todo es público porque `/careers` es público y no hay login interno), el bucket `vacantes_adjuntos` puede ser **público pero con URLs no listables**, o puede ser privado y acceder con signed URLs sin auth (Supabase lo permite con la service-role en un endpoint serverless). **Si no hay claridad, hazlo público por ahora y deja un `// TODO(auth)` documentando que cuando entre auth se vuelve privado.** Esto evita romper el flujo actual.

---

## 4. Feature 1 — Pre-Screen dinámico

### 4.1 Contexto

Hoy en el repo existe un botón / acción de Pre-Screen que está **deshabilitado** (`opacity: 0.6; cursor: not-allowed`). Esta tarea **lo habilita** y le conecta la funcionalidad real. **No crear un módulo paralelo.** Buscar dónde está ese botón y partir de ahí.

### 4.2 Estructura del Pre-Screen (4 bloques)

**Bloque 1 — Apertura** (1 pregunta, FIJA, igual para todas las vacantes)
- Pregunta: *"Platícame sobre ti. ¿Quién eres, a qué te dedicas y qué estás buscando ahorita?"*
- Hint: *"Dejar que el candidato hable libremente 2–3 minutos. Observar energía, claridad y estructura narrativa. No interrumpir."*

**Bloque 2 — Experiencia laboral** (2 preguntas, FIJAS)
- P2.1: *"Háblame de tu empresa más reciente. ¿Qué hacías en el día a día?"*
  - Hint: *"→ ¿Cuál fue tu mayor logro o impacto? → ¿Qué KPIs tenías? → ¿Por qué saliste o buscas cambio?"*
- P2.2: *"Y antes de eso, ¿dónde estuviste? Cuéntame brevemente lo más relevante."*
  - Hint: *"→ ¿Qué hacías? → ¿Algún logro destacado? → ¿Razón de salida?"*

**Bloque 3 — Competencias clave** (DINÁMICO, viene de `vacantes.prescreen_template.competencias`)
- Render N filas, una por competencia configurada en la vacante.
- Cada fila: nombre de competencia (como subtítulo), pregunta, hint, estrellas 1–5, textarea de notas.

**Bloque 4 — Motivación, fit y cierre** (2 preguntas, FIJAS)
- P4.1: *"¿Qué te llama la atención de esta vacante / de este giro?"*
  - Hint: *"Buscar interés genuino. Ojo a respuestas demasiado genéricas."*
- P4.2: *"¿Cuál es tu expectativa salarial? ¿Cuánto ganabas en tu último trabajo y qué prestaciones tenías? ¿Tienes disponibilidad inmediata? ¿Llevas otros procesos?"*
  - Hint: *"Anotar número exacto. Si tiene otros procesos, preguntar en qué etapa van."*

**Bloques fijos van como constantes en `src/services/prescreenConfig.js`** (no hardcoded dentro del componente). Estructura sugerida:

```js
export const BLOQUES_FIJOS = {
  apertura: [{ id: 'apertura', nombre: 'Apertura', pregunta: '…', hint: '…' }],
  experiencia: [
    { id: 'exp-reciente', nombre: 'Experiencia reciente', pregunta: '…', hint: '…' },
    { id: 'exp-anterior', nombre: 'Experiencia anterior', pregunta: '…', hint: '…' }
  ],
  cierre: [
    { id: 'motivacion-fit', nombre: 'Motivación y fit', pregunta: '…', hint: '…' },
    { id: 'expectativa-cierre', nombre: 'Expectativa y cierre', pregunta: '…', hint: '…' }
  ]
};
```

### 4.3 Cálculo del puntaje

Total posible = `(bloques_fijos_count + competencias_dinamicas.length) × 5`
Total fijo = 5 preguntas fijas × 5 = **25**.
Si la vacante tiene N competencias, total = `(5 + N) × 5`.

**Umbrales (ya proporcionales):**
- `score / total ≥ 0.80` → `decision = 'Fuerte'`
- `score / total ≥ 0.60` → `decision = 'Viable con reservas'`
- `score / total ≥ 0.40` → `decision = 'No Apto'` *(el valor "Débil" no está en el enum existente — colapsarlo a "No Apto" o pedir agregar el valor; ver §4.6)*
- `score / total < 0.40` → `decision = 'No Apto'`

Función en `src/services/prescreenScoring.js`:

```js
export function calcularResultado(scores, totalCompetencias) {
  const totalPosible = totalCompetencias * 5;
  const total = Object.values(scores).reduce((a, b) => a + (b || 0), 0);
  const pct = totalPosible === 0 ? 0 : total / totalPosible;
  let decision = 'Pendiente';
  if (total > 0) {
    if (pct >= 0.80) decision = 'Fuerte';
    else if (pct >= 0.60) decision = 'Viable con reservas';
    else decision = 'No Apto';
  }
  return { total, totalPosible, pct, decision };
}
```

### 4.4 Editor de competencias en el modal de crear/editar vacante

En el modal existente de "Crear vacante" (`/clientes/:id/vacantes`), agregar una sección **"Competencias para el pre-screen"** debajo de los campos actuales:

- Lista ordenable con botones **↑ ↓** (no drag & drop por ahora — encaja con la decisión "Kanban sin DnD").
- Cada fila: input para `nombre`, textarea para `pregunta`, textarea para `hint`, botón **🗑** para eliminar.
- Botón **"+ Agregar competencia"** abajo de la lista.
- Botón **"Cargar plantilla sugerida"** con un dropdown: Ventas B2B / Operaciones / Community Manager / Vacío.
- Validación al guardar la vacante: mínimo 2, máximo 8 competencias.

Catálogo de plantillas sugeridas en `src/services/prescreenConfig.js`:

```js
export const PLANTILLAS_SUGERIDAS = {
  'ventas-b2b': [
    { id: 'organizacion-crm', nombre: 'Organización y CRM', pregunta: '¿Cómo organizas tu cartera de clientes y seguimiento? ¿Usas CRM?', hint: '→ ¿Cuántos clientes activos manejabas? → ¿Cómo priorizabas?' },
    { id: 'venta-consultiva', nombre: 'Venta consultiva', pregunta: 'Cuéntame de un cierre difícil. ¿Cómo llegaste al cliente y qué hiciste para cerrar?', hint: '→ ¿Cuál fue el ticket? → ¿Qué objeción superaste?' },
    { id: 'prospeccion', nombre: 'Prospección', pregunta: '¿Cómo prospectabas clientes nuevos? ¿Tenías metas?', hint: '→ Cold calling, LinkedIn, eventos. → Tasa de conversión.' }
  ],
  'operaciones': [
    { id: 'planeacion', nombre: 'Planeación y priorización', pregunta: 'Este puesto implica coordinar varios procesos a la vez. ¿Cómo te organizas?', hint: '→ Método de priorización. → Qué haces bajo presión.' },
    { id: 'excel', nombre: 'Dominio de Excel', pregunta: '¿Qué es lo más complejo que has hecho en Excel?', hint: '→ Tablas dinámicas, fórmulas anidadas, macros, Power Query.' },
    { id: 'inventarios', nombre: 'Control de inventarios', pregunta: '¿Has llevado control de inventarios o materiales? ¿Cómo lo manejabas?', hint: '→ Discrepancias y faltantes. → Sistemas que usaste.' }
  ],
  'community-manager': [
    { id: 'redes-sociales', nombre: 'Manejo de redes sociales', pregunta: '¿Qué redes manejas y cuáles son tus métricas típicas de éxito?', hint: '→ Instagram, TikTok, Facebook. → Engagement, alcance, conversión.' },
    { id: 'produccion-contenido', nombre: 'Producción de contenido', pregunta: '¿Tú produces el contenido o te llega ya hecho? ¿En qué herramientas?', hint: '→ Canva, CapCut, Photoshop. → Foto/video propio o de terceros.' },
    { id: 'paid-media', nombre: 'Paid media', pregunta: '¿Has manejado campañas pagadas? ¿En qué plataformas?', hint: '→ Meta Ads, Google Ads. → Presupuestos y resultados.' },
    { id: 'metricas', nombre: 'Métricas y reporting', pregunta: '¿Cómo reportas el desempeño de redes? ¿Qué métricas miras?', hint: '→ Reportes semanales/mensuales. → KPIs clave.' }
  ]
};
```

### 4.5 UI del Pre-Screen del candidato

- Habilitar el botón "Pre-screen" que hoy está con `opacity: 0.6`. Quitar el estado deshabilitado y conectarlo a un modal nuevo.
- El modal abre con scroll vertical, muestra los 4 bloques en orden.
- Cada pregunta: enunciado, hint en cursiva, fila de 5 estrellas, textarea.
- Footer del modal: tabla resumen (competencia / score / nivel) + total `X / Y` + etiqueta de decisión + botones **"Cancelar"** y **"Guardar evaluación"**.
- Al guardar:
  1. `updateCandidato(id, { score, decision, prescreen_scores, prescreen_notas, prescreen_fecha, prescreen_entrevistador })`.
  2. Si la etapa del candidato es `'Aplicó'`, moverla a `'Pre-screen'` automáticamente.
  3. Toast/feedback y cerrar modal.
- Si el candidato ya tiene `prescreen_scores` guardados, precargarlos al abrir.

### 4.6 Decisión pendiente que Claude Code debe **preguntar antes de implementar**

El valor `'Débil'` no existe en el enum actual `candidatos.decision`. Opciones:
- (A) Agregar `'Débil'` como valor permitido (modificar restricción si existe; si es texto libre, no hay nada que cambiar).
- (B) Colapsar el rango "débil" (40–60%) a `'No Apto'`.

Preguntar a Gustavo cuál antes de codear el cálculo.

---

## 5. Feature 2 — Descarga / subida del Excel de Levantamiento

### 5.1 Botón "Descargar plantilla de levantamiento"

- **Ubicación:** header de la pantalla `/vacantes/:id/pipeline`, junto al título de la vacante. También se puede agregar a la lista de vacantes del cliente como acción secundaria.
- **Comportamiento:**
  1. Obtener la URL pública del template: `supabase.storage.from('templates').getPublicUrl('LevantamientoPerfil_Template.xlsx')`.
  2. Hacer `fetch` del blob.
  3. Disparar la descarga con `URL.createObjectURL` y un `<a download>` con nombre `LevantamientoPerfil_{Cliente}_{Puesto}.xlsx`.
     - `{Cliente}` y `{Puesto}` se obtienen joineando con `clientes` y la vacante actual (sin espacios, usar `_` o PascalCase para evitar problemas en Windows).
  4. **No modificar el contenido del .xlsx.** Es exactamente el archivo template.
- Estado "Descargando…" mientras se baja, para evitar doble click.
- Tras descargar, un toast pequeño: *"Plantilla descargada. Mándasela al cliente; cuando la regrese llena, súbela aquí."*

### 5.2 Botón "Subir levantamiento del cliente" + lista de adjuntos

- **Ubicación:** misma pantalla `/vacantes/:id/pipeline`, en una sección **"Documentos de la vacante"** debajo del kanban (o como tab/sección colapsable).
- **Subida:**
  1. File picker `accept=".xlsx,.xls,.pdf,.docx"` (acepta también JDs y otros).
  2. Validación: tamaño ≤ 10 MB.
  3. `supabase.storage.from('vacantes_adjuntos').upload(\`${vacante_id}/${Date.now()}_${file.name}\`, file)`.
  4. Insertar fila en `vacantes_adjuntos` con `tipo='levantamiento_lleno'` (si subió desde el botón específico) o `tipo='otro'` (si es un upload genérico).
  5. Refrescar la lista.
- **Lista de adjuntos:**
  - Mostrar: ícono según tipo, `nombre_archivo`, fecha (relativa: "hace 3 días"), tamaño, botones **"Descargar"** y **"Eliminar"**.
  - **Descargar:** signed URL de 1 hora si el bucket es privado; URL pública si quedó público.
  - **Eliminar:** confirmación tipo *"¿Eliminar este archivo?"*, luego borrar del storage y de la tabla.

### 5.3 Servicios nuevos

Crear `src/services/vacantesAdjuntosService.js`:

```js
import { supabase } from './supabaseClient';

export async function descargarTemplateLevantamiento(cliente, puesto) { /* … */ }
export async function listarAdjuntos(vacanteId) { /* … */ }
export async function subirAdjunto(vacanteId, file, tipo = 'otro', subidoPor = null) { /* … */ }
export async function descargarAdjunto(storagePath) { /* … */ }
export async function eliminarAdjunto(adjuntoId, storagePath) { /* … */ }
```

Estilo idéntico a los servicios existentes (`vacantesService.js`, `candidatosService.js`).

### 5.4 NO hacer (por ahora)

- No pre-llenar el Excel con datos de la vacante. Es entrega pura del template. Si Gustavo lo pide después, se hace con SheetJS — deja un comentario `// TODO(prefill)` en el handler de descarga.

---

## 6. Estructura de archivos sugerida

```
src/
  services/
    prescreenConfig.js          # BLOQUES_FIJOS + PLANTILLAS_SUGERIDAS
    prescreenScoring.js         # calcularResultado, etiquetas
    vacantesAdjuntosService.js  # CRUD de adjuntos
    (extender) vacantesService.js, candidatosService.js
  components/
    prescreen/
      PrescreenModal.jsx        # Modal con los 4 bloques
      StarRating.jsx            # Componente 1-5 estrellas
      CompetenciasEditor.jsx    # Editor en modal de vacante
    adjuntos/
      DescargarTemplateBtn.jsx
      SubirAdjuntoBtn.jsx
      AdjuntosList.jsx
  pages/
    (extender) VacantesPage.jsx     # Insertar CompetenciasEditor en modal crear
    (extender) PipelinePage.jsx     # Insertar botón descargar template + AdjuntosList + habilitar PrescreenModal
    (extender) CandidatoPage.jsx    # Mostrar resultado del pre-screen si existe
```

Adapta nombres exactos a los que ya use el repo. Si los componentes no están en `components/` sino dentro de cada `pages/`, sigue esa convención.

---

## 7. Criterios de aceptación

1. Migración SQL aplicada limpiamente. `select prescreen_template from vacantes limit 1` regresa el default vacío.
2. Crear una vacante nueva con 3 competencias guarda el JSON correctamente.
3. Botón "Pre-screen" ya no está deshabilitado. Al hacer click abre el modal con los 4 bloques.
4. El bloque 3 muestra exactamente las competencias de la vacante actual.
5. Las estrellas funcionan, el total se recalcula en vivo, la decisión cambia según los umbrales.
6. Guardar evaluación persiste en `candidatos` y refleja el cambio al recargar la página.
7. Si el candidato estaba en etapa `'Aplicó'`, pasa a `'Pre-screen'` tras guardar.
8. Botón "Descargar plantilla" baja un `.xlsx` renombrado correctamente.
9. Subir un Excel lo guarda en Storage y aparece en la lista de adjuntos de esa vacante.
10. Descargar y eliminar un adjunto funcionan.
11. `npm run spellcheck` pasa.
12. `npm run build` pasa sin warnings nuevos.
13. UI consistente con los estilos existentes (objetos JS en línea, clases globales `card/btn/badge`).

---

## 8. Antes de codear (pre-vuelo)

1. Clonar el repo si no está. `npm install`. Confirmar que `npm run dev` arranca y que `.env` tiene `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
2. Leer (`grep` / `cat`):
   - El componente que tiene el botón "Pre-screen" deshabilitado (probablemente en `pages/PipelinePage.jsx` o `pages/CandidatoPage.jsx`).
   - El modal de crear vacante (`pages/VacantesPage.jsx` o similar).
   - `src/services/vacantesService.js` y `candidatosService.js` completos para imitar estilo.
   - `src/index.css` para conocer las clases globales disponibles.
3. **Listar a Gustavo los archivos exactos que vas a modificar y los que vas a crear, antes de tocarlos.** Esperar OK.
4. **Resolver la duda de §4.6** (valor `'Débil'` o colapsar a `'No Apto'`).
5. **Confirmar que el bucket `templates` ya existe en Supabase y que está subido `LevantamientoPerfil_Template.xlsx`.** Si no, decirle a Gustavo cómo subirlo manualmente desde el dashboard antes de seguir.
6. Crear rama: `git checkout -b feat/prescreen-y-levantamiento`.

**Orden de implementación recomendado** (de menos riesgo a más):
1. Migración SQL.
2. Servicio `vacantesAdjuntosService.js` + botón de descarga del template (no toca nada existente).
3. Subida y lista de adjuntos.
4. Editor de competencias en el modal de crear vacante.
5. PrescreenModal habilitado y conectado.
6. Cálculo de score + actualización de etapa/decisión al guardar.

Commits por paso, no uno gigante.

---

## 9. Tono al hablar con Gustavo

- Directo, sin disclaimers, sin "como modelo de lenguaje…".
- Una sola pregunta concreta cuando haya ambigüedad. Nada de listas de 10 preguntas.
- Reportes en bullets cortos. Al terminar cada paso: link al commit, qué probar, cómo probarlo.
- Si rompes algo, dilo de una vez con el error completo. No minimices.

---

**Fin del system prompt.**
