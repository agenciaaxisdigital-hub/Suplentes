import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/PageTransition";
import { CardSkeletonList } from "@/components/CardSkeleton";
import { ChevronDown, ChevronUp, Plus, Trash2, X, Loader2, Wallet, ChevronLeft, ChevronRight, Calculator, Save, Pencil } from "lucide-react";
import { calcTotaisFinanceiros } from "@/lib/finance";

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const CATEGORIAS: Record<string, string> = {
  retirada: "Retirada Mensal",
  plotagem: "Plotagem",
  liderancas: "Lideranças",
  fiscais: "Fiscais",
  outro: "Outro",
};

type Pagamento = {
  id: string;
  suplente_id: string;
  mes: number;
  ano: number;
  categoria: string;
  valor: number;
  observacao: string | null;
  created_at: string;
};

type Suplente = {
  id: string;
  nome: string;
  regiao_atuacao: string | null;
  partido: string | null;
  retirada_mensal_valor: number;
  retirada_mensal_meses: number;
  plotagem_qtd: number;
  plotagem_valor_unit: number;
  liderancas_qtd: number;
  liderancas_valor_unit: number;
  fiscais_qtd: number;
  fiscais_valor_unit: number;
  total_campanha: number;
};

const fmt = (v: number) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function BaixaCategoryRow({
  categoria, label, suplente, mes, ano, onSaved
}: {
  categoria: keyof typeof CATEGORIAS;
  label: string;
  suplente: Suplente;
  mes: number;
  ano: number;
  onSaved: () => void;
}) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  
  const [val1, setVal1] = useState(
    categoria === "retirada" ? suplente.retirada_mensal_valor :
    categoria === "plotagem" ? suplente.plotagem_qtd :
    categoria === "liderancas" ? suplente.liderancas_qtd :
    categoria === "fiscais" ? suplente.fiscais_qtd : 0
  );

  const [val2, setVal2] = useState(
    categoria === "retirada" ? suplente.retirada_mensal_meses :
    categoria === "plotagem" ? suplente.plotagem_valor_unit :
    categoria === "liderancas" ? suplente.liderancas_valor_unit :
    categoria === "fiscais" ? suplente.fiscais_valor_unit : 0
  );
  
  const total = Number(val1) * Number(val2);
  const label1 = categoria === "retirada" ? "Valor Mensal (R$)" : "Qtd";
  const label2 = categoria === "retirada" ? "Meses Totais" : "Valor Unit. (R$)";
  
  // Sugestão padrão de pagemento
  const defaultPagamento = categoria === "retirada" ? val1 : total;
  const [valorPago, setValorPago] = useState(defaultPagamento > 0 ? String(defaultPagamento) : "");

  useEffect(() => {
    const sug = categoria === "retirada" ? val1 : (val1 * val2);
    setValorPago(sug > 0 ? String(sug) : "");
  }, [val1, val2, categoria]);

  const handleSave = async () => {
    const v = parseFloat(valorPago.replace(",", "."));
    if (!v || v <= 0) {
      toast({title: "Valor inválido", description: "O valor pago deve ser maior que 0.", variant: "destructive"});
      return;
    }
    
    setSaving(true);
    let errorUpdate = false;
    
    // Atualiza cadastro se o usuário tiver alterado qtd/valor unit
    const updateData: any = {};
    if (categoria === "retirada") {
      updateData.retirada_mensal_valor = val1;
      updateData.retirada_mensal_meses = val2;
    } else if (categoria === "plotagem") {
      updateData.plotagem_qtd = val1;
      updateData.plotagem_valor_unit = val2;
    } else if (categoria === "liderancas") {
      updateData.liderancas_qtd = val1;
      updateData.liderancas_valor_unit = val2;
    } else if (categoria === "fiscais") {
      updateData.fiscais_qtd = val1;
      updateData.fiscais_valor_unit = val2;
    }
    
    const { error: errUpdate } = await supabase.from("suplentes").update(updateData).eq("id", suplente.id);
    if (errUpdate) errorUpdate = true;

    // Constrói detalhamento
    let obsFinal = "";
    if (categoria !== "retirada") {
       obsFinal += `Qtd no momento da baixa: ${val1} | Valor un.: ${fmt(val2)}`;
    }

    const { error } = await supabase.from("pagamentos").insert({
      suplente_id: suplente.id,
      mes, ano,
      categoria,
      valor: v,
      observacao: obsFinal || null
    });
    
    setSaving(false);
    if (error || errorUpdate) {
       toast({ title: "Erro ao registrar", description: error?.message, variant: "destructive" });
    } else {
       toast({ title: "Registrado com sucesso!" });
       qc.invalidateQueries({ queryKey: ["pagamentos"]});
       qc.invalidateQueries({ queryKey: ["suplentes"]});
       onSaved();
    }
  }

  if (categoria === "outro") return null;

  return (
    <div className="bg-muted/30 rounded-xl p-3 space-y-3 shadow-sm border border-border mt-3">
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold text-foreground">{label}</span>
        <span className="font-bold text-primary">{fmt(total)}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">{label1}</Label>
          <Input type="number" inputMode="numeric" value={val1 || ""} onChange={e => setVal1(Number(e.target.value))} className="h-8 text-sm bg-card shadow-sm border-border font-medium" />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">{label2}</Label>
          <Input type="number" inputMode="numeric" value={val2 || ""} onChange={e => setVal2(Number(e.target.value))} className="h-8 text-sm bg-card shadow-sm border-border font-medium" />
        </div>
      </div>
      
      <div className="pt-3 border-t border-border grid grid-cols-[1fr_auto] gap-3 items-end">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
             <Wallet size={10} className="text-secondary" /> Valor Pago (R$)
          </Label>
          <Input type="number" inputMode="decimal" value={valorPago} onChange={e => setValorPago(e.target.value)} className="h-9 w-full bg-card font-bold border-green-500/50 shadow-sm focus-visible:ring-green-500" placeholder="0,00" />
        </div>
        <Button onClick={handleSave} disabled={saving || !val1} size="sm" className="h-9 bg-gradient-to-r from-pink-500 to-rose-400 hover:opacity-90 font-semibold text-xs shadow-md">
          {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Save size={14} className="mr-1" />} 
          Registrar
        </Button>
      </div>
    </div>
  )
}

function BaixaForm({
  suplente,
  mes,
  ano,
  onClose,
}: {
  suplente: Suplente;
  mes: number;
  ano: number;
  onClose: () => void;
}) {
  return (
    <div className="bg-card border-t border-b border-border/60 py-4 px-2 sm:px-4 space-y-1 mb-2">
      <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
        <h4 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
          <Calculator size={14} /> Ficha de Pagamentos
        </h4>
        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-muted" onClick={onClose}><X size={14} /></Button>
      </div>
      
      <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
        Você pode alterar a <strong>quantidade</strong> ou os valores unitários aqui mesmo caso tenham mudado hoje. Isso ajustará logo em seguida o saldo do candidato. Insira o valor do depósito/pagamento no último campo e clique em registrar.
      </p>

      <BaixaCategoryRow categoria="retirada" label="Retirada Mensal" suplente={suplente} mes={mes} ano={ano} onSaved={onClose} />
      <BaixaCategoryRow categoria="plotagem" label="Plotagem" suplente={suplente} mes={mes} ano={ano} onSaved={onClose} />
      <BaixaCategoryRow categoria="liderancas" label="Lideranças na Campanha" suplente={suplente} mes={mes} ano={ano} onSaved={onClose} />
      <BaixaCategoryRow categoria="fiscais" label="Fiscais no Dia da Eleição" suplente={suplente} mes={mes} ano={ano} onSaved={onClose} />
    </div>
  );
}

