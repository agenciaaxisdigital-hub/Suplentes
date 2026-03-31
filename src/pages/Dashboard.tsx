import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Users, Vote, TrendingUp, MapPin, ChevronDown, ChevronUp,
  FileDown, FileSpreadsheet, Wallet, CheckCircle2, AlertCircle, Briefcase,
  UserCog, BarChart2, List, Clock, Search, X,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { exportAllPDF, exportExcel } from "@/lib/exports";
import { calcTotaisFinanceiros } from "@/lib/finance";
import { PageTransition } from "@/components/PageTransition";
import { CardSkeletonList } from "@/components/CardSkeleton";

const norm = (s: string) => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const fmt = (v: number) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtN = (v: number) => (v || 0).toLocaleString("pt-BR");

function Bar({ pago, total, cor = "bg-primary" }: { pago: number; total: number; cor?: string }) {
  const pct = total > 0 ? Math.min(100, (pago / total) * 100) : 0;
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ${cor}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function Section({ title, icon, children, defaultOpen = true }: {
  title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <span className="text-sm font-bold text-foreground uppercase tracking-wider">{title}</span>
        </div>
        {open ? <ChevronUp size={15} className="text-muted-foreground" /> : <ChevronDown size={15} className="text-muted-foreground" />}
      </button>
      {open && <div className="border-t border-border/50">{children}</div>}
    </div>
  );
}

export default function Dashboard() {
  const now = new Date();
  const mes = now.getMonth() + 1;
  const ano = now.getFullYear();

  const [showAllSuplentes, setShowAllSuplentes] = useState(false);
  const [showAllLids, setShowAllLids] = useState(false);
  const [showAllAdms, setShowAllAdms] = useState(false);
  const [search, setSearch] = useState("");

  const { data: suplentes, isLoading: loadS } = useQuery({
    queryKey: ["suplentes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suplentes").select("*").order("nome");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: liderancas, isLoading: loadL } = useQuery({
    queryKey: ["liderancas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("liderancas").select("*").order("nome");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: administrativo, isLoading: loadA } = useQuery({
    queryKey: ["administrativo"],
    queryFn: async () => {
      const { data, error } = await supabase.from("administrativo").select("*").order("nome");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: pagamentos, isLoading: loadP } = useQuery({
    queryKey: ["pagamentos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pagamentos").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: usuarios } = useQuery({
    queryKey: ["usuarios_dash"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("manage-users", { body: { action: "list" } });
      if (error || data?.error) return [] as any[];
      return data.users as any[];
    },
  });

  const isLoading = loadS || loadL || loadA || loadP;

  const pagsMes = useMemo(() => (pagamentos || []).filter((p: any) => p.mes === mes && p.ano === ano), [pagamentos, mes, ano]);

  // ── Suplentes ─────────────────────────────────────────────────────────────────
  const supData = useMemo(() => {
    return (suplentes || []).map((s: any) => {
      const totalCamp = calcTotaisFinanceiros(s).totalFinal;
      const pagoMes = pagsMes.filter((p: any) => p.suplente_id === s.id && p.categoria === "retirada").reduce((a: number, p: any) => a + p.valor, 0);
      const planejadoMes = s.retirada_mensal_valor || 0;
      const pago = pagoMes >= planejadoMes;
      const pagoAll = (pagamentos || []).filter((p: any) => p.suplente_id === s.id).reduce((a: number, p: any) => a + p.valor, 0);
      return { ...s, totalCamp, pagoMes, planejadoMes, pago, pagoAll };
    });
  }, [suplentes, pagsMes, pagamentos]);

  const supPlanejadoMes = supData.reduce((a: number, s: any) => a + s.planejadoMes, 0);
  const supPagoMes = supData.reduce((a: number, s: any) => a + s.pagoMes, 0);
  const supFaltaMes = Math.max(0, supPlanejadoMes - supPagoMes);
  const supTotalCamp = supData.reduce((a: number, s: any) => a + s.totalCamp, 0);
  const supPagoAll = supData.reduce((a: number, s: any) => a + s.pagoAll, 0);
  const supPendentes = supData.filter((s: any) => !s.pago && s.planejadoMes > 0);
  const supPagos = supData.filter((s: any) => s.pago && s.planejadoMes > 0);

  // ── Lideranças ────────────────────────────────────────────────────────────────
  const lidData = useMemo(() => {
    return (liderancas || []).map((l: any) => {
      const planejadoMes = l.retirada_mensal_valor || 0;
      const pagoMes = pagsMes.filter((p: any) => p.lideranca_id === l.id).reduce((a: number, p: any) => a + p.valor, 0);
      const pago = pagoMes >= planejadoMes;
      const totalCamp = planejadoMes * (l.retirada_mensal_meses || 10);
      const pagoAll = (pagamentos || []).filter((p: any) => p.lideranca_id === l.id).reduce((a: number, p: any) => a + p.valor, 0);
      return { ...l, planejadoMes, pagoMes, pago, totalCamp, pagoAll };
    });
  }, [liderancas, pagsMes, pagamentos]);

  const lidPlanejadoMes = lidData.reduce((a: number, l: any) => a + l.planejadoMes, 0);
  const lidPagoMes = lidData.reduce((a: number, l: any) => a + l.pagoMes, 0);
  const lidFaltaMes = Math.max(0, lidPlanejadoMes - lidPagoMes);
  const lidTotalCamp = lidData.reduce((a: number, l: any) => a + l.totalCamp, 0);
  const lidPagoAll = lidData.reduce((a: number, l: any) => a + l.pagoAll, 0);
  const lidPendentes = lidData.filter((l: any) => !l.pago && l.planejadoMes > 0);
  const lidPagos = lidData.filter((l: any) => l.pago && l.planejadoMes > 0);

  // ── Admin ─────────────────────────────────────────────────────────────────────
  const admData = useMemo(() => {
    return (administrativo || []).map((a: any) => {
      const planejadoMes = a.valor_contrato || 0;
      const pagoMes = pagsMes.filter((p: any) => p.admin_id === a.id).reduce((b: number, p: any) => b + p.valor, 0);
      const pago = pagoMes >= planejadoMes;
      const totalCamp = planejadoMes * (a.valor_contrato_meses || 10);
      const pagoAll = (pagamentos || []).filter((p: any) => p.admin_id === a.id).reduce((b: number, p: any) => b + p.valor, 0);
      return { ...a, planejadoMes, pagoMes, pago, totalCamp, pagoAll };
    });
  }, [administrativo, pagsMes, pagamentos]);

  const admPlanejadoMes = admData.reduce((a: number, d: any) => a + d.planejadoMes, 0);
  const admPagoMes = admData.reduce((a: number, d: any) => a + d.pagoMes, 0);
  const admFaltaMes = Math.max(0, admPlanejadoMes - admPagoMes);
  const admTotalCamp = admData.reduce((a: number, d: any) => a + d.totalCamp, 0);
  const admPagoAll = admData.reduce((a: number, d: any) => a + d.pagoAll, 0);
  const admPendentes = admData.filter((d: any) => !d.pago && d.planejadoMes > 0);
  const admPagos = admData.filter((d: any) => d.pago && d.planejadoMes > 0);

  // ── Totais gerais ─────────────────────────────────────────────────────────────
  const totalPlanejadoMes = supPlanejadoMes + lidPlanejadoMes + admPlanejadoMes;
  const totalPagoMes = supPagoMes + lidPagoMes + admPagoMes;
  const totalFaltaMes = Math.max(0, totalPlanejadoMes - totalPagoMes);
  const totalCampanha = supTotalCamp + lidTotalCamp + admTotalCamp;
  const totalPagoAll = supPagoAll + lidPagoAll + admPagoAll;
  const totalPendentes = supPendentes.length + lidPendentes.length + admPendentes.length;
  const totalPagos = supPagos.length + lidPagos.length + admPagos.length;

  // Votos
  const totalVotos = (suplentes || []).reduce((a: number, s: any) => a + (s.total_votos || 0), 0);
  const totalExpectativa = (suplentes || []).reduce((a: number, s: any) => a + (s.expectativa_votos || 0), 0);

  function PersonRow({ nome, subtitulo, planejadoMes, pagoMes, pago, totalCamp, pagoAll }: any) {
    const falta = Math.max(0, planejadoMes - pagoMes);
    const pctCamp = totalCamp > 0 ? Math.min(100, (pagoAll / totalCamp) * 100) : 0;
    return (
      <div className={`px-4 py-3 border-b border-border/30 last:border-0 ${!pago ? "bg-amber-500/5" : ""}`}>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              {pago
                ? <CheckCircle2 size={11} className="text-green-500 shrink-0" />
                : <AlertCircle size={11} className="text-amber-500 shrink-0" />}
              <p className="text-sm font-semibold text-foreground truncate">{nome}</p>
            </div>
            {subtitulo && <p className="text-[10px] text-muted-foreground ml-4">{subtitulo}</p>}
          </div>
          <div className="text-right shrink-0">
            {pago
              ? <p className="text-xs font-bold text-green-600 dark:text-green-400">{fmt(pagoMes)}</p>
              : <p className="text-xs font-bold text-amber-600 dark:text-amber-400">falta {fmt(falta)}</p>}
            <p className="text-[9px] text-muted-foreground">{fmt(planejadoMes)}/mês</p>
          </div>
        </div>
        {totalCamp > 0 && (
          <div className="ml-4">
            <Bar pago={pagoAll} total={totalCamp} cor={pctCamp >= 100 ? "bg-green-500" : pago ? "bg-primary/60" : "bg-amber-400"} />
            <div className="flex justify-between mt-0.5">
              <span className="text-[9px] text-muted-foreground">{fmt(pagoAll)} pago</span>
              <span className="text-[9px] text-muted-foreground">{pctCamp.toFixed(0)}% de {fmt(totalCamp)}</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => exportAllPDF(suplentes || [])} disabled={!suplentes?.length}>
              <FileDown size={13} /> PDF
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => exportExcel(suplentes || [])} disabled={!suplentes?.length}>
              <FileSpreadsheet size={13} /> Excel
            </Button>
          </div>
        </div>

        {/* Busca */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Filtrar por nome..." className="pl-9 h-10 bg-card border-border rounded-xl text-sm" />
          {search && <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setSearch("")}><X size={14} /></button>}
        </div>

        {isLoading ? <CardSkeletonList count={6} /> : (
          <>
            {/* ── Painel do mês ──────────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center gap-1.5 text-white/80 text-xs mb-3">
                <Wallet size={13} /> Painel do Mês — {MESES[mes - 1]}/{ano}
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="bg-white/15 rounded-xl p-2.5 text-center">
                  <p className="text-white/70 text-[9px] uppercase tracking-wider">Planejado</p>
                  <p className="text-white font-bold text-sm">{fmt(totalPlanejadoMes)}</p>
                </div>
                <div className="bg-white/15 rounded-xl p-2.5 text-center">
                  <p className="text-white/70 text-[9px] uppercase tracking-wider">Pago</p>
                  <p className="text-white font-bold text-sm">{fmt(totalPagoMes)}</p>
                </div>
                <div className="bg-black/20 rounded-xl p-2.5 text-center">
                  <p className="text-white/70 text-[9px] uppercase tracking-wider">Falta</p>
                  <p className="text-white font-bold text-sm">{fmt(totalFaltaMes)}</p>
                </div>
              </div>
              <Bar pago={totalPagoMes} total={totalPlanejadoMes} cor="bg-white" />
              <div className="flex justify-between mt-1 text-white/60 text-[9px]">
                <span>{totalPendentes} pendentes · {totalPagos} pagos</span>
                <span>{totalPlanejadoMes > 0 ? ((totalPagoMes / totalPlanejadoMes) * 100).toFixed(0) : 0}%</span>
              </div>
            </div>

            {/* ── Totais campanha ───────────────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-border shadow-sm p-4 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <BarChart2 size={15} className="text-primary" />
                <span className="text-sm font-bold text-foreground uppercase tracking-wider">Total Campanha</span>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Suplentes", pago: supPagoAll, total: supTotalCamp, cor: "bg-pink-500" },
                  { label: "Lideranças", pago: lidPagoAll, total: lidTotalCamp, cor: "bg-violet-500" },
                  { label: "Administrativo", pago: admPagoAll, total: admTotalCamp, cor: "bg-blue-500" },
                ].map(row => (
                  <div key={row.label}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="text-muted-foreground font-medium">{row.label}</span>
                      <span className="text-foreground font-semibold">{fmt(row.pago)} <span className="text-muted-foreground font-normal">/ {fmt(row.total)}</span></span>
                    </div>
                    <Bar pago={row.pago} total={row.total} cor={row.cor} />
                  </div>
                ))}
                <div className="pt-2 border-t border-border/50">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-foreground">TOTAL GERAL</span>
                    <span className="text-primary">{fmt(totalPagoAll)} / {fmt(totalCampanha)}</span>
                  </div>
                  <Bar pago={totalPagoAll} total={totalCampanha} cor="bg-primary" />
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Falta: <span className="text-amber-600 font-medium">{fmt(Math.max(0, totalCampanha - totalPagoAll))}</span>
                    {" · "}{totalCampanha > 0 ? ((totalPagoAll / totalCampanha) * 100).toFixed(1) : 0}% pago
                  </p>
                </div>
              </div>
            </div>

            {/* ── Resumo rápido ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card rounded-2xl border border-border p-3 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><Vote size={13} className="text-primary" /> Votos eleição</div>
                <p className="text-xl font-bold text-foreground">{fmtN(totalVotos)}</p>
                <p className="text-[10px] text-muted-foreground">Expectativa: {fmtN(totalExpectativa)}</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-3 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><Users size={13} className="text-primary" /> Suplentes</div>
                <p className="text-xl font-bold text-foreground">{(suplentes || []).length}</p>
                <p className="text-[10px] text-muted-foreground">
                  Lideranças: {(liderancas || []).length} · Admin: {(administrativo || []).length}
                </p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-3 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><AlertCircle size={13} className="text-amber-500" /> Pendentes mês</div>
                <p className="text-xl font-bold text-amber-600">{totalPendentes}</p>
                <p className="text-[10px] text-muted-foreground">{fmt(totalFaltaMes)} a pagar</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-3 shadow-sm">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1"><CheckCircle2 size={13} className="text-green-500" /> Pagos mês</div>
                <p className="text-xl font-bold text-green-600">{totalPagos}</p>
                <p className="text-[10px] text-muted-foreground">{fmt(totalPagoMes)} pago</p>
              </div>
            </div>

            {/* ── Suplentes ────────────────────────────────────────────────── */}
            <Section title={`Suplentes — ${MESES[mes - 1]}`} icon={<List size={14} />}>
              <div className="px-4 py-2 bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Planejado: <b className="text-foreground">{fmt(supPlanejadoMes)}</b></span>
                <span>Pago: <b className="text-green-600">{fmt(supPagoMes)}</b></span>
                <span>Falta: <b className="text-amber-600">{fmt(supFaltaMes)}</b></span>
              </div>
              {supPendentes.length > 0 && (
                <div className="px-4 py-1.5 bg-amber-500/5 border-b border-amber-500/20">
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
                    {supPendentes.length} pendentes este mês
                  </p>
                </div>
              )}
              {(() => {
                const filtered = supData.filter((s: any) => s.planejadoMes > 0 && (!search.trim() || norm(s.nome).includes(norm(search)) || norm(s.regiao_atuacao || "").includes(norm(search))));
                const visible = showAllSuplentes || search.trim() ? filtered : filtered.slice(0, 5);
                return (<>
                  {visible.map((s: any) => (
                    <PersonRow key={s.id} nome={s.nome}
                      subtitulo={[s.regiao_atuacao, s.partido].filter(Boolean).join(" · ")}
                      planejadoMes={s.planejadoMes} pagoMes={s.pagoMes} pago={s.pago}
                      totalCamp={s.totalCamp} pagoAll={s.pagoAll} />
                  ))}
                  {!search.trim() && filtered.length > 5 && (
                    <button onClick={() => setShowAllSuplentes(!showAllSuplentes)}
                      className="w-full py-2 text-xs text-primary font-medium flex items-center justify-center gap-1">
                      {showAllSuplentes ? <><ChevronUp size={13} /> Mostrar menos</> : <><ChevronDown size={13} /> Ver todos ({filtered.length})</>}
                    </button>
                  )}
                  {search.trim() && filtered.length === 0 && <p className="px-4 py-3 text-sm text-muted-foreground">Nenhum resultado.</p>}
                </>);
              })()}
            </Section>

            {/* ── Lideranças ───────────────────────────────────────────────── */}
            <Section title={`Lideranças — ${MESES[mes - 1]}`} icon={<Users size={14} />} defaultOpen={false}>
              <div className="px-4 py-2 bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Planejado: <b className="text-foreground">{fmt(lidPlanejadoMes)}</b></span>
                <span>Pago: <b className="text-green-600">{fmt(lidPagoMes)}</b></span>
                <span>Falta: <b className="text-amber-600">{fmt(lidFaltaMes)}</b></span>
              </div>
              {lidPendentes.length > 0 && (
                <div className="px-4 py-1.5 bg-amber-500/5 border-b border-amber-500/20">
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
                    {lidPendentes.length} pendentes este mês
                  </p>
                </div>
              )}
              {(() => {
                const filtered = lidData.filter((l: any) => l.planejadoMes > 0 && (!search.trim() || norm(l.nome).includes(norm(search)) || norm(l.regiao || "").includes(norm(search))));
                const visible = showAllLids || search.trim() ? filtered : filtered.slice(0, 5);
                return (<>
                  {visible.map((l: any) => (
                    <PersonRow key={l.id} nome={l.nome} subtitulo={l.regiao || undefined}
                      planejadoMes={l.planejadoMes} pagoMes={l.pagoMes} pago={l.pago}
                      totalCamp={l.totalCamp} pagoAll={l.pagoAll} />
                  ))}
                  {!search.trim() && filtered.length > 5 && (
                    <button onClick={() => setShowAllLids(!showAllLids)}
                      className="w-full py-2 text-xs text-primary font-medium flex items-center justify-center gap-1">
                      {showAllLids ? <><ChevronUp size={13} /> Mostrar menos</> : <><ChevronDown size={13} /> Ver todos ({filtered.length})</>}
                    </button>
                  )}
                  {search.trim() && filtered.length === 0 && <p className="px-4 py-3 text-sm text-muted-foreground">Nenhum resultado.</p>}
                </>);
              })()}
            </Section>

            {/* ── Administrativo ───────────────────────────────────────────── */}
            <Section title={`Administrativo — ${MESES[mes - 1]}`} icon={<Briefcase size={14} />} defaultOpen={false}>
              <div className="px-4 py-2 bg-muted/30 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Planejado: <b className="text-foreground">{fmt(admPlanejadoMes)}</b></span>
                <span>Pago: <b className="text-green-600">{fmt(admPagoMes)}</b></span>
                <span>Falta: <b className="text-amber-600">{fmt(admFaltaMes)}</b></span>
              </div>
              {admPendentes.length > 0 && (
                <div className="px-4 py-1.5 bg-amber-500/5 border-b border-amber-500/20">
                  <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">
                    {admPendentes.length} pendentes este mês
                  </p>
                </div>
              )}
              {(() => {
                const filtered = admData.filter((d: any) => d.planejadoMes > 0 && (!search.trim() || norm(d.nome).includes(norm(search))));
                const visible = showAllAdms || search.trim() ? filtered : filtered.slice(0, 5);
                return (<>
                  {visible.map((d: any) => (
                    <PersonRow key={d.id} nome={d.nome} subtitulo={d.whatsapp || undefined}
                      planejadoMes={d.planejadoMes} pagoMes={d.pagoMes} pago={d.pago}
                      totalCamp={d.totalCamp} pagoAll={d.pagoAll} />
                  ))}
                  {search.trim() && filtered.length === 0 && <p className="px-4 py-3 text-sm text-muted-foreground">Nenhum resultado.</p>}
                </>);
              })()}
              {!search.trim() && admData.filter((d: any) => d.planejadoMes > 0).length > 5 && (
                <button onClick={() => setShowAllAdms(!showAllAdms)}
                  className="w-full py-2 text-xs text-primary font-medium flex items-center justify-center gap-1">
                  {showAllAdms ? <><ChevronUp size={13} /> Mostrar menos</> : <><ChevronDown size={13} /> Ver todos ({admData.filter((d: any) => d.planejadoMes > 0).length})</>}
                </button>
              )}
            </Section>

            {/* ── Detalhamento suplentes campanha ──────────────────────────── */}
            <Section title="Detalhamento Campanha Suplentes" icon={<TrendingUp size={14} />} defaultOpen={false}>
              {(suplentes || []).map((s: any) => {
                const totais = calcTotaisFinanceiros(s);
                const pagoAll = (pagamentos || []).filter((p: any) => p.suplente_id === s.id).reduce((a: number, p: any) => a + p.valor, 0);
                const pct = totais.totalFinal > 0 ? Math.min(100, (pagoAll / totais.totalFinal) * 100) : 0;
                return (
                  <div key={s.id} className="px-4 py-3 border-b border-border/30 last:border-0">
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{s.nome}</p>
                        {s.regiao_atuacao && <p className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MapPin size={9} />{s.regiao_atuacao}</p>}
                      </div>
                      <p className="text-sm font-bold text-primary">{fmt(totais.totalFinal)}</p>
                    </div>
                    <div className="grid grid-cols-4 gap-1 mb-1.5 text-center">
                      {[
                        { label: "Retirada", v: (s.retirada_mensal_valor || 0) * (s.retirada_mensal_meses || 0) },
                        { label: "Plotagem", v: (s.plotagem_qtd || 0) * (s.plotagem_valor_unit || 0) },
                        { label: "Lideranças", v: (s.liderancas_qtd || 0) * (s.liderancas_valor_unit || 0) },
                        { label: "Fiscais", v: (s.fiscais_qtd || 0) * (s.fiscais_valor_unit || 0) },
                      ].map(item => (
                        <div key={item.label} className="bg-muted/40 rounded-lg py-1">
                          <p className="text-[8px] text-muted-foreground uppercase">{item.label}</p>
                          <p className="text-[10px] font-semibold text-foreground">{fmt(item.v)}</p>
                        </div>
                      ))}
                    </div>
                    <Bar pago={pagoAll} total={totais.totalFinal} cor={pct >= 100 ? "bg-green-500" : "bg-primary"} />
                    <div className="flex justify-between mt-0.5">
                      <span className="text-[9px] text-green-600">{fmt(pagoAll)} pago</span>
                      <span className="text-[9px] text-muted-foreground">{pct.toFixed(0)}%</span>
                    </div>
                  </div>
                );
              })}
            </Section>

            {/* ── Usuários ─────────────────────────────────────────────────── */}
            <Section title="Usuários do Sistema" icon={<UserCog size={14} />} defaultOpen={false}>
              {!usuarios || usuarios.length === 0
                ? <p className="px-4 py-4 text-sm text-muted-foreground">Nenhum usuário encontrado.</p>
                : (usuarios || []).map((u: any) => {
                  const name = u.email?.replace("@painel.sarelli.com", "") ?? u.email;
                  return (
                    <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <UserCog size={14} className="text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground">{name}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock size={9} /> {new Date(u.created_at).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </Section>
          </>
        )}
      </div>
    </PageTransition>
  );
}
