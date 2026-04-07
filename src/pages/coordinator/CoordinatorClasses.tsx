import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Users2, BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { turmaService, TurmaResponse, Turno } from "@/services/coordenador/TurmaService";
import { cursoService, CursoResponse } from "@/services/coordenador/CursoService"; // Assumindo que você tem este service

const CoordinatorClasses = () => {
  const { toast } = useToast();
  
  // Estados de Dados da API
  const [classes, setClasses] = useState<TurmaResponse[]>([]);
  const [courses, setCourses] = useState<CursoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de Filtro e UI
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Estados do Formulário
  const [selectedClass, setSelectedClass] = useState<TurmaResponse | null>(null);
  const [formData, setFormData] = useState({
    codigo: "",
    semester: "",
    shift: "MANHA" as Turno,
    courseId: "",
  });

  // 1. CARREGAR DADOS INICIAIS
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [turmasData, cursosData] = await Promise.all([
        turmaService.getAll(),
        cursoService.getAll() // Certifique-se de ter este endpoint /cursos
      ]);
      setClasses(turmasData);
      setCourses(cursosData);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao sincronizar com o servidor.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // 2. LÓGICA DE SALVAMENTO (CREATE / UPDATE)
  const handleSave = async () => {
    try {
      const payload = {
        codigo: formData.codigo,
        semestre: formData.semester,
        turno: formData.shift,
        cursoId: Number(formData.courseId)
      };

      if (isEditing && selectedClass) {
        await turmaService.update(selectedClass.id, payload);
        toast({ title: "Sucesso", description: "Turma atualizada!" });
      } else {
        await turmaService.create(payload);
        toast({ title: "Sucesso", description: "Nova turma cadastrada!" });
      }

      setDialogOpen(false);
      loadData(); // Recarrega a lista do banco
    } catch (error: any) {
      toast({ 
        title: "Erro ao salvar", 
        description: error.response?.data?.message || "Verifique os dados.", 
        variant: "destructive" 
      });
    }
  };

  // 3. LÓGICA DE EXCLUSÃO
  const confirmDelete = async () => {
    if (!selectedClass) return;
    try {
      await turmaService.delete(selectedClass.id);
      toast({ title: "Removida", description: "Turma excluída com sucesso." });
      setDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível excluir a turma.", variant: "destructive" });
    }
  };

  // Filtros em memória (para performance)
  const filteredClasses = classes.filter((item) => {
    const matchesSearch = !search || item.codigo.toLowerCase().includes(search.toLowerCase()) || item.curso.nome.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === "todos" || item.curso.id.toString() === courseFilter;
    return matchesSearch && matchesCourse;
  });

  const openEditDialog = (item: TurmaResponse) => {
    setIsEditing(true);
    setSelectedClass(item);
    setFormData({
      codigo: item.codigo,
      semester: item.semestre,
      shift: item.turno,
      courseId: item.curso.id.toString(),
    });
    setDialogOpen(true);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Turmas</h1>
          <p className="text-muted-foreground">Administre as turmas vinculadas aos seus cursos.</p>
        </div>
        <Button onClick={() => { setIsEditing(false); setFormData({ codigo: "", semester: "", shift: "MANHA", courseId: "" }); setDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" /> Nova Turma
        </Button>
      </div>

      {/* Grid de Resumo */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl shadow-sm border-0">
          <CardContent className="flex items-center gap-4 p-6">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground font-medium">Cursos</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl shadow-sm border-0">
          <CardContent className="flex items-center gap-4 p-6">
            <Users2 className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total de Turmas</p>
              <p className="text-2xl font-bold">{classes.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm border-0">
        <CardContent className="p-6 space-y-4">
          {/* Filtros */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar por código ou curso..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filtrar por Curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os cursos</SelectItem>
                {courses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Semestre</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-bold">{item.codigo}</TableCell>
                  <TableCell>{item.curso.nome}</TableCell>
                  <TableCell>{item.semestre}</TableCell>
                  <TableCell>{item.turno}</TableCell>
                  <TableCell>
                    <Badge variant={item.ativa ? "default" : "secondary"}>
                      {item.ativa ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { setSelectedClass(item); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Cadastro */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{isEditing ? "Editar Turma" : "Nova Turma"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Curso Responsável</Label>
              <Select value={formData.courseId} onValueChange={(v) => setFormData({...formData, courseId: v})}>
                <SelectTrigger><SelectValue placeholder="Selecione o curso" /></SelectTrigger>
                <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código da Turma</Label>
                <Input value={formData.codigo} onChange={(e) => setFormData({...formData, codigo: e.target.value})} placeholder="TADS2024" />
              </div>
              <div className="space-y-2">
                <Label>Semestre</Label>
                <Input value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} placeholder="2024.1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Turno</Label>
              <Select value={formData.shift} onValueChange={(v: Turno) => setFormData({...formData, shift: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANHA">Manhã</SelectItem>
                  <SelectItem value="TARDE">Tarde</SelectItem>
                  <SelectItem value="NOITE">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="w-full">{isEditing ? "Salvar Alterações" : "Criar Turma"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoordinatorClasses;