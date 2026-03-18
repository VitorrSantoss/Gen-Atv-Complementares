import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send, ArrowLeft } from "lucide-react";
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
    setMensagem("");

    try {
      // Simulação de delay da API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setMensagem("Se o e-mail estiver cadastrado, enviaremos as instruções.");
    } catch (error) {
      setMensagem("Erro ao processar solicitação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      
      {/* --- PAINEL ESQUERDO: RÉPLICA EXATA DO LOGIN --- */}
      <div className="w-full lg:w-1/2 gradient-hero flex items-center justify-center px-6 py-6 lg:py-10 lg:p-12 relative overflow-hidden">
        {/* Efeitos de orbe idênticos */}
        <div className="absolute inset-0 opacity-55">
          <div className="absolute top-10 left-10 w-[320px] h-[140px] lg:w-[600px] lg:h-[200px] rounded-full bg-primary blur-[100px] lg:blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-[320px] h-[140px] lg:w-[600px] lg:h-[200px] rounded-full bg-accent blur-[120px] lg:blur-[150px]" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          {/* Logo na mesma posição e tamanho (w-52 / lg:w-auto) */}
          <img
            src={logoSenac}
            alt="Logo do Senac"
            className="mx-auto mb-10 w-52 lg:w-auto"
          />

          <h1
            className="font-bold text-[1.76rem] lg:text-3xl text-primary-foreground mb-2"
            style={{ fontFamily: "Arial" }}
          >
            Recuperação de Senha
          </h1>

          <p className="text-primary-foreground/70 text-[0.94rem] lg:text-lg">
            Recupere o acesso à sua conta.
          </p>
        </div>
      </div>

      {/* --- PAINEL DIREITO: RECUPERAÇÃO DE SENHA --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 lg:p-8 bg-white">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center text-center">
            {/* Ícone de Envelope no padrão gradient-accent */}
            <div className="hidden lg:flex items-center justify-center w-14 h-14 rounded-xl gradient-accent mb-4 shadow-lg shadow-orange-500/20">
              <Mail className="h-7 w-7 text-accent-foreground" />
            </div>

            <h2
              className="text-[1.76rem] lg:text-3xl font-bold text-foreground"
              style={{ fontFamily: "Arial" }}
            >
              Esqueci minha senha
            </h2>

            <p className="text-muted-foreground mt-1 text-[0.94rem]">
              Informe seu e-mail para receber as instruções de recuperação
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-2 focus:ring-primary/20"
              />
            </div>

            {mensagem && (
              <div className="text-[0.82rem] text-center text-primary-foreground bg-primary rounded-lg p-3 animate-in fade-in slide-in-from-top-1">
                {mensagem}
              </div>
            )}

            <div className="space-y-4 pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-primary text-white h-12 text-base font-semibold transition-all duration-300 hover:opacity-90 active:scale-[0.98] shadow-md"
              >
                {loading ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Enviar recuperação
                  </>
                )}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/"
                  className="inline-flex items-center text-[0.82rem] text-black hover:underline gap-2 font-medium"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar para o login
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha;