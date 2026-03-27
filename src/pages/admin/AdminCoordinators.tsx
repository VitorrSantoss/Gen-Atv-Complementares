import { useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Pencil, Trash2, UploadCloud, ShieldAlert } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const availableCourses = ["Engenharia de Software", "Administração", "Direito", "Design"];

const initialUsers = [
  { id: "1", name: "Prof. Maria Silva", email: "maria@uni.com", role: "Coordenador", courses: ["Engenharia de Software", "Design"] },
  { id: "2", name: "Dr. Roberto Costa", email: "roberto.admin@uni.com", role: "Super Admin", courses: [] },
  { id: "3", name: "Prof. Carlos Souza", email: "carlos@uni.com", role: "Coordenador", courses: ["Direito"] },
];

const AdminCoordinators = () => {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);

  const [formData, setFormData] = useState({ id: "", name: "", email: "", role: "Coordenador" });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const filtered = users.filter((u) => {
    if (!search) return true;
    return u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
  });

  const toggleCourse = (course: string) => {
    setSelectedCourses((prev) => prev.includes(course) ? prev.filter((c) => c !== course) : [...prev, course]);
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData({ id: "", name: "", email: "", role: "Coordenador" });
    setSelectedCourses([]);
    setDialogOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setIsEditing(true);
    setFormData({ id: user.id, name: user.name, email: user.email, role: user.role });
    setSelectedCourses([...user.courses]);
    setDialogOpen(true);
  };

  const handleSave = () => {
    const userData = { ...formData, courses: formData.role === "Coordenador" ? selectedCourses : [] };
    if (isEditing) {
      setUsers(users.map((u) => (u.id === formData.id ? { ...u, ...userData } : u)));
    } else {
      setUsers([...users, { ...userData, id: Math.random().toString(36).substring(2, 9) }]);
    }
    setDialogOpen(false);
  };

  const confirmDelete = () => {
    if (userToDelete) setUsers(users.filter((u) => u.id !== userToDelete.id));
    setDeleteDialogOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      toast({ title: "Importação concluída!", description: "Acessos cadastrados em lote com sucesso." });
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Gestão de Acessos</h1>
          <p className="text-lg text-slate-500 mt-1">Cadastre Super Admins e Coordenadores</p>
        </div>

        <div className="flex gap-3">
          <input type="file" accept=".txt" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
          <Button variant="outline" className="border-blue-200 text-blue-700 bg-blue-50" onClick={() => fileInputRef.current?.click()}>
            <UploadCloud className="h-4 w-4 mr-2" /> Importar (.txt)
          </Button>
          <Button className="gradient-primary text-primary-foreground" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4 mr-2" /> Novo Acesso
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? "Editar Acesso" : "Cadastrar Acesso"}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input placeholder="Ex: João da Silva" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input type="email" placeholder="email@senac.br" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Nível de Acesso</Label>
                  <Select value={formData.role} onValueChange={(val) => setFormData({ ...formData, role: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Coordenador">Coordenador</SelectItem>
                      <SelectItem value="Super Admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.role === "Coordenador" && (
                <div className="space-y-3 pt-2">
                  <Label>Vincular a Cursos (Apenas para Coordenadores)</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border border-border rounded-lg bg-slate-50">
                    {availableCourses.map((course) => (
                      <div key={course} className="flex items-start space-x-2">
                        <Checkbox checked={selectedCourses.includes(course)} onCheckedChange={() => toggleCourse(course)} />
                        <label className="text-sm font-medium leading-tight">{course}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button className="w-full gradient-primary text-primary-foreground" onClick={handleSave}>Salvar Acesso</Button>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card border-0 shadow-sm rounded-2xl">
        <CardHeader className="border-b border-slate-50/50 p-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou e-mail..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Nível de Acesso</TableHead>
                <TableHead>Cursos Vinculados</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-bold text-slate-700">{user.name}</div>
                    <div className="text-xs text-slate-400">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    {user.role === "Super Admin" ? (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0 flex items-center w-fit gap-1"><ShieldAlert className="h-3 w-3"/> Super Admin</Badge>
                    ) : (
                      <Badge variant="outline" className="text-slate-600">Coordenador</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.role === "Super Admin" ? <span className="text-xs text-slate-400 italic">Acesso Total</span> : (
                      <div className="flex flex-wrap gap-1">
                        {user.courses.map(c => <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(user)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => { setUserToDelete(user); setDeleteDialogOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle className="text-red-600">Remover Acesso</DialogTitle></DialogHeader>
          <div className="py-4 text-slate-600">Tem certeza que deseja remover o acesso de <strong>{userToDelete?.name}</strong>?</div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-red-600 text-white" onClick={confirmDelete}>Remover</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminCoordinators;