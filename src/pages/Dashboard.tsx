import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Users, DollarSign, Vote, TrendingUp, MapPin, ChevronDown, ChevronUp, FileDown, FileSpreadsheet, UserCheck, Eye, Car, Banknote } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportAllPDF, exportExcel } from "@/lib/exports";

export default function Dashboard() {
  const [expanded, setExpanded] = useState(false);

  const { data: suplentes } = useQuery({
    queryKey: ["suplentes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suplentes").select("*").order("nome");
      if (error) throw error;
      return data;
    },
  });

  const list = suplentes ?? [];
  const totalCadastros = list.length;
  const totalVotos = list.reduce((a: number, s: any) => a + (s.total_votos || 0), 0);
  const totalExpectativa = list.reduce((a: number, s: any) => a + (s.expectativa_votos || 0), 0);
  const totalLiderancas = list.reduce((a: number, s: any) => a + (s.liderancas_qtd || 0), 0);
  const totalFiscais = list.reduce((a: number, s: any) => a + (s.fiscais_qtd || 0), 0);
  const totalPessoas = totalLiderancas + totalFiscais;
  const totalCampanha = list.reduce((a: number, s: any) => a + (Number(s.total_campanha) || 0), 0);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const fmtN = (v: number) => v.toLocaleString("pt-BR");

  const visibleList = expanded ? list : list.slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => exportAllPDF(list)} disabled={list.length === 0}>
            <FileDown size={14} /> PDF
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => exportExcel(list)} disabled={list.length === 0}>
            <FileSpreadsheet size={14} /> Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-primary" />
            <span className="text-xs text-muted-foreground">Suplentes</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalCadastros}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <div className="flex items-center gap-2">
            <Vote size={16} className="text-primary" />
            <span className="text-xs text-muted-foreground">Votos (passada)</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{fmtN(totalVotos)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-primary" />
            <span className="text-xs text-muted-foreground">Expectativa</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{fmtN(totalExpectativa)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-border p-4 space-y-1 shadow-sm">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-primary" />
            <span className="text-xs text-muted-foreground">Pessoas de Campo</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{fmtN(totalPessoas)}</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-pink-500 to-rose-400 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-2 text-sm text-white/80 mb-1">
          <DollarSign size={16} /> Valor Total das Campanhas
        </div>
        <p className="text-3xl font-bold text-white">{fmt(totalCampanha)}</p>
      </div>

      <div className="bg-card rounded-2xl border border-border p-4 space-y-3 shadow-sm">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Detalhamento</h2>
        <div className="flex justify-between items-center py-1 border-b border-border/50">
          <span className="text-sm text-muted-foreground">Total Lideranças</span>
          <span className="text-sm font-semibold text-foreground">{fmtN(totalLiderancas)}</span>
        </div>
        <div className="flex justify-between items-center py-1 border-b border-border/50">
          <span className="text-sm text-muted-foreground">Total Fiscais</span>
          <span className="text-sm font-semibold text-foreground">{fmtN(totalFiscais)}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-muted-foreground">Total Pessoas de Campo</span>
          <span className="text-sm font-semibold text-foreground">{fmtN(totalPessoas)}</span>
        </div>
      </div>

      {/* Resumo por Candidato - Cards mobile-friendly */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Resumo por Candidato</h2>

        {visibleList.map((s: any) => {
          const pessoas = (s.liderancas_qtd || 0) + (s.fiscais_qtd || 0);
          return (
            <div key={s.id} className="bg-card rounded-2xl border border-border p-4 shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{s.nome}</p>
                  {s.regiao_atuacao && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin size={10} /> {s.regiao_atuacao}
                    </p>
                  )}
                </div>
                <span className="text-sm font-bold text-primary whitespace-nowrap">
                  {fmt(Number(s.total_campanha) || 0)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Votos</p>
                  <p className="text-sm font-bold text-foreground">{fmtN(s.total_votos || 0)}</p>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Expect.</p>
                  <p className="text-sm font-bold text-foreground">{fmtN(s.expectativa_votos || 0)}</p>
                </div>
                <div className="bg-muted rounded-lg p-2 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase">Pessoas</p>
                  <p className="text-sm font-bold text-foreground">{fmtN(pessoas)}</p>
                </div>
              </div>
            </div>
          );
        })}

        {list.length > 5 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-primary bg-card rounded-2xl border border-border shadow-sm hover:bg-muted transition-colors"
          >
            {expanded ? (
              <>Mostrar menos <ChevronUp size={16} /></>
            ) : (
              <>Ver todos ({list.length}) <ChevronDown size={16} /></>
            )}
          </button>
        )}

        {/* Total geral */}
        <div className="bg-gradient-to-r from-pink-500/10 to-rose-400/10 rounded-2xl border border-primary/20 p-4 space-y-2">
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Total Geral</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Votos</p>
              <p className="text-sm font-bold text-foreground">{fmtN(totalVotos)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Expect.</p>
              <p className="text-sm font-bold text-foreground">{fmtN(totalExpectativa)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase">Pessoas</p>
              <p className="text-sm font-bold text-foreground">{fmtN(totalPessoas)}</p>
            </div>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-primary/20">
            <span className="text-sm font-bold text-foreground">TOTAL CAMPANHA</span>
            <span className="text-lg font-bold text-primary">{fmt(totalCampanha)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}