import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, GraduationCap, Clock } from "lucide-react";
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
    <div className="p-8 space-y-6 bg-slate-50">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard Administrativo
          </h1>
          <p className="text-lg text-slate-500">
            Visão geral do sistema de atividades complementares
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card 
            key={stat.label} 
            className="glass-card border-0 shadow-sm rounded-2xl overflow-hidden"
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
                  className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center shadow-lg`}
                >
                  <stat.icon className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card border-0 shadow-sm rounded-2xl lg:col-span-2">
          <CardHeader className="border-b border-slate-50/50 p-6">
            <CardTitle className="text-lg font-bold text-slate-800">
              Solicitações por Curso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke="hsl(215, 20%, 90%)" 
                />
                <XAxis 
                  dataKey="curso" 
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
                  cursor={{ fill: "rgba(241, 245, 249, 0.4)" }}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar dataKey="aprovadas" fill="hsl(215, 90%, 50%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="pendentes" fill="hsl(25, 95%, 55%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="rejeitadas" fill="hsl(0, 84%, 60%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="glass-card border-0 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-slate-50/50 p-6">
            <CardTitle className="text-lg font-bold text-slate-800">
              Distribuição por Área
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
                  {pieData.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      stroke="none"
                    />
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

export default AdminDashboard;