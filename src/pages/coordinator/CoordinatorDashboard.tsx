import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileCheck, Clock, CheckCircle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

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

const CoordinatorDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans' }}>Dashboard do Coordenador</h1>
        <p className="text-muted-foreground mt-1">Engenharia de Software — Visão geral</p>
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
