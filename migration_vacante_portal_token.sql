-- Agregar portal_token a vacantes para portales por vacante (hiring manager)
ALTER TABLE vacantes ADD COLUMN IF NOT EXISTS portal_token UUID UNIQUE DEFAULT gen_random_uuid();
UPDATE vacantes SET portal_token = gen_random_uuid() WHERE portal_token IS NULL;
