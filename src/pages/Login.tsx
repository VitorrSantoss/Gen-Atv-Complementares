import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
import { GraduationCap, Shield, Users, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import logoSenac from "@/assets/logo_senac_branca.png";

const roles = [
  {
    value: "aluno",
    label: "Aluno",
    icon: <GraduationCap className="h-5 w-5" />,
    desc: "Submeta certificados e acompanhe suas horas",
  },
  {
    value: "coordenador",
    label: "Coordenador",
    icon: <Users className="h-5 w-5" />,
    desc: "Gerencie alunos e valide atividades",
  },
  {
    value: "superadmin",
    label: "Super Admin",
    icon: <Shield className="h-5 w-5" />,
    desc: "Administre cursos e coordenadores",
  },
] as const;

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
      {/* Left */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-55">
          <div className="absolute top-20 left-20 w-[600px] h-[200px] rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-[600px] h-[200px] rounded-full bg-accent blur-[150px]" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <img src={logoSenac} alt="Logo do Senac" />
          <h1 className="text-3xl font-bold text-primary-foreground mb-4">
            Atividades Complementares
          </h1>
          <p className="text-primary-foreground/70 text-lg">
            Gerencie e acompanhe suas horas complementares.
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-2xl font-bold">Entrar no Sistema</h2>
            <p className="text-muted-foreground">
              Selecione seu perfil e faça login
            </p>
          </div>

          {/* SELECT */}
          <div className="space-y-2">
            <Label>Tipo de usuário</Label>

            <Select
              value={selectedRole}
              onValueChange={(value) => setSelectedRole(value as UserRole)}
            >
              <SelectTrigger className="h-11 border-2 border-primary bg-primary/5 shadow-md">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
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

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>Senha</Label>
              <Input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* 🔥 LINK AQUI */}
            <div className="text-right">
              <Link
                to="/esqueci-senha"
                className="text-sm text-primary hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>

            <Button type="submit" className="w-full">
              <LogIn className="mr-2 h-5 w-5" />
              Entrar como {roles.find((r) => r.value === selectedRole)?.label}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
