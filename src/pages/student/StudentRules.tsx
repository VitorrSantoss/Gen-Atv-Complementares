// Regras do curso para os alunos, detalhando as atividades permitidas, 
// limites de horas e requisitos de comprovação para cada área (Ensino, Pesquisa, Extensão).
// Aqui foi removido o "adicionar, editar ou excluir regras".

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Info,
  ChevronDown,
  BookOpen,
  Target,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Atividade {
  id: string;
  descricao: string;
  aproveitamento: string;
  requisito: string;
}

interface Rule {
  id: string;
  area: string;
  maxHoras: number;
  descricao: string;
  cor: string;
  bgBadge: string;
  atividades: Atividade[];
}

const initialRules: Rule[] = [
  {
    id: "1",
    area: "Ensino",
    maxHoras: 100,
    descricao: "Monitorias, cursos extracurriculares, participacao como tutor.",
    cor: "border-purple-500",
    bgBadge: "bg-purple-100 text-purple-700",
    atividades: [
      {
        id: "ens-1",
        descricao: "Participação em monitoria no curso",
        aproveitamento: "20h por semestre",
        requisito: "Declaração e relatório das atividades",
      },
      {
        id: "ens-2",
        descricao: "Comparecimento a defesas de monografias (temas pertinentes)",
        aproveitamento: "2h por participação",
        requisito: "Relatório do evento e lista de presença",
      },
      {
        id: "ens-3",
        descricao: "Disciplina cursada em outros cursos da Faculdade Senac",
        aproveitamento: "20h por disciplina",
        requisito: "Histórico oficial",
      },
      {
        id: "ens-4",
        descricao: "Disciplinas cursadas fora da Faculdade Senac",
        aproveitamento: "20h por disciplina",
        requisito: "Histórico escolar e programa da disciplina",
      },
      {
        id: "ens-5",
        descricao: "Cursos instrumentais (informática e/ou língua estrangeira)",
        aproveitamento: "10h por semestre",
        requisito: "Declaração do curso e aprovação no módulo ou semestre",
      },
      {
        id: "ens-6",
        descricao: "Certificações reconhecidas da área",
        aproveitamento: "10h por semestre",
        requisito: "Declaração do curso",
      },
      {
        id: "ens-7",
        descricao: "Elaboração de material didático com supervisão do professor",
        aproveitamento: "5h por material",
        requisito: "Cópia do material",
      },
      {
        id: "ens-8",
        descricao: "Atividade extraclasse promovida como parte da formação do aluno",
        aproveitamento: "10h por participação",
        requisito: "Certificado de participação",
      },
      {
        id: "ens-9",
        descricao: "Visitas técnicas",
        aproveitamento: "4h por visita",
        requisito: "Documento do órgão/empresa e/ou comprovante de presença",
      },
    ],
  },
  {
    id: "2",
    area: "Pesquisa",
    maxHoras: 90,
    descricao: "Atividades vinculadas à Pesquisa.",
    cor: "border-emerald-500",
    bgBadge: "bg-emerald-100 text-emerald-700",
    atividades: [
      {
        id: "pesq-1",
        descricao: "Participação em pesquisas ou atividades de pesquisa",
        aproveitamento: "10h por produto final publicado",
        requisito: "Relatório do professor orientador",
      },
      {
        id: "pesq-2",
        descricao: "Programas de bolsa de Iniciação Científica",
        aproveitamento: "20h por bolsa",
        requisito: "Relatório do professor orientador",
      },
      {
        id: "pesq-3",
        descricao: "Publicações de artigos (revistas, periódicos, sites e congêneres)",
        aproveitamento: "10h por produto publicado",
        requisito: "Publicação",
      },
      {
        id: "pesq-4",
        descricao: "Publicação em livro na área",
        aproveitamento: "40h por produto publicado",
        requisito: "Livro publicado",
      },
      {
        id: "pesq-5",
        descricao: "Participação em programa especial de treinamento",
        aproveitamento: "10h por semestre",
        requisito: "Atestado ou certificado de participação",
      },
    ],
  },
  {
    id: "3",
    area: "Extensão",
    maxHoras: 75,
    descricao: "Atividades vinculadas à Extensão.",
    cor: "border-orange-500",
    bgBadge: "bg-orange-100 text-orange-700",
    atividades: [
      {
        id: "ext-1",
        descricao: "Participação em seminários, congressos, conferências e encontros",
        aproveitamento: "10h por participação / 4h como público",
        requisito: "Atestado ou certificado de participação",
      },
      {
        id: "ext-2",
        descricao: "Atendimento comunitário de cunho social",
        aproveitamento: "10h por semestre",
        requisito: "Atestado de participação",
      },
      {
        id: "ext-3",
        descricao: "Apresentação de trabalhos, concursos, exposições, painéis, mostras e congêneres",
        aproveitamento: "10h pela apresentação",
        requisito: "Trabalho apresentado",
      },
      {
        id: "ext-4",
        descricao: "Estágio extracurricular em entidades públicas ou privadas conveniadas com a Faculdade Senac",
        aproveitamento: "20h por semestre",
        requisito: "Declaração da instituição e apresentação de relatório de atividades",
      },
      {
        id: "ext-5",
        descricao: "Participação em órgãos colegiados da Faculdade Senac",
        aproveitamento: "5h por semestre",
        requisito: "Declaração da Direção ou do Presidente dos Conselhos",
      },
      {
        id: "ext-6",
        descricao: "Representação estudantil",
        aproveitamento: "10h por semestre",
        requisito: "Declaração da representação estudantil",
      },
      {
        id: "ext-7",
        descricao: "Cursos de extensão universitária (dentro ou fora da Faculdade Senac)",
        aproveitamento: "10h por curso",
        requisito: "Declaração da instituição atestando carga horária",
      },
    ],
  },
];

const StudentRules = () => {
  const [rules] = useState<Rule[]>(initialRules);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setExpandedSubId(null);
  };

  const toggleSubExpand = (id: string) => {
    setExpandedSubId(expandedSubId === id ? null : id);
  };

  const getIconForArea = (area: string, colorClass: string) => {
    const iconClass = `h-5 w-5 ${colorClass.split(" ")[1]}`;
    const areaLower = area.toLowerCase();

    if (areaLower.includes("pesquisa")) return <Target className={iconClass} />;
    if (areaLower.includes("extensão") || areaLower.includes("extensao"))
      return <Users className={iconClass} />;
    return <BookOpen className={iconClass} />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Regras do Curso</h1>
        <p className="text-sm md:text-base text-slate-500">
          Consulte os limites de horas, atividades permitidas e requisitos de envio para cada área.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
        <div className="bg-white p-1 rounded-full shadow-sm shrink-0">
          <Info className="h-5 w-5 text-blue-600" />
        </div>
        <div className="text-sm">
          <p className="text-blue-900 font-semibold">
            Carga horária total exigida: <span className="font-bold">100 horas</span>
          </p>
          <p className="text-blue-700">
            A atividade deve ter pertinência com os Cursos Superiores do Eixo de Tecnologia (ADS e DJD).
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {rules.map((rule) => {
          const isExpanded = expandedId === rule.id;

          return (
            <Card
              key={rule.id}
              className={`bg-white border-l-[6px] ${rule.cor} shadow-sm transition-all duration-200 overflow-hidden flex flex-col`}
            >
              {/* --- CABEÇALHO DO ACORDEÃO PRINCIPAL --- */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer select-none hover:bg-slate-50/50"
                onClick={() => toggleExpand(rule.id)}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`p-2.5 rounded-xl ${rule.bgBadge}`}>
                    {getIconForArea(rule.area, rule.bgBadge)}
                  </div>
                  <h3 className="font-bold text-slate-800 text-base sm:text-lg">
                    {rule.area}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={`${rule.bgBadge} border-0 font-semibold text-xs px-2 sm:px-3 py-1 hidden sm:inline-flex`}
                  >
                    Max {rule.maxHoras}h
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`${rule.bgBadge} border-0 font-semibold text-xs px-2 py-1 sm:hidden`}
                  >
                    Max {rule.maxHoras}h
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-400"
                  >
                    <ChevronDown
                      className={`h-5 w-5 transition-transform duration-300 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </div>
              </div>

              {/* --- CORPO DO ACORDEÃO (SUBTÓPICOS) --- */}
              <div
                className={`transition-all duration-300 ease-in-out px-2 sm:px-5 overflow-hidden ${
                  isExpanded
                    ? "max-h-[2000px] opacity-100 pb-5"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 mt-4 px-2 sm:px-0">
                    {rule.descricao}
                  </p>

                  {rule.atividades.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-7">Descrição</div>
                        <div className="col-span-4">Aproveitamento</div>
                        <div className="col-span-1 text-center"></div>
                      </div>

                      {/* Lista de Atividades */}
                      <div className="flex flex-col">
                        {rule.atividades.map((atividade, index) => {
                          const isSubExpanded = expandedSubId === atividade.id;
                          const rowBgColor = index % 2 === 0 ? "bg-white" : "bg-slate-50";

                          return (
                            <div
                              key={atividade.id}
                              className={`border-b border-slate-200 last:border-0 flex flex-col ${rowBgColor}`}
                            >
                              {/* Linha Clicável do Subtópico */}
                              <div
                                className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-4 py-3 items-center cursor-pointer hover:bg-slate-100/70 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSubExpand(atividade.id);
                                }}
                              >
                                <div className="md:col-span-7 text-sm font-semibold text-slate-700 pr-2">
                                  {atividade.descricao}
                                </div>
                                <div className="md:col-span-4 text-sm text-slate-600 flex justify-between md:block items-center">
                                  <span className="md:hidden text-xs font-bold text-slate-400 uppercase">Aproveitamento:</span>
                                  <Badge
                                    variant="outline"
                                    className="bg-white border-slate-200 text-slate-700 font-medium whitespace-normal text-left h-auto py-1 shadow-sm"
                                  >
                                    {atividade.aproveitamento}
                                  </Badge>
                                </div>
                                <div className="hidden md:flex col-span-1 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-slate-400 hover:text-blue-600 pointer-events-none"
                                  >
                                    <ChevronDown
                                      className={`h-4 w-4 transition-transform duration-300 ${
                                        isSubExpanded ? "rotate-180 text-blue-600" : ""
                                      }`}
                                    />
                                  </Button>
                                </div>
                                {/* Mobile Expander Indicator */}
                                <div className="md:hidden flex items-center justify-center pt-2 pb-1 text-slate-400">
                                   <span className="text-xs mr-1">{isSubExpanded ? "Ocultar requisito" : "Ver requisito"}</span>
                                   <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${isSubExpanded ? "rotate-180 text-blue-600" : ""}`} />
                                </div>
                              </div>

                              {/* Área Expandida (Requisito) */}
                              <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                  isSubExpanded
                                    ? "max-h-40 opacity-100 border-t border-slate-200/60"
                                    : "max-h-0 opacity-0"
                                }`}
                              >
                                <div className="px-4 py-3 text-sm text-slate-600 flex flex-col gap-1 bg-blue-50/30">
                                  <span className="font-semibold text-slate-800 text-xs uppercase tracking-wide">
                                    Requisito Comprobatório (Documento Necessário)
                                  </span>
                                  <span>{atividade.requisito}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-slate-200 border-dashed rounded-xl bg-slate-50 text-center">
                      <p className="text-sm text-slate-400 italic">
                        Nenhuma regra detalhada disponível no momento.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StudentRules;