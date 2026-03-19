import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Users, DollarSign, Vote, MapPin, TrendingUp } from "lucide-react";

export default function Dashboard() {
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

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Dashboard</h1>

      {/* Cards de resumo */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={Users} label="Candidatos" value={totalCadastros.toString()} color="text-primary" />
        <StatCard icon={Vote} label="Votos (passada)" value={fmtN(totalVotos)} color="text-blue-400" />
        <StatCard icon={TrendingUp} label="Expectativa" value={fmtN(totalExpectativa)} color="text-green-400" />
        <StatCard icon={Users} label="Pessoas de Campo" value={fmtN(totalPessoas)} color="text-yellow-400" />
      </div>

      {/* Total geral */}
      <div className="bg-gradient-to-r from-primary/20 to-pink-500/20 rounded-xl border border-primary/30 p-5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <DollarSign size={16} className="text-primary" /> Valor Total das Campanhas
        </div>
        <p className="text-3xl font-bold text-primary">{fmt(totalCampanha)}</p>
      </div>

      {/* Detalhamento */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider">Detalhamento</h2>
        <DetailRow label="Total Lideranças" value={fmtN(totalLiderancas)} />
        <DetailRow label="Total Fiscais" value={fmtN(totalFiscais)} />
        <DetailRow label="Total Pessoas de Campo" value={fmtN(totalPessoas)} />
      </div>

      {/* Tabela resumo por candidato */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <h2 className="text-sm font-semibold text-primary uppercase tracking-wider p-4 pb-2">Resumo por Candidato</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs text-muted-foreground">
                <th className="text-left p-3">Nome</th>
                <th className="text-left p-3">Região</th>
                <th className="text-right p-3">Votos</th>
                <th className="text-right p-3">Expect.</th>
                <th className="text-right p-3">Pessoas</th>
                <th className="text-right p-3">Total (R$)</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s: any) => (
                <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="p-3 font-medium text-foreground whitespace-nowrap">{s.nome}</td>
                  <td className="p-3 text-muted-foreground whitespace-nowrap">
                    <span className="flex items-center gap-1"><MapPin size={12} />{s.regiao_atuacao}</span>
                  </td>
                  <td className="p-3 text-right">{fmtN(s.total_votos || 0)}</td>
                  <td className="p-3 text-right">{fmtN(s.expectativa_votos || 0)}</td>
                  <td className="p-3 text-right">{fmtN((s.liderancas_qtd || 0) + (s.fiscais_qtd || 0))}</td>
                  <td className="p-3 text-right font-medium text-primary">{fmt(Number(s.total_campanha) || 0)}</td>
                </tr>
              ))}
              {/* Total row */}
              <tr className="bg-secondary/50 font-bold">
                <td className="p-3" colSpan={2}>TOTAL</td>
                <td className="p-3 text-right">{fmtN(totalVotos)}</td>
                <td className="p-3 text-right">{fmtN(totalExpectativa)}</td>
                <td className="p-3 text-right">{fmtN(totalPessoas)}</td>
                <td className="p-3 text-right text-primary">{fmt(totalCampanha)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 space-y-1">
      <div className="flex items-center gap-2">
        <Icon size={16} className={color} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
