import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2, X, MapPin } from "lucide-react";
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
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (nome.trim().length < 3) {
      toast({ title: "Digite pelo menos 3 letras do nome", variant: "destructive" });
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const { data, error } = await supabase.functions.invoke("buscar-candidato-tse", {
        body: { nome: nome.trim(), ano: parseInt(ano) },
      });

      if (error) throw error;

      setResults(data.resultados || []);
      if ((data.resultados || []).length === 0) {
        toast({ title: "Nenhum resultado encontrado", description: "Tente outro nome ou ano." });
      }
    } catch (e: any) {
      toast({ title: "Erro na busca", description: e.message, variant: "destructive" });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (c: CandidatoResult) => {
    onSelect(c);
    setResults([]);
    setSearched(false);
    setNome("");
  };

  const handleClear = () => {
    setResults([]);
    setSearched(false);
    setNome("");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Nome do suplente..."
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="bg-card shadow-sm border-border flex-1"
        />
        <Select value={ano} onValueChange={setAno}>
          <SelectTrigger className="w-20 bg-card shadow-sm border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2020">2020</SelectItem>
          </SelectContent>
        </Select>
        <Button
          onClick={handleSearch}
          disabled={loading}
          size="icon"
          className="shrink-0 bg-primary"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
        </Button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6 text-sm text-muted-foreground gap-2">
          <Loader2 size={16} className="animate-spin" />
          Buscando em municípios de Goiás...
        </div>
      )}

      {searched && !loading && results.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{results.length} resultado(s)</p>
            <button onClick={handleClear} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
              <X size={12} /> Limpar
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1.5 rounded-xl border border-border p-1.5 bg-muted/30">
            {results.map((c) => (
              <button
                key={`${c.id}-${c.municipio}`}
                onClick={() => handleSelect(c)}
                className="w-full text-left p-2.5 rounded-lg hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground truncate">{c.nome}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                      <span className="text-[11px] font-medium text-primary">{c.partido}</span>
                      <span className="text-[11px] text-muted-foreground">{c.cargo}</span>
                      <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                        <MapPin size={9} /> {c.municipio}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-primary whitespace-nowrap">
                    {c.situacao}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
