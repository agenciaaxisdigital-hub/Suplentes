-- ============================================================
-- MIGRAÇÃO: Cadastro completo da lista de 67 pessoas
-- Lideranças + Suplentes + Pagamentos já realizados
-- Execute no Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. LIDERANÇAS ─────────────────────────────────────────────────────────────
INSERT INTO public.liderancas (nome, regiao, retirada_mensal_valor, retirada_mensal_meses, chave_pix, updated_at)
SELECT nome, regiao, valor, meses, pix, NOW()
FROM (VALUES
  ('Rony',                         'Rosa dos Ventos / Miramar',                       2500,  10, NULL),
  ('Afonso',                       'Rosa dos Ventos',                                 1621,  10, NULL),
  ('Renato',                       'Rosa dos Ventos',                                 1000,  10, NULL),
  ('Genailton',                    'Montreal / Planície',                             2000,  10, NULL),
  ('Bebezão',                      'Rosa dos Ventos',                                 1680,  10, NULL),
  ('Clodoaldo',                    'Vila Souza',                                      2000,  10, NULL),
  ('Wesley',                       'Rosa dos Ventos / Miramar',                       2500,  10, NULL),
  ('Vitor',                        'Miramar',                                         1621,  10, NULL),
  ('Edenilson Gaspar Neguinho',    'Int. Park / Casa Grande / Jard. Repouso',         1630,  10, NULL),
  ('Arlindo Prés. Assoc.',         'Miramar',                                         1000,  10, NULL),
  ('Marcivanio Prés. Assoc.',      'Rosa dos Ventos',                                 2000,  10, NULL),
  ('Cleber Camilo',                'Tiradentes',                                      2000,  10, NULL),
  ('Meg',                          'Sindspag',                                        2000,  10, NULL),
  ('Rocha',                        'Sindspag',                                        2000,  10, NULL),
  ('Eliazar',                      'Miramar',                                         1000,  10, NULL)
) AS v(nome, regiao, valor, meses, pix)
WHERE NOT EXISTS (
  SELECT 1 FROM public.liderancas l WHERE LOWER(TRIM(l.nome)) = LOWER(TRIM(v.nome))
);

-- ── 2. SUPLENTES ──────────────────────────────────────────────────────────────
INSERT INTO public.suplentes (nome, regiao_atuacao, retirada_mensal_valor, retirada_mensal_meses, telefone, observacoes_gerais, updated_at)
SELECT nome, regiao, valor, meses, tel, obs, NOW()
FROM (VALUES
  ('Alarcon',               'Rosa dos Ventos',                           2300, 10, NULL,           NULL),
  ('Silvino da Saúde',      'Serra Dourada',                             3000, 10, NULL,           '40 litros/mês. CPF: 765.850.341-04'),
  ('Robercy',               'Montreal / Nova Olinda',                    3000, 10, NULL,           '+Carro'),
  ('Léo do Povão',          'Retiro do Bosque / Nova Olinda',            3000, 10, '62993098975',  'PIX: 62993098975'),
  ('Roberto Marques',       'Vila Brasília / Santo Antônio',             3000, 10, NULL,           '40 litros/mês'),
  ('Aloízio',               'Sítio Santa Luzia / Tocantins',             3000, 10, NULL,           NULL),
  ('Peterson',              'Park Trindade',                             3000, 10, '62981557083',  '40 litros/mês. PIX: 62981557083'),
  ('Clevis',                'Park Trindade',                             3000, 10, NULL,           '40 litros/mês'),
  ('Pr. Wendel',            'Itaipu',                                    3000, 10, NULL,           NULL),
  ('Júnior Buiu',           'Jardim Olímpico',                           2000, 10, NULL,           NULL),
  ('Clóves Esquinão',       'Sítio Santa Luzia',                         2000, 10, NULL,           NULL),
  ('Dona Dina',             'Buriti Sereno',                             1650, 10, NULL,           NULL),
  ('Hélio Lanterneiro',     'Santa Luzia',                               2000, 10, NULL,           NULL),
  ('Bete do Povo',          'Delfyore',                                  1000, 10, NULL,           NULL),
  ('Celina do Postinho',    'Santa Luzia',                               1650, 10, NULL,           NULL),
  ('Dison da Feira',        'Independência',                             2000, 10, NULL,           NULL),
  ('Rogério Trator',        'Santa Cecília',                             2000, 10, NULL,           '40 litros/mês'),
  ('Leonardo Mussarela',    'Jardim Olímpico',                           1650, 10, '62993334203',  '20 litros/mês'),
  ('Leomar Gomes',          'Park Santa Cecília',                        2000, 10, '62992062179',  'PIX: 62992062179'),
  ('Soldado Souza',         'Vila Alzira',                               3000, 10, NULL,           '40 litros/mês'),
  ('Matheus da UBS',        'Centro',                                    2000, 10, NULL,           NULL),
  ('Silvana',               'Independência',                              800, 10, NULL,           NULL),
  ('Hernandes',             'Buriti Sereno',                             3000, 10, NULL,           NULL),
  ('Catarino',              'Jardim Ipiranga',                           2000, 10, NULL,           NULL),
  ('Cezar Goiás',           'Estrela do Sul',                            2000, 10, NULL,           NULL),
  ('Enfermeira Jô',         'Village Garavelo',                         1600, 10, NULL,           NULL),
  ('Azevedo GCM',           'Tiradentes',                                2000, 10, NULL,           NULL),
  ('Alexandre',             'Centro',                                    3000, 10, NULL,           'PIX: 770.690.481-49'),
  ('Reginaldo Bastos',      'Impediência Mansões',                       1650, 10, NULL,           NULL),
  ('Marlene',               'Retiro do Bosque',                           800, 10, NULL,           NULL),
  ('Joana Dark',            'Alto da Boavista',                          1650, 10, NULL,           NULL),
  ('Ananias',               'Expansul',                                  2000, 10, NULL,           NULL),
  ('Daniel Neves',          'Chácara São Pedro',                         3000, 10, NULL,           NULL),
  ('Joel',                  'Pindorama',                                 1000, 10, NULL,           NULL),
  ('Bahiano do Gás',        'Expansul',                                  2000, 10, NULL,           NULL),
  ('Selso Moreno',          'Vila Brasília',                             2000, 10, NULL,           NULL),
  ('Sérgio Borges Tuti',    'Expansul',                                  3000, 10, NULL,           NULL),
  ('Leocimar',              'Park Industrial Santo Antônio',             1000, 10, NULL,           NULL),
  ('Jorge Pereira',         'Santa Luzia',                               2000, 10, NULL,           NULL),
  ('Leandro Fabiano',       'Vera Cruz / Bairro Cardoso',                3000, 10, NULL,           NULL),
  ('Valdeson Pantera',      'Vila Brasília',                             2000, 10, NULL,           NULL),
  ('Helder Gonçalves',      'Quinta da Boa Vista',                       1650, 10, NULL,           'Pr. Eduardo'),
  ('Leandro Fabino',        'Cidade Vera Cruz',                          3000, 10, NULL,           NULL),
  ('Livia Cruz',            'Alto Paraíso',                              1000, 10, NULL,           NULL),
  ('Guida',                 'Terra do Sol',                              1000, 10, NULL,           NULL),
  ('Ediane',                'Jardim Bela Morada',                         800, 10, NULL,           NULL),
  ('Geisa',                 'Aparecida Garden',                           800, 10, NULL,           NULL),
  ('W Nilson',              'Centro',                                    3000, 10, NULL,           NULL)
) AS v(nome, regiao, valor, meses, tel, obs)
WHERE NOT EXISTS (
  SELECT 1 FROM public.suplentes s WHERE LOWER(TRIM(s.nome)) = LOWER(TRIM(v.nome))
);

-- ── 3. PAGAMENTOS DAS LIDERANÇAS ──────────────────────────────────────────────
-- Rony: Fev + Mar
INSERT INTO public.pagamentos (tipo_pessoa, lideranca_id, mes, ano, categoria, valor, observacao)
SELECT 'lideranca', l.id, v.mes, 2026, 'retirada', l.retirada_mensal_valor, 'Pagamento em lote'
FROM public.liderancas l
CROSS JOIN (VALUES (2),(3)) AS v(mes)
WHERE LOWER(TRIM(l.nome)) = 'rony'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.lideranca_id = l.id AND p.mes = v.mes AND p.ano = 2026
  );

-- Afonso: Fev + Mar
INSERT INTO public.pagamentos (tipo_pessoa, lideranca_id, mes, ano, categoria, valor, observacao)
SELECT 'lideranca', l.id, v.mes, 2026, 'retirada', l.retirada_mensal_valor, 'Pagamento em lote'
FROM public.liderancas l
CROSS JOIN (VALUES (2),(3)) AS v(mes)
WHERE LOWER(TRIM(l.nome)) = 'afonso'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.lideranca_id = l.id AND p.mes = v.mes AND p.ano = 2026
  );

-- Renato: Fev + Mar
INSERT INTO public.pagamentos (tipo_pessoa, lideranca_id, mes, ano, categoria, valor, observacao)
SELECT 'lideranca', l.id, v.mes, 2026, 'retirada', l.retirada_mensal_valor, 'Pagamento em lote'
FROM public.liderancas l
CROSS JOIN (VALUES (2),(3)) AS v(mes)
WHERE LOWER(TRIM(l.nome)) = 'renato'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.lideranca_id = l.id AND p.mes = v.mes AND p.ano = 2026
  );

-- Wesley: Fev + Mar
INSERT INTO public.pagamentos (tipo_pessoa, lideranca_id, mes, ano, categoria, valor, observacao)
SELECT 'lideranca', l.id, v.mes, 2026, 'retirada', l.retirada_mensal_valor, 'Pagamento em lote'
FROM public.liderancas l
CROSS JOIN (VALUES (2),(3)) AS v(mes)
WHERE LOWER(TRIM(l.nome)) = 'wesley'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.lideranca_id = l.id AND p.mes = v.mes AND p.ano = 2026
  );

-- Bebezão: Fev + Mar + Abr
INSERT INTO public.pagamentos (tipo_pessoa, lideranca_id, mes, ano, categoria, valor, observacao)
SELECT 'lideranca', l.id, v.mes, 2026, 'retirada', l.retirada_mensal_valor, 'Pagamento em lote'
FROM public.liderancas l
CROSS JOIN (VALUES (2),(3),(4)) AS v(mes)
WHERE LOWER(TRIM(l.nome)) = 'bebezão'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.lideranca_id = l.id AND p.mes = v.mes AND p.ano = 2026
  );

-- Genailton: Mar
INSERT INTO public.pagamentos (tipo_pessoa, lideranca_id, mes, ano, categoria, valor, observacao)
SELECT 'lideranca', l.id, 3, 2026, 'retirada', l.retirada_mensal_valor, 'Pagamento em lote'
FROM public.liderancas l
WHERE LOWER(TRIM(l.nome)) = 'genailton'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.lideranca_id = l.id AND p.mes = 3 AND p.ano = 2026
  );

-- Clodoaldo: Mar
INSERT INTO public.pagamentos (tipo_pessoa, lideranca_id, mes, ano, categoria, valor, observacao)
SELECT 'lideranca', l.id, 3, 2026, 'retirada', l.retirada_mensal_valor, 'Pagamento em lote'
FROM public.liderancas l
WHERE LOWER(TRIM(l.nome)) = 'clodoaldo'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.lideranca_id = l.id AND p.mes = 3 AND p.ano = 2026
  );

-- Vitor: Mar
INSERT INTO public.pagamentos (tipo_pessoa, lideranca_id, mes, ano, categoria, valor, observacao)
SELECT 'lideranca', l.id, 3, 2026, 'retirada', l.retirada_mensal_valor, 'Pagamento em lote'
FROM public.liderancas l
WHERE LOWER(TRIM(l.nome)) = 'vitor'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.lideranca_id = l.id AND p.mes = 3 AND p.ano = 2026
  );

-- Edenilson Gaspar Neguinho: Mar + Abr
INSERT INTO public.pagamentos (tipo_pessoa, lideranca_id, mes, ano, categoria, valor, observacao)
SELECT 'lideranca', l.id, v.mes, 2026, 'retirada', l.retirada_mensal_valor, 'Pagamento em lote'
FROM public.liderancas l
CROSS JOIN (VALUES (3),(4)) AS v(mes)
WHERE LOWER(TRIM(l.nome)) = 'edenilson gaspar neguinho'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.lideranca_id = l.id AND p.mes = v.mes AND p.ano = 2026
  );

-- Arlindo: Mar
INSERT INTO public.pagamentos (tipo_pessoa, lideranca_id, mes, ano, categoria, valor, observacao)
SELECT 'lideranca', l.id, 3, 2026, 'retirada', l.retirada_mensal_valor, 'Pagamento em lote'
FROM public.liderancas l
WHERE LOWER(TRIM(l.nome)) = 'arlindo prés. assoc.'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.lideranca_id = l.id AND p.mes = 3 AND p.ano = 2026
  );

