import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Eye, FileText, Download, Pencil, MessageSquare, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Importamos a interface correta que definimos no service
import { certificadoService, SubmissaoResponse } from "@/services/coordenador/CertificadoService";

const CoordinatorSubmissions = () => {
  const [submissions, setSubmissions] = useState<SubmissaoResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selected, setSelected] = useState<SubmissaoResponse | null>(null);
  const [feedback, setFeedback] = useState("");
  const [confirmRejectSub, setConfirmRejectSub] = useState<SubmissaoResponse | null>(null);

  const { toast } = useToast();

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await certificadoService.getAll();
      setSubmissions(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar",
        description: "Falha ao buscar as submissões.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Ajustado o tipo para SubmissaoResponse
  const openModal = (sub: SubmissaoResponse) => {
    setSelected(sub);
    setFeedback(sub.feedback || "");
  };

  const handleAction = async (id: number, status: "APROVADA" | "REPROVADA") => {
    try {
      if (status === "APROVADA") {
        await certificadoService.aprovar(id); // Removido feedback se o service for Patch simples
        toast({ title: "Atividade aprovada com sucesso!" });
      } else {
        await certificadoService.rejeitar(id);
        toast({ title: "Atividade reprovada!" });
      }
      
      setSelected(null);
      setConfirmRejectSub(null);
      setFeedback("");
      loadData();
      
    } catch (error: any) {
      toast({
        title: "Erro na avaliação",
        description: "Não foi possível processar a ação.",
        variant: "destructive"
      });
    }
  };

  // 1. AJUSTE NOS STATUS: Devem ser iguais ao Enum do Java (APROVADA/REPROVADA)
  const statusBadges: Record<string, string> = {
    PENDENTE: "bg-orange-500/10 text-orange-600 border-0 font-bold uppercase text-[10px]",
    APROVADA: "bg-green-500 text-white border-0 font-bold uppercase text-[10px]",
    REPROVADA: "bg-red-500 text-white border-0 font-bold uppercase text-[10px]",
  };

  const pendentes = submissions.filter((s) => s.status === "PENDENTE");
  const historico = submissions.filter((s) => s.status !== "PENDENTE");

  // Função auxiliar para pegar a URL do primeiro certificado
  const getArquivoUrl = (sub: SubmissaoResponse) => {
    return sub.certificados && sub.certificados.length > 0 
      ? sub.certificados[0].urlArquivo 
      : "";
  };

  return (
    <div className="flex flex-col p-8 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Gerenciamento de Atividades</h1>
        <p className="text-lg text-slate-500">Avaliação e histórico de devolutivas</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
        </div>
      ) : (
        <>
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
                      <TableCell className="px-6 py-4 font-bold text-slate-700">{sub.alunoNome}</TableCell>
                      <TableCell className="px-6 py-4 text-slate-600">{sub.titulo}</TableCell>
                      <TableCell className="px-6 py-4 font-medium">{sub.horas}h</TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Button variant="outline" size="icon" onClick={() => openModal(sub)} className="rounded-xl"><Eye className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* HISTÓRICO */}
          <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-50 p-6">
              <CardTitle className="text-lg font-bold text-slate-800">Histórico</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {historico.map((sub) => (
                    <TableRow key={sub.id} className="border-slate-50 hover:bg-slate-50/20">
                      <TableCell className="px-6 py-4">
                        <p className="font-bold text-slate-700">{sub.alunoNome}</p>
                        <p className="text-sm text-slate-500">{sub.titulo}</p>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge className={statusBadges[sub.status]}>{sub.status}</Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                         <Button variant="outline" size="icon" onClick={() => openModal(sub)} className="rounded-xl"><Pencil className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* MODAL DE ANÁLISE */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-5xl h-[85vh] flex flex-col overflow-hidden rounded-3xl border-0 p-0">
          <DialogHeader className="p-6 border-b border-slate-100">
            <DialogTitle className="text-xl font-bold text-slate-800">Análise de Solicitação</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 flex-1 overflow-hidden">
              <div className="flex flex-col space-y-4 bg-slate-50 p-6 border-r border-slate-100 overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" /> Certificado
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl font-bold text-xs h-9 bg-white" 
                    onClick={() => window.open(getArquivoUrl(selected), '_blank')}
                  >
                    <Download className="h-3.5 w-3.5 mr-2" /> Abrir Original
                  </Button>
                </div>
                <div className="flex-1 border-2 border-slate-200 border-dashed rounded-2xl overflow-hidden bg-white shadow-inner">
                   {/* 2. AJUSTE DA URL DO PDF: Pegando do primeiro certificado */}
                   <iframe src={getArquivoUrl(selected)} className="w-full h-full border-0" title="PDF Viewer" />
                </div>
              </div>

              <div className="flex flex-col space-y-6 p-8 overflow-y-auto bg-white">
                <div className="grid grid-cols-2 gap-6 p-5 rounded-2xl bg-slate-50/50 border border-slate-100 shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Aluno</span>
                    <p className="font-bold text-slate-800">{selected.alunoNome}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Status</span>
                    <div className="mt-1"><Badge className={statusBadges[selected.status]}>{selected.status}</Badge></div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Atividade</span>
                    <p className="font-semibold text-sm text-slate-700 mt-1">{selected.titulo}</p>
                    <p className="text-xs text-slate-500 mt-1">{selected.descricao}</p>
                  </div>
                </div>

                <div className="space-y-3 flex-1">
                  <Label htmlFor="feedback" className="text-xs font-bold text-slate-800">Feedback / Devolutiva</Label>
                  <Textarea 
                    id="feedback" 
                    value={feedback} 
                    onChange={(e) => setFeedback(e.target.value)} 
                    placeholder="Escreva a razão da aprovação ou reprovação..." 
                    className="rounded-xl border-slate-200 min-h-[150px]" 
                  />
                </div>

                <div className="flex gap-4 pt-4 mt-auto">
                  <Button className="flex-1 bg-red-500 text-white hover:bg-red-600 rounded-xl h-12 font-bold" onClick={() => setConfirmRejectSub(selected)}>
                    <XCircle className="h-4 w-4 mr-2" /> Rejeitar
                  </Button>
                  <Button className="flex-1 bg-green-500 text-white hover:bg-green-600 rounded-xl h-12 font-bold" onClick={() => handleAction(selected.id, "APROVADA")}>
                    <CheckCircle className="h-4 w-4 mr-2" /> Aprovar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* MODAL DE CONFIRMAÇÃO DE REJEIÇÃO (SÓ EXEMPLO) */}
      <Dialog open={!!confirmRejectSub} onOpenChange={(open) => !open && setConfirmRejectSub(null)}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader><DialogTitle className="text-red-600 font-bold">Confirmar Reprovação</DialogTitle></DialogHeader>
          <p className="text-slate-600 text-sm">Deseja realmente reprovar a atividade?</p>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setConfirmRejectSub(null)}>Voltar</Button>
            <Button className="bg-red-600 text-white" onClick={() => confirmRejectSub && handleAction(confirmRejectSub.id, "REPROVADA")}>Sim, Reprovar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default CoordinatorSubmissions;