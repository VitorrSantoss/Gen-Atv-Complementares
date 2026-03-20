import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, Send, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoSenac from "@/assets/logo_senac_branca.png";

const EsqueciSenha = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulação de delay da API
    await new Promise((r) => setTimeout(r, 1500));

    setMensagem("Se o e-mail estiver cadastrado, enviaremos as instruções.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Hero (Idêntico ao Login) */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-55">
          <div className="absolute top-20 left-20 w-[600px] h-[200px] rounded-full bg-primary blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-[600px] h-[200px] rounded-full bg-accent blur-[150px]" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <img src={logoSenac} alt="Logo do Senac" className="mx-auto" />
          <h1 className="text-3xl font-bold text-primary-foreground mb-4">
            Recuperação de Senha
          </h1>
          <p className="text-primary-foreground/70 text-lg">
            Siga os passos para redefinir seu acesso.
          </p>
        </div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">

          {/* Header do Form alinhado à esquerda */}
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
              <GraduationCap className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-center text-2xl font-bold">Esqueci minha senha</h2>
            <p className="text-center text-muted-foreground">
              Informe o e-mail associado à sua conta
            </p>
          </div>

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

            {mensagem && (
              <div className="text-sm font-medium text-green-600 bg-green-50 p-3 rounded-md border border-green-200">
                {mensagem}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              <Send className="mr-2 h-5 w-5" />
              {loading ? "Enviando..." : "Enviar recuperação"}
            </Button>

            <div className="pt-4 text-center">
              <Link
                to="/"
                className="text-sm text-primary hover:underline inline-flex items-center"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para login
              </Link>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha;