-- Fase 12: Portal para clientes — agregar columna de token de acceso
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS portal_token UUID UNIQUE DEFAULT gen_random_uuid();

-- Generar token para clientes existentes
UPDATE clientes SET portal_token = gen_random_uuid() WHERE portal_token IS NULL;
