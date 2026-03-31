-- ============================================================
-- MIGRAÇÃO: Inserir funcionários administrativos
-- Execute no Supabase Dashboard → SQL Editor
-- ============================================================

-- Inserir administrativos novos (ignora se já existir com mesmo nome)
INSERT INTO public.administrativo (nome, valor_contrato, valor_contrato_meses, updated_at)
SELECT * FROM (VALUES
  ('Nuria',         2500, 10, NOW()),
  ('Sindy',         2500, 10, NOW()),
  ('Emival',        2000, 10, NOW()),
  ('Gustavo Gomes', 5000, 10, NOW())
) AS v(nome, valor_contrato, valor_contrato_meses, updated_at)
WHERE NOT EXISTS (
  SELECT 1 FROM public.administrativo a WHERE LOWER(a.nome) = LOWER(v.nome)
);

-- Atualizar PIX/WhatsApp do Gustavo Gomes
UPDATE public.administrativo
SET whatsapp = '62993885258'
WHERE LOWER(nome) = 'gustavo gomes';

-- ============================================================
-- VALIDAÇÃO: Listar todos os suplentes cadastrados
-- ============================================================
SELECT
  nome,
  numero_urna,
  regiao_atuacao,
  partido,
  retirada_mensal_valor,
  retirada_mensal_meses,
  situacao,
  total_votos
FROM public.suplentes
ORDER BY nome;

-- ============================================================
-- VALIDAÇÃO: Listar todas as lideranças cadastradas
-- ============================================================
SELECT
  nome,
  regiao,
  retirada_mensal_valor,
  retirada_mensal_meses,
  chave_pix
FROM public.liderancas
ORDER BY nome;

-- ============================================================
-- VALIDAÇÃO: Listar pagamentos por pessoa (todos os meses)
-- ============================================================
SELECT
  COALESCE(s.nome, l.nome, a.nome) AS pessoa,
  p.tipo_pessoa,
  p.mes,
  p.ano,
  p.categoria,
  p.valor,
  p.observacao,
  p.created_at::date AS data_registro
FROM public.pagamentos p
LEFT JOIN public.suplentes s ON s.id = p.suplente_id
LEFT JOIN public.liderancas l ON l.id = p.lideranca_id
LEFT JOIN public.administrativo a ON a.id = p.admin_id
ORDER BY p.ano, p.mes, pessoa;

-- ============================================================
-- VALIDAÇÃO: Resumo de pagamentos por pessoa e mês
-- ============================================================
SELECT
  COALESCE(s.nome, l.nome, a.nome) AS pessoa,
  p.tipo_pessoa,
  p.mes,
  p.ano,
  SUM(p.valor) AS total_pago
FROM public.pagamentos p
LEFT JOIN public.suplentes s ON s.id = p.suplente_id
LEFT JOIN public.liderancas l ON l.id = p.lideranca_id
LEFT JOIN public.administrativo a ON a.id = p.admin_id
GROUP BY pessoa, p.tipo_pessoa, p.mes, p.ano
ORDER BY p.ano, p.mes, pessoa;
