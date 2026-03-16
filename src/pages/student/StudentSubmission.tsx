import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, CheckCircle2, XCircle, FileText, 
  ChevronRight, RefreshCcw, Search, Filter 
} from "lucide-react";

// Tipagem para facilitar o entendimento
type Status = "aprovado" | "pendente" | "rejeitado";

interface Atividade {
  id: string;
  titulo: string;
  categoria: string;
  horas: number;
  data: string;
  status: Status;
  feedback?: string;
  arquivoURL: string;
}

const atividadesIniciais: Atividade[] = [
  {
    id: "1",
    titulo: "Curso de React Advanced",
    categoria: "Ensino",
    horas: 40,
    data: "12/02/2024",
    status: "aprovado",
    arquivoURL: "#",
  },
  {
    id: "2",
    titulo: "Palestra: Futuro da IA",
    categoria: "Cultural",
    horas: 5,
    data: "10/02/2024",
    status: "rejeitado",
    feedback: "O certificado não contém a carga horária explícita. Por favor, envie o documento com o verso ou a ementa.",
    arquivoURL: "#",
  },
  {
    id: "3",
    titulo: "Monitoria Algoritmos I",
    categoria: "Ensino",
    horas: 60,
    data: "05/02/2024",
    status: "pendente",
    arquivoURL: "#",
  },
];

const StatusBadge = ({ status }: { status: Status }) => {
  const configs = {
    aprovado: { label: "Aprovado", class: "bg-emerald-50 text-[#00B67A] border-emerald-100", icon: CheckCircle2 },
    pendente: { label: "Pendente", class: "bg-orange-50 text-[#FF8A00] border-orange-100", icon: Clock },
    rejeitado: { label: "Rejeitado", class: "bg-red-50 text-red-500 border-red-100", icon: XCircle },
  };

  const { label, class: className, icon: Icon } = configs[status];

  return (
    <Badge className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 shadow-none font-semibold text-[10px] uppercase tracking-wider ${className}`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

const StudentHistory = () => {
  const [atividades] = useState<Atividade[]>(atividadesIniciais);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Minhas Atividades
          </h1>
          <p className="text-sm text-slate-500 mt-1">Histórico completo e status de validação</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
            <Search className="h-4 w-4 text-slate-500" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl border-slate-200">
            <Filter className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
      </div>

      {/* Lista de Atividades */}
      <div className="space-y-4">
        {atividades.map((atv) => (
          <Card key={atv.id} className="border-none shadow-sm bg-white rounded-2xl overflow-hidden hover:ring-1 hover:ring-slate-200 transition-all">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col gap-4">
                
                {/* Linha Superior: Categoria e Status */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{atv.categoria}</span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">{atv.titulo}</h3>
                  </div>
                  <StatusBadge status={atv.status} />
                </div>

                {/* Detalhes: Horas e Data */}
                <div className="flex items-center gap-6 text-sm text-slate-500 border-y border-slate-50 py-3">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-900 font-bold">{atv.horas}h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 uppercase text-[10px] font-bold">Enviado em:</span>
                    <span className="font-medium">{atv.data}</span>
                  </div>
                </div>

                {/* Feedback do Coordenador (Se houver) */}
                {atv.feedback && (
                  <div className="bg-red-50/50 p-4 rounded-xl border border-red-100/50">
                    <p className="text-xs font-bold text-red-600 uppercase mb-1 flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> Feedback do Coordenador
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed italic">"{atv.feedback}"</p>
                  </div>
                )}

                {/* Ações */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <a 
                    href={atv.arquivoURL} 
                    className="flex items-center gap-2 text-sm font-bold text-[#0066FF] hover:underline"
                  >
                    <FileText className="h-4 w-4" />
                    Visualizar Certificado
                  </a>

                  {atv.status === "rejeitado" && (
                    <Button className="bg-[#0066FF] hover:bg-blue-700 text-white rounded-xl h-10 font-bold gap-2 px-6">
                      <RefreshCcw className="h-4 w-4" />
                      Refazer e Reenviar
                    </Button>
                  )}
                  
                  {atv.status === "aprovado" && (
                     <div className="h-10 px-4 flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl text-xs font-bold">
                        <CheckCircle2 className="h-4 w-4" /> Validado
                     </div>
                  )}
                </div>

              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentHistory;