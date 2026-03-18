import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Send, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoSenac from "@/assets/logo_senac_branca.png";

const EsqueciSenha = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulação de chamada de API para bater com o tempo de transição
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setSucesso(true);
    } catch (error) {
      console.error("Erro ao solicitar recuperação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* --- PAINEL ESQUERDO: IDÊNTICO AO SEU LOGIN --- */}
      <div className="w-full lg:w-1/2 gradient-hero flex items-center justify-center px-6 py-6 lg:py-10 lg:p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-55">
          <div className="absolute top-10 left-10 w-[320px] h-[140px] lg:w-[600px] lg:h-[200px] rounded-full bg-primary blur-[100px] lg:blur-[120px]" />
          <div className="absolute bottom-10 right-10 w-[320px] h-[140px] lg:w-[600px] lg:h-[200px] rounded-full bg-accent blur-[120px] lg:blur-[150px]" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <img
            src={logoSenac}
            alt="Logo do Senac"
            className="mx-auto mb-3 w-52 lg:w-auto"
          />

          <h1
            className="font-bold text-[1.76rem] lg:text-3xl text-primary-foreground mb-2"
            style={{ fontFamily: "Arial" }}
          >
            Atividades Complementares
          </h1>

          <p className="text-primary-foreground/70 text-[0.94rem] lg:text-lg">
            Gerencie e acompanhe suas horas complementares <br />
            de forma simples e eficiente.
          </p>
        </div>
      </div>

      {/* --- PAINEL DIREITO: ESTRUTURA BASEADA NO SEU LOGIN --- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10 lg:p-8">
        <div className="w-full max-w-md space-y-6">
          
          {!sucesso ? (
            /* --- ESTADO INICIAL: FORMULÁRIO --- */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col items-center text-center lg:text-left lg:items-start">
                <div className="hidden lg:flex items-center justify-center w-14 h-14 rounded-xl gradient-accent mb-4">
                  <Mail className="h-7 w-7 text-accent-foreground" />
                </div>

                <h2
                  className="text-[1.76rem] lg:text-3xl font-bold text-foreground"
                  style={{ fontFamily: "Arial" }}
                >
                  Recuperar Senha
                </h2>

                <p className="text-muted-foreground mt-1 text-[0.94rem]">
                  Informe seu e-mail para receber as instruções
                </p>
              </div>

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
                    className="h-11"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-primary text-white h-12 text-base font-semibold transition-all duration-300 hover:opacity-90 active:scale-[0.98]"
                >
                  {loading ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="mr-2 h-5 w-5" />
                      Enviar Instruções
                    </>
                  )}
                </Button>

                <p className="text-center mt-4">
                  <Link
                    to="/"
                    className="text-[0.82rem] text-black hover:underline inline-flex items-center gap-2"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Voltar para o login
                  </Link>
                </p>
              </form>
            </div>
          ) : (
            /* --- ESTADO DE SUCESSO: CHECK VERDE --- */
            <div className="flex flex-col items-center text-center space-y-6 animate-in zoom-in-95 duration-500">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 shadow-sm">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h2 
                  className="text-2xl lg:text-3xl font-bold text-foreground"
                  style={{ fontFamily: "Arial" }}
                >
                  E-mail Enviado!
                </h2>
                <p className="text-muted-foreground text-[0.94rem] leading-relaxed">
                  As instruções foram enviadas para <br />
                  <span className="font-bold text-slate-900">{email}</span>
                </p>
              </div>

              <div className="w-full pt-4 space-y-3">
                <Link to="/">
                  <Button className="w-full h-12 gradient-primary text-white font-semibold">
                    Ir para o Login
                  </Button>
                </Link>
                <button 
                  onClick={() => setSucesso(false)}
                  className="text-[0.82rem] text-muted-foreground hover:text-primary transition-colors"
                >
                  Não recebeu? Tentar novamente
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EsqueciSenha;