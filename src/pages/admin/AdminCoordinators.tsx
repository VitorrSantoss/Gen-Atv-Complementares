import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

const initialCoordinators = [
  { id: "1", name: "Prof. Maria Silva", email: "maria@uni.com", courses: ["Eng. Software", "Design"], status: "ativo" },
  { id: "2", name: "Prof. Ana Costa", email: "ana@uni.com", courses: ["Administração"], status: "ativo" },
  { id: "3", name: "Prof. Carlos Souza", email: "carlos@uni.com", courses: ["Direito"], status: "ativo" },
  { id: "4", name: "Prof. Lúcia Santos", email: "lucia@uni.com", courses: ["Medicina"], status: "inativo" },
];

const AdminCoordinators = () => {
  const [coordinators] = useState(initialCoordinators);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filtered = coordinators.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans' }}>Gestão de Coordenadores</h1>
          <p className="text-muted-foreground mt-1">Cadastre e associe coordenadores aos cursos</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground"><Plus className="h-4 w-4 mr-2" />Novo Coordenador</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Cadastrar Coordenador</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2"><Label>Nome</Label><Input placeholder="Nome completo" /></div>
              <div className="space-y-2"><Label>E-mail</Label><Input type="email" placeholder="email@universidade.com" /></div>
              <Button className="w-full gradient-primary text-primary-foreground" onClick={() => setDialogOpen(false)}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card border-0">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar coordenador..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  <TableCell className="hidden md:table-cell">{coord.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {coord.courses.map((c) => (<Badge key={c} variant="secondary" className="text-xs">{c}</Badge>))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={coord.status === "ativo" ? "default" : "secondary"} className={coord.status === "ativo" ? "bg-success text-success-foreground" : ""}>
                      {coord.status}
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

export default AdminCoordinators;
