-- ============================================================
-- MIGRAÇÃO: Expansão do schema para Lideranças e Administrativo
-- Execute no Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Adicionar campos à tabela suplentes
ALTER TABLE public.suplentes
  ADD COLUMN IF NOT EXISTS bairro text,
  ADD COLUMN IF NOT EXISTS numero_urna text;

-- 2. Criar tabela liderancas
CREATE TABLE IF NOT EXISTS public.liderancas (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome                  text NOT NULL,
  cpf                   text,
  regiao                text,
  whatsapp              text,
  rede_social           text,
  ligacao_politica      text,
  retirada_mensal_valor numeric DEFAULT 0,
  chave_pix             text,
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- 3. Criar tabela administrativo
CREATE TABLE IF NOT EXISTS public.administrativo (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            text NOT NULL,
  cpf             text,
  whatsapp        text,
  valor_contrato  numeric DEFAULT 0,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- 4. Estender tabela pagamentos para suportar os 3 tipos
ALTER TABLE public.pagamentos
  ADD COLUMN IF NOT EXISTS lideranca_id uuid REFERENCES public.liderancas(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS admin_id     uuid REFERENCES public.administrativo(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS tipo_pessoa  text DEFAULT 'suplente';

-- Tornar suplente_id opcional (era NOT NULL implícito)
ALTER TABLE public.pagamentos
  ALTER COLUMN suplente_id DROP NOT NULL;

-- 5. RLS: permitir acesso autenticado (mesma política das outras tabelas)
ALTER TABLE public.liderancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.administrativo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read liderancas"
  ON public.liderancas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert liderancas"
  ON public.liderancas FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update liderancas"
  ON public.liderancas FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete liderancas"
  ON public.liderancas FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated read administrativo"
  ON public.administrativo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert administrativo"
  ON public.administrativo FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Allow authenticated update administrativo"
  ON public.administrativo FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated delete administrativo"
  ON public.administrativo FOR DELETE TO authenticated USING (true);
