import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Bell } from "lucide-react";

const notifications = [
  { id: "1", titulo: "Congresso de IA 2025", status: "aprovada", feedback: "Certificado válido. 20 horas computadas na área de Pesquisa.", data: "2026-03-08", lida: false },
  { id: "2", titulo: "Palestra Design Thinking", status: "rejeitada", feedback: "O certificado não possui carga horária legível. Reenvie com melhor qualidade.", data: "2026-03-07", lida: false },
  { id: "3", titulo: "Monitoria Cálculo I", status: "pendente", feedback: "", data: "2026-03-05", lida: true },
  { id: "4", titulo: "Hackathon Tech", status: "aprovada", feedback: "Parabéns pela premiação! 15 horas registradas.", data: "2026-02-20", lida: true },
  { id: "5", titulo: "Voluntariado Social", status: "aprovada", feedback: "Atividade validada com sucesso.", data: "2026-02-10", lida: true },
];

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string; badge: string }> = {
  aprovada: { icon: CheckCircle, color: "text-success", label: "Aprovada", badge: "bg-success text-success-foreground" },
  rejeitada: { icon: XCircle, color: "text-destructive", label: "Rejeitada", badge: "bg-destructive text-destructive-foreground" },
  pendente: { icon: Clock, color: "text-warning", label: "Pendente", badge: "bg-warning text-warning-foreground" },
};

const StudentNotifications = () => {
  const unread = notifications.filter(n => !n.lida).length;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans' }}>Notificações</h1>
          <p className="text-muted-foreground mt-1">Acompanhe o status das suas submissões</p>
        </div>
        {unread > 0 && (
          <Badge className="bg-accent text-accent-foreground text-sm px-3 py-1">
            <Bell className="h-3 w-3 mr-1" />{unread} nova{unread > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => {
          const config = statusConfig[notif.status];
          const Icon = config.icon;
          return (
            <Card key={notif.id} className={`glass-card border-0 ${!notif.lida ? "ring-2 ring-primary/20" : ""}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`mt-0.5 ${config.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-foreground text-sm">{notif.titulo}</h3>
                      <Badge className={`${config.badge} text-xs shrink-0`}>{config.label}</Badge>
                    </div>
                    {notif.feedback && (
                      <p className="text-sm text-muted-foreground">{notif.feedback}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">{new Date(notif.data).toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default StudentNotifications;
