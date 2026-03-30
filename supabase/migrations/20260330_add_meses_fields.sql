-- ============================================================
-- MIGRAÇÃO: Adicionar campo de meses para lideranças e admin
-- Execute no Supabase Dashboard → SQL Editor
-- ============================================================

-- Campo "até qual mês" para lideranças (padrão 10 = Outubro)
ALTER TABLE public.liderancas
  ADD COLUMN IF NOT EXISTS retirada_mensal_meses integer DEFAULT 10;

-- Campo "até qual mês" para administrativo (padrão 10 = Outubro)
ALTER TABLE public.administrativo
  ADD COLUMN IF NOT EXISTS valor_contrato_meses integer DEFAULT 10;
