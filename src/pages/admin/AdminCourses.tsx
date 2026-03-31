import { useRef, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Pencil, Trash2, UploadCloud } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const availableCoordinators = [
  "Prof. Maria Silva",
  "Prof. João Lima",
  "Prof. Ana Costa",
  "Prof. Carlos Souza",
];

const initialCourses = [
  {
    id: "1",
    name: "Engenharia de Software",
    code: "ES",
    hours: "3200",
    coordinators: ["Prof. Maria Silva", "Prof. João Lima"],
  },
  {
    id: "2",
    name: "Administração",
    code: "ADM",
    hours: "3000",
    coordinators: ["Prof. Ana Costa"],
  },
  {
    id: "3",
    name: "Direito",
    code: "DIR",
    hours: "4000",
    coordinators: ["Prof. Carlos Souza"],
  },
];

const AdminCourses = () => {
  const [courses, setCourses] = useState(initialCourses);
  const [search, setSearch] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCoordinators, setSelectedCoordinators] = useState<string[]>(
    [],
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<any>(null);

  // 👇 Adicionado o campo "hours" no estado do formulário
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    code: "",
    hours: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    return (
      normalizedName.includes(normalizedSearch) ||
      c.code.toLowerCase().includes(search.toLowerCase())
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
      setFormData({ id: "", name: "", code: "", hours: "" });
      setIsEditing(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: "", name: "", code: "", hours: "" });
    setSelectedCoordinators([]);
    setDialogOpen(true);
  };

  const handleOpenEdit = (course: any) => {
    setIsEditing(true);
    setFormData({
      id: course.id,
      name: course.name,
      code: course.code,
      hours: course.hours || "",
    });
    setSelectedCoordinators([...course.coordinators]);
    setDialogOpen(true);
  };

  const handleSave = () => {
    const courseData = { ...formData, coordinators: selectedCoordinators };

    if (isEditing) {
      setCourses(
        courses.map((c) =>
          c.id === formData.id ? { ...c, ...courseData } : c,
        ),
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      toast({
        title: "Formato inválido",
        description: "Por favor, envie apenas ficheiros .txt",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Importação concluída!",
      description: `O ficheiro ${file.name} foi processado. Cadastros em lote realizados com sucesso.`,
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Gestão de Cursos
          </h1>
          <p className="text-lg text-slate-500 mt-1">
            Cadastre os cursos da instituição (Cadastro Restrito)
          </p>
        </div>

        <div className="flex gap-3">
          <input
            type="file"
            accept=".txt"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            className="border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadCloud className="h-4 w-4 mr-2" /> Importar (.txt)
          </Button>
          <Button
            className="gradient-primary text-primary-foreground"
            onClick={handleOpenAdd}
          >
            <Plus className="h-4 w-4 mr-2" /> Novo Curso
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Editar Curso" : "Cadastrar Curso"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Curso</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Engenharia de Software"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              {/* 👇 Grid adicionado para organizar o Código e a Carga Horária lado a lado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código do Curso</Label>
                  <Input
                    id="codigo"
                    placeholder="Ex: ES"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horas">Carga Horária (h)</Label>
                  <Input
                    id="horas"
                    type="number"
                    placeholder="Ex: 3000"
                    value={formData.hours}
                    onChange={(e) =>
                      setFormData({ ...formData, hours: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label>Coordenadores Vinculados</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-border rounded-lg bg-slate-50 max-h-48 overflow-y-auto">
                  {availableCoordinators.map((coord) => (
                    <div key={coord} className="flex items-start space-x-2">
                      <Checkbox
                        id={`coord-${coord}`}
                        checked={selectedCoordinators.includes(coord)}
                        onCheckedChange={() => toggleCoordinator(coord)}
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

            <Button
              className="w-full gradient-primary text-primary-foreground"
              onClick={handleSave}
            >
              Salvar Cadastro
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card border-0 shadow-sm rounded-2xl">
        <CardHeader className="border-b border-slate-50/50 p-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar curso..."
              className="pl-9 bg-background/50 focus:bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Curso</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Carga Horária</TableHead>
                <TableHead>Coordenadores Associados</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-bold text-slate-700">
                    {course.name}
                  </TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.hours}h</TableCell>
                  <TableCell>
                    {course.coordinators.length > 0 ? (
                      <span className="text-blue-600 font-medium">
                        {course.coordinators.join(", ")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">
                        Nenhum
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(course)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDeleteClick(course)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
            Confirma a exclusão do curso <strong>{courseToDelete?.name}</strong>
            ?
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button className="bg-red-600 text-white" onClick={confirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCourses;
