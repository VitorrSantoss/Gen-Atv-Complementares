import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Layers } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const stats = [
  { label: "Cursos Cadastrados", value: 12, icon: BookOpen, color: "gradient-primary" },
  { label: "Usuários (Acessos)", value: 8, icon: Users, color: "gradient-accent" },
  { label: "Turmas Ativas", value: 24, icon: Layers, color: "gradient-primary" },
];

const barData = [
  { curso: "Eng. Software", alunos: 120, turmas: 4 },
  { curso: "Administração", alunos: 90, turmas: 3 },
  { curso: "Direito", alunos: 75, turmas: 2 },
  { curso: "Medicina", alunos: 110, turmas: 5 },
  { curso: "Design", alunos: 65, turmas: 2 },
];

const AdminDashboard = () => {
  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Dashboard de Cadastros
          </h1>
          <p className="text-lg text-slate-500">
            Visão geral dos registros no sistema (Acesso restrito)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      <div className="grid grid-cols-1 gap-6">
        <Card className="glass-card border-0 shadow-sm rounded-2xl">
          <CardHeader className="border-b border-slate-50/50 p-6">
            <CardTitle className="text-lg font-bold text-slate-800">
              Volume de Cadastros por Curso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={350}>
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
                <Bar dataKey="alunos" name="Alunos Matriculados" fill="hsl(215, 90%, 50%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="turmas" name="Turmas" fill="hsl(25, 95%, 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;