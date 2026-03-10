import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, Clock, CheckCircle, Bell } from "lucide-react"; 
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Button } from "@/components/ui/button";
// Importando os componentes de Popover e ScrollArea
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";


const stats = [
  { label: "Alunos Vinculados", value: 85, icon: Users, color: "gradient-primary" },
  { label: "Solicitações Pendentes", value: 23, icon: Clock, color: "gradient-accent" },
  { label: "Aprovadas", value: 156, icon: CheckCircle, color: "gradient-primary" },
  { label: "Total Avaliadas", value: 189, icon: FileCheck, color: "gradient-accent" },
];

const barData = [
  { area: "Pesquisa", horas: 450 },
  { area: "Extensão", horas: 380 },
  { area: "Ensino", horas: 220 },
  { area: "Cultural", horas: 180 },
  { area: "Social", horas: 120 },
];

const pieData = [
  { name: "Aprovadas", value: 156 },
  { name: "Pendentes", value: 23 },
  { name: "Rejeitadas", value: 10 },
];

const COLORS = ["hsl(215, 90%, 50%)", "hsl(25, 95%, 55%)", "hsl(0, 84%, 60%)"];

// Simulando os dados de notificações vindos do banco de dados
const mockNotifications = [
  { id: 1, student: "Ana Silva", action: "enviou um certificado de", course: "Minicurso de React", time: "Há 5 min", unread: true },
  { id: 2, student: "Carlos Souza", action: "enviou um certificado de", course: "Seminário de Inteligência Artificial", time: "Há 2 horas", unread: true },
  { id: 3, student: "Beatriz Lima", action: "corrigiu a submissão de", course: "Workshop de Git/GitHub", time: "Há 1 dia", unread: false },
  { id: 4, student: "João Pedro", action: "enviou um certificado de", course: "Palestra de Segurança", time: "Há 2 dias", unread: false },
];

const CoordinatorDashboard = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans' }}>Dashboard do Coordenador</h1>
          <p className="text-muted-foreground mt-1">Visão geral</p>
        </div>
        
        {/* O Botão agora virou o Gatilho (Trigger) do Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative mt-1 border-border bg-card hover:bg-secondary cursor-pointer">
              <Bell className="h-5 w-5 text-foreground" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
              </span>
            </Button>
          </PopoverTrigger>
          
          {/* Conteúdo da Janela Flutuante */}
          <PopoverContent className="w-80 p-0 mr-6 mt-2 shadow-xl border-border rounded-xl" align="end">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <span className="font-semibold text-sm" style={{ fontFamily: 'Plus Jakarta Sans' }}>Notificações</span>
              <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-md">2 novas</span>
            </div>
            
            <ScrollArea className="h-72">
              <div className="flex flex-col">
                {mockNotifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    className={`p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer ${notif.unread ? 'bg-primary/5' : ''}`}
                  >
                    <div className="flex gap-3 items-start">
                      {/* Bolinha indicadora de não lida */}
                      <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${notif.unread ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary))]' : 'bg-transparent'}`} />
                      
                      <div className="space-y-1">
                        <p className="text-sm leading-tight text-foreground">
                          <span className="font-semibold">{notif.student}</span> {notif.action} <span className="font-medium text-primary">{notif.course}</span>.
                        </p>
                        <p className="text-xs text-muted-foreground">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            <div className="p-2 border-t border-border text-center bg-muted/30">
              <Button variant="ghost" className="w-full text-xs h-8 text-primary hover:text-primary hover:bg-primary/10">
                Ver todas as solicitações
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card border-0 lg:col-span-2">
          <CardHeader><CardTitle className="text-lg">Horas por Área</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 90%)" />
                <XAxis dataKey="area" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="horas" fill="hsl(215, 90%, 50%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardHeader><CardTitle className="text-lg">Status das Solicitações</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => (<Cell key={i} fill={COLORS[i]} />))}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
