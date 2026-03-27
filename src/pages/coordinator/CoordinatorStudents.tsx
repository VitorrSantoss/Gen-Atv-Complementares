import { useState, useMemo } from "react";
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

// --- TIPAGENS ---
interface Student {
  id: string;
  name: string;
  cpf: string;
  turma: string;
  curso: string;
  turno: string;
  statusAluno: string;
  horasAprovadas: number;
  meta: number;
}

// --- CONSTANTES ---
const COURSES = ["Moda", "Gastronomia", "ADS", "Jogos", "Administração"];
const TURMAS = ["T1", "T2", "T3", "T4", "T5"];
const STATUS_ALUNO = [
  "Matriculado",
  "Trancado",
  "Evadido",
  "Transferido",
  "Concluinte",
  "Inativo",
];

const statusColors: Record<string, string> = {
  Matriculado: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  Trancado: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  Evadido: "bg-red-100 text-red-700 hover:bg-red-200",
  Transferido: "bg-slate-200 text-slate-700 hover:bg-slate-300",
  Concluinte: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
  Inativo: "bg-gray-200 text-gray-600 hover:bg-gray-300",
};

const initialStudents: Student[] = [
  {
    id: "1",
    name: "João Santos",
    cpf: "111.222.333-44",
    turma: "T1",
    curso: "ADS",
    turno: "Manhã",
    statusAluno: "Matriculado",
    horasAprovadas: 120,
    meta: 200,
  },
  {
    id: "2",
    name: "Ana Oliveira",
    cpf: "555.666.777-88",
    turma: "T2",
    curso: "Moda",
    turno: "Tarde",
    statusAluno: "Matriculado",
    horasAprovadas: 180,
    meta: 200,
  },
  {
    id: "3",
    name: "Carlos Lima",
    cpf: "999.000.111-22",
    turma: "T1",
    curso: "ADS",
    turno: "Noite",
    statusAluno: "Trancado",
    horasAprovadas: 50,
    meta: 200,
  },
  {
    id: "4",
    name: "Maria Fernandes",
    cpf: "333.444.555-66",
    turma: "T3",
    curso: "Jogos",
    turno: "Manhã",
    statusAluno: "Concluinte",
    horasAprovadas: 200,
    meta: 200,
  },
  {
    id: "5",
    name: "Ricardo Souza",
    cpf: "222.333.444-55",
    turma: "T2",
    curso: "Gastronomia",
    turno: "Noite",
    statusAluno: "Transferido",
    horasAprovadas: 90,
    meta: 200,
  },
  {
    id: "6",
    name: "Beatriz Costa",
    cpf: "123.456.789-00",
    turma: "T1",
    curso: "ADS",
    turno: "Manhã",
    statusAluno: "Evadido",
    horasAprovadas: 10,
    meta: 200,
  },
];

const initialNewStudentState = {
  name: "",
  cpf: "",
  turma: "",
  curso: "",
  turno: "",
  statusAluno: "Matriculado",
};

