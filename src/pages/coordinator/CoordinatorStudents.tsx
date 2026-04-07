import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Filter,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { alunoService, AlunoResponse } from "@/services/coordenador/AlunoService";
import { courseService, CourseResponse } from "@/services/admin/courseService";

const CoordinatorStudents = () => {
  // Ajustado: Usando diretamente AlunoResponse
  const [alunos, setAlunos] = useState<AlunoResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filtros e paginação
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Controle dos modais
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // Ajustado: Usando diretamente AlunoResponse
  const [selectedAluno, setSelectedAluno] = useState<AlunoResponse | null>(null);

  // Form de criação
  const [newForm, setNewForm] = useState({
    email: "",
    matricula: "",
    cursoId: "",
  });

  // Form de edição
  const [editForm, setEditForm] = useState({
    email: "",
    matricula: "",
    cursoId: "",
  });

  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [alunosData, cursosData] = await Promise.all([
        alunoService.getAll(),
        courseService.getAll(),
      ]);
      setAlunos(alunosData);
      setCourses(cursosData);
    } catch (error) {
      toast({
        title: "Erro ao carregar",
        description: "Verifique se o back-end está rodando.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, courseFilter]);

  const filtered = useMemo(() => {
    return alunos.filter((a) => {
      const matchesCourse =
        courseFilter === "todos" ||
        String(a.cursoId) === courseFilter;

      const term = search.toLowerCase();
      const matchesSearch =
        !search ||
        (a.email?.toLowerCase().includes(term) ?? false) ||
        (a.matricula?.toLowerCase().includes(term) ?? false);

      return matchesCourse && matchesSearch;
    });
  }, [alunos, search, courseFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentAlunos = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCourseNameById = (id: number | null) => {
    if (!id) return "—";
    return courses.find((c) => c.id === id)?.nome ?? `Curso #${id}`;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.email || !newForm.matricula || !newForm.cursoId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha e-mail, matrícula e curso.",
        variant: "destructive",
      });
      return;
    }
    try {
      await alunoService.create({
        email: newForm.email,
        matricula: newForm.matricula,
        cursoId: Number(newForm.cursoId),
      });
      toast({ title: "Aluno cadastrado com sucesso!" });
      setDialogOpen(false);
      setNewForm({ email: "", matricula: "", cursoId: "" });
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description:
          error?.response?.data?.message ?? "Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAluno) return;
    try {
      await alunoService.update(selectedAluno.usuarioId, {
        email: editForm.email,
        matricula: editForm.matricula,
        cursoId: Number(editForm.cursoId),
      });
      toast({ title: "Aluno atualizado com sucesso!" });
      setEditDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar",
        description: error?.response?.data?.message ?? "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedAluno) return;
    try {
      await alunoService.delete(selectedAluno.usuarioId);
      toast({ title: "Aluno removido com sucesso." });
      setDeleteDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({
        title: "Erro ao remover",
        description: error?.response?.data?.message ?? "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Ajustado: Tipagem para AlunoResponse
  const openEdit = (aluno: AlunoResponse) => {
    setSelectedAluno(aluno);
    setEditForm({
      email: aluno.email ?? "",
      matricula: aluno.matricula ?? "",
      cursoId: aluno.cursoId ? String(aluno.cursoId) : "",
    });
    setEditDialogOpen(true);
  };

  // Ajustado: Tipagem para AlunoResponse
  const openDelete = (aluno: AlunoResponse) => {
    setSelectedAluno(aluno);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Alunos</h1>
          <p className="text-lg text-slate-500">
            Cadastre e acompanhe os alunos vinculados ao curso
          </p>
        </div>

        {/* Modal de Criação */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">
              <Plus className="h-4 w-4 mr-2" /> Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Aluno</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>E-mail do usuário *</Label>
                <Input
                  type="email"
                  placeholder="aluno@email.com"
                  value={newForm.email}
                  onChange={(e) =>
                    setNewForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground">
                  O usuário precisa estar cadastrado no sistema com perfil ALUNO.
                </p>
              </div>
              <div className="space-y-2">
                <Label>Matrícula *</Label>
                <Input
                  placeholder="Ex: 20240001"
                  value={newForm.matricula}
                  onChange={(e) =>
                    setNewForm((p) => ({ ...p, matricula: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Curso *</Label>
                <Select
                  value={newForm.cursoId}
                  onValueChange={(v) =>
                    setNewForm((p) => ({ ...p, cursoId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-blue-600 text-white mt-2">
                Salvar Aluno
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Painel Principal */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        {/* Filtros */}
        <CardHeader className="p-4 border-b border-slate-100">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="relative w-full md:w-[320px] shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por e-mail ou matrícula..."
                className="pl-10 bg-slate-50 border-slate-200 w-full"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Select
                value={courseFilter}
                onValueChange={(v) => {
                  setCourseFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[220px] bg-slate-50">
                  <Filter className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                  <SelectValue placeholder="Curso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Cursos</SelectItem>
                  {courses.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* Tabela */}
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="text-slate-500 font-medium">Matrícula</TableHead>
                  <TableHead className="text-slate-500 font-medium">E-mail</TableHead>
                  <TableHead className="text-slate-500 font-medium">Curso</TableHead>
                  <TableHead className="text-center text-slate-500 font-medium">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentAlunos.map((a) => (
                  <TableRow
                    key={a.usuarioId}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <TableCell className="font-semibold text-slate-700">
                      {a.matricula}
                    </TableCell>
                    <TableCell className="text-slate-500">{a.email}</TableCell>
                    <TableCell>{getCourseNameById(a.cursoId)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => openEdit(a)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600"
                          onClick={() => openDelete(a)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {currentAlunos.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-slate-500"
                    >
                      Nenhum aluno encontrado com os filtros atuais.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {/* Paginação */}
        <CardFooter className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/30">
          <p className="text-sm text-slate-500 font-medium">
            Página {currentPage} de {totalPages} — {filtered.length} alunos
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-slate-200"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Editar Aluno</DialogTitle>
          </DialogHeader>
          {selectedAluno && (
            <form onSubmit={handleEdit} className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Matrícula</Label>
                <Input
                  value={editForm.matricula}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, matricula: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Curso</Label>
                <Select
                  value={editForm.cursoId}
                  onValueChange={(v) =>
                    setEditForm((p) => ({ ...p, cursoId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o curso" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full bg-blue-600 text-white mt-2">
                Salvar Alterações
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Remover Aluno</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600">
            Tem certeza que deseja remover o aluno com matrícula{" "}
            <strong>{selectedAluno?.matricula}</strong>?
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDelete}
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoordinatorStudents;