import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCcw,
  AlertCircle,
  BookOpen,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const COLORS = ["#0066FF", "#FF8A00", "#00B67A", "#FFC700"];

// --- Mock de Dados ---
const initialCourses = [
  {
    id: "1",
    name: "Engenharia de Software",
    meta: 200,
    aprovadas: 120,
    pendentes: 20,
    rejeitadas: 5,
  },
  {
    id: "2",
    name: "Administração",
    meta: 150,
    aprovadas: 45,
    pendentes: 10,
    rejeitadas: 2,
  },
];

const initialAtividades = [
  {
    id: "atv-1",
    courseId: "1",
    titulo: "Curso de React Advanced",
    categoria: "Ensino",
    horas: 40,
    data: "12/02/2026",
    status: "aprovado",
    feedback: "",
    arquivoURL: "https://exemplo.com/cert1.pdf",
  },
  {
    id: "atv-2",
    courseId: "1",
    titulo: "Palestra: Futuro da IA",
    categoria: "Cultural",
    horas: 5,
    data: "10/02/2026",
    status: "rejeitado",
    feedback: "Carga horária não visível no certificado.",
    arquivoURL: "https://exemplo.com/cert2.jpg",
  },
  {
    id: "atv-3",
    courseId: "1",
    titulo: "Monitoria Algoritmos I",
    categoria: "Ensino",
    horas: 60,
    data: "05/02/2026",
    status: "pendente",
    feedback: "",
    arquivoURL: "https://exemplo.com/cert3.pdf",
  },
  {
    id: "atv-4",
    courseId: "2",
    titulo: "Workshop Gestão Financeira",
    categoria: "Extensão",
    horas: 15,
    data: "01/03/2026",
    status: "aprovado",
    feedback: "",
    arquivoURL: "https://exemplo.com/cert4.pdf",
  },
];

const StudentDashboard = () => {
  const [activeCourseId, setActiveCourseId] = useState(initialCourses[0].id);
  const [atividades] = useState(initialAtividades);

  // Derivando dados baseados no curso selecionado
  const activeCourse = initialCourses.find((c) => c.id === activeCourseId)!;
  const filteredAtividades = atividades.filter(
    (a) => a.courseId === activeCourseId,
  );
  const pct = Math.round((activeCourse.aprovadas / activeCourse.meta) * 100);

  // Funções dos Botões
  const handleViewCertificate = (url: string) => {
    window.open(url, "_blank");
  };

  const handleRefazer = (atividade: any) => {
    console.log("Navegando para formulário com dados de:", atividade.titulo);
    alert(`Redirecionando para editar: ${atividade.titulo}`);
    // Aqui você usaria o router para levar o aluno ao formulário:
    // router.push(`/submissao?edit=${atividade.id}`)
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-[#F8FAFC] min-h-screen">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Meu Painel</h1>
        <p className="text-sm text-slate-500 mt-1">
          Acompanhe suas atividades complementares
        </p>
      </div>

      {/* Seletor de Cursos (Funcional) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Meus Cursos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {initialCourses.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCourseId(c.id)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                activeCourseId === c.id
                  ? "border-[#0066FF] bg-blue-50/40 shadow-sm"
                  : "border-transparent bg-white hover:border-slate-200"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activeCourseId === c.id
                    ? "bg-[#0066FF] text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p
                  className={`font-bold text-sm ${activeCourseId === c.id ? "text-[#0066FF]" : "text-slate-700"}`}
                >
                  {c.name}
                </p>
                <p className="text-xs text-slate-500">
                  {c.aprovadas}/{c.meta}h completadas
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Barra de Progresso Principal (Dinâmica) */}
      <Card className="border-none shadow-sm bg-white rounded-2xl">
        <CardContent className="p-6 sm:p-8">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {activeCourse.name}
              </h3>
              <p className="text-sm text-slate-500 font-medium text-[12px] uppercase tracking-tight">
                Meta: {activeCourse.meta} horas
              </p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-[#0066FF]">{pct}%</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase">
                concluído
              </p>
            </div>
          </div>
          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0066FF] transition-all duration-700"
              style={{ width: `${pct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo (Dinâmicos) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Aprovadas",
            val: activeCourse.aprovadas,
            color: "text-[#00B67A]",
            bg: "bg-[#F0FDF4]",
            icon: CheckCircle2,
          },
          {
            label: "Pendentes",
            val: activeCourse.pendentes,
            color: "text-[#FF8A00]",
            bg: "bg-[#FFF7ED]",
            icon: Clock,
          },
          {
            label: "Rejeitadas",
            val: activeCourse.rejeitadas,
            color: "text-[#EF4444]",
            bg: "bg-[#FEF2F2]",
            icon: XCircle,
          },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm">
            <CardContent className="p-6 flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}
              >
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900">{stat.val}h</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de Atividades (Dinâmica por curso) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">
          Atividades de {activeCourse.name}
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {filteredAtividades.map((atv) => (
            <Card
              key={atv.id}
              className="border-none shadow-sm overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                        {atv.titulo}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-bold uppercase text-slate-400">
                          {atv.categoria}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {atv.horas}h
                        </span>
                        <span className="text-xs text-slate-400">
                          {atv.data}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-none pt-3 sm:pt-0">
                    <div
                      className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase ${
                        atv.status === "aprovado"
                          ? "text-emerald-600 bg-emerald-50"
                          : atv.status === "rejeitado"
                            ? "text-red-600 bg-red-50"
                            : "text-orange-600 bg-orange-50"
                      }`}
                    >
                      {atv.status === "aprovado"
                        ? "Validado"
                        : atv.status === "rejeitado"
                          ? "Recusado"
                          : "Em Análise"}
                    </div>

                    {atv.status === "rejeitado" ? (
                      <Button
                        size="sm"
                        onClick={() => handleRefazer(atv)}
                        className="bg-[#0066FF] hover:bg-blue-700 text-white rounded-lg h-9 font-bold gap-2"
                      >
                        <RefreshCcw className="h-3.5 w-3.5" />
                        <span className="text-xs">Refazer</span>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-200 text-slate-600 h-9 rounded-lg font-bold text-xs"
                      >
                        Ver Doc
                      </Button>
                    )}
                  </div>
                </div>

                {atv.status === "rejeitado" && atv.feedback && (
                  <div className="bg-red-50/50 px-4 py-3 border-t border-red-100 flex items-start gap-2 animate-in slide-in-from-top-1">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700 italic">
                      <strong>Motivo:</strong> {atv.feedback}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
