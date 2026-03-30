import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/PageTransition";
import { CardSkeletonList } from "@/components/CardSkeleton";
import { ChevronDown, ChevronUp, Plus, Trash2, X, Loader2, Wallet, ChevronLeft, ChevronRight, Calculator, Save, Pencil, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { calcTotaisFinanceiros } from "@/lib/finance";

const MESES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
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
  const [registrado, setRegistrado] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const isFirstRender = useRef(true);

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

  // Limite máximo = valor da retirada mensal (para retirada) ou total da categoria
  const limiteMax = categoria === "retirada" ? Number(val1) : total;

  // Sugestão padrão de pagamento
  const defaultPagamento = categoria === "retirada" ? val1 : total;
  const [valorPago, setValorPago] = useState(defaultPagamento > 0 ? String(defaultPagamento) : "");

  useEffect(() => {
    const sug = categoria === "retirada" ? val1 : (val1 * val2);
    setValorPago(sug > 0 ? String(sug) : "");
  }, [val1, val2, categoria]);

  // Auto-save debounced: salva no banco 800ms após o usuário parar de digitar
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const updateData: Record<string, number> = {};
    if (categoria === "retirada") {
      updateData.retirada_mensal_valor = Number(val1);
      updateData.retirada_mensal_meses = Number(val2);
    } else if (categoria === "plotagem") {
      updateData.plotagem_qtd = Number(val1);
      updateData.plotagem_valor_unit = Number(val2);
    } else if (categoria === "liderancas") {
      updateData.liderancas_qtd = Number(val1);
      updateData.liderancas_valor_unit = Number(val2);
    } else if (categoria === "fiscais") {
      updateData.fiscais_qtd = Number(val1);
      updateData.fiscais_valor_unit = Number(val2);
    }
    const retiradaV = categoria === "retirada" ? Number(val1) * Number(val2) : suplente.retirada_mensal_valor * suplente.retirada_mensal_meses;
    const plotagemV = categoria === "plotagem" ? Number(val1) * Number(val2) : suplente.plotagem_qtd * suplente.plotagem_valor_unit;
    const liderancasV = categoria === "liderancas" ? Number(val1) * Number(val2) : suplente.liderancas_qtd * suplente.liderancas_valor_unit;
    const fiscaisV = categoria === "fiscais" ? Number(val1) * Number(val2) : suplente.fiscais_qtd * suplente.fiscais_valor_unit;
    updateData.total_campanha = retiradaV + plotagemV + liderancasV + fiscaisV;

    setAutoSaving(true);
    setAutoSaved(false);
    const timer = setTimeout(async () => {
      const { error } = await supabase.from("suplentes").update(updateData).eq("id", suplente.id);
      setAutoSaving(false);
      if (!error) {
        setAutoSaved(true);
        qc.invalidateQueries({ queryKey: ["suplentes"] });
        setTimeout(() => setAutoSaved(false), 2000);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [val1, val2]); // eslint-disable-line react-hooks/exhaustive-deps

  // Validação: valor digitado vs total permitido
  const valorDigitado = parseFloat((valorPago || "0").replace(",", ".")) || 0;
  const excedeu = valorDigitado > limiteMax && limiteMax > 0;

  const handleSave = async () => {
    const v = parseFloat(valorPago.replace(",", "."));
    if (!v || v <= 0) {
      toast({title: "Valor inválido!", description: "Você deve digitar um valor maior que zero para registrar o pagamento.", variant: "destructive"});
      return;
    }
    if (v > limiteMax && limiteMax > 0) {
      toast({title: "Valor excede o limite!", description: `O valor digitado (${fmt(v)}) é maior que o permitido (${fmt(limiteMax)}) para ${label}.`, variant: "destructive"});
      return;
    }
    
    setSaving(true);

    // Constrói detalhamento
    let obsFinal = "";
    if (categoria !== "retirada") {
       obsFinal += `Qtd: ${val1} | Valor un.: ${fmt(val2)}`;
    }

    const { error } = await supabase.from("pagamentos").insert({
      suplente_id: suplente.id,
      mes, ano,
      categoria,
      valor: v,
      observacao: obsFinal || null
    });
    
    setSaving(false);
    if (error) {
       toast({ title: "Erro ao registrar", description: error?.message, variant: "destructive" });
    } else {
       toast({ title: "✅ Pagamento registrado!", description: `${label}: ${fmt(v)}` });
       qc.invalidateQueries({ queryKey: ["pagamentos"]});
       qc.invalidateQueries({ queryKey: ["suplentes"]});
       setRegistrado(true);
       setTimeout(() => setRegistrado(false), 3000);
    }
  }

  if (categoria === "outro") return null;

  return (
    <div className={`rounded-xl p-3 space-y-3 shadow-sm border mt-3 transition-all ${registrado ? 'bg-green-500/10 border-green-500/40' : 'bg-muted/30 border-border'}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="font-semibold text-foreground">{label}</span>
        <div className="flex items-center gap-2">
          {autoSaving && (
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Loader2 size={10} className="animate-spin" /> salvando...
            </span>
          )}
          {autoSaved && (
            <span className="text-[10px] text-green-500 flex items-center gap-1">
              <CheckCircle2 size={10} /> salvo
            </span>
          )}
          <span className="font-bold text-primary">Total: {fmt(total)}</span>
        </div>
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
      
      <div className="pt-3 border-t border-border space-y-2">
        <Label className={`text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${excedeu ? 'text-destructive' : 'text-foreground'}`}>
           <span className="flex items-center gap-1"><Wallet size={12} /> Valor a Pagar Agora</span>
           {limiteMax > 0 && <span className="font-normal text-muted-foreground">Limite: {fmt(limiteMax)}</span>}
        </Label>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">R$</span>
            <Input 
              type="number" 
              inputMode="decimal" 
              value={valorPago} 
              onChange={e => setValorPago(e.target.value)} 
              className={`h-11 w-full pl-8 bg-card text-lg font-bold shadow-sm ${excedeu ? 'border-destructive text-destructive focus-visible:ring-destructive' : 'border-green-500/50 focus-visible:ring-green-500'}`} 
              placeholder="0,00" 
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="h-11 px-3 border-dashed border-primary/50 text-xs font-bold text-primary hover:bg-primary/5 hover:border-primary shrink-0 flex flex-col items-center justify-center leading-none"
            onClick={() => setValorPago(String(limiteMax))}
            title="Preencher valor total planejado"
          >
            <span className="text-[10px] opacity-70">VALOR</span>
            <span>TOTAL</span>
          </Button>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={saving || !val1 || excedeu || !valorPago} 
          className={`w-full h-11 font-bold text-sm shadow-lg transition-all active:scale-[0.98] ${registrado ? 'bg-green-600 hover:bg-green-600' : 'bg-gradient-to-r from-pink-500 to-rose-400 hover:opacity-95'}`}
        >
          {saving ? (
            <div className="flex items-center gap-2">
              <Loader2 size={18} className="animate-spin" />
              <span>Salvando no Banco...</span>
            </div>
          ) : registrado ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} />
              <span>PAGAMENTO REGISTRADO!</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save size={18} />
              <span>SALVAR PAGAMENTO</span>
            </div>
          )}
        </Button>

        {excedeu && (
          <div className="bg-destructive/10 border border-destructive/20 p-2 rounded-lg animate-pulse">
            <p className="text-[11px] text-destructive font-bold text-center">
              ❌ ERRO: O valor ({fmt(valorDigitado)}) é maior que o planejado ({fmt(limiteMax)}). 
              Abaixe o valor para salvar.
            </p>
          </div>
        )}
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

  const pagamentosDoMes = pagamentos.filter(
    (p) => p.suplente_id === suplente.id && p.mes === mes && p.ano === ano
  );

  const pagamentosGlobais = pagamentos.filter((p) => p.suplente_id === suplente.id);

  // Totais Gerais
  const totalPagoGlobal = pagamentosGlobais.reduce((a, p) => a + (p.valor || 0), 0);
  const totalCampanha = calcTotaisFinanceiros(suplente).totalFinal;
  const saldo = totalCampanha - totalPagoGlobal;
  const pct = totalCampanha > 0 ? Math.min(100, (totalPagoGlobal / totalCampanha) * 100) : 0;

  // Totais do mês para interface
  const totalPagoNoMes = pagamentosDoMes.reduce((a, p) => a + (p.valor || 0), 0);

  // Status de retirada no mês
  const retiradaPagaNoMes = pagamentosDoMes.some(p => p.categoria === "retirada");
  const valorRetiradaPagaNoMes = pagamentosDoMes
    .filter(p => p.categoria === "retirada")
    .reduce((a, p) => a + (p.valor || 0), 0);
  const temRetirada = suplente.retirada_mensal_valor > 0;

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
            {/* Badge de status da retirada mensal */}
            {temRetirada && (
              retiradaPagaNoMes ? (
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/30 rounded-full px-2 py-0.5">
                  <CheckCircle2 size={9} /> Retirada Paga {fmt(valorRetiradaPagaNoMes)}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5">
                  <AlertCircle size={9} /> Retirada Pendente {fmt(suplente.retirada_mensal_valor)}
                </span>
              )
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
      <div className="grid grid-cols-4 border-t border-border divide-x divide-border bg-muted/40">
        <div className="py-2 px-1 text-center">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Campanha</p>
          <p className="text-xs font-bold text-foreground">{fmt(totalCampanha)}</p>
        </div>
        <div className="py-2 px-1 text-center bg-green-500/10">
          <p className="text-[9px] uppercase tracking-wider text-green-600 dark:text-green-500 font-medium">+ Este Mês</p>
          <p className="text-xs font-bold text-green-600 dark:text-green-500">{fmt(totalPagoNoMes)}</p>
        </div>
        <div className="py-2 px-1 text-center">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Pago Geral</p>
          <p className="text-xs font-bold text-foreground">{fmt(totalPagoGlobal)}</p>
        </div>
        <div className="py-2 px-1 text-center">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Saldo a Pagar</p>
          <p className={`text-xs font-bold ${saldo > 0 ? "text-destructive" : "text-green-500"}`}>{fmt(saldo)}</p>
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="px-3 py-3 border-t border-border/50 bg-muted/20">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight italic">Status de Pagamento da Campanha</span>
          <span className="text-[11px] font-bold text-primary">{pct.toFixed(0)}% Pago</span>
        </div>
        <div className="h-2.5 bg-muted rounded-full overflow-hidden shadow-inner border border-border/20">
          <div
            className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
           <span className="text-[9px] text-muted-foreground/70 uppercase">{fmt(totalPagoGlobal)} pagos</span>
           <span className="text-[9px] text-muted-foreground/70 uppercase">Faltam {fmt(saldo)}</span>
        </div>
      </div>

      {/* Histórico de pagamentos */}
      {pagamentosDoMes.length > 0 && (
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
              {pagamentosDoMes.map((p) => (
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
  const [busca, setBusca] = useState("");
  const [bulkPaying, setBulkPaying] = useState(false);
  const qc = useQueryClient();

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
    queryKey: ["pagamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pagamentos")
        .select("*")
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
  const totalPagoGeral = (pagamentos || []).reduce((a, p) => a + (p.valor || 0), 0);
  const pctGeral = totalCampanhaGeral > 0 ? Math.min(100, (totalPagoGeral / totalCampanhaGeral) * 100) : 0;

  // Filtro de busca com normalização de acentos (Tânia === tania)
  const norm = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const suplantesFiltrados = (suplentes || []).filter(s => {
    if (!busca.trim()) return true;
    const q = norm(busca);
    return norm(s.nome).includes(q) ||
           norm(s.regiao_atuacao || "").includes(q) ||
           norm(s.partido || "").includes(q);
  });

  // Stats de retirada do mês
  const suplanteComRetirada = suplantesFiltrados.filter(s => s.retirada_mensal_valor > 0);
  const suplantesSemRetiradaPaga = suplanteComRetirada.filter(s =>
    !(pagamentos || []).some(p =>
      p.suplente_id === s.id && p.mes === mes && p.ano === ano && p.categoria === "retirada"
    )
  );
  const todosRetiradaPagos = suplanteComRetirada.length > 0 && suplantesSemRetiradaPaga.length === 0;

  const handlePagarRetiradaTodos = async () => {
    if (suplantesSemRetiradaPaga.length === 0) return;
    const totalLote = suplantesSemRetiradaPaga.reduce((a, s) => a + s.retirada_mensal_valor, 0);
    const nomes = suplantesSemRetiradaPaga.map(s => `• ${s.nome} — ${fmt(s.retirada_mensal_valor)}`).join("\n");
    if (!confirm(
      `Registrar retirada de ${MESES[mes - 1]}/${ano} para ${suplantesSemRetiradaPaga.length} suplente(s)?\n\n${nomes}\n\nTotal: ${fmt(totalLote)}`
    )) return;

    setBulkPaying(true);
    const inserts = suplantesSemRetiradaPaga.map(s => ({
      suplente_id: s.id,
      mes,
      ano,
      categoria: "retirada",
      valor: s.retirada_mensal_valor,
      observacao: `Pagamento em lote — ${MESES[mes - 1]}/${ano}`,
    }));
    const { error } = await supabase.from("pagamentos").insert(inserts);
    setBulkPaying(false);

    if (error) {
      toast({ title: "Erro ao registrar pagamentos em lote", description: error.message, variant: "destructive" });
    } else {
      toast({
        title: `✅ ${inserts.length} retirada(s) registrada(s)!`,
        description: `Retiradas de ${MESES[mes - 1]}/${ano} marcadas como pagas. Total: ${fmt(totalLote)}`,
      });
      qc.invalidateQueries({ queryKey: ["pagamentos"] });
      qc.invalidateQueries({ queryKey: ["suplentes"] });
    }
  };

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

        {/* Botão batch: Pagar Retirada de Todos */}
        {!isLoading && suplanteComRetirada.length > 0 && (
          <div className={`rounded-2xl border p-3 shadow-sm flex items-center justify-between gap-3 ${todosRetiradaPagos ? 'bg-green-500/10 border-green-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
            <div className="min-w-0">
              {todosRetiradaPagos ? (
                <p className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Todas as retiradas de {MESES[mes - 1]} pagas!
                </p>
              ) : (
                <>
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertCircle size={14} /> {suplantesSemRetiradaPaga.length} retirada(s) pendente(s)
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {suplanteComRetirada.length - suplantesSemRetiradaPaga.length} de {suplanteComRetirada.length} pagas em {MESES[mes - 1]}/{ano}
                  </p>
                </>
              )}
            </div>
            {!todosRetiradaPagos && (
              <Button
                size="sm"
                onClick={handlePagarRetiradaTodos}
                disabled={bulkPaying}
                className="shrink-0 h-9 px-3 text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-400 hover:opacity-90 text-white shadow-md"
              >
                {bulkPaying ? (
                  <><Loader2 size={12} className="animate-spin mr-1" /> Registrando...</>
                ) : (
                  <><CheckCircle2 size={12} className="mr-1" /> Pagar Todos</>
                )}
              </Button>
            )}
          </div>
        )}

        {/* Resumo do mês e Geral */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-white/80 text-xs mb-3">
            <Wallet size={14} /> Resumo Geral e {MESES[mes - 1]}/{ano}
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-3">
            <div>
              <p className="text-white/70 text-[10px] uppercase tracking-wider">Total Pago (Global)</p>
              <p className="text-white font-bold text-lg">{fmt(totalPagoGeral)}</p>
            </div>
            <div>
              <p className="text-white/70 text-[10px] uppercase tracking-wider">Total Campanha</p>
              <p className="text-white font-bold text-lg">{fmt(totalCampanhaGeral)}</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-white/20">
              <div className="flex justify-between items-center mb-1">
                <p className="text-white/70 text-[10px] uppercase tracking-wider">Progresso Total</p>
                <p className="text-white font-bold text-sm">{pctGeral.toFixed(0)}%</p>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${pctGeral}%` }} />
              </div>
            </div>
            <div className="col-span-2 pt-2 border-t border-white/20">
              <p className="text-white/70 text-[10px] uppercase tracking-wider">Pago Neste Mês ({MESES[mes - 1]})</p>
              <p className="text-white font-bold text-lg">{fmt(totalPagoMes)}</p>
            </div>
          </div>
        </div>

        {/* Lista de suplentes */}
        {isLoading ? (
          <CardSkeletonList count={4} />
        ) : (
          <div className="space-y-3">
            {/* Campo de Pesquisa */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar suplente por nome, região ou partido..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9 h-10 bg-card border-border rounded-xl text-sm"
              />
              {busca && (
                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setBusca("")}>
                  <X size={12} />
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              {suplantesFiltrados.length} de {(suplentes || []).length} suplente(s) — {pagMes.length} pagamento(s) registrado(s) no mês
            </p>
            {suplantesFiltrados.map((s) => (
              <SuplenteCard
                key={s.id}
                suplente={s}
                pagamentos={pagamentos || []}
                mes={mes}
                ano={ano}
              />
            ))}
            {suplantesFiltrados.length === 0 && busca && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum suplente encontrado para "{busca}"
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
