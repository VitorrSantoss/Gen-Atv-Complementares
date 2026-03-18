import { useState, useEffect } from "react"; // <-- Adicionado o useEffect aqui
import { createPortal } from "react-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCcw,
  AlertCircle,
  BookOpen,
  X,
  UploadCloud,
  Check,
  Eye,
  Calendar,
  Award
} from "lucide-react";

// --- Mock de Dados ---
const initialCourses = [
  { id: "1", name: "Engenharia de Software", meta: 200, aprovadas: 120, pendentes: 20, rejeitadas: 5 },
  { id: "2", name: "Administração", meta: 150, aprovadas: 45, pendentes: 10, rejeitadas: 2 },
];

const initialAtividades = [
  { id: "atv-1", courseId: "1", titulo: "Curso de React Advanced", categoria: "Ensino", horas: 40, data: "12/02/2026", status: "aprovado", feedback: "", arquivoURL: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", arquivoTipo: "pdf" },
  { id: "atv-2", courseId: "1", titulo: "Palestra: Futuro da IA", categoria: "Cultural", horas: 5, data: "10/02/2026", status: "rejeitado", feedback: "Carga horária não visível no certificado. Envie uma foto mais nítida.", arquivoURL: "#", arquivoTipo: "image" },
  { id: "atv-3", courseId: "1", titulo: "Monitoria Algoritmos I", categoria: "Ensino", horas: 60, data: "05/02/2026", status: "pendente", feedback: "", arquivoURL: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", arquivoTipo: "pdf" },
  { id: "atv-4", courseId: "2", titulo: "Workshop Gestão Financeira", categoria: "Extensão", horas: 15, data: "01/03/2026", status: "aprovado", feedback: "", arquivoURL: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf", arquivoTipo: "pdf" },
];

const StudentDashboard = () => {
  const [activeCourseId, setActiveCourseId] = useState(initialCourses[0].id);
  const [atividades, setAtividades] = useState(initialAtividades);
  
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [viewingActivity, setViewingActivity] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const activeCourse = initialCourses.find((c) => c.id === activeCourseId)!;
  const filteredAtividades = atividades.filter((a) => a.courseId === activeCourseId);
  const pct = Math.round((activeCourse.aprovadas / activeCourse.meta) * 100);

  // =======================================================================
  // NOVO: LÓGICA PARA TRAVAR O SCROLL DE FUNDO QUANDO UM MODAL ESTÁ ABERTO
  // =======================================================================
  useEffect(() => {
    // Se qualquer um dos modais estiver aberto...
    if (editingActivity || viewingActivity) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Função de limpeza de segurança: garante que o scroll volta se o componente for destruído
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [editingActivity, viewingActivity]); 
  // O useEffect roda sempre que essas duas variáveis mudam.


  const handleViewDetails = (atividade: any) => {
    setViewingActivity(atividade);
  };

  const handleRefazer = (atividade: any) => {
    setEditingActivity(atividade);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitEdit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const novoTitulo = formData.get("titulo") as string;
    const novaCategoria = formData.get("categoria") as string;
    const novasHoras = Number(formData.get("horas"));
    
    let novaURL = editingActivity.arquivoURL;
    let novoTipo = editingActivity.arquivoTipo;

    if (selectedFile) {
      novaURL = URL.createObjectURL(selectedFile);
      novoTipo = selectedFile.type.includes("pdf") ? "pdf" : "image";
    }

    setAtividades(prev => prev.map(atv => {
      if (atv.id === editingActivity.id) {
        return { 
          ...atv, 
          titulo: novoTitulo || atv.titulo,
          categoria: novaCategoria || atv.categoria,
          horas: novasHoras || atv.horas,
          arquivoURL: novaURL,
          arquivoTipo: novoTipo,
          status: "pendente",
          feedback: ""
        };
      }
      return atv;
    }));
    
    setEditingActivity(null);
    setSelectedFile(null);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-10 space-y-8 bg-[#F8FAFC] min-h-screen">
      
      {/* CABEÇALHO */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E293B] tracking-tight">Meu Painel</h1>
        <p className="text-sm md:text-base text-slate-500 mt-1 md:mt-1.5">Acompanhe suas atividades complementares</p>
      </div>

      {/* SELETOR DE CURSOS */}
      <div className="space-y-3">
        <h2 className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Meus Cursos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {initialCourses.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCourseId(c.id)}
              className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all text-left focus:outline-none focus:ring-2 focus:ring-[#0066FF]/50 focus:ring-offset-1 ${
                activeCourseId === c.id ? "border-[#0066FF] bg-blue-50/40 shadow-sm" : "border-transparent bg-white shadow-sm hover:border-slate-200"
              }`}
            >
              <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-lg md:rounded-xl flex items-center justify-center transition-colors ${activeCourseId === c.id ? "bg-[#0066FF] text-white" : "bg-slate-100 text-slate-400"}`}>
                <BookOpen className="h-5 w-5 md:h-6 md:w-6" />
              </div>
              <div className="min-w-0">
                <p className={`font-bold text-sm md:text-base truncate ${activeCourseId === c.id ? "text-[#0066FF]" : "text-slate-700"}`}>{c.name}</p>
                <p className="text-xs text-slate-500 mt-0.5"><span className={activeCourseId === c.id ? "font-semibold text-[#0066FF]" : ""}>{c.aprovadas}</span>/{c.meta}h</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* BARRA DE PROGRESSO */}
      <Card className="border-slate-100 shadow-sm bg-white rounded-2xl md:rounded-3xl overflow-hidden">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-6 md:mb-8">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-slate-900">{activeCourse.name}</h3>
              <p className="text-xs md:text-sm text-slate-500 font-medium uppercase tracking-tight mt-1">Meta: {activeCourse.meta} horas</p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-4xl md:text-5xl font-black text-[#0066FF] tracking-tighter leading-none">{pct}%</span>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase mt-1">concluído</p>
            </div>
          </div>
          <div className="h-3 md:h-4 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#0066FF] transition-all duration-1000 ease-out rounded-full" style={{ width: `${pct}%` }} />
          </div>
        </CardContent>
      </Card>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5">
        {[
          { label: "Aprovadas", val: activeCourse.aprovadas, color: "text-[#00B67A]", bg: "bg-[#F0FDF4]", icon: CheckCircle2 },
          { label: "Pendentes", val: activeCourse.pendentes, color: "text-[#FF8A00]", bg: "bg-[#FFF7ED]", icon: Clock },
          { label: "Rejeitadas", val: activeCourse.rejeitadas, color: "text-[#EF4444]", bg: "bg-[#FEF2F2]", icon: XCircle },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-100 shadow-sm rounded-2xl">
            <CardContent className="p-5 md:p-6 flex items-center gap-4 md:gap-5">
              <div className={`w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 md:h-7 md:w-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-slate-500 mb-0.5">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-bold text-slate-900 leading-none">{stat.val}<span className="text-base md:text-xl font-semibold text-slate-400 ml-0.5">h</span></p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* LISTA DE ATIVIDADES */}
      <div className="space-y-4 md:space-y-5 pt-2">
        <h2 className="text-lg md:text-xl font-bold text-slate-800">Atividades Recentes</h2>
        <div className="grid grid-cols-1 gap-3 md:gap-4">
          {filteredAtividades.map((atv) => (
            <Card key={atv.id} className={`border shadow-sm overflow-hidden transition-colors rounded-xl md:rounded-2xl ${atv.status === "rejeitado" ? "border-red-100" : "border-slate-100 hover:border-slate-200"}`}>
              <CardContent className="p-0">
                <div className="p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="mt-0.5 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                      <FileText className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <h4 className="font-bold text-slate-900 text-sm md:text-base leading-tight truncate">{atv.titulo}</h4>
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1.5 md:mt-2">
                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">{atv.categoria}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-xs md:text-sm font-semibold text-slate-600">{atv.horas} horas</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 border-t border-slate-50 sm:border-none pt-3 sm:pt-0 w-full sm:w-auto">
                    <div className={`text-[10px] md:text-xs font-bold px-3 py-1 md:py-1.5 rounded-full uppercase tracking-wide border ${
                        atv.status === "aprovado" ? "text-emerald-600 bg-emerald-50 border-emerald-100" : atv.status === "rejeitado" ? "text-red-600 bg-red-50 border-red-100" : "text-amber-600 bg-amber-50 border-amber-100"
                      }`}
                    >
                      {atv.status === "aprovado" ? "Validado" : atv.status === "rejeitado" ? "Recusado" : "Em Análise"}
                    </div>

                    {atv.status === "rejeitado" ? (
                      <Button size="sm" onClick={() => handleRefazer(atv)} className="bg-[#0066FF] hover:bg-blue-700 text-white rounded-lg h-8 md:h-9 font-semibold gap-1.5 px-3 md:px-4 shadow-sm">
                        <RefreshCcw className="h-3.5 w-3.5" />
                        <span className="text-xs md:text-sm">Refazer</span>
                      </Button>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => handleViewDetails(atv)} className="border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 h-8 md:h-9 rounded-lg font-semibold text-xs md:text-sm px-3 md:px-4 gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        Ver Doc
                      </Button>
                    )}
                  </div>
                </div>

                {atv.status === "rejeitado" && atv.feedback && (
                  <div className="bg-red-50/80 px-4 md:px-5 py-3 border-t border-red-100 flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs md:text-sm text-red-700">
                      <strong className="font-semibold italic">Motivo da Recusa:</strong> <span className="italic">{atv.feedback}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. MODAL DE VISUALIZAÇÃO                                       */}
      {/* ============================================================== */}
      {viewingActivity && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            <div className="px-5 md:px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base md:text-lg leading-tight truncate max-w-[200px] sm:max-w-md">
                    {viewingActivity.titulo}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Detalhes da Submissão</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setViewingActivity(null)} className="h-8 w-8 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1"><Award className="h-3 w-3"/> Categoria</p>
                  <p className="text-sm font-semibold text-slate-800">{viewingActivity.categoria}</p>
                </div>
                <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1"><Clock className="h-3 w-3"/> Horas</p>
                  <p className="text-sm font-semibold text-slate-800">{viewingActivity.horas}h validadas</p>
                </div>
                <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1"><Calendar className="h-3 w-3"/> Data</p>
                  <p className="text-sm font-semibold text-slate-800">{viewingActivity.data}</p>
                </div>
                <div className="bg-white p-3 border border-slate-100 rounded-xl shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">Status</p>
                  <div className={`inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
                      viewingActivity.status === "aprovado" ? "text-emerald-600 bg-emerald-50 border-emerald-100" : viewingActivity.status === "rejeitado" ? "text-red-600 bg-red-50 border-red-100" : "text-amber-600 bg-amber-50 border-amber-100"
                    }`}
                  >
                    {viewingActivity.status === "aprovado" ? "Validado" : viewingActivity.status === "rejeitado" ? "Recusado" : "Em Análise"}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-slate-700">Comprovante Anexado</h4>
                  {viewingActivity.arquivoURL !== "#" && (
                    <a href={viewingActivity.arquivoURL} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#0066FF] hover:underline">
                      Abrir em nova aba
                    </a>
                  )}
                </div>
                
                <div className="bg-slate-200/50 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center relative h-64 sm:h-80 md:h-[400px]">
                  {viewingActivity.arquivoURL === "#" ? (
                    <div className="text-center p-6 text-slate-400">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-30" />
                      <p className="text-sm font-medium">Nenhum documento disponível.</p>
                    </div>
                  ) : viewingActivity.arquivoTipo === "image" ? (
                    <img 
                      src={viewingActivity.arquivoURL} 
                      alt="Comprovante" 
                      className="w-full h-full object-contain p-2" 
                    />
                  ) : (
                    <iframe 
                      src={`${viewingActivity.arquivoURL}#view=FitH`} 
                      className="w-full h-full bg-white object-contain"
                      title="Preview do Documento"
                    />
                  )}
                </div>

              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-white flex justify-end shrink-0">
              <Button variant="outline" onClick={() => setViewingActivity(null)} className="h-10 px-6 font-semibold">
                Fechar
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* 2. MODAL DE EDIÇÃO                                             */}
      {/* ============================================================== */}
      {editingActivity && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-8">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Corrigir Submissão</h3>
                <p className="text-xs text-slate-500 mt-1">Reenvie os dados corrigidos para avaliação.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setEditingActivity(null)} className="h-8 w-8 text-slate-400 hover:text-slate-700 bg-white rounded-full border shadow-sm">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmitEdit} className="p-6 space-y-5">
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 leading-snug">
                  <span className="font-bold block mb-0.5">Motivo da recusa anterior:</span>
                  {editingActivity.feedback}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Título da Atividade</label>
                  <input type="text" name="titulo" defaultValue={editingActivity.titulo} className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]" required />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Categoria</label>
                    <select name="categoria" defaultValue={editingActivity.categoria} className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]">
                      <option value="Ensino">Ensino</option>
                      <option value="Pesquisa">Pesquisa</option>
                      <option value="Extensão">Extensão</option>
                      <option value="Cultural">Cultural</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Carga Horária (h)</label>
                    <input type="number" name="horas" defaultValue={editingActivity.horas} min="1" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF]" required />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Novo Comprovante</label>
                  <label className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer group relative ${selectedFile ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 hover:bg-slate-50 hover:border-blue-300'}`}>
                    <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} />
                    {selectedFile ? (
                      <>
                        <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><Check className="h-5 w-5" /></div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-emerald-700 truncate max-w-[200px]">{selectedFile.name}</p>
                          <p className="text-xs text-emerald-600/70 mt-1">Pronto para envio</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="h-10 w-10 bg-blue-50 text-[#0066FF] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><UploadCloud className="h-5 w-5" /></div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-slate-700">Clique para reenviar foto/PDF</p>
                          <p className="text-xs text-slate-400 mt-1">Formatos suportados: JPG, PNG ou PDF</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setEditingActivity(null)} className="text-slate-500 font-semibold h-10">Cancelar</Button>
                <Button type="submit" className="bg-[#0066FF] hover:bg-blue-700 text-white font-bold h-10 px-6 rounded-lg shadow-md shadow-blue-500/20">Reenviar Avaliação</Button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default StudentDashboard;