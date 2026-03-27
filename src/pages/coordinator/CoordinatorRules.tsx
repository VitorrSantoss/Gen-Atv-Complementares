import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Info,
  ChevronDown,
  Pencil,
  Trash2,
  BookOpen,
  Target,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Interface com Descrição, Aproveitamento e Requisito
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
        descricao:
          "Comparecimento a defesas de monografias (temas pertinentes)",
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
        descricao:
          "Elaboração de material didático com supervisão do professor",
        aproveitamento: "5h por material",
        requisito: "Cópia do material",
      },
      {
        id: "ens-8",
        descricao:
          "Atividade extraclasse promovida como parte da formação do aluno",
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
        descricao:
          "Publicações de artigos (revistas, periódicos, sites e congêneres)",
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
        descricao:
          "Participação em seminários, congressos, conferências e encontros",
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
        descricao:
          "Apresentação de trabalhos, concursos, exposições, painéis, mostras e congêneres",
        aproveitamento: "10h pela apresentação",
        requisito: "Trabalho apresentado",
      },
      {
        id: "ext-4",
        descricao:
          "Estágio extracurricular em entidades públicas ou privadas conveniadas com a Faculdade Senac",
        aproveitamento: "20h por semestre",
        requisito:
          "Declaração da instituição e apresentação de relatório de atividades",
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
        descricao:
          "Cursos de extensão universitária (dentro ou fora da Faculdade Senac)",
        aproveitamento: "10h por curso",
        requisito: "Declaração da instituição atestando carga horária",
      },
    ],
  },
];

const colorPalettes = [
  { cor: "border-blue-500", bgBadge: "bg-blue-100 text-blue-700" },
  { cor: "border-emerald-500", bgBadge: "bg-emerald-100 text-emerald-700" },
  { cor: "border-purple-500", bgBadge: "bg-purple-100 text-purple-700" },
  { cor: "border-orange-500", bgBadge: "bg-orange-100 text-orange-700" },
  { cor: "border-pink-500", bgBadge: "bg-pink-100 text-pink-700" },
  { cor: "border-cyan-500", bgBadge: "bg-cyan-100 text-cyan-700" },
  { cor: "border-rose-500", bgBadge: "bg-rose-100 text-rose-700" },
];

