import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Users2, BookOpen, Loader2, UserPlus, UserMinus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { turmaService, TurmaResponse, Turno } from "@/services/coordenador/TurmaService";
import { cursoService, CursoResponse } from "@/services/coordenador/CursoService";
import { turmaAlunoService, AlunoTurmaResponse } from "@/services/coordenador/TurmaAlunoService";
import { api } from "@/lib/api";

const CoordinatorClasses = () => {
  const { toast } = useToast();

  const [classes, setClasses] = useState<TurmaResponse[]>([]);
  const [courses, setCourses] = useState<CursoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alunosDialogOpen, setAlunosDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClass, setSelectedClass] = useState<TurmaResponse | null>(null);
  const [formData, setFormData] = useState({
    codigo: "", semester: "", shift: "MANHA" as Turno, courseId: "",
  });

  // Estados do modal de alunos
  const [alunosDaTurma, setAlunosDaTurma] = useState<AlunoTurmaResponse[]>([]);
  const [todosAlunos, setTodosAlunos] = useState<AlunoTurmaResponse[]>([]);
  const [searchAluno, setSearchAluno] = useState("");
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [alunoParaVincular, setAlunoParaVincular] = useState("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [turmasData, cursosData] = await Promise.all([
        turmaService.getAll(),
        cursoService.getAll(),
      ]);
      setClasses(turmasData);
      setCourses(cursosData);
    } catch {
      toast({ title: "Erro", description: "Falha ao sincronizar com o servidor.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleSave = async () => {
    try {
      const payload = {
        codigo: formData.codigo,
        semestre: formData.semester,
        turno: formData.shift,
        cursoId: Number(formData.courseId),
      };
      if (isEditing && selectedClass) {
        await turmaService.update(selectedClass.id, payload);
        toast({ title: "Sucesso", description: "Turma atualizada!" });
      } else {
        await turmaService.create(payload);
        toast({ title: "Sucesso", description: "Nova turma cadastrada!" });
      }
      setDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.response?.data?.message || "Verifique os dados.", variant: "destructive" });
    }
  };

  const confirmDelete = async () => {
    if (!selectedClass) return;
    try {
      await turmaService.delete(selectedClass.id);
      toast({ title: "Removida", description: "Turma excluída com sucesso." });
      setDeleteDialogOpen(false);
      loadData();
    } catch {
      toast({ title: "Erro", description: "Não foi possível excluir a turma.", variant: "destructive" });
    }
  };

  // ── Gerenciamento de alunos ──────────────────────────────────────────────────

  const abrirModalAlunos = async (turma: TurmaResponse) => {
    setSelectedClass(turma);
    setAlunosDialogOpen(true);
    setLoadingAlunos(true);
    setSearchAluno("");
    setAlunoParaVincular("");

    try {
      const [vinculados, todos] = await Promise.all([
        turmaAlunoService.listarAlunos(turma.id),
        api.get("/alunos").then(r => r.data),
      ]);
      setAlunosDaTurma(vinculados);
      setTodosAlunos(todos);
    } catch {
      toast({ title: "Erro", description: "Falha ao carregar alunos.", variant: "destructive" });
    } finally {
      setLoadingAlunos(false);
    }
  };

  const handleVincular = async () => {
    if (!selectedClass || !alunoParaVincular) return;
    try {
      await turmaAlunoService.vincular(selectedClass.id, Number(alunoParaVincular));
      toast({ title: "Sucesso", description: "Aluno vinculado à turma." });
      const atualizados = await turmaAlunoService.listarAlunos(selectedClass.id);
      setAlunosDaTurma(atualizados);
      setAlunoParaVincular("");
    } catch (error: any) {
      toast({
        title: "Erro ao vincular",
        description: error.response?.data?.erro || "Verifique se o aluno está matriculado neste curso.",
        variant: "destructive",
      });
    }
  };

  const handleDesvincular = async (alunoId: number) => {
    if (!selectedClass) return;
    try {
      await turmaAlunoService.desvincular(selectedClass.id, alunoId);
      toast({ title: "Removido", description: "Aluno removido da turma." });
      setAlunosDaTurma(prev => prev.filter(a => a.usuarioId !== alunoId));
    } catch {
      toast({ title: "Erro", description: "Não foi possível remover o aluno.", variant: "destructive" });
    }
  };

  // Alunos disponíveis para vincular (não vinculados ainda)
  const alunosDisponiveis = todosAlunos.filter(
    a => !alunosDaTurma.some(v => v.usuarioId === a.usuarioId)
  );

  const filteredClasses = classes.filter((item) => {
    const matchesSearch = !search || item.codigo.toLowerCase().includes(search.toLowerCase()) || item.curso.nome.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = courseFilter === "todos" || item.curso.id.toString() === courseFilter;
    return matchesSearch && matchesCourse;
  });

  const alunosFiltrados = alunosDaTurma.filter(a =>
    !searchAluno || a.nome?.toLowerCase().includes(searchAluno.toLowerCase()) || a.matricula?.toLowerCase().includes(searchAluno.toLowerCase())
  );

  const openEditDialog = (item: TurmaResponse) => {
    setIsEditing(true);
    setSelectedClass(item);
    setFormData({ codigo: item.codigo, semester: item.semestre, shift: item.turno, courseId: item.curso.id.toString() });
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
                    <Button variant="ghost" size="icon" title="Gerenciar alunos" onClick={() => abrirModalAlunos(item)}>
                      <Users className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => { setSelectedClass(item); setDeleteDialogOpen(true); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal Cadastro/Edição de Turma */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>{isEditing ? "Editar Turma" : "Nova Turma"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Curso Responsável</Label>
              <Select value={formData.courseId} onValueChange={(v) => setFormData({ ...formData, courseId: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o curso" /></SelectTrigger>
                <SelectContent>{courses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código da Turma</Label>
                <Input value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} placeholder="TADS2024" />
              </div>
              <div className="space-y-2">
                <Label>Semestre</Label>
                <Input value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} placeholder="2024.1" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Turno</Label>
              <Select value={formData.shift} onValueChange={(v: Turno) => setFormData({ ...formData, shift: v })}>
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

      {/* Modal Gerenciar Alunos da Turma */}
      <Dialog open={alunosDialogOpen} onOpenChange={setAlunosDialogOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Alunos da Turma — {selectedClass?.codigo}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Curso: <strong>{selectedClass?.curso.nome}</strong> · Apenas alunos matriculados neste curso podem ser vinculados.
            </p>
          </DialogHeader>

          {loadingAlunos ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6" /></div>
          ) : (
            <div className="space-y-5 py-2">

              {/* Adicionar aluno */}
              <div className="space-y-2">
                <Label>Vincular novo aluno</Label>
                <div className="flex gap-2">
                  <Select value={alunoParaVincular} onValueChange={setAlunoParaVincular}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Selecione um aluno..." />
                    </SelectTrigger>
                    <SelectContent>
                      {alunosDisponiveis.length === 0 ? (
                        <SelectItem value="none" disabled>Nenhum aluno disponível</SelectItem>
                      ) : (
                        alunosDisponiveis.map(a => (
                          <SelectItem key={a.usuarioId} value={a.usuarioId.toString()}>
                            {a.nome} — {a.matricula}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleVincular} disabled={!alunoParaVincular || alunoParaVincular === "none"}>
                    <UserPlus className="h-4 w-4 mr-1" /> Vincular
                  </Button>
                </div>
              </div>

              {/* Lista de alunos vinculados */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Alunos vinculados ({alunosDaTurma.length})</Label>
                  <div className="relative w-48">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="Buscar..."
                      value={searchAluno}
                      onChange={e => setSearchAluno(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>

                {alunosFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg">
                    Nenhum aluno vinculado a esta turma.
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Matrícula</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {alunosFiltrados.map(aluno => (
                          <TableRow key={aluno.usuarioId}>
                            <TableCell className="font-medium">{aluno.nome}</TableCell>
                            <TableCell>{aluno.matricula}</TableCell>
                            <TableCell className="text-muted-foreground text-sm">{aluno.email}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700"
                                title="Remover da turma"
                                onClick={() => handleDesvincular(aluno.usuarioId)}
                              >
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Confirmar exclusão</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja excluir a turma <strong>{selectedClass?.codigo}</strong>? Esta ação não pode ser desfeita.
          </p>
          <DialogFooter className="gap-2 mt-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={confirmDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoordinatorClasses;