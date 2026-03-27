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
  name: string;
  code: string;
  semester: string;
  shift: string;
  vacancies: number;
  students: number;
  status: "ativa" | "encerrada";
  courseId: string;
  courseName: string;
}

const allCourses: Course[] = [
  { id: "1", name: "Engenharia de Software", code: "ES" },
  { id: "2", name: "Administração", code: "ADM" },
  { id: "3", name: "Direito", code: "DIR" },
  { id: "4", name: "Medicina", code: "MED" },
];

const initialClasses: ClassGroup[] = [
  {
    id: "1",
    name: "Turma A - 2026.1",
    code: "ES-A26",
    semester: "2026.1",
    shift: "Noite",
    vacancies: 40,
    students: 34,
    status: "ativa",
    courseId: "1",
    courseName: "Engenharia de Software",
  },
  {
    id: "2",
    name: "Turma B - 2026.1",
    code: "ES-B26",
    semester: "2026.1",
    shift: "Manhã",
    vacancies: 35,
    students: 29,
    status: "ativa",
    courseId: "1",
    courseName: "Engenharia de Software",
  },
  {
    id: "3",
    name: "Turma Única - 2026.1",
    code: "ADM-U26",
    semester: "2026.1",
    shift: "Noite",
    vacancies: 45,
    students: 40,
    status: "ativa",
    courseId: "2",
    courseName: "Administração",
  },
  {
    id: "4",
    name: "Turma 2025.2",
    code: "DIR-25B",
    semester: "2025.2",
    shift: "Tarde",
    vacancies: 50,
    students: 50,
    status: "encerrada",
    courseId: "3",
    courseName: "Direito",
  },
];

const emptyForm = {
  id: "",
  name: "",
  code: "",
  semester: "",
  shift: "",
  vacancies: "",
  students: "",
  status: "ativa" as "ativa" | "encerrada",
  courseId: "",
};

const CoordinatorClasses = () => {
  const { user } = useAuth();
  const coordinator = user as CoordinatorUser | null;

  const myCourseIds = coordinator?.coordinatedCourses ?? ["1", "2"];

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

    const normalizedName = item.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const normalizedCode = item.code.toLowerCase();

    const matchesSearch =
      !search ||
      normalizedName.includes(normalizedSearch) ||
      normalizedCode.includes(search.toLowerCase());

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
      name: item.name,
      code: item.code,
      semester: item.semester,
      shift: item.shift,
      vacancies: String(item.vacancies),
      students: String(item.students),
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
      name: formData.name,
      code: formData.code,
      semester: formData.semester,
      shift: formData.shift,
      vacancies: Number(formData.vacancies) || 0,
      students: Number(formData.students) || 0,
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Minhas Turmas</h1>
        <p className="text-muted-foreground">
          Gerencie apenas as turmas dos cursos sob sua coordenação
        </p>
      </div>

      <Card className="rounded-2xl shadow-sm border-0">
        <CardContent className="space-y-4 pt-6">
          <div className="flex justify-end">
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Turma
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
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

            <Card className="rounded-2xl">
              <CardContent className="flex items-center gap-3 p-4">
                <Users2 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">
                    Alunos nas turmas
                  </p>
                  <p className="text-2xl font-bold">
                    {allowedClasses.reduce((acc, item) => acc + item.students, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou código da turma"
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

          <div className="rounded-2xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turma</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Semestre</TableHead>
                  <TableHead>Turno</TableHead>
                  <TableHead>Alunos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredClasses.length > 0 ? (
                  filteredClasses.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Código: {item.code}
                        </div>
                      </TableCell>
                      <TableCell>{item.courseName}</TableCell>
                      <TableCell>{item.semester}</TableCell>
                      <TableCell>{item.shift}</TableCell>
                      <TableCell>
                        {item.students}/{item.vacancies}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            item.status === "ativa"
                              ? "bg-emerald-500 text-white"
                              : "bg-slate-500 text-white"
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
                      colSpan={7}
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

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-[620px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Turma" : "Cadastrar Turma"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Nome da Turma</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ex: Turma A - 2026.1"
              />
            </div>

            <div className="space-y-2">
              <Label>Código</Label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, code: e.target.value }))
                }
                placeholder="Ex: ES-A26"
              />
            </div>

            <div className="space-y-2">
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
              <Label>Vagas</Label>
              <Input
                type="number"
                value={formData.vacancies}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, vacancies: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Quantidade de Alunos</Label>
              <Input
                type="number"
                value={formData.students}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, students: e.target.value }))
                }
              />
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
            <Button onClick={handleSave}>
              {isEditing ? "Salvar Alterações" : "Cadastrar Turma"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Turma</DialogTitle>
          </DialogHeader>

          <p>
            Tem certeza que deseja remover a turma{" "}
            <strong>{selectedClass?.name}</strong>?
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