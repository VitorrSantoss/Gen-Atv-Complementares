import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Pencil, Trash2, UploadCloud, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { courseService, CourseResponse } from "@/services/admin/courseService";

const availableCoordinators = [
  "Prof. Maria Silva",
  "Prof. João Lima",
  "Prof. Ana Costa",
  "Prof. Carlos Souza",
];

const AdminCourses = () => {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCoordinators, setSelectedCoordinators] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<CourseResponse | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    code: "",
    hours: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Carrega os dados do Back-end ao iniciar
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await courseService.getAll();
      setCourses(data);
    } catch (error) {
      toast({
        title: "Erro de conexão",
        description: "Não foi possível carregar a lista de cursos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter((c) => {
    if (!search) return true;
    const normalizedSearch = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedName = c.nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalizedName.includes(normalizedSearch) || c.codCurso.toLowerCase().includes(search.toLowerCase());
  });

  const toggleCoordinator = (coord: string) => {
    setSelectedCoordinators((prev) =>
      prev.includes(coord) ? prev.filter((c) => c !== coord) : [...prev, coord]
    );
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedCoordinators([]);
      setFormData({ id: "", name: "", code: "", hours: "" });
      setIsEditing(false);
    }
  };

  const handleOpenEdit = (course: CourseResponse) => {
    setIsEditing(true);
    setFormData({
      id: course.id.toString(),
      name: course.nome,
      code: course.codCurso,
      hours: course.cargaHorariaMinima.toString(),
    });
    // Nota: A lógica de coordenadores precisará ser integrada com o modelo de CoordenadorCurso no futuro
    setSelectedCoordinators([]); 
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.code || !formData.hours) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos do curso.", variant: "destructive" });
      return;
    }

    const payload = {
      nome: formData.name,
      codCurso: formData.code,
      statusCurso: true,
      cargaHorariaMinima: parseInt(formData.hours),
    };

    try {
      if (isEditing) {
        await courseService.update(Number(formData.id), payload);
        toast({ title: "Sucesso", description: "Curso atualizado com sucesso!" });
      } else {
        await courseService.create(payload);
        toast({ title: "Sucesso", description: "Curso cadastrado com sucesso!" });
      }
      fetchCourses();
      setDialogOpen(false);
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Verifique os dados e tente novamente.", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (courseToDelete) {
      try {
        await courseService.delete(courseToDelete.id);
        toast({ title: "Excluído", description: "Curso removido com sucesso." });
        fetchCourses();
        setDeleteDialogOpen(false);
      } catch (error) {
        toast({ title: "Erro ao excluir", description: "Não foi possível remover o curso.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Cursos</h1>
          <p className="text-lg text-slate-500 mt-1">Cadastre os cursos da instituição</p>
        </div>

        <div className="flex gap-3">
          <input type="file" accept=".txt" ref={fileInputRef} className="hidden" />
          <Button variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100">
            <UploadCloud className="h-4 w-4 mr-2" /> Importar (.txt)
          </Button>
          <Button className="gradient-primary text-primary-foreground" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Novo Curso
          </Button>
        </div>
      </div>

      <Card className="glass-card border-0 shadow-sm rounded-2xl">
        <CardHeader className="border-b border-slate-50/50 p-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar curso..."
              className="pl-9 bg-background/50 focus:bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome do Curso</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Carga Horária</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-bold text-slate-700">{course.nome}</TableCell>
                    <TableCell>{course.codCurso}</TableCell>
                    <TableCell>{course.cargaHorariaMinima}h</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(course)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="text-red-500 hover:text-red-600"
                        onClick={() => { setCourseToDelete(course); setDeleteDialogOpen(true); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Cadastro/Edição */}
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{isEditing ? "Editar Curso" : "Cadastrar Curso"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Curso</Label>
              <Input id="nome" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input id="codigo" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horas">Carga Horária (h)</Label>
                <Input id="horas" type="number" value={formData.hours} onChange={(e) => setFormData({ ...formData, hours: e.target.value })} />
              </div>
            </div>
          </div>
          <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSave}>Salvar Cadastro</Button>
        </DialogContent>
      </Dialog>

      {/* Dialog de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle className="text-red-600">Excluir Curso</DialogTitle></DialogHeader>
          <div className="py-4 text-slate-600">Confirma a exclusão do curso <strong>{courseToDelete?.nome}</strong>?</div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-red-600 text-white" onClick={confirmDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourses;