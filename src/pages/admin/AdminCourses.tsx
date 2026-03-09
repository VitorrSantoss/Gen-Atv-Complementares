import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

const initialCourses = [
  { id: "1", name: "Engenharia de Software", code: "ES", coordinators: ["Prof. Maria Silva", "Prof. João Lima"], students: 85, status: "ativo" },
  { id: "2", name: "Administração", code: "ADM", coordinators: ["Prof. Ana Costa"], students: 120, status: "ativo" },
  { id: "3", name: "Direito", code: "DIR", coordinators: ["Prof. Carlos Souza"], students: 95, status: "ativo" },
  { id: "4", name: "Medicina", code: "MED", coordinators: ["Prof. Lúcia Santos"], students: 60, status: "ativo" },
  { id: "5", name: "Design Gráfico", code: "DG", coordinators: [], students: 42, status: "inativo" },
];

const AdminCourses = () => {
  const [courses] = useState(initialCourses);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = courses.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans' }}>Gestão de Cursos</h1>
          <p className="text-muted-foreground mt-1">Cadastre e gerencie os cursos da instituição</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Novo Curso</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Curso</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Nome do Curso</Label><Input placeholder="Ex: Engenharia de Software" /></div>
              <div className="space-y-2"><Label>Código</Label><Input placeholder="Ex: ES" /></div>
              <Button className="w-full gradient-primary text-primary-foreground" onClick={() => setDialogOpen(false)}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card border-0">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar curso..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Curso</TableHead>
                <TableHead>Código</TableHead>
                <TableHead className="hidden md:table-cell">Coordenadores</TableHead>
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
                    {course.coordinators.length > 0 ? course.coordinators.join(", ") : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>{course.students}</TableCell>
                  <TableCell>
                    <Badge variant={course.status === "ativo" ? "default" : "secondary"} className={course.status === "ativo" ? "bg-success text-success-foreground" : ""}>
                      {course.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
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
