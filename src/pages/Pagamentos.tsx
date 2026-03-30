import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/PageTransition";
import { CardSkeletonList } from "@/components/CardSkeleton";
import {
  ChevronDown, ChevronUp, Trash2, X, Loader2, Wallet,
  ChevronLeft, ChevronRight, Save, Search,
  CheckCircle2, AlertCircle, Users, Briefcase, List, Pencil,
  Receipt,
} from "lucide-react";

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const fmt = (v: number) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

type Aba = "suplentes" | "liderancas" | "admin";

type Pagamento = {
  id: string; suplente_id: string | null; lideranca_id: string | null;
  admin_id: string | null; tipo_pessoa: string;
  mes: number; ano: number; categoria: string;
  valor: number; observacao: string | null; created_at: string;
};
type Suplente = {
  id: string; nome: string; regiao_atuacao: string | null; partido: string | null;
  retirada_mensal_valor: number; retirada_mensal_meses: number;
  plotagem_qtd: number; plotagem_valor_unit: number;
  liderancas_qtd: number; liderancas_valor_unit: number;
  fiscais_qtd: number; fiscais_valor_unit: number;
};
type Lideranca = { id: string; nome: string; regiao: string | null; retirada_mensal_valor: number | null; retirada_mensal_meses: number | null; chave_pix: string | null; };
type AdminPessoa = { id: string; nome: string; whatsapp: string | null; valor_contrato: number | null; valor_contrato_meses: number | null; };

// ── Barra de progresso ─────────────────────────────────────────────────────────
function Bar({ pago, total, cor = "bg-primary" }: { pago: number; total: number; cor?: string }) {
  const pct = total > 0 ? Math.min(100, (pago / total) * 100) : 0;
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${cor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ── Formulário de pagamento inline ─────────────────────────────────────────────
function QuickPayForm({ valorEsperado, onSave, onCancel, saving }: {
  valorEsperado: number;
  onSave: (valor: number, obs: string) => Promise<void>;
  onCancel: () => void; saving: boolean;
}) {
  const [valor, setValor] = useState(valorEsperado > 0 ? String(valorEsperado) : "");
  const [obs, setObs] = useState("");
  const valorNum = parseFloat(valor.replace(",", ".")) || 0;
  const parcial = valorEsperado > 0 && valorNum > 0 && valorNum < valorEsperado;
  return (
    <div className="border-t border-border/60 bg-muted/30 px-3 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Registrar pagamento</span>
        {valorEsperado > 0 && <span className="text-[10px] text-muted-foreground">Esperado: {fmt(valorEsperado)}</span>}
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium">R$</span>
          <Input type="number" inputMode="decimal" value={valor} onChange={e => setValor(e.target.value)}
            className="pl-8 h-11 text-base font-bold bg-card border-primary/40" placeholder="0,00" autoFocus />
        </div>
        <Button onClick={() => onSave(valorNum, obs)} disabled={saving || valorNum <= 0}
          className="h-11 px-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold shrink-0">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        </Button>
        <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0" onClick={onCancel}><X size={16} /></Button>
      </div>
      <Input value={obs} onChange={e => setObs(e.target.value)} className="h-8 text-xs bg-card"
        placeholder="Observação (opcional)" />
      {parcial && (
        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
          <AlertCircle size={11} className="text-amber-500 shrink-0" />
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Adiantamento — faltará {fmt(valorEsperado - valorNum)}
          </span>
        </div>
      )}
    </div>
  );
}

// ── Item histórico ─────────────────────────────────────────────────────────────
function HistoricoItem({ p, onDelete }: { p: Pagamento; onDelete: (id: string) => void }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [valor, setValor] = useState(String(p.valor));
  const [obs, setObs] = useState(p.observacao || "");
  const [saving, setSaving] = useState(false);
  const cats: Record<string, string> = {
    retirada: "Retirada", plotagem: "Plotagem", liderancas: "Lideranças",
    fiscais: "Fiscais", salario: "Salário", outro: "Outro",
  };
  const save = async () => {
    const v = parseFloat(valor.replace(",", "."));
    if (!v) return;
    setSaving(true);
    const { error } = await supabase.from("pagamentos").update({ valor: v, observacao: obs || null }).eq("id", p.id);
    setSaving(false);
    if (!error) { toast({ title: "Atualizado!" }); qc.invalidateQueries({ queryKey: ["pagamentos"] }); setEditing(false); }
  };
  if (editing) return (
    <div className="px-3 py-2 space-y-1.5 border-b border-border/40 bg-muted/20">
      <div className="flex gap-1.5">
        <Input type="number" value={valor} onChange={e => setValor(e.target.value)} className="h-7 text-xs flex-1 bg-card" />
        <Input value={obs} onChange={e => setObs(e.target.value)} className="h-7 text-xs flex-1 bg-card" placeholder="Obs" />
        <Button size="sm" className="h-7 px-2 bg-primary" onClick={save} disabled={saving}>
          {saving ? <Loader2 size={10} className="animate-spin" /> : "✓"}
        </Button>
        <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => setEditing(false)}>✕</Button>
      </div>
    </div>
  );
  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/30 last:border-0">
      <div className="min-w-0">
        <span className="text-xs font-medium text-foreground">{cats[p.categoria] || p.categoria}</span>
        {p.observacao && <span className="text-[10px] text-muted-foreground ml-2">{p.observacao}</span>}
        <p className="text-[10px] text-muted-foreground">
          {MESES[p.mes - 1]}/{p.ano} · {new Date(p.created_at).toLocaleDateString("pt-BR")}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <span className="text-sm font-bold text-green-600 dark:text-green-400">{fmt(p.valor)}</span>
        <button onClick={() => setEditing(true)} className="p-1 text-muted-foreground"><Pencil size={11} /></button>
        <button onClick={() => onDelete(p.id)} className="p-1 text-destructive"><Trash2 size={11} /></button>
      </div>
    </div>
  );
}

// ── Card Suplente — todas as categorias ───────────────────────────────────────
function SuplenteCard({ suplente, pagamentosMes, todosPagamentos, mes, ano }: {
  suplente: Suplente; pagamentosMes: Pagamento[];
  todosPagamentos: Pagamento[]; mes: number; ano: number;
}) {
  const qc = useQueryClient();
  const [payingCat, setPayingCat] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showFicha, setShowFicha] = useState(false);
  const [showHist, setShowHist] = useState(false);

  const pagsSupMes = pagamentosMes.filter(p => p.suplente_id === suplente.id);
  const pagsSupAll = todosPagamentos.filter(p => p.suplente_id === suplente.id);

  const categorias = [
    {
      key: "retirada", label: "Retirada Mensal",
      planejado: suplente.retirada_mensal_valor || 0,
      pago: pagsSupMes.filter(p => p.categoria === "retirada").reduce((a, p) => a + p.valor, 0),
      isMensal: true,
    },
    {
      key: "plotagem", label: "Plotagem",
      planejado: (suplente.plotagem_qtd || 0) * (suplente.plotagem_valor_unit || 0),
      pago: pagsSupAll.filter(p => p.categoria === "plotagem").reduce((a, p) => a + p.valor, 0),
      isMensal: false,
    },
    {
      key: "liderancas", label: "Lideranças Camp.",
      planejado: (suplente.liderancas_qtd || 0) * (suplente.liderancas_valor_unit || 0),
      pago: pagsSupAll.filter(p => p.categoria === "liderancas").reduce((a, p) => a + p.valor, 0),
      isMensal: false,
    },
    {
      key: "fiscais", label: "Fiscais no Dia",
      planejado: (suplente.fiscais_qtd || 0) * (suplente.fiscais_valor_unit || 0),
      pago: pagsSupAll.filter(p => p.categoria === "fiscais").reduce((a, p) => a + p.valor, 0),
      isMensal: false,
    },
  ].filter(c => c.planejado > 0);

  const totalCampanha = categorias.reduce((a, c) => a + c.planejado, 0);
  const totalPagoAll = pagsSupAll.reduce((a, p) => a + p.valor, 0);
  const pctCampanha = totalCampanha > 0 ? Math.min(100, (totalPagoAll / totalCampanha) * 100) : 0;

  // Suplente está pendente se retirada deste mês não foi paga
  const retiradaMes = categorias.find(c => c.key === "retirada");
  const retiradadaPendente = retiradaMes ? retiradaMes.pago < retiradaMes.planejado : false;

  const handleSave = async (cat: string, valor: number, obs: string) => {
    setSaving(true);
    const { error } = await supabase.from("pagamentos").insert({
      tipo_pessoa: "suplente", suplente_id: suplente.id,
      mes, ano, categoria: cat, valor, observacao: obs || null,
      lideranca_id: null, admin_id: null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    setSaving(false);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      toast({ title: `✅ ${fmt(valor)} registrado!`, description: suplente.nome });
      qc.invalidateQueries({ queryKey: ["pagamentos"] });
      setPayingCat(null);
    }
  };

  const handleDelete = async (pagId: string) => {
    if (!confirm("Excluir pagamento?")) return;
    await supabase.from("pagamentos").delete().eq("id", pagId);
    qc.invalidateQueries({ queryKey: ["pagamentos"] });
  };

  const corBorda = retiradadaPendente ? "border-amber-500/30" : "border-green-500/20";

  return (
    <div className={`bg-card rounded-2xl border shadow-sm overflow-hidden ${corBorda}`}>
      {/* Header */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground text-sm leading-tight">{suplente.nome}</p>
            {(suplente.regiao_atuacao || suplente.partido) && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {[suplente.regiao_atuacao, suplente.partido].filter(Boolean).join(" · ")}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            {retiradadaPendente
              ? <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Retirada pendente</span>
              : <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 dark:text-green-400"><CheckCircle2 size={10} />Retirada OK</span>
            }
            <p className="text-[9px] text-muted-foreground mt-0.5">{pctCampanha.toFixed(0)}% campanha</p>
          </div>
        </div>
        <div className="mt-1.5">
          <Bar pago={totalPagoAll} total={totalCampanha}
            cor={pctCampanha >= 100 ? "bg-green-500" : pctCampanha > 50 ? "bg-primary" : "bg-amber-500"} />
          <div className="flex justify-between mt-0.5">
            <span className="text-[10px] text-green-600 dark:text-green-400">{fmt(totalPagoAll)} pago total</span>
            <span className="text-[10px] text-muted-foreground">/ {fmt(totalCampanha)}</span>
          </div>
        </div>
      </div>

      {/* Categorias — expandidas na ficha */}
      {showFicha && (
        <div className="border-t border-border/30 divide-y divide-border/20 bg-muted/5">
          {categorias.map(cat => {
            const falta = Math.max(0, cat.planejado - cat.pago);
            const pct = cat.planejado > 0 ? Math.min(100, (cat.pago / cat.planejado) * 100) : 0;
            const quitado = falta <= 0;
            const isPayingThis = payingCat === cat.key;
            return (
              <div key={cat.key}>
                <div className="px-3 py-2.5">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold text-foreground/80 uppercase tracking-wide">{cat.label}</span>
                        {cat.isMensal && <span className="text-[9px] bg-primary/10 text-primary px-1 rounded">mês</span>}
                        {!cat.isMensal && <span className="text-[9px] bg-muted text-muted-foreground px-1 rounded">campanha</span>}
                        {quitado && <CheckCircle2 size={10} className="text-green-500" />}
                      </div>
                      <Bar pago={cat.pago} total={cat.planejado}
                        cor={quitado ? "bg-green-500" : pct > 0 ? "bg-amber-500" : "bg-muted-foreground/30"} />
                      <div className="flex justify-between mt-0.5">
                        <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">✓ {fmt(cat.pago)}</span>
                        <span className="text-[10px] text-muted-foreground">/ {fmt(cat.planejado)}</span>
                      </div>
                      {!quitado && <span className="text-[10px] text-amber-600 dark:text-amber-400">⏳ falta {fmt(falta)}</span>}
                    </div>
                    {!quitado && (
                      <button
                        onClick={() => setPayingCat(isPayingThis ? null : cat.key)}
                        className={`shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors ${
                          isPayingThis ? "bg-muted text-muted-foreground" : "bg-gradient-to-r from-pink-500 to-rose-400 text-white"
                        }`}
                      >
                        {isPayingThis ? "✕" : "Pagar"}
                      </button>
                    )}
                  </div>
                </div>
                {isPayingThis && (
                  <QuickPayForm
                    valorEsperado={falta}
                    onSave={(valor, obs) => handleSave(cat.key, valor, obs)}
                    onCancel={() => setPayingCat(null)}
                    saving={saving}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagamento rápido da retirada (quando não está em ficha) */}
      {!showFicha && payingCat === "retirada" && retiradaMes && (
        <QuickPayForm
          valorEsperado={Math.max(0, retiradaMes.planejado - retiradaMes.pago)}
          onSave={(valor, obs) => handleSave("retirada", valor, obs)}
          onCancel={() => setPayingCat(null)}
          saving={saving}
        />
      )}

      {/* Ações */}
      <div className="flex border-t border-border/30 divide-x divide-border/30">
        {retiradadaPendente && !showFicha && (
          <button
            onClick={() => setPayingCat(payingCat === "retirada" ? null : "retirada")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-400 text-white"
          >
            $ Pagar
          </button>
        )}
        {!retiradadaPendente && !showFicha && (
          <button
            onClick={() => setPayingCat(payingCat === "retirada" ? null : "retirada")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] text-primary font-semibold hover:bg-primary/5"
          >
            $ + Pagamento
          </button>
        )}
        <button
          onClick={() => { setShowFicha(!showFicha); setShowHist(false); setPayingCat(null); }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] text-primary font-semibold hover:bg-primary/5"
        >
          <Receipt size={12} /> Ficha {showFicha ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>
      </div>

      {/* Histórico completo */}
      {showFicha && pagsSupAll.length > 0 && (
        <>
          <button
            onClick={() => setShowHist(!showHist)}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-[11px] text-muted-foreground border-t border-border/30 hover:bg-muted/20"
          >
            Histórico completo ({pagsSupAll.length}) {showHist ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {showHist && (
            <div className="bg-muted/10 border-t border-border/30">
              {[...pagsSupAll].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 30).map(p => (
                <HistoricoItem key={p.id} p={p} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Card Liderança / Admin ─────────────────────────────────────────────────────
function PessoaCard({ tipo, id, nome, subtitulo, valorEsperado, mesesCampanha, totalPagoMes, pagamentosMes, todosPagamentos, mes, ano }: {
  tipo: "lideranca" | "admin"; id: string; nome: string; subtitulo?: string;
  valorEsperado: number; mesesCampanha: number;
  totalPagoMes: number; pagamentosMes: Pagamento[];
  todosPagamentos: Pagamento[]; mes: number; ano: number;
}) {
  const qc = useQueryClient();
  const [paying, setPaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showHist, setShowHist] = useState(false);
  const falta = Math.max(0, valorEsperado - totalPagoMes);
  const pago = falta <= 0;
  const temAdiantamento = totalPagoMes > 0 && !pago;
  const categoria = tipo === "lideranca" ? "retirada" : "salario";
  const tipoColor = tipo === "lideranca" ? "text-violet-500 bg-violet-500/10" : "text-blue-500 bg-blue-500/10";
  const tipoLabel = tipo === "lideranca" ? "Liderança" : "Admin";
  const totalCampanha = valorEsperado * mesesCampanha;
  const totalPagoAll = (todosPagamentos || []).filter(p =>
    tipo === "lideranca" ? p.lideranca_id === id : p.admin_id === id
  ).reduce((a, p) => a + p.valor, 0);
  const pctCampanha = totalCampanha > 0 ? Math.min(100, (totalPagoAll / totalCampanha) * 100) : 0;

  const handleSave = async (valor: number, obs: string) => {
    setSaving(true);
    const { error } = await supabase.from("pagamentos").insert({
      tipo_pessoa: tipo, mes, ano, categoria, valor, observacao: obs || null,
      suplente_id: null,
      lideranca_id: tipo === "lideranca" ? id : null,
      admin_id: tipo === "admin" ? id : null,
    } as any); // eslint-disable-line
    setSaving(false);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else {
      toast({ title: `✅ ${fmt(valor)} registrado!`, description: nome });
      qc.invalidateQueries({ queryKey: ["pagamentos"] });
      setPaying(false);
    }
  };

  const handleDelete = async (pagId: string) => {
    if (!confirm("Excluir pagamento?")) return;
    await supabase.from("pagamentos").delete().eq("id", pagId);
    qc.invalidateQueries({ queryKey: ["pagamentos"] });
  };

  return (
    <div className={`bg-card rounded-2xl border shadow-sm overflow-hidden ${pago ? "border-green-500/20" : "border-amber-500/30"}`}>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
              <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${tipoColor}`}>{tipoLabel}</span>
              {pago && <CheckCircle2 size={10} className="text-green-500" />}
              {temAdiantamento && <span className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-md font-bold">Adiantamento</span>}
            </div>
            <p className="font-bold text-foreground text-sm truncate">{nome}</p>
            {subtitulo && <p className="text-[11px] text-muted-foreground truncate">{subtitulo}</p>}
            {/* Barra do mês atual */}
            {(temAdiantamento || !pago) && (
              <div className="mt-1">
                <p className="text-[10px] text-muted-foreground mb-0.5">
                  {MESES[mes - 1]} — {fmt(totalPagoMes)} / {fmt(valorEsperado)}
                </p>
                <Bar pago={totalPagoMes} total={valorEsperado}
                  cor={pago ? "bg-green-500" : temAdiantamento ? "bg-amber-500" : "bg-muted-foreground/30"} />
              </div>
            )}
            {/* Barra de campanha total */}
            {totalCampanha > 0 && (
              <div className="mt-1.5">
                <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5">
                  <span>Campanha total ({mesesCampanha} meses)</span>
                  <span>{fmt(totalPagoAll)} / {fmt(totalCampanha)}</span>
                </div>
                <Bar pago={totalPagoAll} total={totalCampanha}
                  cor={pctCampanha >= 100 ? "bg-green-500" : "bg-primary/60"} />
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            {pago ? (
              <>
                <p className="text-[10px] text-muted-foreground">Pago</p>
                <p className="text-base font-bold text-green-600 dark:text-green-400">{fmt(totalPagoMes)}</p>
                {totalPagoMes > valorEsperado && <p className="text-[10px] text-primary">+{fmt(totalPagoMes - valorEsperado)} extra</p>}
              </>
            ) : (
              <>
                <p className="text-[10px] text-muted-foreground">Falta</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400 leading-tight">{fmt(falta)}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {paying && (
        <QuickPayForm valorEsperado={falta > 0 ? falta : 0} onSave={handleSave} onCancel={() => setPaying(false)} saving={saving} />
      )}

      <div className="flex border-t border-border/30 divide-x divide-border/30">
        {!pago && (
          <button onClick={() => setPaying(!paying)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-400 text-white">
            $ Pagar
          </button>
        )}
        {pago && (
          <button onClick={() => setPaying(!paying)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] text-primary font-semibold hover:bg-primary/5">
            $ + Pagamento
          </button>
        )}
        {pagamentosMes.length > 0 && (
          <button onClick={() => setShowHist(!showHist)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] text-muted-foreground hover:bg-muted/20">
            <Receipt size={11} /> {pagamentosMes.length} pag. {showHist ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        )}
      </div>

      {showHist && (
        <div className="bg-muted/10 border-t border-border/30">
          {pagamentosMes.map(p => <HistoricoItem key={p.id} p={p} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function Pagamentos() {
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [aba, setAba] = useState<Aba>("suplentes");
  const [busca, setBusca] = useState("");
  const [showPagos, setShowPagos] = useState(false);

  const { data: suplentes, isLoading: loadS } = useQuery({
    queryKey: ["suplentes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suplentes").select(
        "id,nome,regiao_atuacao,partido,retirada_mensal_valor,retirada_mensal_meses,plotagem_qtd,plotagem_valor_unit,liderancas_qtd,liderancas_valor_unit,fiscais_qtd,fiscais_valor_unit"
      ).order("nome");
      if (error) throw error;
      return data as unknown as Suplente[];
    },
    staleTime: 300000,
  });

  const { data: liderancas, isLoading: loadL } = useQuery({
    queryKey: ["liderancas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("liderancas").select("id,nome,regiao,retirada_mensal_valor,retirada_mensal_meses,chave_pix").order("nome");
      if (error) throw error;
      return data as unknown as Lideranca[];
    },
    staleTime: 300000,
  });

  const { data: administrativo, isLoading: loadA } = useQuery({
    queryKey: ["administrativo"],
    queryFn: async () => {
      const { data, error } = await supabase.from("administrativo").select("id,nome,whatsapp,valor_contrato,valor_contrato_meses").order("nome");
      if (error) throw error;
      return data as unknown as AdminPessoa[];
    },
    staleTime: 300000,
  });

  const { data: pagamentos, isLoading: loadP } = useQuery({
    queryKey: ["pagamentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pagamentos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as Pagamento[];
    },
    staleTime: 300000,
  });

  const isLoading = loadS || loadL || loadA || loadP;

  const navMes = (dir: -1 | 1) => {
    let m = mes + dir, a = ano;
    if (m < 1) { m = 12; a--; } if (m > 12) { m = 1; a++; }
    setMes(m); setAno(a);
  };

  const pagsMes = (pagamentos || []).filter(p => p.mes === mes && p.ano === ano);

  // Totais
  const supPlanejadoMes = (suplentes || []).reduce((a, s) => a + (s.retirada_mensal_valor || 0), 0);
  const lidPlanejadoMes = (liderancas || []).reduce((a, l) => a + (l.retirada_mensal_valor || 0), 0);
  const admPlanejadoMes = (administrativo || []).reduce((a, a2) => a + (a2.valor_contrato || 0), 0);
  const totalPlanejadoMes = supPlanejadoMes + lidPlanejadoMes + admPlanejadoMes;
  const supPagoMes = pagsMes.filter(p => p.tipo_pessoa === "suplente").reduce((a, p) => a + p.valor, 0);
  const lidPagoMes = pagsMes.filter(p => p.tipo_pessoa === "lideranca").reduce((a, p) => a + p.valor, 0);
  const admPagoMes = pagsMes.filter(p => p.tipo_pessoa === "admin").reduce((a, p) => a + p.valor, 0);
  const totalPagoMes = supPagoMes + lidPagoMes + admPagoMes;
  const totalFaltaMes = Math.max(0, totalPlanejadoMes - totalPagoMes);

  // Suplentes filtradas
  const matchBusca = (nome: string, extra?: string) => {
    if (!busca.trim()) return true;
    const q = norm(busca);
    return norm(nome).includes(q) || norm(extra || "").includes(q);
  };

  const supsVisiveis = (suplentes || []).filter(s => {
    const temValor = (s.retirada_mensal_valor || 0) > 0 ||
      (s.plotagem_qtd || 0) * (s.plotagem_valor_unit || 0) > 0 ||
      (s.liderancas_qtd || 0) * (s.liderancas_valor_unit || 0) > 0 ||
      (s.fiscais_qtd || 0) * (s.fiscais_valor_unit || 0) > 0;
    return temValor && matchBusca(s.nome, [s.regiao_atuacao, s.partido].filter(Boolean).join(" "));
  });

  const isPagoMes = (s: Suplente) => {
    const esp = s.retirada_mensal_valor || 0;
    if (esp <= 0) return true;
    return pagsMes.filter(p => p.suplente_id === s.id && p.categoria === "retirada").reduce((a, p) => a + p.valor, 0) >= esp;
  };

  const supsPendentes = supsVisiveis.filter(s => !isPagoMes(s));
  const supsPagos = supsVisiveis.filter(s => isPagoMes(s));
  const supPagosCount = (suplentes || []).filter(s => (s.retirada_mensal_valor || 0) > 0 && isPagoMes(s)).length;
  const supTotal = (suplentes || []).filter(s => (s.retirada_mensal_valor || 0) > 0).length;

  // Lideranças filtradas
  const lidsVisiveis = (liderancas || []).filter(l =>
    (l.retirada_mensal_valor || 0) > 0 && matchBusca(l.nome, l.regiao || "")
  );
  const isPagoMesLid = (l: Lideranca) =>
    pagsMes.filter(p => p.lideranca_id === l.id).reduce((a, p) => a + p.valor, 0) >= (l.retirada_mensal_valor || 0);
  const lidsPendentes = lidsVisiveis.filter(l => !isPagoMesLid(l));
  const lidsPagos = lidsVisiveis.filter(l => isPagoMesLid(l));
  const lidPagosCount = (liderancas || []).filter(l => (l.retirada_mensal_valor || 0) > 0 && isPagoMesLid(l)).length;
  const lidTotal = (liderancas || []).filter(l => (l.retirada_mensal_valor || 0) > 0).length;

  // Admin filtrado
  const admVisiveis = (administrativo || []).filter(a =>
    (a.valor_contrato || 0) > 0 && matchBusca(a.nome, a.whatsapp || "")
  );
  const isPagoMesAdm = (a: AdminPessoa) =>
    pagsMes.filter(p => p.admin_id === a.id).reduce((b, p) => b + p.valor, 0) >= (a.valor_contrato || 0);
  const admPendentes = admVisiveis.filter(a => !isPagoMesAdm(a));
  const admPagos = admVisiveis.filter(a => isPagoMesAdm(a));
  const admPagosCount = (administrativo || []).filter(a => (a.valor_contrato || 0) > 0 && isPagoMesAdm(a)).length;
  const admTotal = (administrativo || []).filter(a => (a.valor_contrato || 0) > 0).length;

  const abas = [
    { id: "suplentes" as Aba, label: "Suplentes", icon: <List size={12} />, count: supTotal },
    { id: "liderancas" as Aba, label: "Lideranças", icon: <Users size={12} />, count: lidTotal },
    { id: "admin" as Aba, label: "Admin", icon: <Briefcase size={12} />, count: admTotal },
  ];

  const pendentes = aba === "suplentes" ? supsPendentes.length : aba === "liderancas" ? lidsPendentes.length : admPendentes.length;
  const pagosCnt = aba === "suplentes" ? supPagosCount : aba === "liderancas" ? lidPagosCount : admPagosCount;
  const total = aba === "suplentes" ? supTotal : aba === "liderancas" ? lidTotal : admTotal;
  const planejadoAba = aba === "suplentes" ? supPlanejadoMes : aba === "liderancas" ? lidPlanejadoMes : admPlanejadoMes;
  const pagoAba = aba === "suplentes" ? supPagoMes : aba === "liderancas" ? lidPagoMes : admPagoMes;

  // Cores por aba
  const abaCor = { suplentes: "bg-pink-500", liderancas: "bg-violet-500", admin: "bg-blue-500" };
  const abaCorText = { suplentes: "text-pink-500 bg-pink-500/10", liderancas: "text-violet-500 bg-violet-500/10", admin: "text-blue-500 bg-blue-500/10" };
  const abaLabel = { suplentes: "SUPLENTES", liderancas: "LIDERANÇAS", admin: "ADMINISTRATIVO" };

  return (
    <PageTransition>
      <div className="space-y-4">
        <h1 className="text-xl font-bold text-foreground">Pagamentos</h1>

        {/* Painel financeiro */}
        {!isLoading && (
          <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-4 shadow-sm">
            <p className="text-white/80 text-xs mb-3 flex items-center gap-1.5">
              <Wallet size={13} /> Painel Financeiro — {MESES[mes - 1]}/{ano}
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="bg-white/15 rounded-xl p-2.5 text-center">
                <p className="text-white/70 text-[9px] uppercase tracking-wider">Planejado</p>
                <p className="text-white font-bold text-sm leading-tight">{fmt(totalPlanejadoMes)}</p>
              </div>
              <div className="bg-white/15 rounded-xl p-2.5 text-center">
                <p className="text-white/70 text-[9px] uppercase tracking-wider">Pago</p>
                <p className="text-white font-bold text-sm leading-tight">{fmt(totalPagoMes)}</p>
              </div>
              <div className="bg-black/20 rounded-xl p-2.5 text-center">
                <p className="text-white/70 text-[9px] uppercase tracking-wider">Falta</p>
                <p className="text-white font-bold text-sm leading-tight">{fmt(totalFaltaMes)}</p>
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${totalPlanejadoMes > 0 ? Math.min(100, (totalPagoMes / totalPlanejadoMes) * 100) : 0}%` }} />
            </div>
            <div className="flex justify-between mt-1.5 text-white/60 text-[9px]">
              <span>{supPagosCount + lidPagosCount + admPagosCount} pagos · {(supTotal - supPagosCount) + (lidTotal - lidPagosCount) + (admTotal - admPagosCount)} pendentes</span>
              <span>{totalPlanejadoMes > 0 ? `${((totalPagoMes / totalPlanejadoMes) * 100).toFixed(0)}%` : "0%"}</span>
            </div>
          </div>
        )}

        {/* Seletor de mês */}
        <div className="bg-card rounded-2xl border border-border p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navMes(-1)}>
              <ChevronLeft size={20} />
            </Button>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{MESES[mes - 1]} {ano}</p>
              <p className="text-xs text-muted-foreground">Mês de referência</p>
            </div>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navMes(1)}>
              <ChevronRight size={20} />
            </Button>
          </div>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome..." className="pl-9 h-10 bg-card border-border rounded-xl text-sm" />
          {busca && <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setBusca("")}><X size={14} /></button>}
        </div>

        {/* Tabs */}
        <div className="flex bg-muted rounded-xl p-1 gap-1">
          {abas.map(a => (
            <button key={a.id} onClick={() => { setAba(a.id); setShowPagos(false); }}
              className={`flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold py-1.5 rounded-lg transition-all ${aba === a.id ? "bg-card shadow text-primary" : "text-muted-foreground"}`}>
              {a.icon}{a.label}
              <span className={`text-[9px] px-1 py-0.5 rounded-full font-bold ml-0.5 ${aba === a.id ? "bg-primary/10 text-primary" : "bg-muted-foreground/20"}`}>{a.count}</span>
            </button>
          ))}
        </div>

        {isLoading ? <CardSkeletonList count={5} /> : (
          <>
            {/* Resumo da aba */}
            {total > 0 && (
              <div className="bg-card rounded-2xl border border-border px-4 py-3 shadow-sm">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md flex items-center gap-1 ${abaCorText[aba]}`}>
                    {aba === "suplentes" ? <List size={9} /> : aba === "liderancas" ? <Users size={9} /> : <Briefcase size={9} />}
                    {abaLabel[aba]}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">{pagosCnt}/{total} pagos</span>
                  <div className="text-right">
                    <span className="text-xs font-bold text-foreground">{fmt(pagoAba)}</span>
                    <span className="text-[10px] text-muted-foreground"> / {fmt(planejadoAba)}</span>
                  </div>
                </div>
                <Bar pago={pagoAba} total={planejadoAba} cor={abaCor[aba]} />
                {planejadoAba > pagoAba && (
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">Falta: {fmt(planejadoAba - pagoAba)}</p>
                )}
              </div>
            )}

            {/* PENDENTES */}
            {pendentes > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-500" />
                  <h2 className="text-sm font-bold text-foreground">Falta pagar — {pendentes}</h2>
                  <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold ml-auto">
                    {aba === "suplentes" && fmt(supsPendentes.reduce((a, s) => a + Math.max(0, (s.retirada_mensal_valor || 0) - pagsMes.filter(p => p.suplente_id === s.id && p.categoria === "retirada").reduce((b, p) => b + p.valor, 0)), 0))}
                    {aba === "liderancas" && fmt(lidsPendentes.reduce((a, l) => a + Math.max(0, (l.retirada_mensal_valor || 0) - pagsMes.filter(p => p.lideranca_id === l.id).reduce((b, p) => b + p.valor, 0)), 0))}
                    {aba === "admin" && fmt(admPendentes.reduce((a, p) => a + Math.max(0, (p.valor_contrato || 0) - pagsMes.filter(pg => pg.admin_id === p.id).reduce((b, pg) => b + pg.valor, 0)), 0))}
                  </span>
                </div>

                {aba === "suplentes" && supsPendentes.map(s => (
                  <SuplenteCard key={s.id} suplente={s} pagamentosMes={pagsMes} todosPagamentos={pagamentos || []} mes={mes} ano={ano} />
                ))}
                {aba === "liderancas" && lidsPendentes.map(l => {
                  const pagsL = pagsMes.filter(p => p.lideranca_id === l.id);
                  return <PessoaCard key={l.id} tipo="lideranca" id={l.id} nome={l.nome}
                    subtitulo={[l.regiao, l.chave_pix ? `PIX: ${l.chave_pix}` : undefined].filter(Boolean).join(" · ")}
                    valorEsperado={l.retirada_mensal_valor || 0} mesesCampanha={l.retirada_mensal_meses || 10}
                    totalPagoMes={pagsL.reduce((a, p) => a + p.valor, 0)}
                    pagamentosMes={pagsL} todosPagamentos={pagamentos || []} mes={mes} ano={ano} />;
                })}
                {aba === "admin" && admPendentes.map(a => {
                  const pagsA = pagsMes.filter(p => p.admin_id === a.id);
                  return <PessoaCard key={a.id} tipo="admin" id={a.id} nome={a.nome}
                    subtitulo={a.whatsapp || undefined}
                    valorEsperado={a.valor_contrato || 0} mesesCampanha={a.valor_contrato_meses || 10}
                    totalPagoMes={pagsA.reduce((b, p) => b + p.valor, 0)}
                    pagamentosMes={pagsA} todosPagamentos={pagamentos || []} mes={mes} ano={ano} />;
                })}
              </div>
            )}

            {/* Tudo pago */}
            {pendentes === 0 && total > 0 && !busca && (
              <div className="flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/30 rounded-2xl py-4">
                <CheckCircle2 size={18} className="text-green-500" />
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  Todos pagos em {MESES[mes - 1]}!
                </p>
              </div>
            )}

            {/* PAGOS */}
            {pagosCnt > 0 && (
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between py-2 px-1"
                  onClick={() => setShowPagos(!showPagos)}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <h2 className="text-sm font-bold text-foreground">Pagos — {pagosCnt}</h2>
                  </div>
                  {showPagos ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
                </button>

                {showPagos && aba === "suplentes" && supsPagos.map(s => (
                  <SuplenteCard key={s.id} suplente={s} pagamentosMes={pagsMes} todosPagamentos={pagamentos || []} mes={mes} ano={ano} />
                ))}
                {showPagos && aba === "liderancas" && lidsPagos.map(l => {
                  const pagsL = pagsMes.filter(p => p.lideranca_id === l.id);
                  return <PessoaCard key={l.id} tipo="lideranca" id={l.id} nome={l.nome}
                    subtitulo={[l.regiao, l.chave_pix ? `PIX: ${l.chave_pix}` : undefined].filter(Boolean).join(" · ")}
                    valorEsperado={l.retirada_mensal_valor || 0} mesesCampanha={l.retirada_mensal_meses || 10}
                    totalPagoMes={pagsL.reduce((a, p) => a + p.valor, 0)}
                    pagamentosMes={pagsL} todosPagamentos={pagamentos || []} mes={mes} ano={ano} />;
                })}
                {showPagos && aba === "admin" && admPagos.map(a => {
                  const pagsA = pagsMes.filter(p => p.admin_id === a.id);
                  return <PessoaCard key={a.id} tipo="admin" id={a.id} nome={a.nome}
                    subtitulo={a.whatsapp || undefined}
                    valorEsperado={a.valor_contrato || 0} mesesCampanha={a.valor_contrato_meses || 10}
                    totalPagoMes={pagsA.reduce((b, p) => b + p.valor, 0)}
                    pagamentosMes={pagsA} todosPagamentos={pagamentos || []} mes={mes} ano={ano} />;
                })}
              </div>
            )}

            {total === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">Nenhuma pessoa cadastrada nesta categoria</p>
              </div>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
