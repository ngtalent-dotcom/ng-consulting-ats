-- ================================================================
-- Fase 10: Políticas RLS
-- Reemplaza las políticas "allow all anon" por políticas granulares.
-- anon   → solo puede leer vacantes públicas e insertar candidaturas.
-- authenticated → acceso completo a todo.
-- ================================================================

-- 1. Eliminar todas las políticas existentes en tablas del ATS
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('candidatos', 'vacantes', 'clientes', 'actividad', 'vacantes_adjuntos')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 2. Habilitar RLS en todas las tablas (por si acaso)
ALTER TABLE candidatos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacantes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividad         ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacantes_adjuntos ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- VACANTES
-- anon: solo leer vacantes publicadas y activas (portal /careers)
-- authenticated: acceso completo
-- ================================================================
CREATE POLICY "vacantes_anon_leer_publicas" ON vacantes
  FOR SELECT TO anon
  USING (publicada = true AND estatus = 'Activa');

CREATE POLICY "vacantes_auth_todo" ON vacantes
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ================================================================
-- CANDIDATOS
-- anon: solo insertar (formulario de aplicación del portal /careers)
-- authenticated: acceso completo
-- ================================================================
CREATE POLICY "candidatos_anon_insertar" ON candidatos
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "candidatos_auth_todo" ON candidatos
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ================================================================
-- CLIENTES — solo authenticated
-- ================================================================
CREATE POLICY "clientes_auth_todo" ON clientes
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ================================================================
-- ACTIVIDAD — solo authenticated
-- ================================================================
CREATE POLICY "actividad_auth_todo" ON actividad
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ================================================================
-- VACANTES_ADJUNTOS — solo authenticated
-- ================================================================
CREATE POLICY "vacantes_adjuntos_auth_todo" ON vacantes_adjuntos
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ================================================================
-- STORAGE: bucket 'cvs'
-- anon: puede subir CVs (formulario del portal /careers)
-- authenticated: acceso completo
-- public: puede leer (URLs públicas para descargar CVs en el ATS)
-- ================================================================
DROP POLICY IF EXISTS "cvs_publico_leer"  ON storage.objects;
DROP POLICY IF EXISTS "cvs_anon_subir"    ON storage.objects;
DROP POLICY IF EXISTS "cvs_auth_todo"     ON storage.objects;

CREATE POLICY "cvs_publico_leer" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'cvs');

CREATE POLICY "cvs_anon_subir" ON storage.objects
  FOR INSERT TO anon
  WITH CHECK (bucket_id = 'cvs');

CREATE POLICY "cvs_auth_todo" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'cvs') WITH CHECK (bucket_id = 'cvs');
