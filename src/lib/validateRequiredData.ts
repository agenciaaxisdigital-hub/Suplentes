import { supabase } from "@/integrations/supabase/client";
import { namesMatch } from "@/lib/validateVotes";

type CandidateTse = {
  id: number;
  nome: string;
  nomeUrna: string;
  codigoMunicipio: string;
  partido?: string;
};

export type RequiredDataValidationResult = {
  id: string;
  nome: string;
  partidoAntes: string;
  partidoDepois: string;
  votosAntes: number;
  votosDepois: number;
  updated: boolean;
};

const MAX_CONCURRENCY = 5;

function isMissingParty(partido: unknown): boolean {
  return !String(partido || "").trim();
}

function isMissingVotes(votos: unknown): boolean {
  return !Number(votos) || Number(votos) <= 0;
}

export async function validateRequiredData(
  onProgress?: (current: number, total: number, nome: string) => void
): Promise<RequiredDataValidationResult[]> {
  const { data: suplentes, error } = await supabase
    .from("suplentes")
    .select("id, nome, partido, total_votos")
    .order("nome");

  if (error || !suplentes) throw new Error(error?.message || "Erro ao carregar suplentes");

  let votosMap: Record<string, number> = {};
  try {
    const resp = await fetch("/tse-votos-go-2024.json", { cache: "force-cache" });
    if (resp.ok) votosMap = await resp.json();
  } catch {
    votosMap = {};
  }

  const pending = suplentes.filter((s) => isMissingParty(s.partido) || isMissingVotes(s.total_votos));
  if (!pending.length) return [];

  const results: RequiredDataValidationResult[] = [];
  let progress = 0;

  const worker = async (s: (typeof pending)[number]) => {
    progress += 1;
    onProgress?.(progress, pending.length, s.nome);

    try {
      // Try full name first, then first+last name for better matching
      const searchTerms = [
        s.nome.trim(),
        `${s.nome.split(" ")[0]} ${s.nome.split(" ").slice(-1)[0] || ""}`.trim(),
      ];

      let bestMatch: CandidateTse | null = null;

      for (const term of searchTerms) {
        if (bestMatch) break;
        const { data, error: fnError } = await supabase.functions.invoke("buscar-candidato-tse", {
          body: { nome: term, ano: 2024 },
        });
        if (fnError || !data?.resultados) continue;

        const candidatos = data.resultados as CandidateTse[];
        bestMatch =
          candidatos.find((c) => namesMatch(s.nome, c.nome) || namesMatch(s.nome, c.nomeUrna)) || null;
      }
      if (!bestMatch) return;

      const votosNovo = votosMap[`${bestMatch.codigoMunicipio}:${bestMatch.id}`] || 0;
      const payload: Record<string, string | number> = {};

      if (isMissingParty(s.partido) && String(bestMatch.partido || "").trim()) {
        payload.partido = String(bestMatch.partido).trim();
      }
      if (isMissingVotes(s.total_votos) && votosNovo > 0) {
        payload.total_votos = votosNovo;
      }
      if (!Object.keys(payload).length) return;

      const { error: updateError } = await supabase.from("suplentes").update(payload).eq("id", s.id);
      results.push({
        id: s.id,
        nome: s.nome,
        partidoAntes: String(s.partido || ""),
        partidoDepois: String(payload.partido ?? s.partido ?? ""),
        votosAntes: Number(s.total_votos || 0),
        votosDepois: Number(payload.total_votos ?? s.total_votos ?? 0),
        updated: !updateError,
      });
    } catch {
      // Continua para os próximos registros
    }
  };

  for (let i = 0; i < pending.length; i += MAX_CONCURRENCY) {
    const chunk = pending.slice(i, i + MAX_CONCURRENCY);
    await Promise.all(chunk.map(worker));
  }

  return results;
}
