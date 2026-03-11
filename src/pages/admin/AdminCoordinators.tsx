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
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

const availableCourses = [
  "Análise e Desenv. de Sistemas (ADS)",
  "Design",
  "Gastronomia",
  "Jogos Digitais",
  "Engenharia de Software",
  "Administração",
  "Direito",
  "Medicina",
  "Sistemas de Informação",
];

const initialCoordinators = [
  {
    id: "1",
    name: "Prof. Maria Silva",
    email: "maria@uni.com",
    courses: ["Engenharia de Software", "Design"],
    status: "ativo",
  },
  {
    id: "2",
    name: "Prof. Ana Costa",
    email: "ana@uni.com",
    courses: ["Administração"],
    status: "ativo",
  },
  {
    id: "3",
    name: "Prof. Carlos Souza",
    email: "carlos@uni.com",
    courses: ["Direito"],
    status: "ativo",
  },
  {
    id: "4",
    name: "Prof. Lúcia Santos",
    email: "lucia@uni.com",
    courses: ["Medicina"],
    status: "inativo",
  },
];

const AdminCoordinators = () => {
  const [coordinators] = useState(initialCoordinators);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const filtered = coordinators.filter((c) => {
    if (!search) return true;
    const normalizedSearch = search
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const normalizedName = c.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return normalizedName.includes(normalizedSearch);
  });

  const toggleCourse = (course: string) => {
    setSelectedCourses((prev) =>
      prev.includes(course)
        ? prev.filter((c) => c !== course)
        : [...prev, course],
    );
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) setSelectedCourses([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "Plus Jakarta Sans" }}
          >
            Gestão de Coordenadores
          </h1>
          <p className="text-muted-foreground mt-1">
            Cadastre e associe coordenadores aos cursos
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Novo Coordenador
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Cadastrar Coordenador</DialogTitle>
            </DialogHeader>

            {/* 🔧 CORREÇÃO AQUI: px-2 evita cortar o focus ring */}
            <div className="space-y-4 py-2 px-2 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input id="nome" placeholder="Ex: Prof. Maria Silva" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@universidade.com"
                />
              </div>

              <div className="space-y-3 pt-2">
                <Label>
                  Cursos Vinculados
                  <span className="text-xs text-muted-foreground font-normal">
                    {" "}
                    (Selecione um ou mais)
                  </span>
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 p-4 border border-border rounded-lg bg-muted/20">
                  {availableCourses.map((course) => (
                    <div key={course} className="flex items-start space-x-2">
                      <Checkbox
                        id={`course-${course}`}
                        checked={selectedCourses.includes(course)}
                        onCheckedChange={() => toggleCourse(course)}
                        className="mt-0.5 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />

                      <label
                        htmlFor={`course-${course}`}
                        className="text-sm font-medium leading-tight cursor-pointer select-none"
                      >
                        {course}
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
                Salvar Coordenador
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card border-0">
        <CardHeader className="pb-2">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />

            <Input
              placeholder="Buscar coordenador por nome..."
              className="pl-9 bg-background/50 focus:bg-background transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="hidden md:table-cell">E-mail</TableHead>
                <TableHead>Cursos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((coord) => (
                <TableRow key={coord.id}>
                  <TableCell className="font-medium">{coord.name}</TableCell>

                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {coord.email}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {coord.courses.map((c) => (
                        <Badge
                          key={c}
                          variant="secondary"
                          className="text-[10px] sm:text-xs bg-primary/10 text-primary hover:bg-primary/20 border-0 font-medium"
                        >
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        coord.status === "ativo" ? "default" : "secondary"
                      }
                      className={
                        coord.status === "ativo"
                          ? "bg-success text-success-foreground"
                          : ""
                      }
                    >
                      {coord.status}
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

export default AdminCoordinators;
