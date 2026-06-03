import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  History,
  Eye,
  CalendarDays,
  User,
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  Inbox,
  CheckCircle2,
  Clock,
  XCircle,
  Paperclip,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  historicoService,
  HistoricoSubmissao,
  StatusSubmissao,
} from "@/services/aluno/HistoricoService";

type Filtro = "TODAS" | StatusSubmissao;

const FILTROS: { key: Filtro; label: string }[] = [
  { key: "TODAS", label: "Todas" },
  { key: "PENDENTE", label: "Pendentes" },
  { key: "APROVADA", label: "Aprovadas" },
  { key: "REPROVADA", label: "Reprovadas" },
];

const statusStyle: Record<StatusSubmissao, { bg: string; icon: ReactNode }> = {
  PENDENTE: {
    bg: "bg-orange-500/10 text-orange-600 border-0 font-bold uppercase text-[10px]",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  APROVADA: {
    bg: "bg-green-500 text-white border-0 font-bold uppercase text-[10px]",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  REPROVADA: {
    bg: "bg-red-500 text-white border-0 font-bold uppercase text-[10px]",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
};

function formatarData(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const StudentHistory = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<HistoricoSubmissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("TODAS");
  const [selecionada, setSelecionada] = useState<HistoricoSubmissao | null>(null);

  const carregar = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await historicoService.listar();
      setItems(data);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Falha ao carregar histórico.";
      setError(typeof msg === "string" ? msg : "Erro desconhecido");
      toast({
        title: "Erro ao carregar histórico",
        description: typeof msg === "string" ? msg : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtrados = useMemo(
    () => (filtro === "TODAS" ? items : items.filter((i) => i.status === filtro)),
    [items, filtro],
  );

  if (loading) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <Loader2 className="h-10 w-10 animate-spin text-[#0066FF] mb-4" />
          <p className="text-sm font-medium">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <Card className="border border-red-100 bg-red-50/40 rounded-3xl">
          <CardContent className="flex flex-col items-center text-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Não foi possível carregar
            </h3>
            <p className="text-sm text-slate-500 max-w-md mb-6">{error}</p>
            <Button
              onClick={carregar}
              className="bg-[#0066FF] hover:bg-blue-700 text-white rounded-xl h-11 px-6 font-bold"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 flex items-center gap-3">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0066FF]">
              <History className="h-6 w-6" />
            </span>
            Histórico de Submissões
          </h1>
          <p className="text-slate-500 mt-1 text-sm sm:text-base">
            Acompanhe todas as atividades que você já enviou
          </p>
        </div>
        <Button
          variant="outline"
          onClick={carregar}
          className="rounded-xl h-11 px-5 border-slate-200"
        >
          <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {FILTROS.map((f) => {
          const active = f.key === filtro;
          return (
            <button
              key={f.key}
              onClick={() => setFiltro(f.key)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${
                active
                  ? "bg-[#0066FF] text-white shadow-md shadow-blue-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Lista de cards */}
      <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 p-5 sm:p-6">
          <CardTitle className="text-base font-bold text-slate-800">
            {filtro === "TODAS" ? "Todas" : filtro}{" "}
            <span className="text-slate-400 font-medium">({filtrados.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-slate-100">
          {filtrados.length === 0 ? (
            <div className="flex flex-col items-center text-center py-16 px-6 text-slate-500">
              <Inbox className="h-12 w-12 mb-3 opacity-40" />
              <p className="text-sm font-semibold text-slate-700 mb-1">
                Nenhuma submissão encontrada
              </p>
              <p className="text-xs text-slate-500 max-w-sm">
                Quando você enviar uma atividade, ela aparecerá aqui.
              </p>
            </div>
          ) : (
            filtrados.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelecionada(s)}
                className="w-full text-left p-5 hover:bg-slate-50/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 truncate">
                      {s.identificacao}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.tipo}</p>
                  </div>
                  <Badge
                    className={`${statusStyle[s.status].bg} inline-flex items-center gap-1 shrink-0`}
                  >
                    {statusStyle[s.status].icon} {s.status}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatarData(s.dataSubmissao)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <User className="h-3.5 w-3.5" />
                    {s.alunoNome ?? "—"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    {s.quantidadeRegistros}{" "}
                    {s.quantidadeRegistros === 1 ? "registro" : "registros"}
                  </span>
                </div>

                {s.observacao && (
                  <p className="mt-3 text-xs text-orange-700 bg-orange-50 border-l-2 border-orange-300 px-3 py-2 rounded">
                    {s.observacao}
                  </p>
                )}

                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-[#0066FF]">
                  <Eye className="h-3.5 w-3.5" />
                  Visualizar detalhes
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes */}
      <Dialog
        open={!!selecionada}
        onOpenChange={(open) => !open && setSelecionada(null)}
      >
        <DialogContent className="max-w-2xl rounded-3xl border-0 p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-slate-100">
            <DialogTitle className="text-xl font-bold text-slate-800">
              Detalhes da Submissão
            </DialogTitle>
          </DialogHeader>

          {selecionada && (
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 text-lg flex-1 pr-3">
                  {selecionada.identificacao}
                </h3>
                <Badge
                  className={`${statusStyle[selecionada.status].bg} inline-flex items-center gap-1`}
                >
                  {statusStyle[selecionada.status].icon} {selecionada.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: "Tipo", value: selecionada.tipo },
                  { label: "Data e Horário", value: formatarData(selecionada.dataSubmissao) },
                  { label: "Usuário Responsável", value: selecionada.alunoNome ?? "—" },
                  { label: "Curso", value: selecionada.cursoNome ?? "—" },
                  { label: "Registros Processados", value: String(selecionada.quantidadeRegistros) },
                  { label: "ID da Submissão", value: `#${selecionada.id}` },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-slate-50 border border-slate-100 p-4"
                  >
                    <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm font-semibold text-slate-800 break-words">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              {selecionada.observacao && (
                <div className="rounded-2xl bg-orange-50 border border-orange-100 p-4">
                  <p className="text-[10px] font-bold uppercase text-orange-600 tracking-wide mb-1">
                    Observação
                  </p>
                  <p className="text-sm text-orange-800">{selecionada.observacao}</p>
                </div>
              )}

              {selecionada.certificados && selecionada.certificados.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide mb-2">
                    Certificados anexados
                  </p>
                  <div className="space-y-2">
                    {selecionada.certificados.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center shrink-0">
                          <Paperclip className="h-4 w-4 text-[#0066FF]" />
                        </div>
                        <span className="text-sm font-semibold text-slate-700 truncate flex-1">
                          {c.nomeArquivo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentHistory;