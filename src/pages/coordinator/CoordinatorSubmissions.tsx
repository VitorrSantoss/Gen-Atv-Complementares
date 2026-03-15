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
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Eye, FileText, Download, Pencil, MessageSquare } from "lucide-react";

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
  feedback?: string;
}

const initialSubmissions: Submission[] = [
  { id: "1", aluno: "João Santos", titulo: "Congresso de IA 2025", categoria: "Pesquisa", horas: 20, data: "2026-02-15", status: "pendente", arquivo: "certificado.pdf", descricao: "Participação no congresso nacional de inteligência artificial." },
  { id: "2", aluno: "Ana Oliveira", titulo: "Projeto Comunitário", categoria: "Extensão", horas: 40, data: "2026-01-20", status: "pendente", arquivo: "comprovante.jpg", descricao: "Voluntariado em projeto de inclusão digital." },
  { id: "3", aluno: "Carlos Lima", titulo: "Monitoria Cálculo I", categoria: "Ensino", horas: 30, data: "2026-03-01", status: "pendente", arquivo: "declaracao.pdf", descricao: "Monitoria durante o semestre 2025.2." },
  { id: "4", aluno: "Maria Fernandes", titulo: "Hackathon Tech", categoria: "Pesquisa", horas: 15, data: "2025-12-10", status: "aprovada", arquivo: "cert_hack.pdf", descricao: "Participação e premiação no hackathon.", feedback: "Documentação excelente e horas compatíveis com o edital." },
  { id: "5", aluno: "João Santos", titulo: "Palestra Design Thinking", categoria: "Cultural", horas: 4, data: "2026-02-28", status: "rejeitada", arquivo: "foto.jpg", descricao: "Palestra assistida na semana acadêmica.", feedback: "A foto enviada não comprova a carga horária total. Por favor, envie o certificado oficial." },
];

