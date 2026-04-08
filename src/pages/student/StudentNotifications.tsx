import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Bell,
  Trash2,
  Pin,
  Mail,
  MailOpen,
  CheckCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useCourse } from "@/contexts/CourseContext";
import { useAuth } from "@/contexts/AuthContext";
import { submissaoService, SubmissaoResponse } from "@/services/aluno/SubmissaoService";
import { api } from "@/lib/api";

// ─── Tipos ───────────────────────────────────────────────────────────────────

type NotifStatus = "aprovada" | "rejeitada" | "pendente";

interface Notificacao {
  id: string;
  submissaoId: number;
  titulo: string;
  status: NotifStatus;
  feedback: string;
  data: string;
  lida: boolean;
  pinned: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const statusConfig: Record<
  NotifStatus,
  { icon: React.ElementType; color: string; bg: string; label: string }
> = {
  aprovada: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Aprovada",
  },
  rejeitada: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    label: "Rejeitada",
  },
  pendente: {
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Em Análise",
  },
};

function mapStatus(s: SubmissaoResponse["status"]): NotifStatus {
  if (s === "APROVADA") return "aprovada";
  if (s === "REPROVADA") return "rejeitada";
  return "pendente";
}

function feedbackPorStatus(s: SubmissaoResponse): string {
  if (s.status === "APROVADA") {
    return s.feedback
      ? `Aprovada pelo coordenador: ${s.feedback}`
      : "Sua atividade foi aprovada e as horas foram computadas.";
  }
  if (s.status === "REPROVADA") {
    return s.feedback
      ? `Motivo da recusa: ${s.feedback}`
      : "Sua atividade foi reprovada. Entre em contato com o coordenador.";
  }
  return "Sua solicitação está na fila de análise do coordenador.";
}

/** Chave usada para persistir o estado lida/pinned no localStorage */
const STORAGE_KEY = "notif_state";

/** Chave usada para persistir IDs de notificações ocultadas pelo aluno */
const REMOVED_KEY = "notif_removed";

function carregarRemovidos(): Set<string> {
  try {
    const raw = localStorage.getItem(REMOVED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function salvarRemovidos(ids: Set<string>) {
  localStorage.setItem(REMOVED_KEY, JSON.stringify([...ids]));
}

function carregarEstado(): Record<string, { lida: boolean; pinned: boolean }> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function salvarEstado(state: Record<string, { lida: boolean; pinned: boolean }>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ─── Componente ──────────────────────────────────────────────────────────────

const StudentNotifications = () => {
  const { activeCourse } = useCourse();
  const { user } = useAuth();

  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [confirmRemoverId, setConfirmRemoverId] = useState<string | null>(null);
  const [removidos, setRemovidosState] = useState<Set<string>>(carregarRemovidos);

  // ── Busca submissões e monta notificações ─────────────────────────────────
  useEffect(() => {
    const carregar = async () => {
      setLoading(true);
      setErro(false);

      try {
        // Resolve alunoId (mesmo padrão do StudentDashboard)
        let alunoId: number | null = null;
        if ((user as any)?.alunoId) {
          alunoId = (user as any).alunoId as number;
        } else {
          try {
            const me = await api.get("/usuarios/me");
            const usuarioId: number = me.data.id;
            const alunoResp = await api.get("/alunos/me");
            alunoId = alunoResp.data.usuarioId;
          } catch {
            alunoId = null;
          }
        }

        const submissoes = await submissaoService.getMinhas(alunoId ?? -1);
        const estado = carregarEstado();

        const mapeadas: Notificacao[] = submissoes.map((s) => {
          const key = String(s.id);
          const salvo = estado[key] ?? { lida: false, pinned: false };
          return {
            id: key,
            submissaoId: s.id,
            titulo: s.titulo,
            status: mapStatus(s.status),
            feedback: feedbackPorStatus(s),
            data: s.dataSubmissao,
            lida: salvo.lida,
            pinned: salvo.pinned,
          };
        });

        // Filtra notificações que o aluno ocultou manualmente
        const removidosAtual = carregarRemovidos();
        const mapeadasFiltradas = mapeadas.filter((n) => !removidosAtual.has(n.id));

        // Ordena: pinned primeiro, depois por data mais recente
        mapeadas.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return new Date(b.data).getTime() - new Date(a.data).getTime();
        });

        setNotificacoes(mapeadasFiltradas);
      } catch {
        setErro(true);
      } finally {
        setLoading(false);
      }
    };

    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── Persistência de estado (lida / pinned) ────────────────────────────────

  const atualizarEstado = (updated: Notificacao[]) => {
    const estado: Record<string, { lida: boolean; pinned: boolean }> = {};
    updated.forEach((n) => {
      estado[n.id] = { lida: n.lida, pinned: n.pinned };
    });
    salvarEstado(estado);
    setNotificacoes(updated);
  };

  const toggleRead = (id: string) => {
    atualizarEstado(
      notificacoes.map((n) => (n.id === id ? { ...n, lida: !n.lida } : n))
    );
  };

  const togglePin = (id: string) => {
    const updated = notificacoes
      .map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
      .sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      });
    atualizarEstado(updated);
  };

  const remover = (id: string) => {
    // Persiste o ID como oculto para não reaparecer ao recarregar
    const novosRemovidos = new Set(removidos);
    novosRemovidos.add(id);
    salvarRemovidos(novosRemovidos);
    setRemovidosState(novosRemovidos);
    atualizarEstado(notificacoes.filter((n) => n.id !== id));
  };

  const unreadCount = notificacoes.filter((n) => !n.lida).length;

  const toggleAllRead = () => {
    const marcarComoLida = unreadCount > 0;
    atualizarEstado(
      notificacoes.map((n) => ({ ...n, lida: marcarComoLida }))
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full p-4 sm:p-5 lg:p-6 space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Notificações
          </h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Atualizações das suas atividades no curso de{" "}
            <strong className="text-[#0066FF]">{activeCourse.name}</strong>
          </p>
        </div>

        {notificacoes.length > 0 && (
          <button
            onClick={toggleAllRead}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              unreadCount > 0
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-blue-600"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600 focus:ring-slate-200"
            }`}
          >
            {unreadCount > 0 ? (
              <>
                <CheckCheck className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Marcar todas como lidas</span>
                <span className="sm:hidden">Lidas ({unreadCount})</span>
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline">Marcar como não lidas</span>
                <span className="sm:hidden">Não lidas</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Estado: carregando */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
        </div>
      )}

      {/* Estado: erro */}
      {!loading && erro && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500" />
          <p>
            Não foi possível carregar as notificações. Verifique sua conexão e
            tente novamente.
          </p>
        </div>
      )}

      {/* Estado: vazio */}
      {!loading && !erro && notificacoes.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p className="font-medium">Nenhuma notificação por enquanto.</p>
          <p className="text-xs mt-1 text-slate-400">
            As atualizações das suas atividades aparecerão aqui.
          </p>
        </div>
      )}

      {/* Lista de notificações */}
      {!loading && !erro && (
        <div className="space-y-3 sm:space-y-4">
          {notificacoes.map((notif) => {
            const config = statusConfig[notif.status];
            const Icon = config.icon;

            return (
              <Card
                key={notif.id}
                className={`relative border transition-colors group ${
                  notif.pinned
                    ? "border-orange-200 bg-orange-50/10"
                    : !notif.lida
                    ? "bg-blue-50/40 border-blue-100"
                    : "bg-white border-slate-100"
                } shadow-sm rounded-xl overflow-hidden`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 sm:gap-4">

                    {/* Ícone de status */}
                    <div
                      className={`p-2 sm:p-2.5 rounded-full shrink-0 mt-0.5 ${config.bg}`}
                    >
                      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${config.color}`} />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0 pr-24 sm:pr-28">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-semibold text-base sm:text-lg leading-tight ${
                            notif.lida && !notif.pinned
                              ? "text-slate-700"
                              : "text-slate-900"
                          }`}
                        >
                          {notif.titulo}
                        </h3>
                        {notif.pinned && (
                          <Pin className="h-3.5 w-3.5 text-orange-500 fill-orange-500 shrink-0" />
                        )}
                        {!notif.lida && !notif.pinned && (
                          <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-1.5 sm:mt-0">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border-transparent ${config.bg} ${config.color}`}
                        >
                          {config.label.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(notif.data).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <p
                        className={`text-sm leading-relaxed mt-2 ${
                          notif.lida ? "text-slate-500" : "text-slate-600"
                        }`}
                      >
                        {notif.feedback}
                      </p>
                    </div>

                    {/* Ações */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 bg-white/50 sm:bg-transparent rounded-lg p-1 backdrop-blur-sm z-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => togglePin(notif.id)}
                        className={`h-8 w-8 rounded-full ${
                          notif.pinned
                            ? "text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                            : "text-slate-400 hover:text-orange-500 hover:bg-orange-50"
                        }`}
                        title={notif.pinned ? "Desfixar" : "Fixar no topo"}
                      >
                        <Pin
                          className={`h-4 w-4 ${notif.pinned ? "fill-current" : ""}`}
                        />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleRead(notif.id)}
                        className="h-8 w-8 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        title={notif.lida ? "Marcar como não lida" : "Marcar como lida"}
                      >
                        {notif.lida ? (
                          <Mail className="h-4 w-4" />
                        ) : (
                          <MailOpen className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setConfirmRemoverId(notif.id)}
                        className="h-8 w-8 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        title="Ocultar esta notificação (a atividade não será excluída)"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                  </div>

                  {/* Confirmação inline de remoção */}
                  {confirmRemoverId === notif.id && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-sm">
                      <p className="text-slate-600 text-xs">
                        Ocultar esta notificação?{" "}
                        <span className="text-slate-400">(a atividade permanece no sistema)</span>
                      </p>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setConfirmRemoverId(null)}
                          className="px-3 py-1 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => { remover(notif.id); setConfirmRemoverId(null); }}
                          className="px-3 py-1 rounded-lg text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                          Ocultar
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentNotifications;