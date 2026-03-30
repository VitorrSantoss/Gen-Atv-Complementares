import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  GraduationCap,
  Shield,
  Users,
  LogIn,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth, type UserRole } from "@/contexts/AuthContext";
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
  },
  {
    value: "coordenador",
    label: "Coordenador",
    icon: <Users className="h-5 w-5" />,
  },
  {
    value: "superadmin",
    label: "Gestor",
    icon: <Shield className="h-5 w-5" />,
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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const realRole = await login(email, password);

      if (realRole !== selectedRole) {
        logout();
        setErrorMessage(
          `Este usuário pertence ao perfil "${roles.find((r) => r.value === realRole)?.label}", não ao perfil selecionado.`
        );
        return;
      }

      navigate(roleRedirects[realRole]);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setErrorMessage("E-mail ou senha inválidos.");
      } else if (error?.response?.status === 403) {
        setErrorMessage("Você não tem permissão para acessar o sistema.");
      } else {
        setErrorMessage("Não foi possível fazer login. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-55">
          <div className="absolute top-20 left-20 w-[600px] h-[200px] rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-[600px] h-[200px] rounded-full bg-accent blur-[150px]" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <img src={logoSenac} alt="Logo do Senac" className="mx-auto" />
          <h1 className="text-3xl font-bold text-primary-foreground mb-4">
            Atividades Complementares
          </h1>
          <p className="text-primary-foreground/70 text-lg">
            Gerencie e acompanhe suas horas complementares.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>

            <h2 className="text-2xl font-bold text-foreground">
              Entrar no Sistema
            </h2>

            <p className="text-muted-foreground mt-1">
              Selecione seu perfil e faça login
            </p>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="mr-2 h-5 w-5" />
              {loading
                ? "Entrando..."
                : `Entrar como ${roles.find((r) => r.value === selectedRole)?.label}`}
            </Button>

            <div className="text-center">
              <Link
                to="/esqueci-senha"
                className="text-sm text-primary hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;