const CoordinatorSubmissions = () => {
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [confirmRejectSub, setConfirmRejectSub] = useState<Submission | null>(null);

  const openModal = (sub: Submission) => {
    setSelected(sub);
    setFeedback(sub.feedback || "");
  };

  const handleAction = (id: string, status: "aprovada" | "rejeitada") => {
    setSubmissions((subs) =>
      subs.map((s) => (s.id === id ? { ...s, status, feedback } : s)),
    );
    setSelected(null);
    setConfirmRejectSub(null);
    setFeedback("");
  };

  const statusBadges: Record<Submission["status"], string> = {
    pendente: "bg-orange-500/10 text-orange-600 border-0 font-bold uppercase text-[10px]",
    aprovada: "bg-green-500 text-white border-0 font-bold uppercase text-[10px]",
    rejeitada: "bg-red-500 text-white border-0 font-bold uppercase text-[10px]",
  };

  const categoryBadges: Record<string, string> = {
    Pesquisa: "bg-blue-600/10 text-blue-600 border-0 font-bold text-[11px]",
    Extensão: "bg-purple-600/10 text-purple-600 border-0 font-bold text-[11px]",
    Ensino: "bg-cyan-600/10 text-cyan-600 border-0 font-bold text-[11px]",
    Cultural: "bg-pink-600/10 text-pink-600 border-0 font-bold text-[11px]",
  };

  const pendentes = submissions.filter((s) => s.status === "pendente");
  const historico = submissions.filter((s) => s.status !== "pendente");

  return (
    <div className="flex flex-col p-8 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Gerenciamento de Atividades</h1>
        <p className="text-lg text-slate-500">Avaliação e histórico de devolutivas</p>
      </div>

      {/* SEÇÃO PENDENTES (Mantida conforme solicitado anteriormente) */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 p-6">
          <CardTitle className="text-lg font-bold text-slate-800">Pendentes ({pendentes.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px]">Aluno</TableHead>
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px]">Atividade</TableHead>
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px]">Horas</TableHead>
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendentes.map((sub) => (
                <TableRow key={sub.id} className="border-slate-50 hover:bg-slate-50/30">
                  <TableCell className="px-6 py-4 font-bold text-slate-700">{sub.aluno}</TableCell>
                  <TableCell className="px-6 py-4 text-slate-600">{sub.titulo}</TableCell>
                  <TableCell className="px-6 py-4 font-medium">{sub.horas}h</TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="icon" onClick={() => openModal(sub)} className="rounded-xl"><Eye className="h-4 w-4" /></Button>
                      <Button variant="outline" size="icon" onClick={() => handleAction(sub.id, "aprovada")} className="rounded-xl border-green-200 hover:bg-green-50"><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                      <Button variant="outline" size="icon" onClick={() => setConfirmRejectSub(sub)} className="rounded-xl border-red-200 hover:bg-red-50"><XCircle className="h-4 w-4 text-red-600" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* SEÇÃO HISTÓRICO COM FEEDBACK VISÍVEL */}
      <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
        <CardHeader className="border-b border-slate-50 p-6">
          <CardTitle className="text-lg font-bold text-slate-800">Histórico de Devolutivas</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px]">Aluno / Atividade</TableHead>
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px]">Status</TableHead>
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px]">Horas</TableHead>
                <TableHead className="px-6 font-bold text-slate-400 uppercase text-[11px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historico.map((sub) => (
                <TableRow key={sub.id} className="border-slate-50 align-top hover:bg-slate-50/20">
                  <TableCell className="px-6 py-4">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-700">{sub.aluno}</p>
                      <p className="text-sm text-slate-500">{sub.titulo}</p>
                      {/* FEEDBACK DIRETO NA LINHA */}
                      {sub.feedback && (
                        <div className="mt-3 p-3 bg-slate-100/80 rounded-xl border-l-4 border-slate-300 relative group">
                          <div className="flex items-center gap-2 mb-1">
                            <MessageSquare className="h-3 w-3 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Devolutiva</span>
                          </div>
                          <p className="text-xs text-slate-600 italic leading-relaxed">
                            "{sub.feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge className={statusBadges[sub.status]}>{sub.status}</Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium text-slate-600">{sub.horas}h</TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200" onClick={() => openModal(sub)}>
                      <Pencil className="h-4 w-4 text-slate-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL DE ANÁLISE / EDIÇÃO */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col overflow-hidden rounded-3xl border-0 p-0">
          <DialogHeader className="p-6 border-b border-slate-100">
            <DialogTitle className="text-xl font-bold text-slate-800">
              {selected?.status === "pendente" ? "Análise de Solicitação" : "Revisar Devolutiva"}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 flex-1 overflow-hidden">
              <div className="flex flex-col space-y-4 bg-slate-50 p-6 border-r border-slate-100 overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" /> {selected.arquivo}
                  </span>
                  <Button variant="outline" size="sm" className="rounded-xl font-bold text-xs h-9 bg-white">
                    <Download className="h-3.5 w-3.5 mr-2" /> Baixar
                  </Button>
                </div>
                <div className="flex-1 border-2 border-slate-200 border-dashed rounded-2xl overflow-hidden bg-white shadow-inner">
                   <iframe src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" className="w-full h-full border-0" />
                </div>
              </div>

              <div className="flex flex-col space-y-6 p-8 overflow-y-auto bg-white">
                <div className="grid grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50/50 border border-slate-100 shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Aluno</span>
                    <p className="font-bold text-slate-800">{selected.aluno}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                    <div className="mt-1"><Badge className={statusBadges[selected.status]}>{selected.status}</Badge></div>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  <Label htmlFor="feedback" className="text-xs font-bold text-slate-800">Feedback / Devolutiva</Label>
                  <Textarea 
                    id="feedback" 
                    value={feedback} 
                    onChange={(e) => setFeedback(e.target.value)} 
                    placeholder="Escreva aqui a razão da aprovação ou reprovação..." 
                    className="rounded-xl border-slate-200 min-h-[150px]" 
                  />
                </div>

                <div className="flex gap-4 pt-4 mt-auto">
                  <Button className="flex-1 bg-red-500 text-white hover:bg-red-600 rounded-xl h-12 font-bold" onClick={() => setConfirmRejectSub(selected)}>
                    <XCircle className="h-4 w-4 mr-2" /> Rejeitar
                  </Button>
                  <Button className="flex-1 bg-green-500 text-white hover:bg-green-600 rounded-xl h-12 font-bold" onClick={() => handleAction(selected.id, "aprovada")}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Aprovar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CONFIRMAÇÃO DE REJEIÇÃO */}
      <Dialog open={!!confirmRejectSub} onOpenChange={(open) => !open && setConfirmRejectSub(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader><DialogTitle className="text-red-600 font-bold">Confirmar Reprovação</DialogTitle></DialogHeader>
          <p className="text-slate-600 text-sm">Deseja realmente reprovar a atividade de <strong>{confirmRejectSub?.aluno}</strong>? O feedback será enviado ao aluno.</p>
          <DialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirmRejectSub(null)} className="rounded-xl">Voltar</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700 rounded-xl" onClick={() => confirmRejectSub && handleAction(confirmRejectSub.id, "rejeitada")}>Sim, Reprovar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoordinatorSubmissions;