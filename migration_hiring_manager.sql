-- Fase A: Hiring Manager por vacante
ALTER TABLE vacantes
  ADD COLUMN IF NOT EXISTS hiring_manager TEXT,
  ADD COLUMN IF NOT EXISTS hiring_manager_email TEXT,
  ADD COLUMN IF NOT EXISTS hiring_manager_telefono TEXT;
