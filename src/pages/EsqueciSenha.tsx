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

    await new Promise((r) => setTimeout(r, 1500));

    setMensagem("Se o e-mail estiver cadastrado, enviaremos as instruções.");
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-1/2 gradient-hero flex items-center justify-center p-12">
        <div className="text-center">
          <img src={logoSenac} className="mx-auto mb-6" />
          <h1 className="text-2xl text-white font-bold">
            Recuperação de Senha
          </h1>
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-2xl font-bold text-center">
            Esqueci minha senha
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {mensagem && (
              <div className="text-center text-sm text-green-600">
                {mensagem}
              </div>
            )}

            <Button type="submit" className="w-full">
              <Send className="mr-2 h-4 w-4" />
              {loading ? "Enviando..." : "Enviar recuperação"}
            </Button>

            {/* 🔥 BOTÃO FUNCIONANDO */}
            <div className="text-center">
              <Link to="/" className="text-sm text-primary hover:underline">
                <ArrowLeft className="inline mr-1 h-4 w-4" />
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
