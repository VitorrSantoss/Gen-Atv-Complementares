import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Trash2, Pencil, Loader2, ShieldAlert, GraduationCap, UserCog, Filter, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { userService, UserResponse } from "@/services/admin/userService";

const AdminUsers = () => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- ESTADOS DE PESQUISA, FILTRO E PAGINAÇÃO ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterProfile, setFilterProfile] = useState("TODOS");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Controle do Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    nome: "", email: "", senha: "", perfil: "ALUNO" as "ALUNO" | "COORDENADOR" | "SUPER_ADMIN" 
  });

  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      toast({ title: "Erro", description: "Falha ao carregar lista de usuários.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  // Reseta para a página 1 sempre que a busca ou o filtro mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterProfile]);

  // --- LÓGICA DE FILTRAGEM COMBINADA (BUSCA + PERFIL) ---
  const filteredUsers = users.filter(u => {
    const matchesProfile = filterProfile === "TODOS" || u.perfil === filterProfile;
    const matchesSearch = 
      u.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesProfile && matchesSearch;
  });

  // --- LÓGICA DE PAGINAÇÃO ---
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({ nome: "", email: "", senha: "", perfil: "ALUNO" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: UserResponse) => {
    setEditingId(user.id);
    setFormData({ nome: user.nome, email: user.email, senha: "", perfil: user.perfil });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.email || (!editingId && !formData.senha)) {
      toast({ title: "Atenção", description: "Preencha os campos obrigatórios.", variant: "destructive" });
      return;
    }

    try {
      if (editingId) {
        await userService.update(editingId, formData);
        toast({ title: "Atualizado", description: "Usuário atualizado com sucesso!" });
      } else {
        await userService.create(formData);
        toast({ title: "Sucesso", description: "Usuário cadastrado com sucesso!" });
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: "Erro ao processar requisição.", variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await userService.delete(id);
      toast({ title: "Removido", description: "Usuário excluído com sucesso." });
      loadUsers();
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível remover o usuário.", variant: "destructive" });
    }
  };

  const getProfileBadge = (perfil: string) => {
    switch (perfil) {
      case "SUPER_ADMIN":
        return <span className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold"><ShieldAlert className="h-3 w-3"/> Gestor</span>;
      case "COORDENADOR":
        return <span className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold"><UserCog className="h-3 w-3"/> Coordenador</span>;
      case "ALUNO":
      default:
        return <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold"><GraduationCap className="h-3 w-3"/> Aluno</span>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Visualize e gerencie todas as contas do sistema.</p>
        </div>
        <Button className="bg-primary text-white" onClick={handleOpenNew}>
          <UserPlus className="mr-2 h-4 w-4" /> Novo Usuário
        </Button>
      </div>

      {/* --- BARRA DE PESQUISA E FILTROS --- */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Campo de Pesquisa */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar por nome ou e-mail..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Seletor de Perfil */}
        <div className="flex items-center gap-2 bg-card px-3 py-1 rounded-lg border border-border w-full md:w-64">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filterProfile} onValueChange={setFilterProfile}>
            <SelectTrigger className="border-none shadow-none bg-transparent focus:ring-0">
              <SelectValue placeholder="Perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os Perfis</SelectItem>
              <SelectItem value="SUPER_ADMIN">Gestor</SelectItem>
              <SelectItem value="COORDENADOR">Coordenador</SelectItem>
              <SelectItem value="ALUNO">Aluno</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Usuário" : "Cadastrar Novo Usuário"}</DialogTitle>
            {editingId && <DialogDescription>Deixe a senha em branco se não quiser alterá-la.</DialogDescription>}
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome Completo</label>
              <Input value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha {editingId && "(Opcional)"}</label>
              <Input type="password" placeholder={editingId ? "Manter atual" : "********"} value={formData.senha} onChange={(e) => setFormData({...formData, senha: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Perfil de Acesso</label>
              <Select value={formData.perfil} onValueChange={(v: any) => setFormData({...formData, perfil: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALUNO">Aluno</SelectItem>
                  <SelectItem value="COORDENADOR">Coordenador</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Gestor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} className="w-full">{editingId ? "Salvar Alterações" : "Cadastrar Usuário"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center p-10"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Perfil</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{u.email}</TableCell>
                      <TableCell>{getProfileBadge(u.perfil)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="icon" onClick={() => handleOpenEdit(u)} className="text-blue-500 hover:text-blue-700">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Paginação */}
              <div className="flex items-center justify-between mt-4 border-t pt-4">
                <div className="text-sm text-muted-foreground">
                   Resultados: {filteredUsers.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm">Página {currentPage} de {totalPages}</span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;