import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, BookOpen, UserCog, GraduationCap, Loader2, ArrowRight, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { userService } from "@/services/admin/userService";
import { courseService } from "@/services/admin/courseService";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const CORES_PERFIL = ['#22c55e', '#3b82f6', '#ef4444']; 

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    alunos: 0,
    coordenadores: 0,
    gestores: 0,
    cursos: 0,
  });

  const [distribuicaoData, setDistribuicaoData] = useState<any[]>([]);
  const [relatorioMensal, setRelatorioMensal] = useState<any[]>([]);

  // Função auxiliar para preparar os últimos 6 meses zerados
  const gerarUltimos6Meses = () => {
    const nomesMeses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const meses = [];
    const hoje = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      meses.push({
        mes: nomesMeses[data.getMonth()],
        mesNum: data.getMonth(),
        ano: data.getFullYear(),
        alunos: 0 // Começa em zero e vamos preencher com os dados do banco
      });
    }
    return meses;
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [usersData, coursesData] = await Promise.all([
          userService.getAll(),
          courseService.getAll()
        ]);

        const alunosCount = usersData.filter(u => u.perfil === "ALUNO").length;
        const coordCount = usersData.filter(u => u.perfil === "COORDENADOR").length;
        const gestorCount = usersData.filter(u => u.perfil === "SUPER_ADMIN").length;

        setStats({
          totalUsers: usersData.length,
          alunos: alunosCount,
          coordenadores: coordCount,
          gestores: gestorCount,
          cursos: coursesData.length,
        });

        setDistribuicaoData([
          { name: 'Alunos', value: alunosCount },
          { name: 'Coordenadores', value: coordCount },
          { name: 'Gestores', value: gestorCount },
        ]);

        // INTEGRAÇÃO REAL DO GRÁFICO DE LINHA
        const dadosMensais = gerarUltimos6Meses();

        usersData.forEach((user: any) => {
          // Verifica se é aluno e se a data veio do back-end
          if (user.perfil === "ALUNO" && user.criadoEm) {
            const dataCriacao = new Date(user.criadoEm);
            const mesCriacao = dataCriacao.getMonth();
            const anoCriacao = dataCriacao.getFullYear();

            // Encontra o mês correspondente no nosso array e soma +1
            const mesEncontrado = dadosMensais.find(m => m.mesNum === mesCriacao && m.ano === anoCriacao);
            if (mesEncontrado) {
              mesEncontrado.alunos += 1;
            }
          }
        });

        // Se não houver dados antigos (ex: todo mundo criado hoje), ele mostrará tudo no mês atual
        setRelatorioMensal(dadosMensais);

      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Geral</h1>
        <p className="text-muted-foreground">Bem-vindo ao painel de administração. Aqui está o resumo do sistema.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total de Usuários</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalUsers}</div><p className="text-xs text-muted-foreground">Contas registradas</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Alunos</CardTitle><GraduationCap className="h-4 w-4 text-green-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.alunos}</div><p className="text-xs text-muted-foreground">Estudantes ativos</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Coordenadores</CardTitle><UserCog className="h-4 w-4 text-blue-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.coordenadores}</div><p className="text-xs text-muted-foreground">Avaliadores de horas</p></CardContent></Card>
        <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Cursos</CardTitle><BookOpen className="h-4 w-4 text-orange-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.cursos}</div><p className="text-xs text-muted-foreground">Grades cadastradas</p></CardContent></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
            <CardDescription>Crescimento de alunos ativos nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={relatorioMensal} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAlunos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="mes" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <RechartsTooltip formatter={(value) => [`${value} Alunos`, 'Cadastros']} />
                  <Area type="monotone" dataKey="alunos" stroke="#10b981" fillOpacity={1} fill="url(#colorAlunos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Distribuição de Usuários</CardTitle>
            <CardDescription>Proporção de perfis na plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribuicaoData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                    {distribuicaoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CORES_PERFIL[index % CORES_PERFIL.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Button variant="outline" className="h-16 justify-start px-6 gap-4" onClick={() => navigate('/admin/usuarios')}>
          <div className="bg-primary/10 p-2 rounded-full"><Users className="h-5 w-5 text-primary" /></div>
          <div className="flex flex-col items-start flex-1 text-left">
            <span className="font-semibold text-sm">Gerenciar Usuários</span>
            <span className="text-xs text-muted-foreground font-normal">Criar ou editar contas</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button variant="outline" className="h-16 justify-start px-6 gap-4" onClick={() => navigate('/admin/cursos')}>
          <div className="bg-orange-500/10 p-2 rounded-full"><BookOpen className="h-5 w-5 text-orange-500" /></div>
          <div className="flex flex-col items-start flex-1 text-left">
            <span className="font-semibold text-sm">Gerenciar Cursos</span>
            <span className="text-xs text-muted-foreground font-normal">Ver grades ativas</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Button>
        <Button variant="outline" className="h-16 justify-start px-6 gap-4" onClick={() => navigate('/admin/coordenadores')}>
          <div className="bg-blue-500/10 p-2 rounded-full"><ShieldAlert className="h-5 w-5 text-blue-500" /></div>
          <div className="flex flex-col items-start flex-1 text-left">
            <span className="font-semibold text-sm">Gestão de Acessos</span>
            <span className="text-xs text-muted-foreground font-normal">Vincular coordenadores</span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;