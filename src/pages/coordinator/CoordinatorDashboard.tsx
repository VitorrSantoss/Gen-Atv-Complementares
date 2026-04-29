import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileCheck,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ComposedChart,
  Line,
  Area,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

// Importação dos serviços e tipos
import { dashboardService } from "@/services/coordenador/DashboardService";
import { SubmissaoResponse } from "@/services/coordenador/CertificadoService";

const STATUS_COLORS = ["#2563eb", "#f97316", "#dc2626"];

// ─── Helpers de data ─────────────────────────────────────────────────────────

/** Diferença em dias inteiros entre duas datas (a - b). */
function diffEmDias(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/** Formata data como "DD/MM" para o eixo X do gráfico de fluxo. */
function formatarDiaMes(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    alunos: any[];
    submissoes: SubmissaoResponse[];
    cursos: any[];
  } | null>(null);

  useEffect(() => {
    dashboardService
      .getDashboardData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  // ── Totais de HORAS por status (não mais contagem de submissões) ─────────
  // Em horas complementares, a moeda real é a hora — não a quantidade de papéis.
  const horasPorStatus = useMemo(() => {
    const base = { validadas: 0, pendentes: 0, rejeitadas: 0 };
    if (!data) return base;

    data.submissoes.forEach((s) => {
      if (s.status === "APROVADA") base.validadas += s.horas;
      else if (s.status === "PENDENTE") base.pendentes += s.horas;
      else if (s.status === "REPROVADA") base.rejeitadas += s.horas;
    });
    return base;
  }, [data]);

  const totalPendentes = useMemo(
    () => data?.submissoes.filter((s) => s.status === "PENDENTE").length ?? 0,
    [data],
  );

  // ── Cards superiores ─────────────────────────────────────────────────────
  const statsCalculated = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: "Alunos Vinculados",
        value: data.alunos.length,
        suffix: "",
        icon: Users,
        color: "bg-blue-600",
      },
      {
        label: "Pendentes",
        value: totalPendentes,
        suffix: "",
        icon: Clock,
        color: "bg-orange-500",
        sub: `${horasPorStatus.pendentes}h aguardando`,
      },
      {
        label: "Horas Validadas",
        value: horasPorStatus.validadas,
        suffix: "h",
        icon: CheckCircle,
        color: "bg-emerald-500",
      },
      {
        label: "Horas Rejeitadas",
        value: horasPorStatus.rejeitadas,
        suffix: "h",
        icon: XCircle,
        color: "bg-red-500",
      },
    ];
  }, [data, totalPendentes, horasPorStatus]);

  // ── Gráfico de pizza (status das submissões) ─────────────────────────────
  const pieData = useMemo(() => {
    if (!data) return [];
    return [
      {
        name: "Aprovadas",
        value: data.submissoes.filter((s) => s.status === "APROVADA").length,
      },
      {
        name: "Pendentes",
        value: data.submissoes.filter((s) => s.status === "PENDENTE").length,
      },
      {
        name: "Rejeitadas",
        value: data.submissoes.filter((s) => s.status === "REPROVADA").length,
      },
    ];
  }, [data]);

  // ── Gráfico 1: Fluxo de submissões nas últimas 8 semanas ─────────────────
  // Mostra o ritmo de chegada vs avaliação. Se a área de "recebidas" cresce
  // mais rápido que a linha de "avaliadas", a fila está estourando.
  // Escala perfeitamente para milhares de submissões — agrega por semana.
  const fluxoSemanal = useMemo(() => {
    if (!data) return [];

    const SEMANAS = 8;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    // Cria buckets das últimas 8 semanas (mais antiga primeiro)
    const buckets = Array.from({ length: SEMANAS }, (_, i) => {
      const fim = new Date(hoje);
      fim.setDate(hoje.getDate() - (SEMANAS - 1 - i) * 7);
      const inicio = new Date(fim);
      inicio.setDate(fim.getDate() - 6);
      return {
        inicio,
        fim,
        label: formatarDiaMes(inicio),
        recebidas: 0,
        avaliadas: 0,
      };
    });

    data.submissoes.forEach((s: any) => {
      if (!s.dataSubmissao) return;
      const dt = new Date(s.dataSubmissao);
      const bucket = buckets.find(
        (b) => dt >= b.inicio && dt <= new Date(b.fim.getTime() + 86399999),
      );
      if (!bucket) return;

      bucket.recebidas += 1;
      // Considera "avaliada" qualquer submissão que saiu de PENDENTE
      if (s.status !== "PENDENTE") bucket.avaliadas += 1;
    });

    return buckets.map((b) => ({
      semana: b.label,
      recebidas: b.recebidas,
      avaliadas: b.avaliadas,
    }));
  }, [data]);

  // ── Gráfico 2: SLA das pendências (aging) ────────────────────────────────
  // Distribui as pendências em faixas de tempo desde a submissão.
  // Resposta direta: "o que está parado há quanto tempo?"
  // Permite ao coordenador priorizar o que está mais atrasado.
  const slaPendentes = useMemo(() => {
    const faixasIniciais = [
      { faixa: "0-3 dias", quantidade: 0, horas: 0, criticidade: 0 },
      { faixa: "4-7 dias", quantidade: 0, horas: 0, criticidade: 1 },
      { faixa: "8-15 dias", quantidade: 0, horas: 0, criticidade: 2 },
      { faixa: "16-30 dias", quantidade: 0, horas: 0, criticidade: 3 },
      { faixa: "+30 dias", quantidade: 0, horas: 0, criticidade: 4 },
    ];

    if (!data) return faixasIniciais;

    const hoje = new Date();
    const faixas = [...faixasIniciais.map((f) => ({ ...f }))];

    data.submissoes
      .filter((s) => s.status === "PENDENTE")
      .forEach((s: any) => {
        if (!s.dataSubmissao) return;
        const dias = diffEmDias(hoje, new Date(s.dataSubmissao));
        let idx = 0;
        if (dias <= 3) idx = 0;
        else if (dias <= 7) idx = 1;
        else if (dias <= 15) idx = 2;
        else if (dias <= 30) idx = 3;
        else idx = 4;

        faixas[idx].quantidade += 1;
        faixas[idx].horas += s.horas;
      });

    return faixas;
  }, [data]);

  // Cores graduais por criticidade — verde → amarelo → laranja → vermelho
  const corPorCriticidade = (c: number): string => {
    const cores = ["#10b981", "#84cc16", "#f59e0b", "#f97316", "#dc2626"];
    return cores[c] ?? "#94a3b8";
  };

  // Quantos dias está parada a pendência mais antiga (KPI direto)
  const pendenciaMaisAntiga = useMemo(() => {
    if (!data) return 0;
    const hoje = new Date();
    const pendentes = data.submissoes.filter((s) => s.status === "PENDENTE");
    if (pendentes.length === 0) return 0;

    return pendentes.reduce((max, s: any) => {
      if (!s.dataSubmissao) return max;
      const dias = diffEmDias(hoje, new Date(s.dataSubmissao));
      return Math.max(max, dias);
    }, 0);
  }, [data]);

  // Pendências críticas (>15 dias) — gatilho de atenção
  const pendenciasCriticas = useMemo(
    () =>
      slaPendentes
        .filter((f) => f.criticidade >= 3)
        .reduce((acc, f) => acc + f.quantidade, 0),
    [slaPendentes],
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard do Coordenador
          </h1>
          <p className="text-lg text-slate-500">
            Visão Geral dos Cursos e Alunos
          </p>
        </div>

        {totalPendentes > 0 && (
          <Button
            onClick={() => navigate("/coordenador/solicitacoes")}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2 rounded-xl shadow-sm"
          >
            <AlertCircle className="h-4 w-4" />
            Avaliar pendentes ({totalPendentes})
            <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Alerta de pendências críticas (clicável) */}
      {pendenciasCriticas > 0 && (
        <Card
          className="border-0 shadow-sm rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-l-red-500 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/coordenador/solicitacoes")}
        >
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="font-bold text-slate-800">
                  {pendenciasCriticas}{" "}
                  {pendenciasCriticas === 1
                    ? "submissão crítica"
                    : "submissões críticas"}{" "}
                  aguardando há mais de 15 dias
                </p>
                <p className="text-sm text-slate-600">
                  Pendência mais antiga: {pendenciaMaisAntiga} dias parada
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-red-500" />
          </CardContent>
        </Card>
      )}

      {/* STATS CARDS DINÂMICOS (agora em horas — métrica real) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCalculated.map((stat) => (
          <Card
            key={stat.label}
            className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-black text-slate-800 mt-1">
                    {stat.value}
                    {stat.suffix && (
                      <span className="text-xl text-slate-400 ml-1">
                        {stat.suffix}
                      </span>
                    )}
                  </p>
                  {stat.sub && (
                    <p className="text-[11px] text-slate-500 mt-1 font-medium">
                      {stat.sub}
                    </p>
                  )}
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center shadow-lg shadow-blue-500/10`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* GRÁFICOS PRINCIPAIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fluxo semanal — substituiu "Carga Horária Validada" */}
        <Card className="border-0 shadow-sm rounded-2xl bg-white lg:col-span-2">
          <CardHeader className="border-b border-slate-50 p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Fluxo de Submissões — últimas 8 semanas
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Compare quantas chegam vs. quantas você consegue avaliar
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-blue-200" />
                  <span className="text-slate-600 font-medium">Recebidas</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Avaliadas</span>
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {fluxoSemanal.every(
              (s) => s.recebidas === 0 && s.avaliadas === 0,
            ) ? (
              <div className="h-[320px] flex flex-col items-center justify-center text-sm text-slate-400 gap-2">
                <FileCheck className="h-10 w-10 text-slate-300" />
                <p>Sem submissões nas últimas 8 semanas.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <ComposedChart
                  data={fluxoSemanal}
                  margin={{ top: 10, right: 20, left: 0, bottom: 5 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRecebidas"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="semana"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#f8fafc" }}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    formatter={(value: number, name: string) => {
                      const labels: Record<string, string> = {
                        recebidas: "Recebidas",
                        avaliadas: "Avaliadas",
                      };
                      return [value, labels[name] ?? name];
                    }}
                    labelFormatter={(label) => `Semana de ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="recebidas"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorRecebidas)"
                  />
                  <Line
                    type="monotone"
                    dataKey="avaliadas"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#10b981" }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Distribuição de status — mantido conforme solicitado */}
        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardHeader className="border-b border-slate-50 p-6">
            <CardTitle className="text-lg font-bold text-slate-800">
              Distribuição de Status
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Proporção entre aprovadas, pendentes e rejeitadas
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {pieData.every((p) => p.value === 0) ? (
              <div className="h-[300px] flex items-center justify-center text-sm text-slate-400">
                Sem dados para exibir.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={STATUS_COLORS[i]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}`, "Submissões"]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                  />
                  <Legend verticalAlign="bottom" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SLA das pendências — gráfico de aging */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white">
        <CardHeader className="border-b border-slate-50 p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-500" />
                Tempo de Espera das Pendências
              </CardTitle>
              <p className="text-xs text-slate-500 mt-1">
                Há quanto tempo cada faixa de submissões aguarda avaliação —
                priorize as faixas mais à direita
              </p>
            </div>
            {totalPendentes > 0 && (
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Pendência mais antiga
                </p>
                <p
                  className={`text-2xl font-black ${
                    pendenciaMaisAntiga > 15
                      ? "text-red-600"
                      : pendenciaMaisAntiga > 7
                        ? "text-orange-500"
                        : "text-slate-700"
                  }`}
                >
                  {pendenciaMaisAntiga}
                  <span className="text-sm font-medium text-slate-400 ml-1">
                    {pendenciaMaisAntiga === 1 ? "dia" : "dias"}
                  </span>
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {totalPendentes === 0 ? (
            <div className="h-[260px] flex flex-col items-center justify-center text-sm text-slate-400 gap-2">
              <CheckCircle className="h-10 w-10 text-emerald-300" />
              <p className="font-medium text-slate-500">
                Nenhuma pendência aguardando avaliação. 🎉
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={slaPendentes}
                margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
                barCategoryGap="20%"
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="faixa"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#475569", fontWeight: 500 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                  formatter={(value: number, name: string, props: any) => {
                    if (name === "quantidade") {
                      const horas = props.payload.horas;
                      return [
                        `${value} ${value === 1 ? "submissão" : "submissões"} (${horas}h)`,
                        "Aguardando",
                      ];
                    }
                    return [value, name];
                  }}
                />
                <Bar dataKey="quantidade" radius={[6, 6, 0, 0]}>
                  {slaPendentes.map((entry, i) => (
                    <Cell key={i} fill={corPorCriticidade(entry.criticidade)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CoordinatorDashboard;