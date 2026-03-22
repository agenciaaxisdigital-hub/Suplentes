

## Integração com API do TSE - Busca de Suplentes

### Situação atual
A API pública do TSE (DivulgaCandContas) **não permite busca por CPF**. Os endpoints disponíveis permitem listar candidatos por município/eleição/cargo e buscar detalhes por código do candidato.

### O que é possível fazer

Criar uma busca por **nome do candidato** nos municípios de Goiás, usando a API pública gratuita do TSE. Ao encontrar o candidato, o sistema preenche automaticamente: **nome completo, partido, total de votos e cargo disputado**.

### Plano de implementação

**1. Criar Edge Function `buscar-candidato-tse`**
- Recebe: nome do candidato e ano da eleição (ex: 2024)
- Consulta a API do TSE: `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/{ano}/{municipio}/{eleicao}/{cargo}/candidatos`
- Filtra por nome nos principais municípios de Goiás (Goiânia, Aparecida, Anápolis, etc.)
- Retorna: nome completo, partido (sigla), total de votos, cargo, situação

**2. Alterar tela de Cadastro (`Cadastro.tsx`)**
- Adicionar campo de busca por nome no topo da seção "Dados do Suplente"
- Botão "Buscar no TSE" ao lado do campo
- Ao encontrar resultados, mostrar lista para o usuário selecionar
- Ao selecionar, preenche automaticamente: nome, partido, total_votos, cargo_disputado, situacao

**3. Fluxo do usuário**
1. Digita o nome (ou parte) do suplente
2. Clica "Buscar no TSE"
3. Vê uma lista de resultados com nome, partido e votos
4. Seleciona o correto
5. Campos são preenchidos automaticamente
6. Usuário completa os dados restantes (região, telefone, valores financeiros)

### Limitações importantes
- A API do TSE é pública e gratuita, mas **não tem busca por CPF**
- A busca será por nome nos municípios de Goiás
- Dados disponíveis: eleições de 2020 e 2024 (municipais)
- A API pode ser lenta pois precisamos consultar múltiplos municípios

### Detalhes técnicos
- Edge Function em Deno chamando `divulgacandcontas.tse.jus.br/divulga/rest/v1/`
- Códigos dos municípios de GO pré-cadastrados na função
- CORS headers para chamada do frontend
- Sem necessidade de API key (API pública)