const CoordinatorRules = () => {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);

  // Estados dos Modais
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    area: "",
    maxHoras: "",
    descricao: "",
  });

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setFormData({ id: "", area: "", maxHoras: "", descricao: "" });
      setIsEditing(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: "", area: "", maxHoras: "", descricao: "" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (rule: Rule) => {
    setIsEditing(true);
    setFormData({
      id: rule.id,
      area: rule.area,
      maxHoras: rule.maxHoras.toString(),
      descricao: rule.descricao,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const ruleData = {
      area: formData.area,
      descricao: formData.descricao,
      maxHoras: Number(formData.maxHoras) || 0,
    };

    if (isEditing) {
      setRules(
        rules.map((r) => (r.id === formData.id ? { ...r, ...ruleData } : r)),
      );
    } else {
      const randomPalette =
        colorPalettes[Math.floor(Math.random() * colorPalettes.length)];

      const newRule: Rule = {
        ...ruleData,
        id: Math.random().toString(36).substring(2, 9),
        cor: randomPalette.cor,
        bgBadge: randomPalette.bgBadge,
        atividades: [],
      };

      setRules([...rules, newRule]);
    }
    setDialogOpen(false);
  };

  const handleDeleteClick = (rule: Rule) => {
    setRuleToDelete(rule);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (ruleToDelete) {
      setRules(rules.filter((r) => r.id !== ruleToDelete.id));
      setDeleteDialogOpen(false);
      setRuleToDelete(null);
    }
  };

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
    <div className="p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Regras</h1>
          <p className="text-lg text-slate-500">
            Configure os limites de horas por área de atividade
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6"
          onClick={handleOpenAdd}
        >
          <Plus className="h-4 w-4 mr-2" /> Nova Regra
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 shadow-sm">
        <div className="bg-white p-1 rounded-full shadow-sm shrink-0">
          <Info className="h-5 w-5 text-blue-600" />
        </div>
        <div className="text-sm">
          <p className="text-blue-900 font-semibold">
            Carga horária total do curso:{" "}
            <span className="font-bold">100 horas</span>
          </p>
          <p className="text-blue-700">
            A condição básica deve ser realizada pelo aluno tenha que
            pertinência ao Cursos Superiores do Eixo de Tecnologia (ADS e DJD).
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
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${rule.bgBadge}`}>
                    {getIconForArea(rule.area, rule.bgBadge)}
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">
                    {rule.area}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={`${rule.bgBadge} border-0 font-semibold text-xs px-3 py-1`}
                  >
                    Max {rule.maxHoras}h
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(rule);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 mr-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(rule);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="h-6 w-px bg-slate-200 mx-1"></div>

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
                className={`transition-all duration-300 ease-in-out px-5 overflow-hidden ${
                  isExpanded
                    ? "max-h-[2000px] opacity-100 pb-5"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 mt-4">
                    {rule.descricao}
                  </p>

                  {/* Cabeçalho da Tabela de Atividades */}
                  {rule.atividades.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <div className="col-span-7">Descrição</div>
                        <div className="col-span-4">Aproveitamento</div>
                        <div className="col-span-1 text-center"></div>
                      </div>

                      {/* Lista de Atividades (Sub-Acordeão) com Efeito Zebrado */}
                      <div className="flex flex-col">
                        {rule.atividades.map((atividade, index) => {
                          const isSubExpanded = expandedSubId === atividade.id;
                          // 👇 Lógica de alternância de cores (Zebrado)
                          const rowBgColor =
                            index % 2 === 0 ? "bg-white" : "bg-slate-50";

                          return (
                            <div
                              key={atividade.id}
                              className={`border-b border-slate-200 last:border-0 flex flex-col ${rowBgColor}`}
                            >
                              {/* Linha Clicável do Subtópico */}
                              <div
                                className="grid grid-cols-12 gap-4 px-4 py-3 items-center cursor-pointer hover:bg-slate-100/70 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSubExpand(atividade.id);
                                }}
                              >
                                <div className="col-span-7 text-sm font-semibold text-slate-700 pr-2">
                                  {atividade.descricao}
                                </div>
                                <div className="col-span-4 text-sm text-slate-600">
                                  <Badge
                                    variant="outline"
                                    className="bg-white border-slate-200 text-slate-700 font-medium whitespace-normal text-left h-auto py-1 shadow-sm"
                                  >
                                    {atividade.aproveitamento}
                                  </Badge>
                                </div>
                                <div className="col-span-1 flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-slate-400 hover:text-blue-600"
                                  >
                                    <ChevronDown
                                      className={`h-4 w-4 transition-transform duration-300 ${
                                        isSubExpanded
                                          ? "rotate-180 text-blue-600"
                                          : ""
                                      }`}
                                    />
                                  </Button>
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
                                <div className="px-4 py-3 text-sm text-slate-600 flex flex-col gap-1">
                                  <span className="font-semibold text-slate-800 text-xs uppercase tracking-wide">
                                    Requisito Comprobatório
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
                        Nenhuma atividade detalhada cadastrada para esta regra.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal de Nova/Editar Regra */}
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Regra" : "Nova Regra"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="area" className="text-right">
                Área
              </Label>
              <Input
                id="area"
                placeholder="Ex: Extensão"
                className="col-span-3"
                value={formData.area}
                onChange={(e) =>
                  setFormData({ ...formData, area: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="maxHoras" className="text-right">
                Máx. Horas
              </Label>
              <Input
                id="maxHoras"
                type="number"
                placeholder="Ex: 40"
                className="col-span-3"
                value={formData.maxHoras}
                onChange={(e) =>
                  setFormData({ ...formData, maxHoras: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="descricao" className="text-right mt-3">
                Descrição
              </Label>
              <textarea
                id="descricao"
                placeholder="Descrição das atividades aceitas nesta área..."
                className="col-span-3 flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.descricao}
                onChange={(e) =>
                  setFormData({ ...formData, descricao: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
              onClick={handleSave}
            >
              Salvar Regra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Excluir */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Excluir Regra</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600">
            Tem certeza que deseja remover a regra para a área de{" "}
            <strong>{ruleToDelete?.area}</strong>?
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={confirmDelete}
            >
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoordinatorRules;
