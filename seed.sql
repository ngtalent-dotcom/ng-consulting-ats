-- ============================================================
-- N&G Talent Consulting ATS — Seed Data
-- Ejecutar en Supabase SQL Editor DESPUES de crear el schema
-- ============================================================

-- 1. CLIENTES
INSERT INTO clientes (nombre, industria, contacto, email, telefono) VALUES
  ('Grupo Didiamant',   'Joyeria y Retail',       'Rodrigo Espinoza', 'r.espinoza@didiamant.com', '81 1234 5678'),
  ('Coppel Monterrey',  'Retail y Finanzas',       'Sandra Morales',   's.morales@coppel.com',     '81 2345 6789'),
  ('Ternium Mexico',    'Manufactura / Acero',     'Luis Ramirez',     'l.ramirez@ternium.com',    '81 3456 7890');

-- 2. VACANTES (referenciando clientes por posicion en el INSERT anterior)
-- Nota: los IDs se generan automaticamente (identity). Usamos subqueries para evitar hardcodear IDs.

INSERT INTO vacantes (cliente_id, titulo, area, nivel, modalidad, ciudad, salario_min, salario_max, fecha_apertura, estatus, prioridad, publicada) VALUES
  ((SELECT id FROM clientes WHERE nombre = 'Grupo Didiamant'),  'Ejecutivo de Ventas',    'Ventas',      'Senior',      'Presencial', 'Monterrey, NL',    25000, 35000, '2026-04-15', 'Activa', 'Alta',  true),
  ((SELECT id FROM clientes WHERE nombre = 'Grupo Didiamant'),  'Gerente de Tienda',      'Operaciones', 'Gerencial',   'Presencial', 'Monterrey, NL',    30000, 45000, '2026-05-01', 'Activa', 'Media', true),
  ((SELECT id FROM clientes WHERE nombre = 'Coppel Monterrey'), 'Analista de Credito',    'Finanzas',    'Junior',      'Hibrido',    'Monterrey, NL',    15000, 22000, '2026-05-10', 'Activa', 'Alta',  true),
  ((SELECT id FROM clientes WHERE nombre = 'Ternium Mexico'),   'Ingeniero de Procesos',  'Ingenieria',  'Semi-Senior', 'Presencial', 'San Nicolas, NL',  28000, 38000, '2026-05-05', 'Activa', 'Media', true);

-- 3. CANDIDATOS
INSERT INTO candidatos (vacante_id, nombre, apellido, email, telefono, fuente, etapa, score, decision, notas, created_at) VALUES
-- Vacante 1: Ejecutivo de Ventas / Didiamant
  ((SELECT id FROM vacantes WHERE titulo = 'Ejecutivo de Ventas'),   'Carlos',    'Mendoza',    'carlos.m@gmail.com',     '81 1111 2222', 'LinkedIn',    'Aplico',              NULL, NULL,                   '',                                                  '2026-04-16 10:00:00+00'),
  ((SELECT id FROM vacantes WHERE titulo = 'Ejecutivo de Ventas'),   'Ana',       'Torres',     'ana.torres@hotmail.com', '81 2222 3333', 'LinkedIn',    'Pre-screen',           NULL, 'Viable con reservas',  '3 anos en ventas de retail. Buen perfil inicial.',   '2026-04-17 10:00:00+00'),
  ((SELECT id FROM vacantes WHERE titulo = 'Ejecutivo de Ventas'),   'Luis',      'Garza',      'luis.garza@outlook.com', '81 3333 4444', 'Referido',    'Entrevista Cliente',   NULL, 'Fuerte',               '5 anos en ventas B2B. Muy solido, recomienda su ex jefe.', '2026-04-18 10:00:00+00'),
  ((SELECT id FROM vacantes WHERE titulo = 'Ejecutivo de Ventas'),   'Monica',    'Reyes',      'mreyes@gmail.com',       '81 4444 5555', 'OCC Mundial', 'Oferta',               NULL, 'Fuerte',               'Finalista. Propuesta enviada, esperando respuesta.',  '2026-04-19 10:00:00+00'),
  ((SELECT id FROM vacantes WHERE titulo = 'Ejecutivo de Ventas'),   'Roberto',   'Leal',       'rleal@gmail.com',        '81 5555 6666', 'Indeed',      'Rechazado',            NULL, 'No Apto',              'Poca experiencia en ventas consultivas.',             '2026-04-20 10:00:00+00'),

-- Vacante 2: Gerente de Tienda / Didiamant
  ((SELECT id FROM vacantes WHERE titulo = 'Gerente de Tienda'),     'Patricia',  'Sanchez',    'paty.sanchez@gmail.com', '81 3344 5566', 'LinkedIn',    'Pre-screen',           NULL, 'Viable con reservas',  '8 anos en retail, lidero equipos de hasta 15 personas.', '2026-05-03 10:00:00+00'),
  ((SELECT id FROM vacantes WHERE titulo = 'Gerente de Tienda'),     'Hector',    'Vazquez',    'hector.v@hotmail.com',   '81 7788 9900', 'Referido',    'Aplico',               NULL, 'Pendiente',            '',                                                   '2026-05-10 10:00:00+00'),
  ((SELECT id FROM vacantes WHERE titulo = 'Gerente de Tienda'),     'Gabriela',  'Luna',       'gaby.luna@gmail.com',    '81 1122 3344', 'OCC Mundial', 'Entrevista Cliente',   NULL, 'Fuerte',               'Perfil solido. Gerente de tienda Zara por 4 anos.',   '2026-05-04 10:00:00+00'),

-- Vacante 3: Analista de Credito / Coppel
  ((SELECT id FROM vacantes WHERE titulo = 'Analista de Credito'),   'Jorge',     'Pena',       'jorge.pena@gmail.com',   '81 4455 6677', 'LinkedIn',    'Pre-screen',           NULL, 'Viable con reservas',  'Recien egresado con practicas en BBVA.',              '2026-05-12 10:00:00+00'),
  ((SELECT id FROM vacantes WHERE titulo = 'Analista de Credito'),   'Sofia',     'Hernandez',  'sofia.hdz@outlook.com',  '81 8899 0011', 'Indeed',      'Aplico',               NULL, 'Pendiente',            '',                                                   '2026-05-18 10:00:00+00'),
  ((SELECT id FROM vacantes WHERE titulo = 'Analista de Credito'),   'Fernanda',  'Rios',       'fer.rios@gmail.com',     '81 2211 3322', 'Referido',    'Entrevista Cliente',   NULL, 'Fuerte',               '2 anos en analisis de credito en Banorte.',           '2026-05-11 10:00:00+00'),
  ((SELECT id FROM vacantes WHERE titulo = 'Analista de Credito'),   'Manuel',    'Ortega',     'manuel.o@gmail.com',     '81 6655 4433', 'OCC Mundial', 'Rechazado',            NULL, 'No Apto',              'No cumple con el perfil tecnico.',                   '2026-05-13 10:00:00+00'),

-- Vacante 4: Ingeniero de Procesos / Ternium
  ((SELECT id FROM vacantes WHERE titulo = 'Ingeniero de Procesos'), 'Ricardo',   'Castro',     'ricardo.c@gmail.com',    '81 9900 1122', 'LinkedIn',    'Entrevista Cliente',   NULL, 'Fuerte',               'Ingeniero Industrial con 5 anos en manufactura. Muy solido.', '2026-05-07 10:00:00+00'),
  ((SELECT id FROM vacantes WHERE titulo = 'Ingeniero de Procesos'), 'Valeria',   'Moreno',     'valeria.m@hotmail.com',  '81 3322 1100', 'Referido',    'Pre-screen',           NULL, 'Viable con reservas',  'Experiencia en Vitro. Buena candidata.',              '2026-05-09 10:00:00+00'),
  ((SELECT id FROM vacantes WHERE titulo = 'Ingeniero de Procesos'), 'Ivan',      'Guerrero',   'ivan.g@gmail.com',       '81 5544 3322', 'Indeed',      'Aplico',               NULL, 'Pendiente',            '',                                                   '2026-05-20 10:00:00+00');
