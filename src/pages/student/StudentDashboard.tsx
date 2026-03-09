import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle, XCircle, BookOpen } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const courses = [
  { id: "1", name: "Engenharia de Software", code: "ES", meta: 200, aprovadas: 120, pendentes: 20, rejeitadas: 5 },
  { id: "2", name: "Administração", code: "ADM", meta: 150, aprovadas: 45, pendentes: 10, rejeitadas: 2 },
];

const areaData = [
  { name: "Pesquisa", value: 50 },
  { name: "Extensão", value: 35 },
  { name: "Ensino", value: 20 },
  { name: "Cultural", value: 15 },
];

const COLORS = ["hsl(215, 90%, 50%)", "hsl(25, 95%, 55%)", "hsl(150, 60%, 45%)", "hsl(40, 95%, 55%)"];

const StudentDashboard = () => {
  const [activeCourse, setActiveCourse] = useState(courses[0].id);
  const course = courses.find(c => c.id === activeCourse)!;
  const pct = Math.round((course.aprovadas / course.meta) * 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans' }}>Meu Painel</h1>
        <p className="text-muted-foreground mt-1">Acompanhe suas atividades complementares</p>
      </div>

      {/* Course switcher */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Meus Cursos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCourse(c.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                activeCourse === c.id ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeCourse === c.id ? "gradient-primary" : "bg-muted"}`}>
                  <BookOpen className={`h-5 w-5 ${activeCourse === c.id ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{c.name}</p>
                  <p className="text-xs text-muted-foreground">{c.aprovadas}/{c.meta}h completadas</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      <Card className="glass-card border-0">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{course.name}</h3>
              <p className="text-sm text-muted-foreground">Meta: {course.meta} horas</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-bold text-primary">{pct}%</span>
              <p className="text-xs text-muted-foreground">concluído</p>
            </div>
          </div>
          <Progress value={pct} className="h-4" />
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card border-0">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aprovadas</p>
              <p className="text-2xl font-bold text-foreground">{course.aprovadas}h</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-2xl font-bold text-foreground">{course.pendentes}h</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-0">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rejeitadas</p>
              <p className="text-2xl font-bold text-foreground">{course.rejeitadas}h</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie chart */}
      <Card className="glass-card border-0">
        <CardHeader><CardTitle className="text-lg">Horas por Área</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={areaData} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} dataKey="value">
                {areaData.map((_, i) => (<Cell key={i} fill={COLORS[i]} />))}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
