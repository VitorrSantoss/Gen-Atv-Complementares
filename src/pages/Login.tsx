import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { GraduationCap, Shield, Users, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const roles: { value: UserRole; label: string; icon: React.ReactNode; desc: string }[] = [
  { value: "aluno", label: "Aluno", icon: <GraduationCap className="h-6 w-6" />, desc: "Submeta certificados e acompanhe suas horas" },
  { value: "coordenador", label: "Coordenador", icon: <Users className="h-6 w-6" />, desc: "Gerencie alunos e valide atividades" },
  { value: "superadmin", label: "Super Admin", icon: <Shield className="h-6 w-6" />, desc: "Administre cursos e coordenadores" },
];

const roleRedirects: Record<UserRole, string> = {
  superadmin: "/admin",
  coordenador: "/coordenador",
  aluno: "/aluno",
};

const Login = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("aluno");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email, password, selectedRole);
    navigate(roleRedirects[selectedRole]);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-55">
          <div className="absolute top-20 left-20 w-[600px] h-[200px] rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-[600px] h-[200px] rounded-full bg-accent blur-[150px]" />
        </div>
        <div className="relative z-10 text-center max-w-md">
          <div >
            <img src="../public/logo_senac_branca.png" alt="Logo do Senac" />
          </div>
          <h1 className="text-4xl font-bold text-primary-foreground mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Atividades Complementares
          </h1>
          <p className="text-primary-foreground/70 text-lg">
            Gerencie e acompanhe suas horas complementares de forma simples e eficiente.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden inline-flex items-center justify-center w-14 h-14 rounded-xl gradient-accent mb-4">
              <GraduationCap className="h-7 w-7 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Entrar no Sistema
            </h2>
            <p className="text-muted-foreground mt-1">Selecione seu perfil e faça login</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-3">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedRole === role.value
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/30 hover:bg-secondary"
                }`}
              >
                <div className={`p-2 rounded-lg ${selectedRole === role.value ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {role.icon}
                </div>
                <span className={`text-xs font-semibold ${selectedRole === role.value ? "text-primary" : "text-muted-foreground"}`}>
                  {role.label}
                </span>
              </button>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground bg-secondary rounded-lg p-3">
            {roles.find(r => r.value === selectedRole)?.desc}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground h-12 text-base font-semibold">
              <LogIn className="mr-2 h-5 w-5" /> Entrar como {roles.find(r => r.value === selectedRole)?.label}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
