import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, Clock, CheckCircle, Bell } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "Alunos Vinculados", value: 85, icon: Users, color: "bg-blue-600" },
  {
    label: "Solicitações Pendentes",
    value: 23,
    icon: Clock,
    color: "bg-orange-500",
  },
  { label: "Aprovadas", value: 156, icon: CheckCircle, color: "bg-blue-600" },
  {
    label: "Total Avaliadas",
    value: 189,
    icon: FileCheck,
    color: "bg-orange-500",
  },
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

const COLORS = ["#2563eb", "#f97316", "#dc2626"];

const mockNotifications = [
  {
    id: 1,
    student: "Ana Silva",
    action: "enviou um certificado de",
    course: "Minicurso de React",
    time: "Há 5 min",
    unread: true,
  },
  {
    id: 2,
    student: "Carlos Souza",
    action: "enviou um certificado de",
    course: "Seminário de IA",
    time: "Há 2 horas",
    unread: true,
  },
  {
    id: 3,
    student: "Beatriz Lima",
    action: "corrigiu a submissão de",
    course: "Workshop de Git/GitHub",
    time: "Há 1 dia",
    unread: false,
  },
  {
    id: 4,
    student: "João Pedro",
    action: "enviou um certificado de",
    course: "Palestra de Segurança",
    time: "Há 2 dias",
    unread: false,
  },
];

const CoordinatorDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="p-8 space-y-6 bg-slate-50 ">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard do Coordenador</h1>
          <p className="text-lg text-slate-500">
            Visão Geral
          </p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="relative border-slate-200 bg-white hover:bg-slate-50 rounded-xl h-11 w-11 shadow-sm"
            >
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
              </span>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-80 p-0 shadow-2xl border-slate-200 rounded-2xl overflow-hidden"
            align="end"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/50">
              <span
                className="font-semibold text-sm"
              >
                Notificações
              </span>
              <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">
                2 NOVAS
              </span>
            </div>

            <ScrollArea className="h-72">
              <div className="flex flex-col">
                {mockNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer ${notif.unread ? "bg-blue-50/30" : ""}`}
                  >
                    <div className="flex gap-3 items-start">
                      <div
                        className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${notif.unread ? "bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" : "bg-transparent"}`}
                      />
                      <div className="space-y-1">
                        <p className="text-xs leading-snug text-slate-600">
                          <span className="font-bold text-slate-800">
                            {notif.student}
                          </span>{" "}
                          {notif.action}{" "}
                          <span className="font-bold text-blue-600">
                            {notif.course}
                          </span>
                          .
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {notif.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-2 border-t border-slate-100 bg-slate-50/50">
              <Button
                variant="ghost"
                className="w-full text-xs h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold"
                onClick={() => navigate("/coordenador/solicitacoes")}
              >
                Ver todas as solicitações
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-black text-slate-800 mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center shadow-lg shadow-blue-500/10`}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm rounded-2xl bg-white lg:col-span-2">
          <CardHeader className="border-b border-slate-50 p-6">
            <CardTitle className="text-lg font-bold text-slate-800">
              Horas por Área
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="area"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="horas"
                  fill="#2563eb"
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm rounded-2xl bg-white">
          <CardHeader className="border-b border-slate-50 p-6">
            <CardTitle className="text-lg font-bold text-slate-800">
              Status das Solicitações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CoordinatorDashboard;