// --- COMPONENTE COMPARTILHADO: FORMULÁRIO DE ALUNO ---
// Evita duplicação de código entre o modal de Criação e de Edição
const StudentFormFields = ({
  student,
  onChange,
}: {
  student: Partial<Student>;
  onChange: (field: string, value: string) => void;
}) => (
  <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pl-[5px] pr-2">
    <div className="grid gap-2">
      <Label>Nome Completo</Label>
      <Input
        value={student.name || ""}
        onChange={(e) => onChange("name", e.target.value)}
        required
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label>CPF</Label>
        <Input
          placeholder="000.000.000-00"
          value={student.cpf || ""}
          onChange={(e) => onChange("cpf", e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label>Turma</Label>
        <Select
          value={student.turma}
          onValueChange={(v) => onChange("turma", v)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {TURMAS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-2">
        <Label>Curso</Label>
        <Select
          value={student.curso}
          onValueChange={(v) => onChange("curso", v)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
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
        <Label>Turno</Label>
        <Select
          value={student.turno}
          onValueChange={(v) => onChange("turno", v)}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Manhã">Manhã</SelectItem>
            <SelectItem value="Tarde">Tarde</SelectItem>
            <SelectItem value="Noite">Noite</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="grid gap-2">
      <Label>Status da Matrícula</Label>
      <Select
        value={student.statusAluno}
        onValueChange={(v) => onChange("statusAluno", v)}
        required
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione o status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_ALUNO.map((status) => (
            <SelectItem key={status} value={status}>
              {status}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL ---
const CoordinatorStudents = () => {
  // Estados de Listagem
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Estados de Modais
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Estados de Formulário
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState(initialNewStudentState);

  // --- HANDLERS (AÇÕES) ---
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const studentToAdd: Student = {
      ...(newStudent as Student),
      id: Math.random().toString(36).substring(2, 9),
      horasAprovadas: 0,
      meta: 200,
    };
    setStudents([studentToAdd, ...students]);
    setNewStudent(initialNewStudentState);
    setDialogOpen(false);
  };

  const handleEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setStudents(
      students.map((s) => (s.id === selectedStudent.id ? selectedStudent : s)),
    );
    setEditDialogOpen(false);
    setSelectedStudent(null);
  };

  const confirmDelete = () => {
    if (selectedStudent) {
      setStudents(
        students.map((s) =>
          s.id === selectedStudent.id ? { ...s, statusAluno: "Inativo" } : s,
        ),
      );
      setDeleteDialogOpen(false);
      setSelectedStudent(null);
    }
  };

  const handleNewStudentChange = (field: string, value: string) => {
    setNewStudent((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditStudentChange = (field: string, value: string) => {
    setSelectedStudent((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  // --- MEMOIZATION (Performance) ---
  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchesCourse =
        courseFilter === "todos" || s.curso === courseFilter;
      const matchesStatus =
        statusFilter === "todos" || s.statusAluno === statusFilter;

      if (!search) return matchesCourse && matchesStatus;

      const term = search
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const searchDigits = search.replace(/\D/g, "");
      const matchesName = s.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .includes(term);
      const matchesCpf =
        searchDigits.length > 0 &&
        s.cpf.replace(/\D/g, "").includes(searchDigits);

      return (matchesName || matchesCpf) && matchesCourse && matchesStatus;
    });
  }, [students, search, courseFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentStudents = useMemo(() => {
    return filtered.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage,
    );
  }, [filtered, currentPage]);

  // --- RENDERIZAÇÃO ---
  return (
    <div className="overflow-hidden flex flex-col p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-start flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Gestão de Alunos
          </h1>
          <p className="text-lg text-slate-500">
            Cadastre e acompanhe os alunos do curso
          </p>
        </div>

        {/* Modal de Criação */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">
              <Plus className="h-4 w-4 mr-2" /> Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Aluno</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStudent}>
              <StudentFormFields
                student={newStudent}
                onChange={handleNewStudentChange}
              />
              <Button type="submit" className="bg-blue-600 w-full mt-2">
                Salvar Aluno
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Painel Principal */}
      <Card className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col w-full h-full min-h-[500px]">
        {/* Cabeçalho com Filtros */}
        <CardHeader className="p-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full">
            <div className="relative w-full md:w-[320px] shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                className="pl-10 bg-slate-50 border-slate-200 w-full"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full md:w-auto">
              <Select
                value={courseFilter}
                onValueChange={(v) => {
                  setCourseFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] bg-slate-50">
                  <Filter className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
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

              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] bg-slate-50">
                  <Filter className="h-4 w-4 mr-2 text-slate-400 shrink-0" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  {STATUS_ALUNO.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        {/* Tabela */}
        <CardContent className="p-0 flex-1 overflow-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 sticky top-0 z-10">
              <TableRow className="hover:bg-transparent border-b border-slate-100">
                <TableHead className="text-slate-500 font-medium whitespace-nowrap">
                  Nome / CPF
                </TableHead>
                <TableHead className="text-slate-500 font-medium whitespace-nowrap">
                  Curso / Turma
                </TableHead>
                <TableHead className="text-center text-slate-500 font-medium whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="text-center text-slate-500 font-medium whitespace-nowrap">
                  Progresso
                </TableHead>
                <TableHead className="text-center text-slate-500 font-medium whitespace-nowrap">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentStudents.map((s) => {
                const pct = Math.round((s.horasAprovadas / s.meta) * 100);
                return (
                  <TableRow
                    key={s.id}
                    className="border-b border-slate-100 last:border-0 h-16 transition-colors"
                  >
                    <TableCell className="font-medium text-slate-700">
                      <div className="flex flex-col items-start gap-0.5">
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          CPF: {s.cpf}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-600">
                          {s.curso}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {s.turma} • {s.turno || "N/A"}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        variant="secondary"
                        className={`font-semibold border-0 ${statusColors[s.statusAluno] || "bg-slate-100 text-slate-700"}`}
                      >
                        {s.statusAluno}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge
                        className={`rounded-full px-3 py-0.5 font-bold text-[10px] uppercase ${pct >= 100 ? "bg-emerald-500 hover:bg-emerald-600" : "bg-blue-600 hover:bg-blue-700"} text-white`}
                      >
                        {pct >= 100 ? "Completo" : `${pct}%`}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
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
                          className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-600"
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

              {currentStudents.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-slate-500"
                  >
                    Nenhum aluno encontrado com os filtros atuais.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>

        <CardFooter className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/30 flex-shrink-0">
          <p className="text-sm text-slate-500 font-medium">
            Página {currentPage} de {totalPages || 1}
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
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Informações</DialogTitle>
          </DialogHeader>
          {selectedStudent && (
            <form onSubmit={handleEditStudent}>
              <StudentFormFields
                student={selectedStudent}
                onChange={handleEditStudentChange}
              />
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 w-full mt-2"
              >
                Salvar Alterações
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Inativação */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Inativar Aluno</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600">
            Tem certeza que deseja inativar o aluno{" "}
            <strong className="text-slate-800">{selectedStudent?.name}</strong>?
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmDelete}
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
