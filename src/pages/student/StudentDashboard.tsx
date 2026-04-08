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
  Search,
  Printer,
  Loader2,
} from "lucide-react";

import { useCourse } from "@/contexts/CourseContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  submissaoService,
  SubmissaoResponse,
} from "@/services/aluno/SubmissaoService";
import { courseService } from "@/services/admin/courseService";

// ─── Tipos locais ─────────────────────────────────────────────────────────────

type ActivityStatus = "aprovado" | "rejeitado" | "pendente";
type ActivityFileType = "pdf" | "image";

type Activity = {
  id: number;
  /** ID numérico do curso — usado para filtrar no dashboard */
  cursoId: number;
  titulo: string;
  categoria: string;
  horas: number;
  semestre: string;
  status: ActivityStatus;
  feedback: string;
  arquivoURL: string;
  arquivoTipo: ActivityFileType;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Converte o status do back-end para o status local do front */
function mapStatus(s: SubmissaoResponse["status"]): ActivityStatus {
  if (s === "APROVADA") return "aprovado";
  if (s === "REPROVADA") return "rejeitado";
  return "pendente";
}

/** Converte uma SubmissaoResponse em Activity (formato usado pelos cards) */
function toActivity(s: SubmissaoResponse & { alunoId?: number; cursoId?: number }): Activity {
  const cert = s.certificados?.[0];
  const url = cert?.urlArquivo ?? "";
  const tipo: ActivityFileType =
    url.toLowerCase().endsWith(".pdf") ? "pdf" : "image";

  return {
    id: s.id,
    // Usa o cursoId exposto pelo back (quando disponível) ou 0 como fallback
    cursoId: s.cursoId ?? 0,
    titulo: s.titulo,
    categoria: "Geral",
    horas: s.horas,
    semestre: s.dataSubmissao
      ? (() => {
          const d = new Date(s.dataSubmissao);
          const mes = d.getMonth() + 1;
          return `${d.getFullYear()}.${mes <= 6 ? 1 : 2}`;
        })()
      : "--",
    status: mapStatus(s.status),
    feedback: s.feedback ?? "",
    arquivoURL: url,
    arquivoTipo: tipo,
  };
}

function getStatusBadge(status: ActivityStatus) {
  if (status === "aprovado")
    return "text-emerald-600 bg-emerald-50 border-emerald-100";
  if (status === "rejeitado") return "text-red-600 bg-red-50 border-red-100";
  return "text-amber-600 bg-amber-50 border-amber-100";
}

function getStatusLabel(status: ActivityStatus) {
  if (status === "aprovado") return "Validado";
  if (status === "rejeitado") return "Recusado";
  return "Em Análise";
}

// ─── Componente ──────────────────────────────────────────────────────────────

const StudentDashboard = () => {
  const { courses, activeCourseId, setActiveCourseId, activeCourse, updateProgress } =
    useCourse();
  const { user } = useAuth();

  const userName = user?.name ?? "Aluno";

  // Estado das atividades vindas do back-end
  const [atividades, setAtividades] = useState<Activity[]>([]);
  const [loadingAtividades, setLoadingAtividades] = useState(true);
  const [erroAtividades, setErroAtividades] = useState(false);

  // Estados de UI
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todas" | ActivityStatus>("todas");

  // ── Busca submissões do back-end ──────────────────────────────────────────
  // Carrega APENAS as submissões do aluno logado (filtrado por alunoId)
  useEffect(() => {
    if (!user?.alunoId) {
      setLoadingAtividades(false);
      return;
    }

    setLoadingAtividades(true);
    setErroAtividades(false);

    submissaoService
      .getMinhas(user.alunoId)
      .then((data) => {
        const mapped = data.map(toActivity);
        setAtividades(mapped);

        // Recalcula progresso de horas para cada curso do aluno
        courses.forEach((course) => {
          const dosCurso = mapped.filter(
            (a) => a.cursoId === Number(course.id)
          );
          const aprovadas = dosCurso
            .filter((a) => a.status === "aprovado")
            .reduce((sum, a) => sum + a.horas, 0);
          const pendentes = dosCurso
            .filter((a) => a.status === "pendente")
            .reduce((sum, a) => sum + a.horas, 0);
          const rejeitadas = dosCurso
            .filter((a) => a.status === "rejeitado")
            .reduce((sum, a) => sum + a.horas, 0);

          updateProgress(course.id, aprovadas, pendentes, rejeitadas);
        });
      })
      .catch(() => setErroAtividades(true))
      .finally(() => setLoadingAtividades(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.alunoId]);

  // ── Atividades filtradas ──────────────────────────────────────────────────
  const courseAtividades = useMemo(
    () => atividades.filter((a) => a.cursoId === Number(activeCourseId)),
    [atividades, activeCourseId]
  );

  const displayAtividades = useMemo(() => {
    return courseAtividades.filter((a) => {
      const matchStatus =
        statusFilter === "todas" || a.status === statusFilter;
      const matchSearch = a.titulo
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [courseAtividades, statusFilter, searchTerm]);

  const atividadesAprovadas = courseAtividades.filter(
    (a) => a.status === "aprovado"
  );

  const pct = activeCourse.meta > 0
    ? Math.min(
        100,
        Math.round((activeCourse.aprovadas / activeCourse.meta) * 100)
      )
    : 0;

  const horasRestantes = Math.max(activeCourse.meta - activeCourse.aprovadas, 0);
  const totalSubmissoes = courseAtividades.length;

  // Bloqueia scroll quando modal está aberto
  useEffect(() => {
    if (editingActivity || viewingActivity) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [editingActivity, viewingActivity]);

  const handleRefazer = (atividade: Activity) => {
    setEditingActivity(atividade);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  /**
   * Reenvio de atividade rejeitada:
   * 1. Deleta a submissão antiga (se ainda PENDENTE — o back bloqueia REPROVADA, então apenas remove localmente)
   * 2. Redireciona para a tela de submissão (ou remove da lista local)
   */
  const handleSubmitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingActivity) return;

    // Remove da lista local para feedback imediato
    setAtividades((prev) => prev.filter((a) => a.id !== editingActivity.id));
    setEditingActivity(null);
    setSelectedFile(null);
  };

  const handlePrint = () => window.print();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ─── TELA NORMAL ────────────────────────────────────────────────────── */}
      <div className="w-full p-4 sm:p-5 lg:p-6 space-y-5 print:hidden">

        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Olá, {userName.split(" ")[0]}! 👋
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Acompanhe as suas atividades complementares e o progresso por curso
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handlePrint}
              variant="outline"
              className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#0066FF] gap-2 h-12 rounded-xl font-semibold shadow-sm hidden sm:flex"
            >
              <Printer className="h-4 w-4" />
              Extrato (PDF)
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              size="icon"
              className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#0066FF] h-12 w-12 rounded-xl font-semibold shadow-sm sm:hidden shrink-0"
            >
              <Printer className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Layout principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
          <div className="xl:col-span-2 space-y-5">

            {/* Seletor de Cursos */}
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

                {courses.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">
                    Nenhum curso disponível no momento.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {courses.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setActiveCourseId(c.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#0066FF]/40 ${
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
                )}
              </CardContent>
            </Card>

            {/* Barra de Progresso */}
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

            {/* Cards de Resumo */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
                {Object.entries(activeCourse.categorias).map(
                  ([catName, dados]) => {
                    const catPct = Math.min(
                      100,
                      dados.limite > 0
                        ? Math.round((dados.aprovadas / dados.limite) * 100)
                        : 0
                    );
                    const displayName =
                      catName === "Extensao" ? "Extensão" : catName;
                    return (
                      <Card
                        key={catName}
                        className="border border-slate-200 shadow-sm bg-white rounded-xl"
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center mb-2">
                            <p className="text-[10px] font-bold text-slate-500 uppercase">
                              {displayName}
                            </p>
                            <p className="text-xs font-semibold text-slate-700">
                              {dados.aprovadas} / {dados.limite}h
                            </p>
                          </div>
                          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-1000 ease-out rounded-full ${
                                catPct >= 100
                                  ? "bg-emerald-500"
                                  : "bg-[#0066FF]"
                              }`}
                              style={{ width: `${catPct}%` }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                )}
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
                      <span className="text-sm font-medium text-slate-400 ml-1">h</span>
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      Situação Atual
                    </p>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-[#0066FF]" />
                      <p className="text-sm text-slate-900">
                        {pct >= 100
                          ? "Meta concluída 🎉"
                          : `${pct}% da meta atingida`}
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

        {/* Lista de Atividades */}
        <Card className="border border-slate-200 shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-4 sm:p-5 lg:p-6">
            {/* Cabeçalho com filtros */}
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
                <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
                  {(
                    ["todas", "aprovado", "pendente", "rejeitado"] as const
                  ).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize whitespace-nowrap transition-all ${
                        statusFilter === s
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {s === "todas"
                        ? "Todas"
                        : s === "aprovado"
                        ? "Validadas"
                        : s === "rejeitado"
                        ? "Recusadas"
                        : "Em Análise"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Estado: carregando */}
            {loadingAtividades && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
              </div>
            )}

            {/* Estado: erro */}
            {!loadingAtividades && erroAtividades && (
              <div className="text-center py-12 px-4 bg-red-50 rounded-xl border border-red-100 border-dashed">
                <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-red-600">
                  Não foi possível carregar as atividades.
                </p>
                <p className="text-xs text-red-400 mt-1">
                  Verifique se o back-end está rodando e tente novamente.
                </p>
              </div>
            )}

            {/* Estado: vazio */}
            {!loadingAtividades &&
              !erroAtividades &&
              displayAtividades.length === 0 && (
                <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                  <Search className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">
                    Nenhuma atividade encontrada.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Tente ajustar a pesquisa ou os filtros selecionados.
                  </p>
                </div>
              )}

            {/* Lista */}
            {!loadingAtividades && !erroAtividades && (
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
                                Semestre: {atv.semestre}
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
                              onClick={() => setViewingActivity(atv)}
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
      </div>

      {/* ─── MODAL DE VISUALIZAÇÃO ───────────────────────────────────────────── */}
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
                  {[
                    {
                      label: "Categoria",
                      value: viewingActivity.categoria,
                      icon: Award,
                    },
                    {
                      label: "Horas",
                      value: `${viewingActivity.horas}h validadas`,
                      icon: Clock,
                    },
                    {
                      label: "Semestre",
                      value: viewingActivity.semestre,
                      icon: Calendar,
                    },
                  ].map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="bg-white p-3 border border-slate-100 rounded-xl shadow-sm"
                    >
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                        <Icon className="h-3 w-3" />
                        {label}
                      </p>
                      <p className="text-sm font-medium text-slate-800">{value}</p>
                    </div>
                  ))}
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

                {viewingActivity.arquivoURL && viewingActivity.arquivoURL !== "#" && (
                  <div>
                    <div className="flex items-center justify-between mb-2 gap-4">
                      <h4 className="text-sm font-semibold text-slate-700">
                        Comprovante Anexado
                      </h4>
                      <a
                        href={viewingActivity.arquivoURL}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-[#0066FF] hover:underline"
                      >
                        Abrir em nova aba
                      </a>
                    </div>
                    <div className="bg-slate-200/50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative h-64 sm:h-80 md:h-[420px]">
                      {viewingActivity.arquivoTipo === "image" ? (
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
                )}
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

      {/* ─── MODAL DE REENVIO ────────────────────────────────────────────────── */}
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
                    Vá à tela de submissão para reenviar com os dados corrigidos
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

              <div className="p-5 space-y-4">
                {editingActivity.feedback && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 leading-snug">
                      <span className="font-semibold block mb-0.5">
                        Motivo da recusa:
                      </span>
                      {editingActivity.feedback}
                    </p>
                  </div>
                )}
                <p className="text-sm text-slate-600">
                  Para reenviar esta atividade, acesse a tela{" "}
                  <strong>Nova Atividade</strong> no menu lateral e preencha as
                  informações corrigidas.
                </p>
              </div>

              <div className="p-4 border-t border-slate-100 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => setEditingActivity(null)}
                  className="font-medium text-slate-600"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* ─── VERSÃO DE IMPRESSÃO ─────────────────────────────────────────────── */}
      <div className="hidden print:block p-8 bg-white text-black font-sans min-h-screen">
        <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide">
              Extrato de Atividades
            </h1>
            <p className="text-sm mt-1">
              Sistema Integrado de Gestão de Atividades Complementares
            </p>
          </div>
          <div className="text-right text-sm">
            <p>
              <strong>Data de Emissão:</strong>{" "}
              {new Date().toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="col-span-1">
            <p className="text-xs uppercase text-gray-500">Aluno</p>
            <p className="font-bold text-lg">{userName}</p>
          </div>
          <div className="col-span-1">
            <p className="text-xs uppercase text-gray-500">Curso Vinculado</p>
            <p className="font-bold text-lg">{activeCourse.name}</p>
          </div>
          <div className="col-span-1">
            <p className="text-xs uppercase text-gray-500">Situação Atual</p>
            <p className="font-bold text-lg">
              {activeCourse.aprovadas}h de {activeCourse.meta}h ({pct}%)
            </p>
          </div>
        </div>

        <h3 className="text-lg font-bold mb-3 border-b border-gray-300 pb-1">
          Atividades Validadas
        </h3>

        {atividadesAprovadas.length === 0 ? (
          <p className="text-gray-500 italic">
            Nenhuma atividade validada até ao momento.
          </p>
        ) : (
          <table className="w-full text-left border-collapse mt-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border-b border-gray-300 py-2 px-3 text-sm font-semibold">
                  Semestre
                </th>
                <th className="border-b border-gray-300 py-2 px-3 text-sm font-semibold">
                  Atividade
                </th>
                <th className="border-b border-gray-300 py-2 px-3 text-sm font-semibold">
                  Categoria
                </th>
                <th className="border-b border-gray-300 py-2 px-3 text-sm font-semibold text-right">
                  Horas
                </th>
              </tr>
            </thead>
            <tbody>
              {atividadesAprovadas.map((atv, idx) => (
                <tr
                  key={atv.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border-b border-gray-200 py-2 px-3 text-sm">
                    {atv.semestre}
                  </td>
                  <td className="border-b border-gray-200 py-2 px-3 text-sm font-medium">
                    {atv.titulo}
                  </td>
                  <td className="border-b border-gray-200 py-2 px-3 text-sm uppercase text-xs">
                    {atv.categoria}
                  </td>
                  <td className="border-b border-gray-200 py-2 px-3 text-sm font-bold text-right">
                    {atv.horas}h
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td
                  colSpan={3}
                  className="py-3 px-3 text-right font-bold uppercase text-sm"
                >
                  Total Validado:
                </td>
                <td className="py-3 px-3 text-right font-bold text-lg">
                  {activeCourse.aprovadas}h
                </td>
              </tr>
            </tfoot>
          </table>
        )}

        <div className="mt-16 text-center text-xs text-gray-400">
          <p>
            Este documento é gerado eletronicamente e tem validade apenas para
            conferência de progresso pelo aluno.
          </p>
        </div>
      </div>
    </>
  );
};

export default StudentDashboard;