function PagamentoItem({ p, onDelete }: { p: Pagamento, onDelete: (id: string) => void }) {
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [valor, setValor] = useState(String(p.valor));
  const [obs, setObs] = useState(p.observacao || "");
  const [saving, setSaving] = useState(false);

  const handleSaveEdit = async () => {
    const v = parseFloat(valor.replace(",", "."));
    if (!v || v <= 0) return toast({ title: "Valor inválido", variant: "destructive" });
    setSaving(true);
    const { error } = await supabase.from("pagamentos").update({
      valor: v, observacao: obs.trim() || null
    }).eq("id", p.id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao editar", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Pagamento atualizado!" });
      qc.invalidateQueries({ queryKey: ["pagamentos"] });
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 px-3 py-3 border-b border-border/50 bg-background/50">
        <div className="flex items-center gap-2">
          <div className="flex-1 space-y-1">
            <Label className="text-[10px] text-muted-foreground uppercase">Valor do Pagamento</Label>
            <Input type="number" inputMode="decimal" value={valor} onChange={e => setValor(e.target.value)} className="h-7 text-xs bg-card" />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground uppercase">Observação</Label>
          <Input value={obs} onChange={e => setObs(e.target.value)} className="h-7 text-xs bg-card" />
        </div>
        <div className="flex justify-end gap-2 mt-1">
          <Button size="sm" variant="ghost" className="h-7 text-[10px] px-2" onClick={() => setIsEditing(false)}>Cancelar</Button>
          <Button size="sm" className="h-7 text-[10px] px-3 bg-primary" onClick={handleSaveEdit} disabled={saving}>
            {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} className="mr-1" />} Salvar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs font-medium text-foreground">{CATEGORIAS[p.categoria] || p.categoria}</p>
        {p.observacao && <p className="text-[10px] text-muted-foreground truncate">{p.observacao}</p>}
        <p className="text-[10px] text-muted-foreground">
          {new Date(p.created_at).toLocaleDateString("pt-BR")}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-bold text-green-500">{fmt(p.valor)}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setIsEditing(true)}
        >
          <Pencil size={12} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive"
          onClick={() => onDelete(p.id)}
        >
          <Trash2 size={12} />
        </Button>
      </div>
    </div>
  );
}

function SuplenteCard({
  suplente,
  pagamentos,
  mes,
  ano,
}: {
  suplente: Suplente;
  pagamentos: Pagamento[];
  mes: number;
  ano: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [isAddingBaixa, setIsAddingBaixa] = useState(false);
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const meusPagamentos = pagamentos.filter(
    (p) => p.suplente_id === suplente.id && p.mes === mes && p.ano === ano
  );

  const totalPago = meusPagamentos.reduce((a, p) => a + (p.valor || 0), 0);
  const totalCampanha = calcTotaisFinanceiros(suplente).totalFinal;
  const saldo = totalCampanha - totalPago;
  const pct = totalCampanha > 0 ? Math.min(100, (totalPago / totalCampanha) * 100) : 0;

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este pagamento?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("pagamentos").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      qc.invalidateQueries({ queryKey: ["pagamentos"] });
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground text-sm truncate">{suplente.nome}</p>
            {suplente.regiao_atuacao && (
              <p className="text-[11px] text-muted-foreground">{suplente.regiao_atuacao}</p>
            )}
          </div>
          <Button
            size="sm"
            className="h-7 px-2 text-xs gap-1 shrink-0 bg-green-500 hover:bg-green-600 text-white"
            onClick={() => setIsAddingBaixa(!isAddingBaixa)}
            variant={isAddingBaixa ? "secondary" : "default"}
          >
            {isAddingBaixa ? <X size={12} className="text-foreground"/> : <Plus size={12} />} 
            <span className={isAddingBaixa ? "text-foreground" : ""}>{isAddingBaixa ? "Cancelar" : "Pagar"}</span>
          </Button>
        </div>
      </div>

      {isAddingBaixa && (
        <BaixaForm
          suplente={suplente}
          mes={mes}
          ano={ano}
          onClose={() => setIsAddingBaixa(false)}
        />
      )}

      {/* Totais */}
      <div className="grid grid-cols-3 border-t border-border divide-x divide-border bg-muted/40">
        <div className="py-2 px-1 text-center">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Total</p>
          <p className="text-xs font-bold text-foreground">{fmt(totalCampanha)}</p>
        </div>
        <div className="py-2 px-1 text-center">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Pago</p>
          <p className="text-xs font-bold text-green-500">{fmt(totalPago)}</p>
        </div>
        <div className="py-2 px-1 text-center">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Saldo</p>
          <p className={`text-xs font-bold ${saldo > 0 ? "text-destructive" : "text-green-500"}`}>{fmt(saldo)}</p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="px-3 py-2 border-t border-border/50 bg-muted/20">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-muted-foreground font-medium">{pct.toFixed(0)}% pago</span>
          <span className="text-[10px] text-muted-foreground font-medium">{meusPagamentos.length} pagamento(s)</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Histórico de pagamentos */}
      {meusPagamentos.length > 0 && (
        <>
          <button
            className="w-full flex items-center justify-between px-3 py-2 border-t border-border text-xs text-muted-foreground hover:bg-muted/30 transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            <span className="font-semibold">{expanded ? "Ocultar Histórico" : "Ver Histórico de Pagamentos do Mês"}</span>
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expanded && (
            <div className="border-t border-border/50 divide-y divide-border/50 bg-muted/10">
              {meusPagamentos.map((p) => (
                <PagamentoItem key={p.id} p={p} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Pagamentos() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());

  const { data: suplentes, isLoading: loadingSuplentes } = useQuery({
    queryKey: ["suplentes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suplentes").select(
        "id, nome, regiao_atuacao, partido, retirada_mensal_valor, retirada_mensal_meses, plotagem_qtd, plotagem_valor_unit, liderancas_qtd, liderancas_valor_unit, fiscais_qtd, fiscais_valor_unit, total_campanha"
      ).order("nome");
      if (error) throw error;
      return data as unknown as Suplente[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache - deixa instantâneo
  });

  const { data: pagamentos, isLoading: loadingPag } = useQuery({
    queryKey: ["pagamentos", mes, ano],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pagamentos")
        .select("*")
        .eq("mes", mes)
        .eq("ano", ano)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Pagamento[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });

  const isLoading = loadingSuplentes || loadingPag;

  const navMes = (dir: -1 | 1) => {
    let m = mes + dir;
    let a = ano;
    if (m < 1) { m = 12; a--; }
    if (m > 12) { m = 1; a++; }
    setMes(m);
    setAno(a);
  };

  const pagMes = (pagamentos || []).filter((p) => p.mes === mes && p.ano === ano);
  const totalPagoMes = pagMes.reduce((a, p) => a + (p.valor || 0), 0);
  const totalCampanhaGeral = (suplentes || []).reduce(
    (a, s) => a + calcTotaisFinanceiros(s).totalFinal, 0
  );

  return (
    <PageTransition>
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-foreground">Pagamentos</h1>

        {/* Seletor de mês */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="icon" onClick={() => navMes(-1)}>
              <ChevronLeft size={20} />
            </Button>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{MESES[mes - 1]} {ano}</p>
              <p className="text-xs text-muted-foreground">Mês de referência</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => navMes(1)}>
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>

        {/* Resumo do mês */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-white/80 text-xs mb-2">
            <Wallet size={14} /> Resumo {MESES[mes - 1]}/{ano}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-white/70 text-[10px] uppercase tracking-wider">Total Pago no Mês</p>
              <p className="text-white font-bold text-lg">{fmt(totalPagoMes)}</p>
            </div>
            <div>
              <p className="text-white/70 text-[10px] uppercase tracking-wider">Total Campanha</p>
              <p className="text-white font-bold text-lg">{fmt(totalCampanhaGeral)}</p>
            </div>
          </div>
        </div>

        {/* Lista de suplentes */}
        {isLoading ? (
          <CardSkeletonList count={4} />
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {(suplentes || []).length} suplente(s) — {pagMes.length} pagamento(s) registrado(s) no mês
            </p>
            {(suplentes || []).map((s) => (
              <SuplenteCard
                key={s.id}
                suplente={s}
                pagamentos={pagamentos || []}
                mes={mes}
                ano={ano}
              />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