-- Marcivanio: Mar
INSERT INTO public.pagamentos (tipo_pessoa, lideranca_id, mes, ano, categoria, valor, observacao)
SELECT 'lideranca', l.id, 3, 2026, 'retirada', l.retirada_mensal_valor, 'Pagamento em lote'
FROM public.liderancas l
WHERE LOWER(TRIM(l.nome)) = 'marcivanio prés. assoc.'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.lideranca_id = l.id AND p.mes = 3 AND p.ano = 2026
  );

-- ── 4. PAGAMENTOS DOS SUPLENTES ───────────────────────────────────────────────
-- Alarcon: Fev
INSERT INTO public.pagamentos (tipo_pessoa, suplente_id, mes, ano, categoria, valor, observacao)
SELECT 'suplente', s.id, 2, 2026, 'retirada', s.retirada_mensal_valor, 'Pagamento em lote'
FROM public.suplentes s
WHERE LOWER(TRIM(s.nome)) = 'alarcon'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.suplente_id = s.id AND p.mes = 2 AND p.ano = 2026 AND p.categoria = 'retirada'
  );

-- Léo do Povão: Fev + Mar
INSERT INTO public.pagamentos (tipo_pessoa, suplente_id, mes, ano, categoria, valor, observacao)
SELECT 'suplente', s.id, v.mes, 2026, 'retirada', s.retirada_mensal_valor, 'Pagamento em lote'
FROM public.suplentes s
CROSS JOIN (VALUES (2),(3)) AS v(mes)
WHERE LOWER(TRIM(s.nome)) = 'léo do povão'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.suplente_id = s.id AND p.mes = v.mes AND p.ano = 2026 AND p.categoria = 'retirada'
  );

-- Silvino da Saúde: Mar
INSERT INTO public.pagamentos (tipo_pessoa, suplente_id, mes, ano, categoria, valor, observacao)
SELECT 'suplente', s.id, 3, 2026, 'retirada', s.retirada_mensal_valor, 'Pagamento em lote'
FROM public.suplentes s
WHERE LOWER(TRIM(s.nome)) = 'silvino da saúde'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.suplente_id = s.id AND p.mes = 3 AND p.ano = 2026 AND p.categoria = 'retirada'
  );

-- Robercy: Mar
INSERT INTO public.pagamentos (tipo_pessoa, suplente_id, mes, ano, categoria, valor, observacao)
SELECT 'suplente', s.id, 3, 2026, 'retirada', s.retirada_mensal_valor, 'Pagamento em lote'
FROM public.suplentes s
WHERE LOWER(TRIM(s.nome)) = 'robercy'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.suplente_id = s.id AND p.mes = 3 AND p.ano = 2026 AND p.categoria = 'retirada'
  );

-- Roberto Marques: Mar
INSERT INTO public.pagamentos (tipo_pessoa, suplente_id, mes, ano, categoria, valor, observacao)
SELECT 'suplente', s.id, 3, 2026, 'retirada', s.retirada_mensal_valor, 'Pagamento em lote'
FROM public.suplentes s
WHERE LOWER(TRIM(s.nome)) = 'roberto marques'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.suplente_id = s.id AND p.mes = 3 AND p.ano = 2026 AND p.categoria = 'retirada'
  );

-- Aloízio: Mar
INSERT INTO public.pagamentos (tipo_pessoa, suplente_id, mes, ano, categoria, valor, observacao)
SELECT 'suplente', s.id, 3, 2026, 'retirada', s.retirada_mensal_valor, 'Pagamento em lote'
FROM public.suplentes s
WHERE LOWER(TRIM(s.nome)) = 'aloízio'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.suplente_id = s.id AND p.mes = 3 AND p.ano = 2026 AND p.categoria = 'retirada'
  );

-- Peterson: Mar
INSERT INTO public.pagamentos (tipo_pessoa, suplente_id, mes, ano, categoria, valor, observacao)
SELECT 'suplente', s.id, 3, 2026, 'retirada', s.retirada_mensal_valor, 'Pagamento em lote'
FROM public.suplentes s
WHERE LOWER(TRIM(s.nome)) = 'peterson'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.suplente_id = s.id AND p.mes = 3 AND p.ano = 2026 AND p.categoria = 'retirada'
  );

-- Clevis: Mar
INSERT INTO public.pagamentos (tipo_pessoa, suplente_id, mes, ano, categoria, valor, observacao)
SELECT 'suplente', s.id, 3, 2026, 'retirada', s.retirada_mensal_valor, 'Pagamento em lote'
FROM public.suplentes s
WHERE LOWER(TRIM(s.nome)) = 'clevis'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.suplente_id = s.id AND p.mes = 3 AND p.ano = 2026 AND p.categoria = 'retirada'
  );

