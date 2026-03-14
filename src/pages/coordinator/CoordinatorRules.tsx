import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Info } from "lucide-react";
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

const initialRules = [
  {
    id: "1",
    area: "Pesquisa",
    maxHoras: 60,
    descricao:
      "Atividades de iniciacao científica, participacao em grupos de pesquisa, publicacao de artigos e apresentacao em congressos.",
    cor: "border-blue-400",
    bgBadge: "bg-blue-100 text-blue-700",
  },
  {
    id: "2",
    area: "Extensao",
    maxHoras: 50,
    descricao:
      "Projetos sociais, voluntariado, atividades comunitarias organizadas pela universidade.",
    cor: "border-emerald-400",
    bgBadge: "bg-emerald-100 text-emerald-700",
  },
  {
    id: "3",
    area: "Ensino",
    maxHoras: 40,
    descricao: "Monitorias, cursos extracurriculares, participacao como tutor.",
    cor: "border-blue-300",
    bgBadge: "bg-blue-50 text-blue-600",
  },
  {
    id: "4",
    area: "Cultura",
    maxHoras: 30,
    descricao:
      "Participacao em eventos culturais, grupos de teatro, musica e artes visuais.",
    cor: "border-purple-400",
    bgBadge: "bg-purple-100 text-purple-700",
  },
  {
    id: "5",
    area: "Esporte",
    maxHoras: 20,
    descricao:
      "Competicoes esportivas universitarias, participacao em equipes oficiais.",
    cor: "border-orange-400",
    bgBadge: "bg-orange-100 text-orange-700",
  },
];

const CoordinatorRules = () => {
  const [rules, setRules] = useState(initialRules);
  const totalMax = rules.reduce((acc, r) => acc + r.maxHoras, 0);

  // Estados dos Modais
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<any>(null);

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

  const handleOpenEdit = (rule: any) => {
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
      ...formData,
      maxHoras: Number(formData.maxHoras) || 0,
    };

    if (isEditing) {
      setRules(
        rules.map((r) => (r.id === formData.id ? { ...r, ...ruleData } : r))
      );
    } else {
      const newRule = {
        ...ruleData,
        id: Math.random().toString(36).substring(2, 9),
        cor: "border-slate-400",
        bgBadge: "bg-slate-100 text-slate-700",
      };
      setRules([...rules, newRule]);
    }

    setDialogOpen(false);
  };

  const handleDeleteClick = (rule: any) => {
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

  return (
    <div className="p-8 space-y-6 bg-slate-50 ">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Regras</h1>
          <p className="text-lg text-slate-500">
            Configure os limites de horas por area de atividade
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
        <div className="bg-white p-1 rounded-full shadow-sm">
          <Info className="h-5 w-5 text-blue-600" />
        </div>
        <div className="text-sm">
          <p className="text-blue-900 font-semibold">
            Carga horaria total do curso:{" "}
            <span className="font-bold">200 horas</span>
          </p>
          <p className="text-blue-700">
            Soma dos limites maximo por area:{" "}
            <span className="font-bold">{totalMax}h</span> (pode exceder o total
            pois o aluno nao precisa atingir o maximo em cada area)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule) => (
          <Card
            key={rule.id}
            className={`bg-white border-l-4 ${rule.cor} shadow-sm hover:shadow-md transition-shadow`}
          >
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-700 text-lg">
                    {rule.area}
                  </h3>
                  <Badge
                    variant="secondary"
                    className={`${rule.bgBadge} border-0 font-medium`}
                  >
                    Max {rule.maxHoras}h
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-blue-600"
                    onClick={() => handleOpenEdit(rule)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-red-500"
                    onClick={() => handleDeleteClick(rule)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {rule.descricao}
              </p>
              <p className="text-xs text-slate-400">
                Exemplos:{" "}
                {rule.area === "Pesquisa"
                  ? "IC, artigos, congressos"
                  : rule.area === "Extensao"
                    ? "Projetos sociais, voluntariado"
                    : "Monitorias, cursos, tutoria"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

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
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, maxHoras: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto" onClick={handleSave}>
              Salvar Regra
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete}>
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoordinatorRules;