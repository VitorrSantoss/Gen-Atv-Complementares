import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Info,
  ChevronDown,
  BookOpen,
  Target,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useCourse } from "@/contexts/CourseContext";
import { api } from "@/lib/api";

// ─── Tipos (espelham RegraAtividade e ItemRegraAtividade do back-end) ─────────

interface ItemRegra {
  id: number;
  descricao: string;
  aproveitamento: string;
  explicacao?: string;
}

interface Regra {
  id: string;
  area: string;
  limiteHoras: number;
  exigeComprovante: boolean;
  itens: ItemRegra[];
}

// ─── Paleta de cores por índice ───────────────────────────────────────────────

const paletas = [
  { borda: "border-blue-500",   badge: "bg-blue-100 text-blue-700"   },
  { borda: "border-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  { borda: "border-purple-500", badge: "bg-purple-100 text-purple-700" },
  { borda: "border-orange-500", badge: "bg-orange-100 text-orange-700" },
  { borda: "border-pink-500",   badge: "bg-pink-100 text-pink-700"   },
];

function iconeArea(area: string, badgeClass: string) {
  const cor = badgeClass.split(" ")[1]; // ex: "text-blue-700"
  const cls = `h-5 w-5 ${cor}`;
  const lower = area.toLowerCase();
  if (lower.includes("pesquisa")) return <Target className={cls} />;
  if (lower.includes("exten"))    return <Users  className={cls} />;
  return <BookOpen className={cls} />;
}

// ─── Componente ──────────────────────────────────────────────────────────────

const StudentRules = () => {
  const { courses, activeCourseId, setActiveCourseId, activeCourse } = useCourse();

  const [regras, setRegras] = useState<Regra[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(false);

  // Acordeão principal (área) e sub (item)
  const [expandedId, setExpandedId]       = useState<string | null>(null);
  const [expandedItemKey, setExpandedItemKey] = useState<string | null>(null);

  // ── Busca regras sempre que o curso selecionado mudar ─────────────────────
  useEffect(() => {
    if (!activeCourseId) return;

    setLoading(true);
    setErro(false);
    setRegras([]);
    setExpandedId(null);

    api
      .get<Regra[]>(`/regras/curso/${activeCourseId}`)
      .then((resp) => setRegras(resp.data))
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, [activeCourseId]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">

      {/* Cabeçalho */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
          Regras do Curso
        </h1>
        <p className="text-sm md:text-base text-slate-500">
          Consulte os limites de horas, atividades permitidas e requisitos de
          envio para cada área.
        </p>
      </div>

      {/* Seletor de curso (se o aluno tiver mais de um) */}
      {courses.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-500">Curso:</span>
          <Select value={activeCourseId} onValueChange={setActiveCourseId}>
            <SelectTrigger className="w-[280px] bg-white border-slate-200">
              <SelectValue placeholder="Selecione o curso" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Banner informativo */}
      {!loading && !erro && regras.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
          <div className="bg-white p-1 rounded-full shadow-sm shrink-0">
            <Info className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-sm">
            <p className="text-blue-900 font-semibold">
              Carga horária total exigida:{" "}
              <span className="font-bold">{activeCourse.meta}h</span>
            </p>
            <p className="text-blue-700">
              Curso: <strong>{activeCourse.name}</strong>. As atividades devem
              estar dentro das áreas e limites definidos pelo coordenador.
            </p>
          </div>
        </div>
      )}

      {/* Estado: carregando */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
        </div>
      )}

      {/* Estado: erro */}
      {!loading && erro && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
          <p>
            Não foi possível carregar as regras. Verifique sua conexão e tente
            novamente.
          </p>
        </div>
      )}

      {/* Estado: sem regras cadastradas */}
      {!loading && !erro && regras.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">
            Nenhuma regra cadastrada para este curso ainda.
          </p>
          <p className="text-xs mt-1">
            O coordenador ainda não configurou as regras de atividades
            complementares.
          </p>
        </div>
      )}

      {/* Lista de regras */}
      {!loading && !erro && (
        <div className="flex flex-col gap-4">
          {regras.map((regra, idx) => {
            const paleta    = paletas[idx % paletas.length];
            const isExpanded = expandedId === regra.id;

            return (
              <Card
                key={regra.id}
                className={`bg-white border-l-[6px] ${paleta.borda} shadow-sm overflow-hidden`}
              >
                {/* ── Cabeçalho do acordeão ── */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-slate-50/50"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : regra.id)
                  }
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`p-2.5 rounded-xl ${paleta.badge}`}>
                      {iconeArea(regra.area, paleta.badge)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                        {regra.area}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Limite de {regra.limiteHoras} horas por curso
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={`${paleta.badge} border-0 font-semibold text-xs px-2 sm:px-3 py-1 hidden sm:inline-flex`}
                    >
                      Máx {regra.limiteHoras}h
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {regra.exigeComprovante && (
                      <Badge
                        variant="outline"
                        className="text-orange-600 border-orange-200 bg-orange-50 text-xs hidden sm:inline-flex"
                      >
                        Exige Comprovante
                      </Badge>
                    )}
                    <Badge
                      variant="secondary"
                      className={`${paleta.badge} border-0 font-semibold text-xs px-2 py-1 sm:hidden`}
                    >
                      Máx {regra.limiteHoras}h
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400">
                      <ChevronDown
                        className={`h-5 w-5 transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </div>
                </div>

                {/* ── Corpo expandido ── */}
                <div
                  className={`transition-all duration-300 ease-in-out px-2 sm:px-5 overflow-hidden ${
                    isExpanded
                      ? "max-h-[2000px] opacity-100 pb-5"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  {/* Alerta de comprovante obrigatório (mobile) */}
                  {regra.exigeComprovante && (
                    <div className="mx-2 mb-3 mt-2 flex items-center gap-2 text-xs text-orange-700 bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 sm:hidden">
                      <Info className="h-3.5 w-3.5 shrink-0" />
                      Exige envio obrigatório de comprovante
                    </div>
                  )}

                  {regra.itens && regra.itens.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm mt-2">
                      {/* Cabeçalho da tabela (desktop) */}
                      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-1" />
                        <div className="col-span-6">Descrição</div>
                        <div className="col-span-5">Aproveitamento</div>
                      </div>

                      <div className="flex flex-col">
                        {regra.itens.map((item, iIdx) => {
                          const itemKey    = `${regra.id}-${iIdx}`;
                          const itemExpand = expandedItemKey === itemKey;
                          const rowBg      = iIdx % 2 === 0 ? "bg-white" : "bg-slate-50";

                          return (
                            <div
                              key={item.id ?? itemKey}
                              className={`border-b border-slate-200 last:border-0 flex flex-col ${rowBg}`}
                            >
                              {/* Linha clicável */}
                              <div
                                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 items-center cursor-pointer hover:bg-slate-100/70 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedItemKey(
                                    itemExpand ? null : itemKey
                                  );
                                }}
                              >
                                <div className="hidden md:flex md:col-span-1 justify-center">
                                  <ChevronDown
                                    className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                                      itemExpand ? "rotate-180 text-blue-600" : ""
                                    }`}
                                  />
                                </div>
                                <div className="md:col-span-6 text-sm font-semibold text-slate-700">
                                  {item.descricao}
                                </div>
                                <div className="md:col-span-5 text-sm text-slate-600 flex justify-between md:block items-center">
                                  <span className="md:hidden text-xs font-bold text-slate-400 uppercase">
                                    Aproveitamento:
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="bg-white border-slate-200 text-slate-700 font-medium whitespace-normal text-left h-auto py-1 shadow-sm"
                                  >
                                    {item.aproveitamento}
                                  </Badge>
                                </div>
                                {/* Indicador mobile */}
                                <div className="md:hidden flex items-center justify-center pt-1 pb-0.5 text-slate-400">
                                  <span className="text-xs mr-1">
                                    {itemExpand ? "Ocultar requisito" : "Ver requisito"}
                                  </span>
                                  <ChevronDown
                                    className={`h-3 w-3 transition-transform duration-300 ${
                                      itemExpand ? "rotate-180 text-blue-600" : ""
                                    }`}
                                  />
                                </div>
                              </div>

                              {/* Requisito expandido */}
                              {item.explicacao && (
                                <div
                                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                    itemExpand
                                      ? "max-h-40 opacity-100 border-t border-slate-200/60"
                                      : "max-h-0 opacity-0"
                                  }`}
                                >
                                  <div className="px-4 py-3 text-sm text-slate-600 flex flex-col gap-1 bg-blue-50/30">
                                    <span className="font-semibold text-slate-800 text-xs uppercase tracking-wide">
                                      Detalhes adicionais
                                    </span>
                                    <span>{item.explicacao}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-slate-200 border-dashed rounded-xl bg-slate-50 text-center mt-2">
                      <p className="text-sm text-slate-400 italic">
                        Nenhum item detalhado para esta área.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentRules;