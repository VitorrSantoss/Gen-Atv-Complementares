import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Users2, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type CoordinatorUser = {
  id: string;
  name: string;
  email: string;
  role: "coordenador";
  coordinatedCourses?: string[];
};

interface Course {
  id: string;
  name: string;
  code: string;
}

interface ClassGroup {
  id: string;
  code: string;
  semester: string;
  shift: string;
  status: "ativa" | "encerrada";
  courseId: string;
  courseName: string;
}

const allCourses: Course[] = [
  { id: "1", name: "Engenharia de Software", code: "ES" },
  { id: "2", name: "Administração", code: "ADM" },
  { id: "3", name: "Direito", code: "DIR" },
  { id: "4", name: "Medicina", code: "MED" },
  { id: "5", name: "Análise e Desenv. de Sistemas", code: "ADS" },
];

const initialClasses: ClassGroup[] = [
  {
    id: "1",
    code: "ES-A26",
    semester: "2026.1",
    shift: "Noite",
    status: "ativa",
    courseId: "1",
    courseName: "Engenharia de Software",
  },
  {
    id: "2",
    code: "TADS044",
    semester: "2026.1",
    shift: "Manhã",
    status: "ativa",
    courseId: "5",
    courseName: "Análise e Desenv. de Sistemas",
  },
  {
    id: "3",
    code: "ADM-U26",
    semester: "2026.1",
    shift: "Noite",
    status: "ativa",
    courseId: "2",
    courseName: "Administração",
  },
  {
    id: "4",
    code: "DIR-25B",
    semester: "2025.2",
    shift: "Tarde",
    status: "encerrada",
    courseId: "3",
    courseName: "Direito",
  },
];

const emptyForm = {
  id: "",
  code: "",
  semester: "",
  shift: "",
  status: "ativa" as "ativa" | "encerrada",
  courseId: "",
};

const CoordinatorClasses = () => {
  const { user } = useAuth();
  const coordinator = user as CoordinatorUser | null;

  const myCourseIds = coordinator?.coordinatedCourses ?? ["1", "2", "3", "4", "5"];

  const myCourses = useMemo(
    () => allCourses.filter((course) => myCourseIds.includes(course.id)),
    [myCourseIds]
  );

  const [classes, setClasses] = useState<ClassGroup[]>(initialClasses);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("todos");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [selectedClass, setSelectedClass] = useState<ClassGroup | null>(null);
  const [formData, setFormData] = useState({
    ...emptyForm,
    courseId: myCourses[0]?.id ?? "",
  });

  const allowedClasses = classes.filter((item) =>
    myCourseIds.includes(item.courseId)
  );

  const filteredClasses = allowedClasses.filter((item) => {
    const normalizedSearch = search
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const normalizedCode = item.code
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const normalizedCourse = item.courseName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const matchesSearch =
      !search ||
      normalizedCode.includes(normalizedSearch) ||
      normalizedCourse.includes(normalizedSearch);

    const matchesCourse =
      courseFilter === "todos" || item.courseId === courseFilter;

    return matchesSearch && matchesCourse;
  });

  const resetForm = () => {
    setFormData({
      ...emptyForm,
      courseId: myCourses[0]?.id ?? "",
    });
    setIsEditing(false);
    setSelectedClass(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (item: ClassGroup) => {
    setIsEditing(true);
    setSelectedClass(item);
    setFormData({
      id: item.id,
      code: item.code,
      semester: item.semester,
      shift: item.shift,
      status: item.status,
      courseId: item.courseId,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    const selectedCourse = myCourses.find((c) => c.id === formData.courseId);
    if (!selectedCourse) return;

    const payload: ClassGroup = {
      id: formData.id || Math.random().toString(36).substring(2, 9),
      code: formData.code,
      semester: formData.semester,
      shift: formData.shift,
      status: formData.status,
      courseId: formData.courseId,
      courseName: selectedCourse.name,
    };

    if (isEditing) {
      setClasses((prev) =>
        prev.map((item) => (item.id === payload.id ? payload : item))
      );
    } else {
      setClasses((prev) => [payload, ...prev]);
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDeleteClick = (item: ClassGroup) => {
    setSelectedClass(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!selectedClass) return;
    setClasses((prev) => prev.filter((item) => item.id !== selectedClass.id));
    setDeleteDialogOpen(false);
    setSelectedClass(null);
  };

  return (
    // ✅ MODIFICAÇÃO: Aqui está o container atualizado para padronizar com o resto do painel
    <div className="p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Minhas Turmas</h1>
          <p className="text-muted-foreground">
            Gerencie apenas as turmas dos cursos sob sua coordenação
          </p>
        </div>

        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Turma
        </Button>
      </div>

      <Card className="rounded-2xl shadow-sm border-0">
        <CardContent className="space-y-4 pt-6">
          {/* Cards Superiores - Ajustados para grid-cols-2 */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl">
              <CardContent className="flex items-center gap-3 p-4">
                <BookOpen className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Cursos vinculados
                  </p>
                  <p className="text-2xl font-bold">{myCourses.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl">
              <CardContent className="flex items-center gap-3 p-4">
                <Users2 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Turmas cadastradas
                  </p>
                  <p className="text-2xl font-bold">{allowedClasses.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por turma ou curso..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os cursos</SelectItem>
                {myCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de Turmas */}
          <div className="rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turma</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Semestre</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium text-slate-800">
                        {item.code}
                      </TableCell>
                      <TableCell>{item.courseName}</TableCell>
                      <TableCell>{item.semester}</TableCell>
                      <TableCell>{item.shift}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            item.status === "ativa"
                              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                              : "bg-slate-500 hover:bg-slate-600 text-white"
                          }
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(item)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteClick(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhuma turma encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Cadastro/Edição */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Turma" : "Cadastrar Turma"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 py-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Curso</Label>
              <Select
                value={formData.courseId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, courseId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o curso" />
                </SelectTrigger>
                <SelectContent>
                  {myCourses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Turma</Label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value }))
                }
                placeholder="Ex: TADS044"
              />
            </div>

            <div className="space-y-2">
              <Label>Semestre</Label>
              <Input
                value={formData.semester}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, semester: e.target.value }))
                }
                placeholder="Ex: 2026.1"
              />
            </div>

            <div className="space-y-2">
              <Label>Turno</Label>
              <Select
                value={formData.shift}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, shift: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manhã">Manhã</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                  <SelectItem value="Noite">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "ativa" | "encerrada") =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativa">Ativa</SelectItem>
                  <SelectItem value="encerrada">Encerrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleSave} className="w-full sm:w-auto">
              {isEditing ? "Salvar Alterações" : "Cadastrar Turma"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Turma</DialogTitle>
          </DialogHeader>

          <p>
            Tem certeza que deseja remover a turma{" "}
            <strong>{selectedClass?.code}</strong>?
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoordinatorClasses;