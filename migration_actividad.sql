-- Fase 8: Historial de actividad y notas colaborativas
CREATE TABLE IF NOT EXISTS public.actividad (
  id bigserial PRIMARY KEY,
  candidato_id bigint NOT NULL REFERENCES public.candidatos(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('creacion', 'etapa', 'nota', 'prescreen', 'edicion', 'cv')),
  descripcion text,
  datos jsonb,
  autor text, -- TODO(auth): rellenar con usuario autenticado en Fase 10
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS actividad_candidato_id_idx ON public.actividad(candidato_id);

ALTER TABLE public.actividad ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_actividad" ON public.actividad FOR SELECT TO anon USING (true);
CREATE POLICY "anon_insert_actividad" ON public.actividad FOR INSERT TO anon WITH CHECK (true);
