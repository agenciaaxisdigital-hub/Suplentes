
CREATE TABLE public.suplentes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  regiao_atuacao TEXT,
  telefone TEXT,
  cargo_disputado TEXT DEFAULT 'Vereador',
  ano_eleicao INTEGER DEFAULT 2024,
  partido TEXT,
  situacao TEXT DEFAULT 'Suplente',
  total_votos INTEGER DEFAULT 0,
  expectativa_votos INTEGER DEFAULT 0,
  base_politica TEXT,
  
  -- Valores financeiros
  retirada_mensal_valor NUMERIC(12,2) DEFAULT 3000,
  retirada_mensal_meses INTEGER DEFAULT 6,
  
  plotagem_qtd INTEGER DEFAULT 0,
  plotagem_valor_unit NUMERIC(12,2) DEFAULT 250,
  
  liderancas_qtd INTEGER DEFAULT 0,
  liderancas_valor_unit NUMERIC(12,2) DEFAULT 1622,
  
  fiscais_qtd INTEGER DEFAULT 0,
  fiscais_valor_unit NUMERIC(12,2) DEFAULT 110,
  
  total_campanha NUMERIC(12,2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.suplentes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read" ON public.suplentes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert" ON public.suplentes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update" ON public.suplentes
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete" ON public.suplentes
  FOR DELETE TO authenticated USING (true);
