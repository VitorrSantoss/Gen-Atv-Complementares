import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  Filter,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Student {
  id: string;
  name: string;
  cpf: string;
  turma: string;
  curso: string;
  horasAprovadas: number;
  meta: number;
}

const COURSES = ["Moda", "Gastronomia", "ADS", "Jogos", "Administração"];

const initialStudents: Student[] = [
  {
    id: "1",
    name: "João Santos",
    cpf: "111.222.333-44",
    turma: "T1",
    curso: "ADS",
    horasAprovadas: 120,
    meta: 200,
  },
  {
    id: "2",
    name: "Ana Oliveira",
    cpf: "555.666.777-88",
    turma: "T2",
    curso: "Moda",
    horasAprovadas: 180,
    meta: 200,
  },
  {
    id: "3",
    name: "Carlos Lima",
    cpf: "999.000.111-22",
    turma: "T1",
    curso: "ADS",
    horasAprovadas: 50,
    meta: 200,
  },
  {
    id: "4",
    name: "Maria Fernandes",
    cpf: "333.444.555-66",
    turma: "T3",
    curso: "Jogos",
    horasAprovadas: 200,
    meta: 200,
  },
  {
    id: "5",
    name: "Ricardo Souza",
    cpf: "222.333.444-55",
    turma: "T2",
    curso: "Gastronomia",
    horasAprovadas: 90,
    meta: 200,
  },
];

const CoordinatorStudents = () => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const [newStudent, setNewStudent] = useState({
    name: "",
    cpf: "",
    turma: "",
    curso: "ADS",
  });

  const handleAddStudent = () => {
    const studentToAdd: Student = {
      ...newStudent,
      id: Math.random().toString(36).substring(2, 9),
      horasAprovadas: 0,
      meta: 200,
    };
    setStudents([studentToAdd, ...students]);
    setNewStudent({ name: "", cpf: "", turma: "", curso: "ADS" });
    setDialogOpen(false);
  };

  const handleEditStudent = () => {
    if (!selectedStudent) return;
    setStudents(
      students.map((s) => (s.id === selectedStudent.id ? selectedStudent : s)),
    );
    setEditDialogOpen(false);
    setSelectedStudent(null);
  };

  const confirmDelete = () => {
    if (selectedStudent) {
      setStudents(students.filter((s) => s.id !== selectedStudent.id));
      setDeleteDialogOpen(false);
      setSelectedStudent(null);
    }
  };

  // Lógica de Filtro Combinado (Busca + Curso)
  const filtered = students.filter((s) => {
    const term = search
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const matchesSearch =
      s.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .includes(term) ||
      s.cpf.replace(/\D/g, "").includes(search.replace(/\D/g, ""));
    const matchesCourse = courseFilter === "todos" || s.curso === courseFilter;

    return matchesSearch && matchesCourse;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentStudents = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="overflow-hidden flex flex-col p-8 space-y-6 bg-slate-50">
      <div className="flex justify-between items-start flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Gestão de Alunos
          </h1>
          <p className="text-lg text-slate-500">
            Cadastre e acompanhe os alunos do curso
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">
              <Plus className="h-4 w-4 mr-2" /> Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Aluno</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome Completo</Label>
                <Input
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({ ...newStudent, name: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>CPF</Label>
                  <Input
                    value={newStudent.cpf}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, cpf: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Turma</Label>
                  <Input
                    value={newStudent.turma}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, turma: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Curso</Label>
                <Select
                  value={newStudent.curso}
                  onValueChange={(v) =>
                    setNewStudent({ ...newStudent, curso: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-blue-600 w-full" onClick={handleAddStudent}>
                Salvar Aluno
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col w-full h-[520px]">
        <CardHeader className="p-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex gap-4 max-w-4xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                className="pl-10 bg-slate-50 border-slate-200"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={courseFilter}
              onValueChange={(v) => {
                setCourseFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px] bg-slate-50">
                <Filter className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Cursos</SelectItem>
                {COURSES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="text-slate-500 font-medium">
                  Nome
                </TableHead>
                <TableHead className="text-slate-500 font-medium">
                  Curso/Turma
                </TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentStudents.map((s) => {
                const pct = Math.round((s.horasAprovadas / s.meta) * 100);
                return (
                  <TableRow
                    key={s.id}
                    className="border-b border-slate-100 last:border-0 h-20"
                  >
                    <TableCell className="font-medium text-slate-700">
                      {s.name}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-600">
                          {s.curso}
                        </span>
                        <span className="text-xs text-slate-400">
                          {s.turma}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        className={`rounded-full px-4 py-0.5 font-bold text-[10px] uppercase ${pct >= 100 ? "bg-emerald-500" : "bg-blue-600"} text-white`}
                      >
                        {pct >= 100 ? "Completo" : `${pct}%`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-blue-600"
                          onClick={() => {
                            setSelectedStudent(s);
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:text-red-600"
                          onClick={() => {
                            setSelectedStudent(s);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/30">
          <p className="text-sm text-slate-500 font-medium">
            Página {currentPage} de {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Informações</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome</Label>
                <Input
                  value={selectedStudent.name}
                  onChange={(e) =>
                    setSelectedStudent({
                      ...selectedStudent,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Curso</Label>
                  <Select
                    value={selectedStudent.curso}
                    onValueChange={(v) =>
                      setSelectedStudent({ ...selectedStudent, curso: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COURSES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Turma</Label>
                  <Input
                    value={selectedStudent.turma}
                    onChange={(e) =>
                      setSelectedStudent({
                        ...selectedStudent,
                        turma: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button
                className="bg-blue-600 w-full"
                onClick={handleEditStudent}
              >
                Salvar Alterações
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Excluir Aluno</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600">
            Tem certeza que deseja remover{" "}
            <strong>{selectedStudent?.name}</strong>?
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button className="bg-red-600 text-white" onClick={confirmDelete}>
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoordinatorStudents;
