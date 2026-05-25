-- Fix completo de RLS en candidatos
-- Primero verificar estado actual (ejecutar por separado si se quiere diagnostico):
-- SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'candidatos';

-- Paso 1: asegurar que RLS este habilitado
ALTER TABLE candidatos ENABLE ROW LEVEL SECURITY;

-- Paso 2: eliminar TODAS las politicas existentes de candidatos
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'candidatos' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON candidatos', r.policyname);
  END LOOP;
END $$;

-- Paso 3: recrear politicas correctamente

-- Usuarios autenticados (ATS interno): acceso total
CREATE POLICY "auth_all_candidatos" ON candidatos
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Usuarios anonimos (portal de careers): solo pueden insertar su candidatura
CREATE POLICY "anon_insert_candidatos" ON candidatos
  FOR INSERT TO anon
  WITH CHECK (true);
