import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, KeyRound, Eye, EyeOff, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoSenac from "@/assets/logo_senac_branca.png";
import { api } from "@/lib/api";

const RedefinirSenha = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const codigo = location.state?.codigo || "";

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");

    if (novaSenha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/password/redefinir", { email, codigo, novaSenha });
      setSucesso(true);
      setTimeout(() => navigate("/"), 3000);
    } catch (err: any) {
      setErro(err?.response?.data?.erro || "Erro ao redefinir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (sucesso) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Senha redefinida!</h2>
          <p className="text-muted-foreground">Você será redirecionado para o login em instantes...</p>
        </div>
      </div>
    );
  }

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
            Nova Senha
          </h1>
          <p className="text-primary-foreground/70 text-lg">
            Escolha uma senha segura para sua conta.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
              <KeyRound className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Redefinir senha</h2>
            <p className="text-muted-foreground">Digite sua nova senha abaixo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Nova senha</Label>
              <div className="relative">
                <Input
                  type={mostrarSenha ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {mostrarSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label>Confirmar nova senha</Label>
              <Input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Repita a senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                required
              />
            </div>

            {erro && (
              <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {erro}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RedefinirSenha;