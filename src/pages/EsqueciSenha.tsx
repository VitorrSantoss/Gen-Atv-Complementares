import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logoSenac from "@/assets/logo_senac_branca.png";

export default function EsqueciSenha() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMensagem("");

    try {
      // Aqui depois você conecta com sua API
      // Exemplo:
      // await api.post("/auth/esqueci-senha", { email });

      await new Promise((resolve) => setTimeout(resolve, 1200));

      setMensagem("Se o e-mail estiver cadastrado, enviaremos um código de recuperação.");
    } catch (error) {
      setMensagem("Não foi possível enviar a solicitação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex relative items-center justify-center overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.35),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.25),_transparent_30%)]" />

        <div className="relative z-10 flex flex-col items-center text-center px-8">
          <img
            src={logoSenac}
            alt="Senac"
            className="w-[280px] max-w-full object-contain mb-8"
          />

          <h1 className="text-4xl font-bold text-white mb-4">
            Recuperação de Senha
          </h1>

          <p className="max-w-md text-lg text-slate-200 leading-relaxed">
            Recupere o acesso à sua conta de forma simples e segura.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10 bg-slate-50">
        <Card className="w-full max-w-md border-0 shadow-xl rounded-2xl">
          <CardHeader className="space-y-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500">
              <Mail className="h-7 w-7 text-white" />
            </div>

            <div>
              <CardTitle className="text-3xl font-bold text-slate-900">
                Esqueci minha senha
              </CardTitle>
              <CardDescription className="text-sm text-slate-500 mt-2">
                Informe seu e-mail para receber instruções de recuperação.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              {mensagem && (
                <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">
                  {mensagem}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold"
                disabled={loading}
              >
                {loading ? (
                  "Enviando..."
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar recuperação
                  </>
                )}
              </Button>

              <Link to="/" className="block">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-11 text-sm"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para login
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}