import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Eye, FileText } from "lucide-react";

interface Submission {
  id: string;
  aluno: string;
  titulo: string;
  categoria: string;
  horas: number;
  data: string;
  status: "pendente" | "aprovada" | "rejeitada";
  arquivo: string;
  descricao: string;
}

const initialSubmissions: Submission[] = [
  { id: "1", aluno: "João Santos", titulo: "Congresso de IA 2025", categoria: "Pesquisa", horas: 20, data: "2026-02-15", status: "pendente", arquivo: "certificado.pdf", descricao: "Participação no congresso nacional de inteligência artificial." },
  { id: "2", aluno: "Ana Oliveira", titulo: "Projeto Comunitário", categoria: "Extensão", horas: 40, data: "2026-01-20", status: "pendente", arquivo: "comprovante.jpg", descricao: "Voluntariado em projeto de inclusão digital." },
  { id: "3", aluno: "Carlos Lima", titulo: "Monitoria Cálculo I", categoria: "Ensino", horas: 30, data: "2026-03-01", status: "pendente", arquivo: "declaracao.pdf", descricao: "Monitoria durante o semestre 2025.2." },
  { id: "4", aluno: "Maria Fernandes", titulo: "Hackathon Tech", categoria: "Pesquisa", horas: 15, data: "2025-12-10", status: "aprovada", arquivo: "cert_hack.pdf", descricao: "Participação e premiação no hackathon." },
  { id: "5", aluno: "João Santos", titulo: "Palestra Design Thinking", categoria: "Cultural", horas: 4, data: "2026-02-28", status: "rejeitada", arquivo: "foto.jpg", descricao: "Palestra assistida na semana acadêmica." },
];

const CoordinatorSubmissions = () => {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState("");

  const handleAction = (id: string, status: "aprovada" | "rejeitada") => {
    setSubmissions(subs => subs.map(s => s.id === id ? { ...s, status } : s));
    setSelected(null);
    setFeedback("");
  };

  const statusColors: Record<string, string> = {
    pendente: "bg-warning text-warning-foreground",
    aprovada: "bg-success text-success-foreground",
    rejeitada: "bg-destructive text-destructive-foreground",
  };

  const pendentes = submissions.filter(s => s.status === "pendente");
  const historico = submissions.filter(s => s.status !== "pendente");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans' }}>Fila de Solicitações</h1>
        <p className="text-muted-foreground mt-1">Avalie os certificados enviados pelos alunos</p>
      </div>

      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="text-lg">Pendentes ({pendentes.length})</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Atividade</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendentes.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.aluno}</TableCell>
                  <TableCell>{sub.titulo}</TableCell>
                  <TableCell className="hidden md:table-cell"><Badge variant="secondary">{sub.categoria}</Badge></TableCell>
                  <TableCell>{sub.horas}h</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setSelected(sub)}><Eye className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleAction(sub.id, "aprovada")}><CheckCircle className="h-4 w-4 text-success" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleAction(sub.id, "rejeitada")}><XCircle className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pendentes.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma solicitação pendente 🎉</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="text-lg">Histórico</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Atividade</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historico.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.aluno}</TableCell>
                  <TableCell>{sub.titulo}</TableCell>
                  <TableCell>{sub.horas}h</TableCell>
                  <TableCell><Badge className={statusColors[sub.status]}>{sub.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Detalhes da Solicitação</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Aluno:</span><p className="font-medium">{selected.aluno}</p></div>
                <div><span className="text-muted-foreground">Categoria:</span><p className="font-medium">{selected.categoria}</p></div>
                <div><span className="text-muted-foreground">Horas:</span><p className="font-medium">{selected.horas}h</p></div>
                <div><span className="text-muted-foreground">Data:</span><p className="font-medium">{selected.data}</p></div>
              </div>
              <div><span className="text-sm text-muted-foreground">Descrição:</span><p className="text-sm mt-1">{selected.descricao}</p></div>
              <div className="flex items-center gap-2 p-3 bg-secondary rounded-xl">
                <FileText className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{selected.arquivo}</span>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Feedback (opcional):</span>
                <Textarea placeholder="Motivo da aprovação/rejeição..." value={feedback} onChange={(e) => setFeedback(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 bg-success text-success-foreground hover:bg-success/90" onClick={() => handleAction(selected.id, "aprovada")}>
                  <CheckCircle className="h-4 w-4 mr-2" />Aprovar
                </Button>
                <Button className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleAction(selected.id, "rejeitada")}>
                  <XCircle className="h-4 w-4 mr-2" />Rejeitar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoordinatorSubmissions;
