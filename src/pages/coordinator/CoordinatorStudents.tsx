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
  Upload,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  alunoService,
  AlunoResponse,
} from "@/services/coordenador/AlunoService";
import { courseService, CourseResponse } from "@/services/admin/courseService";

const CoordinatorStudents = () => {
  const [alunos, setAlunos] = useState<AlunoResponse[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("todos");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"manual" | "csv">("manual");

  const [form, setForm] = useState({
    email: "",
    matricula: "",
    cursoId: "",
  });

  const [csvFile, setCsvFile] = useState<File | null>(null);

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
    } catch {
      toast({
        title: "Erro ao carregar dados",
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
        courseFilter === "todos" || String(a.cursoId) === courseFilter;

      const term = search.toLowerCase();
      const matchesSearch =
        !search ||
        a.email?.toLowerCase().includes(term) ||
        a.matricula?.toLowerCase().includes(term);

      return matchesCourse && matchesSearch;
    });
  }, [alunos, search, courseFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));

  const currentAlunos = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleCreate = async () => {
    if (!form.email || !form.matricula || !form.cursoId) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    try {
      await alunoService.create({
        email: form.email,
        matricula: form.matricula,
        cursoId: Number(form.cursoId),
      });

      toast({ title: "Aluno criado com sucesso" });

      setDialogOpen(false);
      setForm({ email: "", matricula: "", cursoId: "" });

      loadData();
    } catch {
      toast({ title: "Erro ao criar aluno", variant: "destructive" });
    }
  };

  const handleUploadCsv = async () => {
    if (!csvFile) {
      toast({ title: "Selecione um CSV", variant: "destructive" });
      return;
    }

    try {
      const result = await alunoService.uploadCsv(csvFile);

      const erros = result.detalhes.filter((d: any) => !d.sucesso);

      const resumo: Record<string, number> = {};

      erros.forEach((e: any) => {
        const motivo = e.motivo.toLowerCase();

        let chave = "Erro desconhecido";

        if (motivo.includes("já existe")) {
          chave = "Usuários já existentes";
        } else if (motivo.includes("cursoid")) {
          chave = "Problema no curso";
        } else if (motivo.includes("matricula")) {
          chave = "Problema na matrícula";
        } else if (motivo.includes("email")) {
          chave = "Problema no email";
        } else if (motivo.includes("não pode estar vazio")) {
          chave = "Campos obrigatórios não preenchidos";
        } else if (motivo.includes("número inteiro")) {
          chave = "Valor inválido";
        }

        resumo[chave] = (resumo[chave] || 0) + 1;
      });

      const mensagemResumo =
        Object.entries(resumo)
          .map(([erro, qtd]) => `${qtd} ${erro}`)
          .join(" | ") || "Importação realizada com sucesso";

      toast({
        title: "Resultado do CSV",
        description: mensagemResumo,
        variant: result.falhas > 0 ? "destructive" : "default",
      });

      setDialogOpen(false);
      setCsvFile(null);
      loadData();
      setCurrentPage(1);
    } catch {
      toast({ title: "Erro ao enviar CSV", variant: "destructive" });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Gestão de Alunos</h1>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Aluno
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Aluno</DialogTitle>
            </DialogHeader>

            <div className="flex gap-2 mb-4">
              <Button
                variant={mode === "manual" ? "default" : "outline"}
                onClick={() => setMode("manual")}
              >
                Manual
              </Button>
              <Button
                variant={mode === "csv" ? "default" : "outline"}
                onClick={() => setMode("csv")}
              >
                CSV
              </Button>
            </div>

            {mode === "manual" ? (
              <div className="space-y-3">
                <Input
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
                <Input
                  placeholder="Matrícula"
                  value={form.matricula}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, matricula: e.target.value }))
                  }
                />
                <Input
                  placeholder="Curso ID"
                  value={form.cursoId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, cursoId: e.target.value }))
                  }
                />

                <Button onClick={handleCreate} className="w-full">
                  Criar Aluno
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                />

                <Button onClick={handleUploadCsv} className="w-full">
                  Enviar CSV
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center p-10">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Curso</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentAlunos.map((a) => (
                  <TableRow key={a.usuarioId}>
                    <TableCell>{a.matricula}</TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell>{a.cursoId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <p>
            Página {currentPage} de {totalPages} — {filtered.length} alunos
          </p>

          <div className="flex gap-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft />
            </Button>

            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CoordinatorStudents;
