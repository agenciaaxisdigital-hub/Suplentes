import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronRight, MapPin, Vote, DollarSign, ArrowLeft, Trash2, FileDown } from "lucide-react";
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

      <div className="space-y-2">
        {filtered.map((s: any) => (
          <div
            key={s.id}
            className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3 shadow-sm"
          >
            <button
              onClick={() => setEditingId(s.id)}
              className="flex-1 min-w-0 text-left space-y-1"
            >
              <p className="font-semibold text-foreground truncate">{s.nome}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                {s.regiao_atuacao && (
                  <span className="flex items-center gap-1"><MapPin size={12} /> {s.regiao_atuacao}</span>
                )}
                <span className="flex items-center gap-1"><Vote size={12} /> {s.total_votos} votos</span>
                <span className="flex items-center gap-1 text-primary font-medium"><DollarSign size={12} /> {fmt(s.total_campanha)}</span>
              </div>
            </button>
            <div className="flex items-center gap-1 shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary" onClick={(e) => { e.stopPropagation(); exportSuplentePDF(s); }}>
                <FileDown size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(s.id, s.nome)}>
                <Trash2 size={16} />
              </Button>
              <ChevronRight size={20} className="text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
