import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, Clock, CheckCircle, Bell, Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

// Importação dos serviços e tipos
import { dashboardService } from "@/services/coordenador/DashboardService";
import { SubmissaoResponse } from "@/services/coordenador/CertificadoService";

const COLORS = ["#2563eb", "#f97316", "#dc2626"];

const CoordinatorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    alunos: any[];
    submissoes: SubmissaoResponse[];
    cursos: any[];
  } | null>(null);

  useEffect(() => {
    dashboardService.getDashboardData()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  // Cálculos das estatísticas baseados nos dados reais
  const statsCalculated = useMemo(() => {
    if (!data) return [];
    
    const pendentes = data.submissoes.filter(s => s.status === "PENDENTE").length;
    const aprovadas = data.submissoes.filter(s => s.status === "APROVADA").length;
    const avaliadas = data.submissoes.filter(s => s.status !== "PENDENTE").length;

    return [
      { label: "Alunos Vinculados", value: data.alunos.length, icon: Users, color: "bg-blue-600" },
      { label: "Solicitações Pendentes", value: pendentes, icon: Clock, color: "bg-orange-500" },
      { label: "Aprovadas", value: aprovadas, icon: CheckCircle, color: "bg-blue-600" },
      { label: "Total Avaliadas", value: avaliadas, icon: FileCheck, color: "bg-orange-500" },
    ];
  }, [data]);

  // Dados para o Gráfico de Pizza (Status)
  const pieData = useMemo(() => {
    if (!data) return [];
    return [
      { name: "Aprovadas", value: data.submissoes.filter(s => s.status === "APROVADA").length },
      { name: "Pendentes", value: data.submissoes.filter(s => s.status === "PENDENTE").length },
      { name: "Rejeitadas", value: data.submissoes.filter(s => s.status === "REPROVADA").length },
    ];
  }, [data]);

  // Dados para o Gráfico de Barras (Horas por área)
  // Nota: Este cálculo depende de como as áreas estão mapeadas nas suas submissões/regras
  const barData = useMemo(() => {
    if (!data) return [];
    const areas: Record<string, number> = {};
    
    data.submissoes.forEach(s => {
      if (s.status === "APROVADA") {
        // Assume que o título ou algum campo identifica a área para o gráfico
        const area = "Geral"; // No futuro, vincular à 'area' da RegraAtividade
        areas[area] = (areas[area] || 0) + s.horas;
      }
    });

    return Object.entries(areas).map(([area, horas]) => ({ area, horas }));
  }, [data]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard do Coordenador</h1>
          <p className="text-lg text-slate-500">Visão Geral dos Cursos e Alunos</p>
        </div>
        {/* Componente Popover de Notificações mantido... */}
      </div>

      {/* STATS CARDS DINÂMICOS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCalculated.map((stat) => (
          <Card key={stat.label} className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center shadow-lg shadow-blue-500/10`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* GRÁFICOS DINÂMICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm rounded-2xl bg-white lg:col-span-2">
          <CardHeader className="border-b border-slate-50 p-6">
            <CardTitle className="text-lg font-bold text-slate-800">Carga Horária Validada</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="area" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="horas" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardHeader className="border-b border-slate-50 p-6">
            <CardTitle className="text-lg font-bold text-slate-800">Distribuição de Status</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={8} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} stroke="none" />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;