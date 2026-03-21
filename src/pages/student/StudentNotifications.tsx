import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Clock, Bell, Trash2, Pin, Mail, MailOpen, CheckCheck } from "lucide-react";

// MODIFICAÇÃO 1: Importando o hook
import { useCourse } from "@/contexts/CourseContext";

const initialNotifications = [
  { id: "1", titulo: "Congresso de IA 2025", status: "aprovada", feedback: "Certificado válido. 20 horas computadas.", data: "2026-03-08T10:00:00", lida: false, pinned: false },
  { id: "2", titulo: "Palestra Design Thinking", status: "rejeitada", feedback: "O certificado não possui carga horária legível.", data: "2026-03-07T14:30:00", lida: false, pinned: true },
  { id: "3", titulo: "Monitoria Cálculo I", status: "pendente", feedback: "Sua solicitação está na fila de análise.", data: "2026-03-05T09:15:00", lida: true, pinned: false },
];

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  aprovada: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", label: "Aprovada" },
  rejeitada: { icon: XCircle, color: "text-red-600", bg: "bg-red-50", label: "Rejeitada" },
  pendente: { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", label: "Em Análise" },
};

const StudentNotifications = () => {
  // MODIFICAÇÃO 2: Puxando o curso ativo do contexto
  const { activeCourse } = useCourse();

  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = notifications.filter(n => !n.lida).length;

  // 1. Alternar Todas (Lidas <-> Não Lidas)
  const toggleAllStatus = () => {
    // Se existe alguma não lida, o objetivo é marcar todas como lidas (true).
    // Se TODAS já estão lidas, o objetivo é desfazer e marcar todas como não lidas (false).
    const isMarkingAsRead = unreadCount > 0;
    setNotifications(prev => prev.map(n => ({ ...n, lida: isMarkingAsRead })));
  };

  const toggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, lida: !n.lida } : n));
  };

  const togglePin = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const sortedNotifications = [...notifications].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.data).getTime() - new Date(a.data).getTime();
  });

  const simulateNewPushNotification = () => {
    const newNotif = {
      id: Math.random().toString(),
      titulo: "Nova Avaliação " + Math.floor(Math.random() * 100),
      status: "aprovada",
      feedback: "Horas computadas automaticamente pelo sistema.",
      data: new Date().toISOString(),
      lida: false,
      pinned: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 md:py-8 space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Notificações</h1>
          {/*  MODIFICAÇÃO 3: Exibindo o nome do curso para o aluno */}
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Gerencie os alertas do curso de <strong className="text-[#0066FF]">{activeCourse.name}</strong>
          </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="outline" size="sm" onClick={simulateNewPushNotification} className="hidden md:flex text-xs h-8">
            + Simular Push
          </Button>
          
          {/* BOTÃO INTELIGENTE: Marcar Todas */}
          {notifications.length > 0 && (
            <button
              onClick={toggleAllStatus}
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
      </div>

      {/* LISTA DE NOTIFICAÇÕES (Mantida igual) */}
      <div className="space-y-3 sm:space-y-4">
        {sortedNotifications.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Bell className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Você não tem nenhuma notificação.</p>
          </div>
        ) : (
          sortedNotifications.map((notif) => {
            const config = statusConfig[notif.status] || statusConfig.pendente;
            const Icon = config.icon;
            
            return (
              <Card 
                key={notif.id} 
                className={`relative border transition-colors group ${
                  notif.pinned ? "border-orange-200 bg-orange-50/10" : 
                  !notif.lida ? "bg-blue-50/40 border-blue-100" : "bg-white border-slate-100"
                } shadow-sm rounded-xl overflow-hidden`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    
                    <div className={`p-2 sm:p-2.5 rounded-full shrink-0 mt-0.5 ${config.bg}`}>
                      <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${config.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-12 sm:pr-24">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold text-base sm:text-lg leading-tight ${notif.lida && !notif.pinned ? 'text-slate-700' : 'text-slate-900'}`}>
                          {notif.titulo}
                        </h3>
                        {notif.pinned && <Pin className="h-3.5 w-3.5 text-orange-500 fill-orange-500 shrink-0" />}
                        {!notif.lida && !notif.pinned && <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0"></span>}
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1.5 sm:mt-0">
                        <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.color} border-${config.color.split('-')[1]}-200 bg-white`}>
                          {config.label.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-slate-400 font-medium">
                          {new Date(notif.data).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      {notif.feedback && (
                        <p className={`text-sm leading-relaxed mt-2 ${notif.lida ? 'text-slate-500' : 'text-slate-600'}`}>
                          {notif.feedback}
                        </p>
                      )}
                    </div>

                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 bg-white/50 sm:bg-transparent rounded-lg p-1 backdrop-blur-sm sm:backdrop-blur-none z-10">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => togglePin(notif.id)}
                        className={`h-8 w-8 rounded-full ${notif.pinned ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-50' : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50'}`}
                        title={notif.pinned ? "Desfixar" : "Fixar no topo"}
                      >
                        <Pin className={`h-4 w-4 ${notif.pinned ? 'fill-current' : ''}`} />
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => toggleRead(notif.id)}
                        className="h-8 w-8 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        title={notif.lida ? "Marcar como não lida" : "Marcar como lida"}
                      >
                        {notif.lida ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                      </Button>

                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => deleteNotification(notif.id)}
                        className="h-8 w-8 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        title="Excluir notificação"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentNotifications;