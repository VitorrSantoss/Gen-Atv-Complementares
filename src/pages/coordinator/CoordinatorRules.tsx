import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  ChevronDown,
  Pencil,
  Trash2,
  BookOpen,
  Target,
  Users,
  Loader2,
  X,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { regraService, RegraAtividade } from "@/services/coordenador/RegraService";
import { cursoService, CursoResponse } from "@/services/coordenador/CursoService";

const colorPalettes = [
  { cor: "border-blue-500", bgBadge: "bg-blue-100 text-blue-700", badgeItem: "bg-blue-50 text-blue-600 border-blue-200" },
  { cor: "border-emerald-500", bgBadge: "bg-emerald-100 text-emerald-700", badgeItem: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { cor: "border-purple-500", bgBadge: "bg-purple-100 text-purple-700", badgeItem: "bg-purple-50 text-purple-600 border-purple-200" },
  { cor: "border-orange-500", bgBadge: "bg-orange-100 text-orange-700", badgeItem: "bg-orange-50 text-orange-600 border-orange-200" },
  { cor: "border-pink-500", bgBadge: "bg-pink-100 text-pink-700", badgeItem: "bg-pink-50 text-pink-600 border-pink-200" },
];

const CoordinatorRules = () => {
  const { toast } = useToast();

  const [courses, setCourses] = useState<CursoResponse[]>([]);
  const [selectedCursoId, setSelectedCursoId] = useState<string>("");
  const [rules, setRules] = useState<RegraAtividade[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<RegraAtividade | null>(null);
  const [expandedItemKey, setExpandedItemKey] = useState<string | null>(null);

  const emptyItem = { descricao: "", aproveitamento: "", explicacao: "" };
  const [formData, setFormData] = useState({
    id: "",
    area: "",
    itens: [{ ...emptyItem }],
    limiteHoras: "",
    exigeComprovante: false,
  });

  useEffect(() => {
    cursoService.getAll().then((data) => {
      setCourses(data);
      if (data.length > 0) setSelectedCursoId(data[0].id.toString());
    }).finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCursoId) {
      setIsLoading(true);
      regraService.getByCurso(Number(selectedCursoId))
        .then(setRules)
        .catch(() => toast({ title: "Erro ao buscar regras", variant: "destructive" }))
        .finally(() => setIsLoading(false));
    }
  }, [selectedCursoId, toast]);

  const handleSave = async () => {
    if (!formData.area.trim()) {
      toast({ title: "Atenção", description: "O campo Área da Atividade é obrigatório.", variant: "destructive" });
      return;
    }
    if (!selectedCursoId) {
      toast({ title: "Atenção", description: "Selecione um curso antes de salvar.", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        area: formData.area,
        itens: formData.itens.filter(item => item.descricao.trim() !== ""),
        limiteHoras: Number(formData.limiteHoras) || 0,
        exigeComprovante: formData.exigeComprovante,
        cursoId: Number(selectedCursoId),
      };
      if (isEditing) {
        await regraService.update(formData.id, payload);
        toast({ title: "Regra atualizada com sucesso!" });
      } else {
        await regraService.save(payload);
        toast({ title: "Nova regra cadastrada!" });
      }
      setDialogOpen(false);
      const data = await regraService.getByCurso(Number(selectedCursoId));
      setRules(data);
    } catch {
      toast({ title: "Erro ao salvar", description: "Verifique os dados ou a conexão com o servidor.", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!ruleToDelete) return;
    try {
      await regraService.delete(ruleToDelete.id);
      setRules(rules.filter(r => r.id !== ruleToDelete.id));
      setDeleteDialogOpen(false);
      toast({ title: "Regra removida" });
    } catch {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  const getIconForArea = (area: string) => {
    const areaLower = area?.toLowerCase() || "";
    if (areaLower.includes("pesquisa")) return <Target className="h-5 w-5" />;
    if (areaLower.includes("extensão") || areaLower.includes("extensao")) return <Users className="h-5 w-5" />;
    return <BookOpen className="h-5 w-5" />;
  };

  if (isLoading && courses.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Regras de Atividades</h1>
          <div className="mt-2 flex items-center gap-3">
            <Label className="text-slate-500 font-medium">Configurando para o curso:</Label>
            <Select value={selectedCursoId} onValueChange={setSelectedCursoId}>
              <SelectTrigger className="w-[280px] bg-white border-slate-300 shadow-sm focus:ring-blue-500">
                <SelectValue placeholder="Selecione o curso" />
              </SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6 text-white shadow-sm"
          onClick={() => {
            setIsEditing(false);
            setFormData({ id: "", area: "", itens: [{ ...emptyItem }], limiteHoras: "", exigeComprovante: false });
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Nova Regra
        </Button>
      </div>

      {/* Lista de Regras */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
          </div>
        ) : rules.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-white border border-slate-200 border-dashed rounded-2xl">
            Nenhuma regra cadastrada para este curso ainda.
          </div>
        ) : (
          rules.map((rule, index) => {
            const palette = colorPalettes[index % colorPalettes.length];
            const isExpanded = expandedId === rule.id;

            return (
              <Card key={rule.id} className={`bg-white border-l-[6px] ${palette.cor} shadow-sm overflow-hidden`}>
                {/* Cabeçalho do Card */}
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : rule.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${palette.bgBadge}`}>{getIconForArea(rule.area)}</div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{rule.area}</h3>
                      <p className="text-xs text-slate-400">Limite de {rule.limiteHoras} horas por curso</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {rule.exigeComprovante && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">
                        Exige Comprovante
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                        setFormData({
                          id: rule.id,
                          area: rule.area,
                          itens: rule.itens?.length
                            ? rule.itens.map(i => ({
                                descricao: i.descricao || "",
                                aproveitamento: i.aproveitamento || "",
                                explicacao: i.explicacao || "",
                              }))
                            : [{ ...emptyItem }],
                          limiteHoras: rule.limiteHoras ? rule.limiteHoras.toString() : "",
                          exigeComprovante: rule.exigeComprovante || false,
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRuleToDelete(rule);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                    </Button>
                    <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Acordeão Principal */}
                <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    {rule.itens?.length > 0 ? (
                      <div className="border-t border-slate-200 bg-white">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-slate-400 uppercase tracking-wider border-b border-slate-200 bg-slate-50/50">
                              <th className="py-4 px-4 font-medium w-8"></th>
                              <th className="py-4 font-medium">Descrição da Atividade</th>
                              <th className="py-4 px-4 font-medium text-right">Carga Horária</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {rule.itens.map((item, i) => {
                              const itemKey = `${rule.id}-${i}`;
                              const isItemExpanded = expandedItemKey === itemKey;
                              const rowBgColor = i % 2 === 0 ? "bg-white" : "bg-slate-50";

                              return (
                                <div key={itemKey} className={`contents ${rowBgColor}`}>
                                  {/* Linha Principal */}
                                  <tr
                                    className={`cursor-pointer hover:bg-slate-100/80 transition-colors ${rowBgColor}`}
                                    onClick={() => setExpandedItemKey(isItemExpanded ? null : itemKey)}
                                  >
                                    <td className="py-4 px-4 align-top">
                                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-300 mt-0.5 ${isItemExpanded ? "rotate-180 text-blue-600" : ""}`} />
                                    </td>
                                    <td className="py-4 pr-4 text-slate-800 font-bold leading-relaxed">
                                      {item.descricao}
                                    </td>
                                    <td className="py-4 px-4 text-right align-top">
                                      <Badge variant="outline" className={`${palette.badgeItem} font-semibold whitespace-nowrap px-3 py-1 shadow-sm`}>
                                        {item.aproveitamento}
                                      </Badge>
                                    </td>
                                  </tr>

                                  {/* Linha de Detalhes — só texto em cinza, sem label */}
                                  <tr className={rowBgColor}>
                                    <td colSpan={3} className="p-0 border-0">
                                      <div className={`grid transition-all duration-300 ease-in-out ${isItemExpanded && item.explicacao ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                                        <div className="overflow-hidden">
                                          <div className="px-4 pb-5 ml-[3.25rem] mr-4">
                                            <div className="flex items-start gap-2.5 pl-1">
                                              <div className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                                              <span className="text-slate-400 text-sm leading-relaxed">
                                                {item.explicacao}
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                </div>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 border-t border-slate-100 text-center text-sm text-slate-400 italic">
                        Nenhuma atividade detalhada cadastrada.
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar Regra" : "Nova Regra de Atividade"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-4 px-2 max-h-[65vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Área da Atividade</Label>
              <Input
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="Ex: Pesquisa, Extensão, Ensino..."
                className="border-slate-300 shadow-sm focus-visible:ring-blue-500"
              />
            </div>

            <div className="space-y-3">
              <Label>Itens da Regra</Label>
              {formData.itens.map((item, i) => (
                <div key={i} className="space-y-2 rounded-lg border border-slate-200 p-3 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Input
                      value={item.descricao}
                      onChange={(e) => {
                        const novos = [...formData.itens];
                        novos[i] = { ...novos[i], descricao: e.target.value };
                        setFormData({ ...formData, itens: novos });
                      }}
                      placeholder="Descrição"
                      className="flex-1 bg-white border-slate-300 shadow-sm focus-visible:ring-blue-500"
                    />
                    <Input
                      value={item.aproveitamento}
                      onChange={(e) => {
                        const novos = [...formData.itens];
                        novos[i] = { ...novos[i], aproveitamento: e.target.value };
                        setFormData({ ...formData, itens: novos });
                      }}
                      placeholder="Carga Horária"
                      className="w-[160px] bg-white border-slate-300 shadow-sm focus-visible:ring-blue-500"
                    />
                    {formData.itens.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-slate-400 hover:text-red-500 hover:bg-red-50"
                        onClick={() => setFormData({ ...formData, itens: formData.itens.filter((_, idx) => idx !== i) })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={item.explicacao}
                    onChange={(e) => {
                      const novos = [...formData.itens];
                      novos[i] = { ...novos[i], explicacao: e.target.value };
                      setFormData({ ...formData, itens: novos });
                    }}
                    placeholder="Requisito Comprobatório (Explicação/Detalhes)"
                    className="text-sm bg-white border-slate-300 shadow-sm focus-visible:ring-blue-500"
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 w-full border-dashed border-slate-300 text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50"
                onClick={() => setFormData({ ...formData, itens: [...formData.itens, { ...emptyItem }] })}
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar novo item
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Limite Total de Horas</Label>
                <Input
                  type="number"
                  value={formData.limiteHoras}
                  onChange={(e) => setFormData({ ...formData, limiteHoras: e.target.value })}
                  placeholder="Ex: 40"
                  className="border-slate-300 shadow-sm focus-visible:ring-blue-500"
                />
              </div>
              <div className="flex flex-col justify-end pb-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="exige"
                    checked={formData.exigeComprovante}
                    onChange={(e) => setFormData({ ...formData, exigeComprovante: e.target.checked })}
                    className="rounded border-slate-300 w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <Label htmlFor="exige" className="text-sm cursor-pointer select-none">
                    Exige comprovante oficial
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100">
            <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-white shadow-sm" onClick={handleSave}>
              Salvar Configuração
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">
            Tem certeza que deseja excluir a regra <strong>{ruleToDelete?.area}</strong>?
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoordinatorRules;