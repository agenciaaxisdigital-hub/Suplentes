CREATE TABLE public.pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  suplente_id UUID NOT NULL REFERENCES public.suplentes(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL,
  categoria TEXT NOT NULL CHECK (categoria IN ('retirada', 'plotagem', 'liderancas', 'fiscais', 'outro')),
  valor NUMERIC(12,2) NOT NULL DEFAULT 0,
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read pagamentos" ON public.pagamentos
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert pagamentos" ON public.pagamentos
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update pagamentos" ON public.pagamentos
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete pagamentos" ON public.pagamentos
  FOR DELETE TO authenticated USING (true);

CREATE INDEX idx_pagamentos_suplente ON public.pagamentos(suplente_id);
CREATE INDEX idx_pagamentos_mes_ano ON public.pagamentos(ano, mes);
