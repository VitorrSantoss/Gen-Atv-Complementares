import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { regraService, RegraAtividade, ItemRegraAtividade } from "@/services/coordenador/RegraService";
import { cursoService, CursoResponse } from "@/services/coordenador/CursoService";

const colorPalettes = [
  { cor: "border-blue-500", bgBadge: "bg-blue-100 text-blue-700" },
  { cor: "border-emerald-500", bgBadge: "bg-emerald-100 text-emerald-700" },
  { cor: "border-purple-500", bgBadge: "bg-purple-100 text-purple-700" },
  { cor: "border-orange-500", bgBadge: "bg-orange-100 text-orange-700" },
  { cor: "border-pink-500", bgBadge: "bg-pink-100 text-pink-700" },
];

const CoordinatorRules = () => {
  const { toast } = useToast();
  
  // Estados de Dados
  const [courses, setCourses] = useState<CursoResponse[]>([]);
  const [selectedCursoId, setSelectedCursoId] = useState<string>("");
  const [rules, setRules] = useState<RegraAtividade[]>([]);
  
  // Estados de UI
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
    exigeComprovante: false
  });

  // 1. Carregar cursos ao montar a tela
  useEffect(() => {
    cursoService.getAll().then((data) => {
      setCourses(data);
      if (data.length > 0) setSelectedCursoId(data[0].id.toString());
    }).finally(() => setIsLoading(false));
  }, []);

  // 2. Carregar regras quando o curso selecionado mudar
  useEffect(() => {
    if (selectedCursoId) {
      setIsLoading(true);
      regraService.getByCurso(Number(selectedCursoId))
        .then(setRules)
        .finally(() => setIsLoading(false));
    }
  }, [selectedCursoId]);

  const handleSave = async () => {
    try {
      const payload = {
        area: formData.area,
        itens: formData.itens.filter(item => item.descricao.trim() !== ""),
        limiteHoras: Number(formData.limiteHoras),
        exigeComprovante: formData.exigeComprovante,
        cursoId: Number(selectedCursoId)
      };

      if (isEditing) {
        await regraService.update(formData.id, payload);
        toast({ title: "Regra atualizada com sucesso!" });
      } else {
        // Gerar um ID temporário ou deixar o back-end gerar
        await regraService.save({ ...payload, id: Math.random().toString(36).substring(2, 9) });
        toast({ title: "Nova regra cadastrada!" });
      }

      setDialogOpen(false);
      // Recarregar lista
      const data = await regraService.getByCurso(Number(selectedCursoId));
      setRules(data);
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!ruleToDelete) return;
    try {
      await regraService.delete(ruleToDelete.id);
      setRules(rules.filter(r => r.id !== ruleToDelete.id));
      setDeleteDialogOpen(false);
      toast({ title: "Regra removida" });
    } catch (error) {
      toast({ title: "Erro ao excluir", variant: "destructive" });
    }
  };

  // Funções de UI
  const getIconForArea = (area: string) => {
    const areaLower = area.toLowerCase();
    if (areaLower.includes("pesquisa")) return <Target className="h-5 w-5" />;
    if (areaLower.includes("extensão")) return <Users className="h-5 w-5" />;
    return <BookOpen className="h-5 w-5" />;
  };

  if (isLoading && courses.length === 0) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Regras de Atividades</h1>
          <div className="mt-2 flex items-center gap-3">
             <Label className="text-slate-500 font-medium">Configurando para o curso:</Label>
             <Select value={selectedCursoId} onValueChange={setSelectedCursoId}>
                <SelectTrigger className="w-[280px] bg-white border-slate-200">
                  <SelectValue placeholder="Selecione o curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>)}
                </SelectContent>
             </Select>
          </div>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 rounded-xl px-6" onClick={() => { setIsEditing(false); setFormData({id: "", area: "", itens: [{ ...emptyItem }], limiteHoras: "", exigeComprovante: false}); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Nova Regra
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          rules.map((rule, index) => {
            const palette = colorPalettes[index % colorPalettes.length];
            const isExpanded = expandedId === rule.id;

            return (
              <Card key={rule.id} className={`bg-white border-l-[6px] ${palette.cor} shadow-sm overflow-hidden`}>
                <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : rule.id)}>
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-xl ${palette.bgBadge}`}>{getIconForArea(rule.area)}</div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{rule.area}</h3>
                      <p className="text-xs text-slate-400">Limite de {rule.limiteHoras} horas por curso</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {rule.exigeComprovante && <Badge variant="outline" className="text-orange-600 border-orange-200 bg-orange-50">Exige Comprovante</Badge>}
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setIsEditing(true); setFormData({ id: rule.id, area: rule.area, itens: rule.itens?.length ? rule.itens.map(i => ({ descricao: i.descricao, aproveitamento: i.aproveitamento, explicacao: i.explicacao || "" })) : [{ ...emptyItem }], limiteHoras: rule.limiteHoras.toString(), exigeComprovante: rule.exigeComprovante }); setDialogOpen(true); }}><Pencil className="h-4 w-4 text-slate-400" /></Button>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setRuleToDelete(rule); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4 text-slate-400" /></Button>
                    <ChevronDown className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </div>
                </div>
                {isExpanded && rule.itens?.length > 0 && (
                  <div className="border-t border-slate-100 px-5 pb-5 pt-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs text-slate-400 uppercase tracking-wider">
                          <th className="pb-2 font-medium w-8"></th>
                          <th className="pb-2 font-medium">Descrição</th>
                          <th className="pb-2 font-medium text-right">Aproveitamento</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rule.itens.map((item, i) => {
                          const itemKey = `${rule.id}-${i}`;
                          const isItemExpanded = expandedItemKey === itemKey;
                          return (
                            <>
                              <tr
                                key={itemKey}
                                className="cursor-pointer hover:bg-slate-50"
                                onClick={() => setExpandedItemKey(isItemExpanded ? null : itemKey)}
                              >
                                <td className="py-2">
                                  <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isItemExpanded ? "rotate-180" : ""}`} />
                                </td>
                                <td className="py-2 text-slate-600">{item.descricao}</td>
                                <td className="py-2 text-slate-500 text-right">{item.aproveitamento}</td>
                              </tr>
                              {isItemExpanded && item.explicacao && (
                                <tr key={`${itemKey}-exp`}>
                                  <td></td>
                                  <td colSpan={2} className="pb-3 pt-1 text-xs text-slate-500 italic">
                                    {item.explicacao}
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de Cadastro */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader><DialogTitle>{isEditing ? "Editar Regra" : "Nova Regra de Atividade"}</DialogTitle></DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <Label>Área da Atividade</Label>
              <Input value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} placeholder="Ex: Pesquisa, Extensão, Ensino..." />
            </div>
            <div className="space-y-3">
              <Label>Itens da Regra</Label>
              {formData.itens.map((item, i) => (
                <div key={i} className="space-y-2 rounded-lg border border-slate-200 p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={item.descricao}
                      onChange={(e) => {
                        const novos = [...formData.itens];
                        novos[i] = { ...novos[i], descricao: e.target.value };
                        setFormData({...formData, itens: novos});
                      }}
                      placeholder="Descrição"
                      className="flex-1"
                    />
                    <Input
                      value={item.aproveitamento}
                      onChange={(e) => {
                        const novos = [...formData.itens];
                        novos[i] = { ...novos[i], aproveitamento: e.target.value };
                        setFormData({...formData, itens: novos});
                      }}
                      placeholder="Aproveitamento"
                      className="w-[160px]"
                    />
                    {formData.itens.length > 1 && (
                      <Button variant="ghost" size="icon" className="shrink-0" onClick={() => {
                        setFormData({...formData, itens: formData.itens.filter((_, idx) => idx !== i)});
                      }}>
                        <X className="h-4 w-4 text-slate-400" />
                      </Button>
                    )}
                  </div>
                  <Input
                    value={item.explicacao}
                    onChange={(e) => {
                      const novos = [...formData.itens];
                      novos[i] = { ...novos[i], explicacao: e.target.value };
                      setFormData({...formData, itens: novos});
                    }}
                    placeholder="Explicação (detalhes adicionais)"
                    className="text-sm"
                  />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => setFormData({...formData, itens: [...formData.itens, { ...emptyItem }]})}>
                <Plus className="h-3 w-3 mr-1" /> Adicionar item
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Limite de Horas</Label>
              <Input type="number" value={formData.limiteHoras} onChange={(e) => setFormData({...formData, limiteHoras: e.target.value})} placeholder="Ex: 40" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="exige" checked={formData.exigeComprovante} onChange={(e) => setFormData({...formData, exigeComprovante: e.target.checked})} className="rounded border-slate-300" />
              <Label htmlFor="exige" className="text-sm cursor-pointer">Exige obrigatoriamente o envio de comprovante</Label>
            </div>
          </div>
          <DialogFooter>
            <Button className="bg-blue-600 w-full" onClick={handleSave}>Salvar Configuração</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Modal de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Confirmar Exclusão</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Tem certeza que deseja excluir a regra <strong>{ruleToDelete?.area}</strong>?</p>
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