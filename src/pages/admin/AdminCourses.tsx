import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

const availableCoordinators = [
  "Prof. Maria Silva",
  "Prof. João Lima",
  "Prof. Ana Costa",
  "Prof. Carlos Souza",
  "Prof. Lúcia Santos",
  "Prof. Roberto Almeida",
];

const initialCourses = [
  {
    id: "1",
    name: "Engenharia de Software",
    code: "ES",
    coordinators: ["Prof. Maria Silva", "Prof. João Lima"],
    students: 85,
    status: "ativo",
  },
  {
    id: "2",
    name: "Administração",
    code: "ADM",
    coordinators: ["Prof. Ana Costa"],
    students: 120,
    status: "ativo",
  },
  {
    id: "3",
    name: "Direito",
    code: "DIR",
    coordinators: ["Prof. Carlos Souza"],
    students: 95,
    status: "ativo",
  },
  {
    id: "4",
    name: "Medicina",
    code: "MED",
    coordinators: ["Prof. Lúcia Santos"],
    students: 60,
    status: "ativo",
  },
  {
    id: "5",
    name: "Design Gráfico",
    code: "DG",
    coordinators: [],
    students: 42,
    status: "inativo",
  },
];

const AdminCourses = () => {
  const [courses] = useState(initialCourses);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCoordinators, setSelectedCoordinators] = useState<string[]>(
    [],
  );

  const filtered = courses.filter((c) => {
    if (!search) return true;

    const normalizedSearch = search
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const normalizedName = c.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    const normalizedCode = c.code.toLowerCase();

    return (
      normalizedName.includes(normalizedSearch) ||
      normalizedCode.includes(search.toLowerCase())
    );
  });

  const toggleCoordinator = (coord: string) => {
    setSelectedCoordinators((prev) =>
      prev.includes(coord) ? prev.filter((c) => c !== coord) : [...prev, coord],
    );
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setSelectedCoordinators([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "Plus Jakarta Sans" }}
          >
            Gestão de Cursos
          </h1>

          <p className="text-muted-foreground mt-1">
            Cadastre e gerencie os cursos da instituição
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Novo Curso
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Curso</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 px-2 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Curso</Label>
                <Input id="nome" placeholder="Ex: Engenharia de Software" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input id="codigo" placeholder="Ex: ES" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacidade">Capacidade (Alunos)</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    placeholder="Ex: 100"
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status do Curso</Label>

                <Select defaultValue="ativo">
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <Label>Coordenadores Vinculados</Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 p-4 border border-border rounded-lg bg-muted/20">
                  {availableCoordinators.map((coord) => (
                    <div key={coord} className="flex items-start space-x-2">
                      <Checkbox
                        id={`coord-${coord}`}
                        checked={selectedCoordinators.includes(coord)}
                        onCheckedChange={() => toggleCoordinator(coord)}
                        className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />

                      <label
                        htmlFor={`coord-${coord}`}
                        className="text-sm font-medium leading-tight cursor-pointer select-none"
                      >
                        {coord}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                className="w-full gradient-primary text-primary-foreground"
                onClick={() => setDialogOpen(false)}
              >
                Salvar Curso
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card border-0">
        <CardHeader className="pb-2">
          <div className="flex items-center w-full max-w-md h-10 rounded-md border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 transition-colors">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />

            <input
              type="text"
              placeholder="Buscar curso por nome ou código..."
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Código</TableHead>
                <TableHead className="hidden md:table-cell">
                  Coordenadores
                </TableHead>
                <TableHead>Alunos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.name}</TableCell>

                  <TableCell>{course.code}</TableCell>

                  <TableCell className="hidden md:table-cell">
                    {course.coordinators.length > 0 ? (
                      <span className="text-primary font-medium">
                        {course.coordinators.join(", ")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">
                        Nenhum
                      </span>
                    )}
                  </TableCell>

                  <TableCell>{course.students}</TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        course.status === "ativo" ? "default" : "secondary"
                      }
                      className={
                        course.status === "ativo"
                          ? "bg-success text-success-foreground"
                          : ""
                      }
                    >
                      {course.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-primary"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCourses;
