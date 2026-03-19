import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronRight, MapPin, ArrowLeft, Trash2, FileDown, Phone, Users, Eye, Car, UserCheck, Banknote } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Cadastro from "./Cadastro";
import { exportSuplentePDF } from "@/lib/exports";

export default function Cadastros() {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data: suplentes, refetch } = useQuery({
    queryKey: ["suplentes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suplentes")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data;
    },
  });

  const filtered = suplentes?.filter((s: any) =>
    s.nome?.toLowerCase().includes(search.toLowerCase()) ||
    s.regiao_atuacao?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const fmt = (v: number) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const editing = editingId ? suplentes?.find((s: any) => s.id === editingId) : null;

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Excluir "${nome}"?`)) return;
    const { error } = await supabase.from("suplentes").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Excluído com sucesso" });
      refetch();
    }
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <button onClick={() => setEditingId(null)} className="flex items-center gap-1 text-sm text-primary font-medium">
          <ArrowLeft size={16} /> Voltar à lista
        </button>
        <Cadastro
          initial={editing as any}
          onSaved={() => { setEditingId(null); refetch(); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Fichas Cadastradas</h1>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou região..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-card border-border"
        />
      </div>

      <p className="text-xs text-muted-foreground">{filtered.length} registro(s)</p>

      <div className="space-y-3">
        {filtered.map((s: any) => {
          const liderancas = (s.liderancas_qtd || 0);
          const fiscais = (s.fiscais_qtd || 0);
          const plotagem = (s.plotagem_qtd || 0);
          const pessoas = liderancas + fiscais;
          const retirada = (s.retirada_mensal_valor || 0) * (s.retirada_mensal_meses || 0);

          return (
            <div key={s.id} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setEditingId(s.id)}
                className="w-full text-left p-4 pb-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-foreground text-sm truncate">{s.nome}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                      {s.regiao_atuacao && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin size={11} className="text-primary shrink-0" /> {s.regiao_atuacao}
                        </span>
                      )}
                      {s.telefone && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <Phone size={11} className="shrink-0" /> {s.telefone}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                      {s.partido && (
                        <span className="text-[11px] text-muted-foreground">{s.partido}</span>
                      )}
                      {s.cargo_disputado && (
                        <span className="text-[11px] text-muted-foreground">{s.cargo_disputado} {s.ano_eleicao}</span>
                      )}
                      {s.situacao && (
                        <span className="text-[10px] font-medium uppercase tracking-wider text-primary">{s.situacao}</span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm font-bold text-primary whitespace-nowrap">{fmt(s.total_campanha)}</p>
                </div>
              </button>

              {/* Stats row */}
              <div className="grid grid-cols-4 border-t border-border divide-x divide-border bg-muted/40">
                <div className="py-2 px-1 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Votos</p>
                  <p className="text-sm font-bold text-foreground">{(s.total_votos || 0).toLocaleString("pt-BR")}</p>
                </div>
                <div className="py-2 px-1 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Expect.</p>
                  <p className="text-sm font-bold text-foreground">{(s.expectativa_votos || 0).toLocaleString("pt-BR")}</p>
                </div>
                <div className="py-2 px-1 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Pessoas</p>
                  <p className="text-sm font-bold text-foreground">{pessoas.toLocaleString("pt-BR")}</p>
                </div>
                <div className="py-2 px-1 text-center">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Plotag.</p>
                  <p className="text-sm font-bold text-foreground">{plotagem.toLocaleString("pt-BR")}</p>
                </div>
              </div>

              {/* Detail row */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border text-[10px] text-muted-foreground">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><UserCheck size={10} /> {liderancas} líd.</span>
                  <span className="flex items-center gap-1"><Eye size={10} /> {fiscais} fisc.</span>
                  <span className="flex items-center gap-1"><Banknote size={10} /> {fmt(retirada)} ret.</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:text-primary" onClick={() => exportSuplentePDF(s)}>
                    <FileDown size={14} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(s.id, s.nome)}>
                    <Trash2 size={14} />
                  </Button>
                  <ChevronRight size={16} className="text-muted-foreground" onClick={() => setEditingId(s.id)} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
