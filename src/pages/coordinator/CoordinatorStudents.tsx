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
import { Plus, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialStudents = [
  {
    id: "1",
    name: "João Santos",
    cpf: "111.222.333-44",
    turma: "T1",
    periodo: "3º Período",
    email: "joao@aluno.com",
    horasAprovadas: 120,
    horasPendentes: 20,
    meta: 200,
  },
  {
    id: "2",
    name: "Ana Oliveira",
    cpf: "555.666.777-88",
    turma: "T2",
    periodo: "5º Período",
    email: "ana@aluno.com",
    horasAprovadas: 180,
    horasPendentes: 10,
    meta: 200,
  },
  {
    id: "3",
    name: "Carlos Lima",
    cpf: "999.000.111-22",
    turma: "T1",
    periodo: "3º Período",
    email: "carlos@aluno.com",
    horasAprovadas: 50,
    horasPendentes: 30,
    meta: 200,
  },
  {
    id: "4",
    name: "Maria Fernandes",
    cpf: "333.444.555-66",
    turma: "T3",
    periodo: "4º Período",
    email: "maria@aluno.com",
    horasAprovadas: 200,
    horasPendentes: 0,
    meta: 200,
  },
];

const CoordinatorStudents = () => {
  const [students] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Filtro Dinâmico em Tempo Real (Corrigido)
  const filtered = students.filter((s) => {
    // Se a busca estiver vazia, mostra todos
    if (!search) return true;

    // Prepara o texto removendo acentos e deixando minúsculo
    const normalizedSearch = search
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const normalizedName = s.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    // Verifica se bate com o nome
    const matchName = normalizedName.includes(normalizedSearch);

    // Extrai apenas os números da busca para comparar com o CPF
    const searchDigits = search.replace(/\D/g, "");

    // Só tenta buscar por CPF se realmente houver algum número digitado
    const matchCpf =
      searchDigits.length > 0 &&
      s.cpf.replace(/\D/g, "").includes(searchDigits);

    // Retorna o aluno se bater com o nome OU com o CPF
    return matchName || matchCpf;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-foreground"
            style={{ fontFamily: "Plus Jakarta Sans" }}
          >
            Gestão de Alunos
          </h1>
          <p className="text-muted-foreground mt-1">
            Cadastre e acompanhe os alunos do curso
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Aluno</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input placeholder="Nome completo" />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input placeholder="000.000.000-00" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Turma</Label>
                  <Input placeholder="Ex: T1" />
                </div>

                <div className="space-y-2">
                  <Label>Período</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1º Período</SelectItem>
                      <SelectItem value="2">2º Período</SelectItem>
                      <SelectItem value="3">3º Período</SelectItem>
                      <SelectItem value="4">4º Período</SelectItem>
                      <SelectItem value="5">5º Período</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" placeholder="aluno@universidade.com" />
              </div>
              <Button
                className="w-full gradient-primary text-primary-foreground mt-4"
                onClick={() => setDialogOpen(false)}
              >
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="glass-card border-0">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              className="pl-10"
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
                <TableHead>CPF</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead className="hidden md:table-cell">Período</TableHead>
                <TableHead className="hidden lg:table-cell">E-mail</TableHead>
                <TableHead>Progresso</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const pct = Math.round((s.horasAprovadas / s.meta) * 100);
                return (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.cpf}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {s.turma}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {s.periodo}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {s.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full gradient-primary rounded-full"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {s.horasAprovadas}/{s.meta}h
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          pct >= 100
                            ? "bg-success text-success-foreground"
                            : pct >= 50
                              ? "bg-primary text-primary-foreground"
                              : "bg-warning text-warning-foreground"
                        }
                      >
                        {pct >= 100 ? "Completo" : `${pct}%`}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoordinatorStudents;
