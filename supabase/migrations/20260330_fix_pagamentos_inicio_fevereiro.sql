-- ============================================================
-- MIGRAÇÃO: Remover pagamentos anteriores a fevereiro de 2026
-- Pagamentos válidos: a partir de fevereiro/2026 (mes >= 2)
-- Execute no Supabase Dashboard → SQL Editor
-- ============================================================

-- Apaga pagamentos registrados antes de fevereiro/2026
DELETE FROM public.pagamentos
WHERE (ano < 2026) OR (ano = 2026 AND mes < 2);

-- Confirmar o resultado
SELECT COUNT(*) AS total_restantes,
       MIN(mes) AS mes_mais_antigo,
       MIN(ano) AS ano_mais_antigo
FROM public.pagamentos;
