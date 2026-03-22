import { useState, useRef, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Search, Loader2, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CandidatoResult {
  id: number;
  nome: string;
  nomeUrna: string;
  partido: string;
  cargo: string;
  situacao: string;
  municipio: string;
  ano: number;
}

interface Props {
  onSelect: (candidato: CandidatoResult) => void;
}

export default function BuscaTSE({ onSelect }: Props) {
  const [nome, setNome] = useState("");
  const [ano, setAno] = useState("2024");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CandidatoResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const doSearch = useCallback(async (searchTerm: string, year: string) => {
    if (searchTerm.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setShowResults(true);
    try {
      const { data, error } = await supabase.functions.invoke("buscar-candidato-tse", {
        body: { nome: searchTerm.trim(), ano: parseInt(year) },
      });
      if (error) throw error;
      setResults(data.resultados || []);
    } catch (e: any) {
      toast({ title: "Erro na busca", description: e.message, variant: "destructive" });
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setNome(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length >= 3) {
      debounceRef.current = setTimeout(() => doSearch(value, ano), 600);
    } else {
      setResults([]);
      setShowResults(false);
    }
  };

  const handleSelect = (c: CandidatoResult) => {
    onSelect(c);
    setNome(c.nome);
    setShowResults(false);
    setResults([]);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Digite o nome completo ou de campanha..."
            value={nome}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            className="bg-card shadow-sm border-border pl-9"
          />
          {loading && (
            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
        <Select value={ano} onValueChange={(v) => { setAno(v); if (nome.trim().length >= 3) doSearch(nome, v); }}>
          <SelectTrigger className="w-20 bg-card shadow-sm border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2020">2020</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5 px-1">
          <Loader2 size={12} className="animate-spin" />
          Buscando em todos os 246 municípios de Goiás...
        </p>
      )}

      {showResults && !loading && results.length === 0 && nome.trim().length >= 3 && (
        <p className="text-xs text-muted-foreground px-1">Nenhum resultado encontrado. Tente outro nome ou ano.</p>
      )}

      {showResults && results.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 max-h-64 overflow-y-auto rounded-xl border border-border bg-popover shadow-lg">
          <div className="px-3 py-1.5 border-b border-border">
            <p className="text-[11px] text-muted-foreground">{results.length} resultado(s) — nome completo ou de urna</p>
          </div>
          {results.map((c) => (
            <button
              key={`${c.id}-${c.municipio}`}
              onClick={() => handleSelect(c)}
              className="w-full text-left px-3 py-2.5 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{c.nome}</p>
                  {c.nomeUrna && c.nomeUrna.toUpperCase() !== c.nome.toUpperCase() && (
                    <p className="text-[11px] text-muted-foreground truncate">Urna: {c.nomeUrna}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                    <span className="text-[11px] font-medium text-primary">{c.partido}</span>
                    <span className="text-[11px] text-muted-foreground">{c.cargo}</span>
                    <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                      <MapPin size={9} /> {c.municipio}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-primary whitespace-nowrap mt-0.5">
                  {c.situacao}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
