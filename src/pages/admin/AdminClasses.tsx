import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { classService, TurmaResponse } from "@/services/admin/classService";
import { courseService, CourseResponse } from "@/services/admin/courseService";

const AdminClasses = () => {
  // Inicializamos sempre como array vazio para evitar erros de renderização
  const [classes, setClasses] = useState<TurmaResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<TurmaResponse | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    code: "",
    courseId: "",
    semester: "",
    shift: "MANHA" as "MANHA" | "TARDE" | "NOITE",
  });

  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, coursesData] = await Promise.all([
        classService.getAll(),
        courseService.getAll()
      ]);

      // AJUSTE DE SEGURANÇA: Só atualiza o estado se o retorno for um Array
      setClasses(Array.isArray(classesData) ? classesData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast({ 
        title: "Erro de Conexão", 
        description: "Não foi possível carregar as turmas. Verifique se o Back-end está rodando.", 
        variant: "destructive" 
      });
      setClasses([]); // Garante que continue sendo um array em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.code || !formData.courseId || !formData.semester) {
      toast({ title: "Atenção", description: "Preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }

    const payload = {
      codigo: formData.code,
      cursoId: Number(formData.courseId),
      turno: formData.shift,
      semestre: formData.semester,
    };

    try {
      if (isEditing) {
        await classService.update(Number(formData.id), payload);
        toast({ title: "Sucesso", description: "Turma atualizada com sucesso!" });
      } else {
        await classService.create(payload);
        toast({ title: "Sucesso", description: "Turma criada com sucesso!" });
      }
      loadData();
      setDialogOpen(false);
    } catch (error: any) {
      const errorMsg = error.response?.data?.erro || "Erro ao salvar a turma.";
      toast({ title: "Erro", description: errorMsg, variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (classToDelete) {
      try {
        await classService.delete(classToDelete.id);
        toast({ title: "Excluído", description: "Turma removida com sucesso." });
        loadData();
        setDeleteDialogOpen(false);
      } catch (error) {
        toast({ title: "Erro ao excluir", variant: "destructive" });
      }
    }
  };

  // AJUSTE DE SEGURANÇA: Verifica se classes é um array antes de filtrar
  const filtered = Array.isArray(classes) 
    ? classes.filter(c => 
        c.codigo?.toLowerCase().includes(search.toLowerCase()) || 
        c.curso?.nome?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Turmas</h1>
          <p className="text-slate-500">Administre as turmas vinculadas aos cursos</p>
        </div>
        <Button className="gradient-primary" onClick={() => { 
          setIsEditing(false); 
          setFormData({ id: "", code: "", courseId: "", semester: "", shift: "MANHA" });
          setDialogOpen(true); 
        }}>
          <Plus className="mr-2 h-4 w-4" /> Nova Turma
        </Button>
      </div>

      <Card className="glass-card border-0 shadow-sm">
        <CardHeader>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por código ou curso..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Semestre</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length > 0 ? (
                  filtered.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="font-bold">{t.codigo}</TableCell>
                      <TableCell>{t.curso?.nome || "Sem curso"}</TableCell>
                      <TableCell>{t.semestre}</TableCell>
                      <TableCell className="capitalize">{t.turno?.toLowerCase()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => {
                          setIsEditing(true);
                          setFormData({ 
                            id: t.id.toString(), 
                            code: t.codigo, 
                            courseId: t.curso?.id?.toString() || "", 
                            semester: t.semestre, 
                            shift: t.turno as any 
                          });
                          setDialogOpen(true);
                        }}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { setClassToDelete(t); setDeleteDialogOpen(true); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      Nenhuma turma encontrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Cadastro */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{isEditing ? "Editar" : "Nova"} Turma</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Código da Turma</Label>
              <Input placeholder="Ex: TADS045" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Curso Vinculado</Label>
              <Select value={formData.courseId} onValueChange={(v) => setFormData({...formData, courseId: v})}>
                <SelectTrigger><SelectValue placeholder="Selecione o curso" /></SelectTrigger>
                <SelectContent>
                  {courses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Semestre</Label>
                <Input placeholder="Ex: 2026.1" value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Turno</Label>
                <Select value={formData.shift} onValueChange={(v: any) => setFormData({...formData, shift: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MANHA">Manhã</SelectItem>
                    <SelectItem value="TARDE">Tarde</SelectItem>
                    <SelectItem value="NOITE">Noite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter><Button className="w-full gradient-primary text-white" onClick={handleSave}>Salvar Turma</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-red-600">Excluir Turma</DialogTitle></DialogHeader>
          <div className="py-4">Tem certeza que deseja excluir a turma <strong>{classToDelete?.codigo}</strong>?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-red-600 text-white" onClick={confirmDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClasses;