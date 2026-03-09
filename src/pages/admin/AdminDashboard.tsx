import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, GraduationCap, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const stats = [
  { label: "Cursos Ativos", value: 12, icon: BookOpen, color: "gradient-primary" },
  { label: "Coordenadores", value: 8, icon: Users, color: "gradient-accent" },
  { label: "Alunos", value: 342, icon: GraduationCap, color: "gradient-primary" },
  { label: "Pendências", value: 47, icon: Clock, color: "gradient-accent" },
];

const barData = [
  { curso: "Eng. Software", aprovadas: 120, pendentes: 30, rejeitadas: 15 },
  { curso: "Administração", aprovadas: 90, pendentes: 22, rejeitadas: 8 },
  { curso: "Direito", aprovadas: 75, pendentes: 18, rejeitadas: 12 },
  { curso: "Medicina", aprovadas: 110, pendentes: 25, rejeitadas: 5 },
  { curso: "Design", aprovadas: 65, pendentes: 15, rejeitadas: 10 },
];

const pieData = [
  { name: "Pesquisa", value: 35 },
  { name: "Extensão", value: 28 },
  { name: "Ensino", value: 20 },
  { name: "Cultural", value: 17 },
];

const COLORS = [
  "hsl(215, 90%, 50%)",
  "hsl(25, 95%, 55%)",
  "hsl(150, 60%, 45%)",
  "hsl(40, 95%, 55%)",
];

const AdminDashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans' }}>Dashboard Administrativo</h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema de atividades complementares</p>
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
          <CardHeader>
            <CardTitle className="text-lg">Solicitações por Curso</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(215, 20%, 90%)" />
                <XAxis dataKey="curso" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="aprovadas" fill="hsl(215, 90%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pendentes" fill="hsl(25, 95%, 55%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejeitadas" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-0">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Área</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
