import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Eye, FileText, Download } from "lucide-react";

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
    setSubmissions((subs) =>
      subs.map((s) => (s.id === id ? { ...s, status } : s)),
    );
    setSelected(null);
    setFeedback("");
  };

  const statusBadges: Record<Submission["status"], string> = {
    pendente: "bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-0 font-bold uppercase text-[10px]",
    aprovada: "bg-green-500 text-white hover:bg-green-600 border-0 font-bold uppercase text-[10px]",
    rejeitada: "bg-red-500 text-white hover:bg-red-600 border-0 font-bold uppercase text-[10px]",
  };

  const categoryBadges: Record<string, string> = {
    Pesquisa: "bg-blue-600/10 text-blue-600 hover:bg-blue-600/20 border-0 font-bold text-[11px]",
    Extensão: "bg-purple-600/10 text-purple-600 hover:bg-purple-600/20 border-0 font-bold text-[11px]",
    Ensino: "bg-cyan-600/10 text-cyan-600 hover:bg-cyan-600/20 border-0 font-bold text-[11px]",
    Cultural: "bg-pink-600/10 text-pink-600 hover:bg-pink-600/20 border-0 font-bold text-[11px]",
  };

  const pendentes = submissions.filter((s) => s.status === "pendente");
  const historico = submissions.filter((s) => s.status !== "pendente");

  return (
    <div className="overflow-hidden flex flex-col p-8 space-y-6 bg-slate-50">
      <div className="flex justify-between items-start flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Submissão de Atividades
          </h1>
          <p className="text-lg text-slate-500">
            Avalie as atividades submetidas pelos alunos
          </p>
        </div>
      </div>

      {/* PENDENTES SECTION */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 p-6">
          <CardTitle className="text-lg font-bold text-slate-800">
            Pendentes ({pendentes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px]">Aluno</TableHead>
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px]">Atividade</TableHead>
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px] hidden md:table-cell">Categoria</TableHead>
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px]">Horas</TableHead>
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendentes.map((sub) => (
                <TableRow key={sub.id} className="border-slate-50 hover:bg-slate-50/30 transition-colors">
                  <TableCell className="px-6 py-4 font-bold text-slate-700">{sub.aluno}</TableCell>
                  <TableCell className="px-6 py-4 text-slate-600">{sub.titulo}</TableCell>
                  <TableCell className="px-6 py-4 hidden md:table-cell">
                    <Badge className={categoryBadges[sub.categoria] || "bg-slate-100 text-slate-600"}>
                      {sub.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium text-slate-600">{sub.horas}h</TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 hover:bg-slate-100" onClick={() => setSelected(sub)}>
                        <Eye className="h-4 w-4 text-slate-600" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 hover:bg-green-50 hover:border-green-200 group" onClick={() => handleAction(sub.id, "aprovada")}>
                        <CheckCircle className="h-4 w-4 text-green-600 group-hover:scale-110 transition-transform" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 hover:bg-red-50 hover:border-red-200 group" onClick={() => handleAction(sub.id, "rejeitada")}>
                        <XCircle className="h-4 w-4 text-red-600 group-hover:scale-110 transition-transform" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pendentes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-400 py-12 font-medium">
                    Nenhuma solicitação pendente 🎉
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* HISTÓRICO SECTION */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 p-6">
          <CardTitle className="text-lg font-bold text-slate-800">Histórico</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px]">Aluno</TableHead>
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px]">Atividade</TableHead>
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px]">Horas</TableHead>
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historico.map((sub) => (
                <TableRow key={sub.id} className="border-slate-50">
                  <TableCell className="px-6 py-4 font-bold text-slate-700">{sub.aluno}</TableCell>
                  <TableCell className="px-6 py-4 text-slate-600">{sub.titulo}</TableCell>
                  <TableCell className="px-6 py-4 text-slate-600 font-medium">{sub.horas}h</TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge className={statusBadges[sub.status]}>
                      {sub.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL - Padronizado com sombras e cantos arredondados */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col overflow-hidden rounded-3xl border-0 shadow-2xl p-0">
          <DialogHeader className="p-6 border-b border-slate-100">
            <DialogTitle className="text-xl font-bold text-slate-800">Análise de Solicitação</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 flex-1 overflow-hidden">
              {/* PREVIEW */}
              <div className="flex flex-col space-y-4 bg-slate-50 p-6 border-r border-slate-100 overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    {selected.arquivo}
                  </span>
                  <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs h-9 bg-white shadow-sm">
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Baixar Arquivo
                  </Button>
                </div>
                <div className="flex-1 border-2 border-slate-200 border-dashed rounded-2xl overflow-hidden flex items-center justify-center bg-white shadow-inner relative">
                   <iframe src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" className="w-full h-full border-0" />
                </div>
              </div>

              {/* INFO */}
              <div className="flex flex-col space-y-6 p-8 overflow-y-auto bg-white">
                <div className="grid grid-cols-2 gap-6 p-6 rounded-2xl bg-slate-50/50 border border-slate-100 shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aluno</span>
                    <p className="font-bold text-slate-800">{selected.aluno}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Categoria</span>
                    <div>
                      <Badge className={categoryBadges[selected.categoria] || "bg-slate-100"}>
                        {selected.categoria}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Horas Solicitadas</span>
                    <p className="font-black text-blue-600 text-lg">{selected.horas}h</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Data de Submissão</span>
                    <p className="font-bold text-slate-800 text-sm">{selected.data}</p>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Descrição do Aluno</span>
                  <p className="text-sm text-slate-600 mt-2 leading-relaxed italic bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
                    "{selected.descricao}"
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="feedback" className="text-xs font-bold text-slate-800">Feedback para o Aluno (opcional)</Label>
                  <Textarea id="feedback" value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Ex: Certificado incompleto ou horas aprovadas..." className="rounded-xl border-slate-200 focus:ring-blue-500 min-h-[100px]" />
                </div>

                <div className="flex gap-4 pt-4 mt-auto">
                  <Button className="flex-1 bg-red-500 text-white hover:bg-red-600 rounded-xl h-12 font-bold shadow-lg shadow-red-500/10" onClick={() => handleAction(selected.id, "rejeitada")}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button className="flex-1 bg-green-500 text-white hover:bg-green-600 rounded-xl h-12 font-bold shadow-lg shadow-green-500/10" onClick={() => handleAction(selected.id, "aprovada")}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar Horas
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoordinatorSubmissions;