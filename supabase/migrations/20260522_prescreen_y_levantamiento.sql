-- ============================================================
-- Migración: Pre-screen dinámico + adjuntos de vacante
-- Aplicar en: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. Extender vacantes con plantilla de pre-screen
alter table public.vacantes
  add column if not exists prescreen_template jsonb
  default jsonb_build_object('competencias', jsonb_build_array());

-- 2. Extender candidatos con resultados del pre-screen
alter table public.candidatos
  add column if not exists prescreen_scores    jsonb      default '{}'::jsonb,
  add column if not exists prescreen_notas     jsonb      default '{}'::jsonb,
  add column if not exists prescreen_fecha     timestamptz,
  add column if not exists prescreen_entrevistador text;

-- 3. Tabla de adjuntos por vacante
create table if not exists public.vacantes_adjuntos (
  id              bigserial primary key,
  vacante_id      bigint not null references public.vacantes(id) on delete cascade,
  tipo            text not null check (tipo in ('levantamiento_lleno','jd','contrato','otro')),
  nombre_archivo  text not null,
  storage_path    text not null,
  mime_type       text,
  tamano_bytes    bigint,
  subido_por      text,
  created_at      timestamptz not null default now()
);

create index if not exists idx_vacantes_adjuntos_vacante
  on public.vacantes_adjuntos(vacante_id);

-- Verificación rápida (opcional, comentar si no se quiere output)
-- select column_name from information_schema.columns where table_name = 'vacantes' and column_name = 'prescreen_template';
-- select column_name from information_schema.columns where table_name = 'candidatos' and column_name like 'prescreen%';
-- select table_name from information_schema.tables where table_name = 'vacantes_adjuntos';