-- Pr. Wendel: Mar + Abr
INSERT INTO public.pagamentos (tipo_pessoa, suplente_id, mes, ano, categoria, valor, observacao)
SELECT 'suplente', s.id, v.mes, 2026, 'retirada', s.retirada_mensal_valor, 'Pagamento em lote'
FROM public.suplentes s
CROSS JOIN (VALUES (3),(4)) AS v(mes)
WHERE LOWER(TRIM(s.nome)) = 'pr. wendel'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.suplente_id = s.id AND p.mes = v.mes AND p.ano = 2026 AND p.categoria = 'retirada'
  );

-- Júnior Buiu: Mar
INSERT INTO public.pagamentos (tipo_pessoa, suplente_id, mes, ano, categoria, valor, observacao)
SELECT 'suplente', s.id, 3, 2026, 'retirada', s.retirada_mensal_valor, 'Pagamento em lote'
FROM public.suplentes s
WHERE LOWER(TRIM(s.nome)) = 'júnior buiu'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.suplente_id = s.id AND p.mes = 3 AND p.ano = 2026 AND p.categoria = 'retirada'
  );

-- Clóves Esquinão: Mar
INSERT INTO public.pagamentos (tipo_pessoa, suplente_id, mes, ano, categoria, valor, observacao)
SELECT 'suplente', s.id, 3, 2026, 'retirada', s.retirada_mensal_valor, 'Pagamento em lote'
FROM public.suplentes s
WHERE LOWER(TRIM(s.nome)) = 'clóves esquinão'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.suplente_id = s.id AND p.mes = 3 AND p.ano = 2026 AND p.categoria = 'retirada'
  );

-- Hélio Lanterneiro: Mar
INSERT INTO public.pagamentos (tipo_pessoa, suplente_id, mes, ano, categoria, valor, observacao)
SELECT 'suplente', s.id, 3, 2026, 'retirada', s.retirada_mensal_valor, 'Pagamento em lote'
FROM public.suplentes s
WHERE LOWER(TRIM(s.nome)) = 'hélio lanterneiro'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.suplente_id = s.id AND p.mes = 3 AND p.ano = 2026 AND p.categoria = 'retirada'
  );

-- Dison da Feira: Mar
INSERT INTO public.pagamentos (tipo_pessoa, suplente_id, mes, ano, categoria, valor, observacao)
SELECT 'suplente', s.id, 3, 2026, 'retirada', s.retirada_mensal_valor, 'Pagamento em lote'
FROM public.suplentes s
WHERE LOWER(TRIM(s.nome)) = 'dison da feira'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.suplente_id = s.id AND p.mes = 3 AND p.ano = 2026 AND p.categoria = 'retirada'
  );

-- Rogério Trator: Mar
INSERT INTO public.pagamentos (tipo_pessoa, suplente_id, mes, ano, categoria, valor, observacao)
SELECT 'suplente', s.id, 3, 2026, 'retirada', s.retirada_mensal_valor, 'Pagamento em lote'
FROM public.suplentes s
WHERE LOWER(TRIM(s.nome)) = 'rogério trator'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.suplente_id = s.id AND p.mes = 3 AND p.ano = 2026 AND p.categoria = 'retirada'
  );

-- Valdeson Pantera: Abr
INSERT INTO public.pagamentos (tipo_pessoa, suplente_id, mes, ano, categoria, valor, observacao)
SELECT 'suplente', s.id, 4, 2026, 'retirada', s.retirada_mensal_valor, 'Pagamento em lote'
FROM public.suplentes s
WHERE LOWER(TRIM(s.nome)) = 'valdeson pantera'
  AND NOT EXISTS (
    SELECT 1 FROM public.pagamentos p WHERE p.suplente_id = s.id AND p.mes = 4 AND p.ano = 2026 AND p.categoria = 'retirada'
  );

-- ── 5. VERIFICAÇÃO FINAL ──────────────────────────────────────────────────────
SELECT 'LIDERANCAS' AS tabela, COUNT(*) AS total FROM public.liderancas
UNION ALL
SELECT 'SUPLENTES', COUNT(*) FROM public.suplentes
UNION ALL
SELECT 'ADMINISTRATIVO', COUNT(*) FROM public.administrativo
UNION ALL
SELECT 'PAGAMENTOS', COUNT(*) FROM public.pagamentos;
