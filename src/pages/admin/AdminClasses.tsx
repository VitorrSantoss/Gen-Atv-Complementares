import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, UploadCloud, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const availableCourses = [
  "Engenharia de Software",
  "Administração",
  "Direito",
  "Design",
];

const initialClasses = [
  { id: "1", name: "ES-2026.1", course: "Engenharia de Software", semester: "2026.1", students: 45, status: "ativo" },
  { id: "2", name: "ADM-2026.1", course: "Administração", semester: "2026.1", students: 30, status: "ativo" },
  { id: "3", name: "DIR-2025.2", course: "Direito", semester: "2025.2", students: 50, status: "inativo" },
];

const AdminClasses = () => {
  const [classes, setClasses] = useState(initialClasses);
  const [search, setSearch] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<any>(null);

  const [formData, setFormData] = useState({ id: "", name: "", course: "", semester: "", status: "ativo" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filtered = classes.filter((c) => {
    if (!search) return true;
    const normalizedSearch = search.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedName = c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return normalizedName.includes(normalizedSearch) || c.course.toLowerCase().includes(search.toLowerCase());
  });

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: "", name: "", course: "", semester: "", status: "ativo" });
    setDialogOpen(true);
  };

  const handleOpenEdit = (cls: any) => {
    setIsEditing(true);
    setFormData({ id: cls.id, name: cls.name, course: cls.course, semester: cls.semester, status: cls.status });
    setDialogOpen(true);
  };

  const handleSave = () => {
    // Preserva o número de alunos mockado ao editar, ou define 0 se for nova
    const studentsCount = isEditing ? classes.find(c => c.id === formData.id)?.students || 0 : 0;
    
    const classData = { ...formData, students: studentsCount };

    if (isEditing) {
      setClasses(classes.map((c) => (c.id === formData.id ? { ...c, ...classData } : c)));
    } else {
      setClasses([...classes, { ...classData, id: Math.random().toString(36).substring(2, 9) }]);
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (classToDelete) setClasses(classes.filter((c) => c.id !== classToDelete.id));
    setDeleteDialogOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      toast({ title: "Importação concluída!", description: "Turmas cadastradas em lote com sucesso." });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Turmas</h1>
          <p className="text-lg text-slate-500 mt-1">Cadastre e organize as turmas da instituição</p>
        </div>

        <div className="flex gap-3">
          <input type="file" accept=".txt" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <Button variant="outline" className="border-blue-200 text-blue-700 bg-blue-50" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-4 w-4 mr-2" /> Importar (.txt)
          </Button>
          <Button className="gradient-primary text-primary-foreground" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-2" /> Nova Turma
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Turma" : "Cadastrar Turma"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Turma</Label>
                  <Input placeholder="Ex: ES-2026.1" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Semestre</Label>
                  <Input placeholder="Ex: 2026.1" value={formData.semester} onChange={(e) => setFormData({ ...formData, semester: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Curso Vinculado</Label>
                <Select value={formData.course} onValueChange={(val) => setFormData({ ...formData, course: val })}>
                  <SelectTrigger><SelectValue placeholder="Selecione o curso..." /></SelectTrigger>
                  <SelectContent>
                    {availableCourses.map(course => (
                      <SelectItem key={course} value={course}>{course}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativa</SelectItem>
                    <SelectItem value="inativo">Inativa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSave}>Salvar Turma</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card border-0 shadow-sm rounded-2xl">
        <CardHeader className="border-b border-slate-50/50 p-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar turma ou curso..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Turma</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>Semestre</TableHead>
                <TableHead>Alunos Matriculados</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell>
                    <div className="font-bold text-slate-700 flex items-center gap-2">
                      <Layers className="h-4 w-4 text-blue-500" />
                      {cls.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">{cls.course}</TableCell>
                  <TableCell className="font-medium">{cls.semester}</TableCell>
                  <TableCell>{cls.students} alunos</TableCell>
                  <TableCell>
                    <Badge variant={cls.status === "ativo" ? "default" : "secondary"} className={cls.status === "ativo" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-0" : ""}>
                      {cls.status === "ativo" ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(cls)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => { setClassToDelete(cls); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle className="text-red-600">Excluir Turma</DialogTitle></DialogHeader>
          <div className="py-4 text-slate-600">Tem certeza que deseja excluir a turma <strong>{classToDelete?.name}</strong>? Esta ação não removerá os alunos associados.</div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-red-600 text-white" onClick={confirmDelete}>Excluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClasses;