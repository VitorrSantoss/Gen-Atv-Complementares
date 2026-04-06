import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, UserPlus, Trash2, Loader2, BookOpen } from "lucide-react";
import { coordService, CoordCursoLink, CoordinatorUser } from "@/services/admin/coordService";
import { courseService, CourseResponse } from "@/services/admin/courseService";

const AdminCoordinators = () => {
  const [vinculos, setVinculos] = useState<CoordCursoLink[]>([]);
  const [availableCoords, setAvailableCoords] = useState<CoordinatorUser[]>([]);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [selectedCoord, setSelectedCoord] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [vData, cData, crsData] = await Promise.all([
        coordService.getAllVinculos(),
        coordService.getAvailableCoordinators(),
        courseService.getAll()
      ]);
      setVinculos(vData);
      setAvailableCoords(cData);
      setCourses(crsData);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao carregar dados de acesso.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreateBind = async () => {
    if (!selectedCoord || !selectedCourse) return;
    try {
      await coordService.bind(Number(selectedCoord), Number(selectedCourse));
      toast({ title: "Sucesso", description: "Acesso concedido ao coordenador." });
      setIsDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast({ 
        title: "Erro ao vincular", 
        description: error.response?.data || "Verifique se o vínculo já existe.", 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteBind = async (id: number) => {
    try {
      await coordService.unbind(id);
      toast({ title: "Removido", description: "Acesso revogado com sucesso." });
      loadData();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível remover o acesso.", variant: "destructive" });
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Acessos</h1>
          <p className="text-muted-foreground">Controle quais coordenadores gerenciam cada curso.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-white">
              <UserPlus className="mr-2 h-4 w-4" /> Vincular Coordenador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Vínculo de Curso</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Coordenador</label>
                <Select onValueChange={setSelectedCoord}>
                  <SelectTrigger><SelectValue placeholder="Selecione o usuário" /></SelectTrigger>
                  <SelectContent>
                    {availableCoords.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.nome} ({c.email})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Curso</label>
                <Select onValueChange={setSelectedCourse}>
                  <SelectTrigger><SelectValue placeholder="Selecione o curso" /></SelectTrigger>
                  <SelectContent>
                    {courses.map(course => (
                      <SelectItem key={course.id} value={course.id.toString()}>{course.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateBind} className="w-full">Confirmar Acesso</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Coordenador</TableHead>
                  <TableHead>Curso</TableHead>
                  <TableHead>Nível</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vinculos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="font-medium">{v.coordenador?.nome || v.nome}</div>
                      <div className="text-xs text-muted-foreground">{v.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <BookOpen className="mr-2 h-3 w-3 text-slate-400" />
                        {v.curso?.nome}
                      </div>
                    </TableCell>
                    <TableCell><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{v.nivelAcesso}</span></TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteBind(v.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCoordinators;