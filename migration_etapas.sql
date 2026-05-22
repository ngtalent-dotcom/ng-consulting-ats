-- Migración: corregir etapa 'Aplico' → 'Aplicó' en candidatos existentes
UPDATE candidatos SET etapa = 'Aplicó' WHERE etapa = 'Aplico';

-- Verificar
SELECT etapa, count(*) FROM candidatos GROUP BY etapa ORDER BY etapa;
