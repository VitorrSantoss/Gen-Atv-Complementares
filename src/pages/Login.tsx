import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { GraduationCap, Shield, Users, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoSenac from "@/assets/logo_senac_branca.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const roles: {
  value: UserRole;
  label: string;
  icon: React.ReactNode;
  desc: string;
}[] = [
  {
    value: "aluno",
    label: "Aluno",
    icon: <GraduationCap className="h-6 w-6" />,
    desc: "Submeta certificados e acompanhe suas horas",
  },
  {
    value: "coordenador",
    label: "Coordenador",
    icon: <Users className="h-6 w-6" />,
    desc: "Gerencie alunos e valide atividades",
  },
  {
    value: "superadmin",
    label: "Gestor",
    icon: <Shield className="h-6 w-6" />,
    desc: "Administre cursos e coordenadores",
  },
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
          <div>
            <img src={logoSenac} alt="Logo do Senac" />
          </div>
          <h1
            className="text-3xl font-bold text-primary-foreground mb-4"
            style={{ fontFamily: "Arial" }}
          >
            Atividades Complementares
          </h1>
          <p className="text-primary-foreground/70 text-lg">
            Gerencie e acompanhe suas horas complementares de forma simples e
            eficiente.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center lg:text-left">
            <div className="lg:flex inline-flex items-center justify-center w-14 h-14 rounded-xl gradient-accent mb-4">
              <GraduationCap className="h-7 w-7 text-accent-foreground" />
            </div>
            <h2
              className="flex flex-col items-center text-3xl font-bold text-foreground"
              style={{ fontFamily: "Arial" }}
            >
              Entrar no Sistema
            </h2>
            <p className="flex flex-col items-center text-muted-foreground mt-1">
              Selecione seu perfil e faça login
            </p>
          </div>

          {/* Role selector */}
          <div className="space-y-2">
            <Label>Tipo de usuário</Label>

            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <SelectTrigger
                className={`h-11 border-2 transition-all duration-200 
                    border-primary bg-primary/5 shadow-md 
                    hover:border-primary/30 hover:bg-secondary`}
              >
                <SelectValue placeholder="Selecione seu perfil" />
              </SelectTrigger>

              <SelectContent className="border-primary/20">
                {roles.map((role) => (
                  <SelectItem
                    key={role.value}
                    value={role.value}
                    className="
                        text-black border border-transparent
                        hover:!border-primary/40
                        hover:!bg-primary/10
                        hover:!text-black
                        data-[state=checked]:!bg-white
                        data-[state=checked]:!text-black
                      "
                  >
                    <div className="flex items-center gap-2">
                      {role.icon}
                      {role.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs text-center text-muted-foreground bg-secondary rounded-lg p-3">
            {roles.find((r) => r.value === selectedRole)?.desc}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full gradient-primary text-white h-12 text-base font-semibold transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Entrar como {roles.find((r) => r.value === selectedRole)?.label}
            </Button>
            <p className="text-center mt-4">
              <a
                href="/forgot-password"
                className="text-xs text-black hover:underline inline-block"
              >
                Esqueci a senha
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
