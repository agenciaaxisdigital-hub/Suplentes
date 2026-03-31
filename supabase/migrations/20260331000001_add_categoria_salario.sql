-- Adiciona categoria 'salario' ao check constraint de pagamentos
-- Usada para pagamentos do tipo admin (tabela administrativo)
ALTER TABLE public.pagamentos DROP CONSTRAINT pagamentos_categoria_check;
ALTER TABLE public.pagamentos ADD CONSTRAINT pagamentos_categoria_check
  CHECK (categoria IN ('retirada', 'plotagem', 'liderancas', 'fiscais', 'salario', 'outro'));
