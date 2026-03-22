import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Principais municípios de Goiás com códigos TSE
const MUNICIPIOS_GO: Record<string, string> = {
  "93734": "GOIÂNIA",
  "92050": "APARECIDA DE GOIÂNIA",
  "90140": "ANÁPOLIS",
  "95125": "RIO VERDE",
  "93114": "FORMOSA",
  "94579": "LUZIÂNIA",
  "90417": "ÁGUAS LINDAS DE GOIÁS",
  "96652": "VALPARAÍSO DE GOIÁS",
  "95508": "SENADOR CANEDO",
  "96393": "TRINDADE",
  "94196": "ITUMBIARA",
  "93173": "GOIANÉSIA",
  "94935": "PLANALTINA",
  "93378": "GOIATUBA",
  "94650": "MINEIROS",
  "93246": "GOIANIRA",
  "94340": "JATAÍ",
  "92371": "CALDAS NOVAS",
  "92274": "CATALÃO",
  "93572": "INHUMAS",
  "95176": "NOVO GAMA",
  "92681": "CIDADE OCIDENTAL",
  "91030": "SANTO ANTÔNIO DO DESCOBERTO",
  "94072": "IPORÁ",
  "95559": "SILVÂNIA",
  "94293": "JARAGUÁ",
  "95834": "URUAÇU",
  "94013": "IPAMERI",
  "92118": "ARAGARÇAS",
  "95613": "PORANGATU",
  "92746": "CRIXÁS",
  "93505": "GUAPÓ",
  "90875": "ANICUNS",
  "90611": "ALEXÂNIA",
  "92614": "CERES",
  "94714": "MORRINHOS",
  "95370": "QUIRINÓPOLIS",
  "95044": "PIRES DO RIO",
  "92827": "CRISTALINA",
  "94773": "NERÓPOLIS",
};

const ELEICAO_IDS: Record<number, string> = {
  2024: "2045202024",
  2020: "2030402020",
};

// Cargo: 13 = Vereador, 6 = Prefeito, 7 = Vice-Prefeito
const CARGOS = [13];

interface CandidatoResult {
  id: number;
  nome: string;
  nomeUrna: string;
  partido: string;
  cargo: string;
  situacao: string;
  municipio: string;
  codigoMunicipio: string;
  ano: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, ano = 2024 } = await req.json();

    if (!nome || nome.trim().length < 3) {
      return new Response(
        JSON.stringify({ error: "Nome deve ter pelo menos 3 caracteres" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const searchTerm = nome.trim().toUpperCase();
    const eleicaoId = ELEICAO_IDS[ano];

    if (!eleicaoId) {
      return new Response(
        JSON.stringify({ error: `Ano ${ano} não disponível. Use 2024 ou 2020.` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: CandidatoResult[] = [];
    const errors: string[] = [];

    // Query all municipalities in parallel (batches of 10)
    const entries = Object.entries(MUNICIPIOS_GO);
    const batchSize = 10;

    for (let i = 0; i < entries.length; i += batchSize) {
      const batch = entries.slice(i, i + batchSize);
      const promises = batch.flatMap(([codigo, nomeMunicipio]) =>
        CARGOS.map(async (cargo) => {
          try {
            const url = `https://divulgacandcontas.tse.jus.br/divulga/rest/v1/candidatura/listar/${ano}/${codigo}/${eleicaoId}/${cargo}/candidatos`;
            const resp = await fetch(url, {
              headers: { 'Accept': 'application/json' },
            });
            if (!resp.ok) {
              errors.push(`${nomeMunicipio}: HTTP ${resp.status}`);
              return;
            }
            const data = await resp.json();
            const candidatos = data.candidatos || [];

            for (const c of candidatos) {
              const nomeCompleto = (c.nomeCompleto || "").toUpperCase();
              const nomeUrnaCand = (c.nomeUrna || "").toUpperCase();
              if (nomeCompleto.includes(searchTerm) || nomeUrnaCand.includes(searchTerm)) {
                results.push({
                  id: c.id,
                  nome: c.nomeCompleto || c.nomeUrna,
                  nomeUrna: c.nomeUrna || "",
                  partido: c.partido?.sigla || "",
                  cargo: c.cargo?.nome || "",
                  situacao: c.descricaoTotalizacao || c.descricaoSituacao || "",
                  municipio: nomeMunicipio,
                  codigoMunicipio: codigo,
                  ano,
                });
              }
            }
          } catch (e) {
            errors.push(`${nomeMunicipio}: ${e.message}`);
          }
        })
      );
      await Promise.all(promises);
    }

    // Sort by name
    results.sort((a, b) => a.nome.localeCompare(b.nome));

    return new Response(
      JSON.stringify({
        resultados: results,
        total: results.length,
        municipios_consultados: entries.length,
        erros: errors.length > 0 ? errors.slice(0, 5) : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
