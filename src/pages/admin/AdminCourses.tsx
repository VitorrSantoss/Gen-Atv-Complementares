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
  const [courses, setCourses] = useState(initialCourses);
  const [search, setSearch] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCoordinators, setSelectedCoordinators] = useState<string[]>([]);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    code: "",
    students: "",
    status: "ativo",
  });

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
    if (!open) {
      setSelectedCoordinators([]);
      setFormData({ id: "", name: "", code: "", students: "", status: "ativo" });
      setIsEditing(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: "", name: "", code: "", students: "", status: "ativo" });
    setSelectedCoordinators([]);
    setDialogOpen(true);
  };

  const handleOpenEdit = (course: any) => {
    setIsEditing(true);
    setFormData({
      id: course.id,
      name: course.name,
      code: course.code,
      students: course.students.toString(),
      status: course.status,
    });
    setSelectedCoordinators([...course.coordinators]);
    setDialogOpen(true);
  };

  const handleSave = () => {
    const courseData = {
      ...formData,
      students: Number(formData.students) || 0,
      coordinators: selectedCoordinators,
    };

    if (isEditing) {
      setCourses(
        courses.map((c) => (c.id === formData.id ? { ...c, ...courseData } : c))
      );
    } else {
      const newCourse = {
        ...courseData,
        id: Math.random().toString(36).substring(2, 9),
      };
      setCourses([...courses, newCourse]);
    }
    
    setDialogOpen(false);
  };

  const handleDeleteClick = (course: any) => {
    setCourseToDelete(course);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (courseToDelete) {
      setCourses(courses.filter((c) => c.id !== courseToDelete.id));
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Gestão de Cursos
          </h1>

          <p className="text-lg text-slate-500 mt-1">
            Cadastre e gerencie os cursos da instituição
          </p>
        </div>

        <Button 
          className="gradient-primary text-primary-foreground"
          onClick={handleOpenAdd}
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Curso
        </Button>

        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Editar Curso" : "Cadastrar Curso"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2 px-2 max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Curso</Label>
                <Input 
                  id="nome" 
                  placeholder="Ex: Engenharia de Software" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input 
                    id="codigo" 
                    placeholder="Ex: ES" 
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacidade">Capacidade (Alunos)</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    placeholder="Ex: 100"
                    min="0"
                    value={formData.students}
                    onChange={(e) => setFormData({ ...formData, students: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status do Curso</Label>

                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
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
                onClick={handleSave}
              >
                Salvar Curso
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card border-0 shadow-sm rounded-2xl">
        <CardHeader className="border-b border-slate-50/50 p-6">
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

        <CardContent className="p-6">
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
                        onClick={() => handleOpenEdit(course)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-destructive"
                        onClick={() => handleDeleteClick(course)}
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Excluir Curso</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-slate-600">
            Tem certeza que deseja remover o curso{" "}
            <strong>{courseToDelete?.name}</strong>?
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete}>
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourses;