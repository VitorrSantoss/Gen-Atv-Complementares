import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCcw,
  AlertCircle,
  BookOpen,
  X,
  UploadCloud,
  Check,
  Eye,
  Calendar,
  Award,
  Target,
  FolderClock,
  TrendingUp,
  Search, //  NOVO Ícone de pesquisa adicionado
  Printer, // Ícone de impressão
} from "lucide-react";

//Referente a Importação o hook do context
import { useCourse } from "@/contexts/CourseContext";

type Course = {
  id: string;
  name: string;
  meta: number;
  aprovadas: number;
  pendentes: number;
  rejeitadas: number;
  // Adicionada a tipagem das categorias para evitar erros no TypeScript
  categorias?: {
    [key: string]: { limite: number; aprovadas: number };
  };
};

type ActivityStatus = "aprovado" | "rejeitado" | "pendente";
type ActivityFileType = "pdf" | "image";

type Activity = {
  id: string;
  courseId: string;
  titulo: string;
  categoria: string;
  horas: number;
  data: string;
  status: ActivityStatus;
  feedback: string;
  arquivoURL: string;
  arquivoTipo: ActivityFileType;
};

//  A constante initialCourses foi apagada daqui, pois agora ela vive no CourseContext.tsx!

const initialAtividades: Activity[] = [
  {
    id: "atv-1",
    courseId: "1",
    titulo: "Curso de React Advanced",
    categoria: "Ensino",
    horas: 40,
    data: "12/02/2026",
    status: "aprovado",
    feedback: "",
    arquivoURL:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    arquivoTipo: "pdf",
  },
  {
    id: "atv-2",
    courseId: "1",
    titulo: "Palestra: Futuro da IA",
    categoria: "Cultural",
    horas: 5,
    data: "10/02/2026",
    status: "rejeitado",
    feedback:
      "Carga horária não visível no certificado. Envie uma foto mais nítida.",
    arquivoURL: "#",
    arquivoTipo: "image",
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
    arquivoURL:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    arquivoTipo: "pdf",
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
    arquivoURL:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    arquivoTipo: "pdf",
  },
];

const getStatusBadge = (status: ActivityStatus) => {
  if (status === "aprovado") return "text-emerald-600 bg-emerald-50 border-emerald-100";
  if (status === "rejeitado") return "text-red-600 bg-red-50 border-red-100";
  return "text-amber-600 bg-amber-50 border-amber-100";
};

const getStatusLabel = (status: ActivityStatus) => {
  if (status === "aprovado") return "Validado";
  if (status === "rejeitado") return "Recusado";
  return "Em Análise";
};

const StudentDashboard = () => {
  // Puxando as informações de curso globais em vez de usar useState local
  const { courses, activeCourseId, setActiveCourseId, activeCourse } = useCourse();

  const [atividades, setAtividades] = useState<Activity[]>(initialAtividades);

  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  //  Estados para os filtros e pesquisa
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todas" | ActivityStatus>("todas");

  // 1. Atividades do curso atual (usado para a contagem total no topo)
  const courseAtividades = useMemo(
    () => atividades.filter((a) => a.courseId === activeCourseId),
    [atividades, activeCourseId]
  );

  //  Atividades filtradas para mostrar na lista
  const displayAtividades = useMemo(() => {
    return courseAtividades.filter((a) => {
      const matchStatus = statusFilter === "todas" || a.status === statusFilter;
      const matchSearch = a.titulo.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [courseAtividades, statusFilter, searchTerm]);

  const atividadesAprovadas = courseAtividades.filter(a => a.status === "aprovado");

  const pct = Math.min(
    100,
    Math.round((activeCourse.aprovadas / activeCourse.meta) * 100)
  );

  const horasRestantes = Math.max(activeCourse.meta - activeCourse.aprovadas, 0);
  const totalSubmissoes = courseAtividades.length; // Usa a base total do curso

  useEffect(() => {
    if (editingActivity || viewingActivity) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [editingActivity, viewingActivity]);

  const handleViewDetails = (atividade: Activity) => {
    setViewingActivity(atividade);
  };

  const handleRefazer = (atividade: Activity) => {
    setEditingActivity(atividade);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingActivity) return;

    const formData = new FormData(e.currentTarget);
    const novoTitulo = formData.get("titulo") as string;
    const novaCategoria = formData.get("categoria") as string;
    const novasHoras = Number(formData.get("horas"));

    let novaURL = editingActivity.arquivoURL;
    let novoTipo = editingActivity.arquivoTipo;

    if (selectedFile) {
      novaURL = URL.createObjectURL(selectedFile);
      novoTipo = selectedFile.type.includes("pdf") ? "pdf" : "image";
    }

    setAtividades((prev) =>
      prev.map((atv) => {
        if (atv.id === editingActivity.id) {
          return {
            ...atv,
            titulo: novoTitulo || atv.titulo,
            categoria: novaCategoria || atv.categoria,
            horas: novasHoras || atv.horas,
            arquivoURL: novaURL,
            arquivoTipo: novoTipo,
            status: "pendente",
            feedback: "",
          };
        }
        return atv;
      })
    );

    setEditingActivity(null);
    setSelectedFile(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/*  O ECRÃ NORMAL FICA INVISÍVEL NA IMPRESSÃO (print:hidden) */}
      <div className="w-full p-4 sm:p-5 lg:p-6 space-y-5 print:hidden">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold text-slate-900"
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Meu Painel
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Acompanhe suas atividades complementares e o progresso por curso
            </p>
          </div>
          
          {/* Botão de imprimir */}
          <Button 
            onClick={handlePrint}
            variant="outline" 
            className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#0066FF] gap-2 h-10 rounded-xl font-semibold shadow-sm w-full sm:w-auto"
          >
            <Printer className="h-4 w-4" />
            Baixar Extrato (PDF)
          </Button>
        </div>

        {/* Topo */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
          <div className="xl:col-span-2 space-y-5">
            {/* Cursos */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="mb-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Meus Cursos
                  </p>
                  <h2 className="text-base sm:text-lg font-semibold text-slate-900">
                    Selecione um curso
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courses.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCourseId(c.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40 focus:ring-offset-1 ${
                        activeCourseId === c.id
                          ? "border-[#0066FF] bg-blue-50/40"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors ${
                          activeCourseId === c.id
                            ? "bg-[#0066FF] text-white"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <BookOpen className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`font-semibold text-sm truncate ${
                            activeCourseId === c.id
                              ? "text-[#0066FF]"
                              : "text-slate-800"
                          }`}
                        >
                          {c.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {c.aprovadas}/{c.meta}h concluídas
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progresso Geral */}
            <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-6">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      Progresso do Curso
                    </p>
                    <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">
                      {activeCourse.name}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Meta total de {activeCourse.meta} horas complementares
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-4xl sm:text-5xl font-bold text-[#0066FF] leading-none tracking-tight">
                      {pct}%
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mt-1">
                      concluído
                    </p>
                  </div>
                </div>

                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0066FF] transition-all duration-1000 ease-out rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {[
                {
                  label: "Aprovadas",
                  val: activeCourse.aprovadas,
                  suffix: "h",
                  color: "text-[#00B67A]",
                  bg: "bg-[#F0FDF4]",
                  icon: CheckCircle2,
                },
                {
                  label: "Pendentes",
                  val: activeCourse.pendentes,
                  suffix: "h",
                  color: "text-[#FF8A00]",
                  bg: "bg-[#FFF7ED]",
                  icon: Clock,
                },
                {
                  label: "Rejeitadas",
                  val: activeCourse.rejeitadas,
                  suffix: "h",
                  color: "text-[#EF4444]",
                  bg: "bg-[#FEF2F2]",
                  icon: XCircle,
                },
                {
                  label: "Submissões",
                  val: totalSubmissoes,
                  suffix: "",
                  color: "text-[#0066FF]",
                  bg: "bg-blue-50",
                  icon: FileText,
                },
              ].map((stat, i) => (
                <Card
                  key={i}
                  className="border border-slate-200 shadow-sm bg-white rounded-xl"
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div
                      className={`w-11 h-11 shrink-0 rounded-xl ${stat.bg} flex items-center justify-center`}
                    >
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>

                    <div>
                      <p className="text-xs font-medium text-slate-500 mb-1">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-semibold text-slate-900 leading-none">
                        {stat.val}
                        {stat.suffix && (
                          <span className="text-base font-medium text-slate-400 ml-0.5">
                            {stat.suffix}
                          </span>
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Progresso por Categoria */}
            {activeCourse.categorias && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                {Object.entries(activeCourse.categorias).map(([catName, dados]: [string, any]) => {
                  const catPct = Math.min(100, Math.round((dados.aprovadas / dados.limite) * 100));
                  const displayName = catName === "Extensao" ? "Extensão" : catName;
                  return (
                    <Card key={catName} className="border border-slate-200 shadow-sm bg-white rounded-xl">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase">{displayName}</p>
                          <p className="text-xs font-semibold text-slate-700">{dados.aprovadas} / {dados.limite}h</p>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-1000 ease-out rounded-full ${catPct >= 100 ? 'bg-emerald-500' : 'bg-[#0066FF]'}`}
                            style={{ width: `${catPct}%` }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Target className="h-5 w-5 text-[#0066FF]" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900">Visão Geral</h2>
                    <p className="text-xs text-slate-500">Resumo do curso ativo</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      Curso Ativo
                    </p>
                    <p className="text-sm font-medium text-slate-900 break-words">
                      {activeCourse.name}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      Horas Restantes
                    </p>
                    <p className="text-xl font-semibold text-slate-900">
                      {horasRestantes}
                      <span className="text-sm font-medium text-slate-400 ml-1">
                        h
                      </span>
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      Situação Atual
                    </p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[#0066FF]" />
                      <p className="text-sm text-slate-900">
                        {pct >= 100 ? "Meta concluída" : `${pct}% da meta atingida`}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <FolderClock className="h-5 w-5 text-slate-700" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900">Orientações</h2>
                    <p className="text-xs text-slate-500">Sobre suas submissões</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                  <div className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                    <p>Atividades validadas contam para a meta do curso.</p>
                  </div>

                  <div className="flex gap-3">
                    <Clock className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
                    <p>Atividades pendentes ainda aguardam análise.</p>
                  </div>

                  <div className="flex gap-3">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                    <p>Submissões recusadas podem ser corrigidas e reenviadas.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Atividades */}
        <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            
            {/* Cabeçalho com Filtros e Pesquisa */}
            <div className="mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                  Histórico
                </p>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
                  Minhas Atividades
                </h2>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Barra de Pesquisa */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Procurar atividade..." 
                    className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Filtros de Status */}
                <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto hide-scrollbar">
                  {(["todas", "aprovado", "pendente", "rejeitado"] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-all ${
                        statusFilter === status 
                          ? "bg-white text-slate-900 shadow-sm" 
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {status === "todas" ? "Todas" : status === "aprovado" ? "Validadas" : status === "rejeitado" ? "Recusadas" : "Em Análise"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

 {/* : Estado Vazio se a pesquisa/filtro não encontrar nada */}
            {displayAtividades.length === 0 ? (
              <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-600">Nenhuma atividade encontrada.</p>
                <p className="text-xs text-slate-400 mt-1">Tente ajustar a sua pesquisa ou os filtros selecionados.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {displayAtividades.map((atv) => (
                  <Card
                    key={atv.id}
                    className={`border shadow-sm overflow-hidden transition-colors rounded-xl ${
                      atv.status === "rejeitado"
                        ? "border-red-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="mt-0.5 w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-900 text-sm sm:text-base leading-tight break-words">
                              {atv.titulo}
                            </h4>

                            <div className="flex flex-wrap items-center gap-2.5 mt-1.5">
                              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                {atv.categoria}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="text-sm text-slate-600">
                                {atv.horas} horas
                              </span>
                              <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
                              <span className="text-sm text-slate-500">
                                {atv.data}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 lg:justify-end lg:shrink-0">
                          <div
                            className={`inline-flex text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide border ${getStatusBadge(
                              atv.status
                            )}`}
                          >
                            {getStatusLabel(atv.status)}
                          </div>

                          {atv.status === "rejeitado" ? (
                            <Button
                              size="sm"
                              onClick={() => handleRefazer(atv)}
                              className="bg-[#0066FF] hover:bg-blue-700 text-white rounded-lg h-8 font-medium gap-2 px-3 shadow-sm"
                            >
                              <RefreshCcw className="h-3.5 w-3.5" />
                              Refazer
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(atv)}
                              className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 h-8 rounded-lg font-medium px-3 gap-2"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Ver Doc
                            </Button>
                          )}
                        </div>
                      </div>

                      {atv.status === "rejeitado" && atv.feedback && (
                        <div className="bg-red-50/80 px-4 py-3 border-t border-red-100 flex items-start gap-3">
                          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700">
                            <strong className="font-medium italic">
                              Motivo da Recusa:
                            </strong>{" "}
                            <span className="italic">{atv.feedback}</span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal visualização e Edição */}
        {viewingActivity &&
          createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-slate-800 text-base leading-tight truncate">
                        {viewingActivity.titulo}
                      </h3>
                      <p className="text-xs text-slate-500">Detalhes da submissão</p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewingActivity(null)}
                    className="h-8 w-8 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-sm">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Award className="h-3 w-3" />
                        Categoria
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        {viewingActivity.categoria}
                      </p>
                    </div>

                    <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-sm">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Clock className="h-3 w-3" />
                        Horas
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        {viewingActivity.horas}h validadas
                      </p>
                    </div>

                    <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-sm">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Calendar className="h-3 w-3" />
                        Data
                      </p>
                      <p className="text-sm font-medium text-slate-800">
                        {viewingActivity.data}
                      </p>
                    </div>

                    <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-sm">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Status
                      </p>
                      <div
                        className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide border ${getStatusBadge(
                          viewingActivity.status
                        )}`}
                      >
                        {getStatusLabel(viewingActivity.status)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2 gap-4">
                      <h4 className="text-sm font-semibold text-slate-700">
                        Comprovante Anexado
                      </h4>

                      {viewingActivity.arquivoURL !== "#" && (
                        <a
                          href={viewingActivity.arquivoURL}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-[#0066FF] hover:underline"
                        >
                          Abrir em nova aba
                        </a>
                      )}
                    </div>

                    <div className="bg-slate-200/50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative h-64 sm:h-80 md:h-[420px]">
                      {viewingActivity.arquivoURL === "#" ? (
                        <div className="text-center p-6 text-slate-400">
                          <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                          <p className="text-sm">Nenhum documento disponível.</p>
                        </div>
                      ) : viewingActivity.arquivoTipo === "image" ? (
                        <img
                          src={viewingActivity.arquivoURL}
                          alt="Comprovante"
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <iframe
                          src={`${viewingActivity.arquivoURL}#view=FitH`}
                          className="w-full h-full bg-white"
                          title="Preview do Documento"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-white flex justify-end shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => setViewingActivity(null)}
                    className="h-9 px-5 font-medium"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            </div>,
            document.body
          )}

 {/* Modal edição */}
        {editingActivity &&
          createPortal(
            <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-8">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="font-semibold text-slate-800 text-base">
                      Corrigir Submissão
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Reenvie os dados corrigidos para avaliação
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingActivity(null)}
                    className="h-8 w-8 text-slate-400 hover:text-slate-700 bg-white rounded-full border shadow-sm"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleSubmitEdit} className="p-5 space-y-4">
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 leading-snug">
                      <span className="font-semibold block mb-0.5">
                        Motivo da recusa anterior:
                      </span>
                      {editingActivity.feedback}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        Título da Atividade
                      </label>
                      <input
                        type="text"
                        name="titulo"
                        defaultValue={editingActivity.titulo}
                        className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          Categoria
                        </label>
                        <select
                          name="categoria"
                          defaultValue={editingActivity.categoria}
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
                        >
                          <option value="Ensino">Ensino</option>
                          <option value="Pesquisa">Pesquisa</option>
                          <option value="Extensão">Extensão</option>
                          <option value="Cultural">Cultural</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                          Carga Horária (h)
                        </label>
                        <input
                          type="number"
                          name="horas"
                          defaultValue={editingActivity.horas}
                          min="1"
                          className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">
                        Novo Comprovante
                      </label>

                      <label
                        className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer group relative ${
                          selectedFile
                            ? "border-emerald-200 bg-emerald-50/30"
                            : "border-slate-200 hover:bg-slate-50 hover:border-blue-300"
                        }`}
                      >
                        <input
                          type="file"
                          className="hidden"
                          accept=".jpg,.jpeg,.png,.pdf"
                          onChange={handleFileChange}
                        />

                        {selectedFile ? (
                          <>
                            <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                              <Check className="h-5 w-5" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-emerald-700 truncate max-w-[200px]">
                                {selectedFile.name}
                              </p>
                              <p className="text-xs text-emerald-600/70 mt-1">
                                Pronto para envio
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="h-10 w-10 bg-blue-50 text-[#0066FF] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                              <UploadCloud className="h-5 w-5" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-medium text-slate-700">
                                Clique para reenviar foto/PDF
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                Formatos suportados: JPG, PNG ou PDF
                              </p>
                            </div>
                          </>
                        )}
                      </label>
                    </div>
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setEditingActivity(null)}
                      className="text-slate-500 font-medium h-9"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#0066FF] hover:bg-blue-700 text-white font-medium h-9 px-5 rounded-lg shadow-md shadow-blue-500/20"
                    >
                      Reenviar Avaliação
                    </Button>
                  </div>
                </form>
              </div>
            </div>,
            document.body
          )}
      </div>

      {/* ======================================================================================= */}
      {/*  LAYOUT EXCLUSIVO PARA IMPRESSÃO (Fica invisível na ecrã normal - print:block) */}
      {/* ======================================================================================= */}
      <div className="hidden print:block p-8 bg-white text-black font-sans min-h-screen">
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide">Extrato de Atividades</h1>
            <p className="text-sm mt-1">Sistema Integrado de Gestão de Atividades Complementares</p>
          </div>
          <div className="text-right text-sm">
            <p><strong>Data de Emissão:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase text-gray-500">Curso Vinculado</p>
            <p className="font-bold text-lg">{activeCourse.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-gray-500">Situação do Aluno</p>
            <p className="font-bold text-lg">
              {activeCourse.aprovadas}h validadas de {activeCourse.meta}h ({pct}%)
            </p>
          </div>
        </div>

        <h3 className="text-lg font-bold mb-3 border-b border-gray-300 pb-1">Atividades Validadas</h3>
        
        {atividadesAprovadas.length === 0 ? (
          <p className="text-gray-500 italic">Nenhuma atividade validada até o momento.</p>
        ) : (
          <table className="w-full text-left border-collapse mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b border-gray-300 py-2 px-3 text-sm font-semibold">Data</th>
                <th className="border-b border-gray-300 py-2 px-3 text-sm font-semibold">Atividade</th>
                <th className="border-b border-gray-300 py-2 px-3 text-sm font-semibold">Categoria</th>
                <th className="border-b border-gray-300 py-2 px-3 text-sm font-semibold text-right">Horas</th>
              </tr>
            </thead>
            <tbody>
              {atividadesAprovadas.map((atv, idx) => (
                <tr key={atv.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border-b border-gray-200 py-2 px-3 text-sm">{atv.data}</td>
                  <td className="border-b border-gray-200 py-2 px-3 text-sm font-medium">{atv.titulo}</td>
                  <td className="border-b border-gray-200 py-2 px-3 text-sm uppercase text-xs">{atv.categoria}</td>
                  <td className="border-b border-gray-200 py-2 px-3 text-sm font-bold text-right">{atv.horas}h</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-3 px-3 text-right font-bold uppercase text-sm">Total Validado:</td>
                <td className="py-3 px-3 text-right font-bold text-lg">{activeCourse.aprovadas}h</td>
              </tr>
            </tfoot>
          </table>
        )}

        <div className="mt-16 text-center text-xs text-gray-400">
          <p>Este documento é gerado eletronicamente e tem validade apenas para conferência de progresso pelo aluno.</p>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;