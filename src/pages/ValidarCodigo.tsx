import { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GraduationCap, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoSenac from "@/assets/logo_senac_branca.png";
import { api } from "@/lib/api";

const ValidarCodigo = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const novo = [...codigo];
    novo[index] = value.slice(-1);
    setCodigo(novo);
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !codigo[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setCodigo(pasted.split(""));
      inputs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const codigoStr = codigo.join("");
    if (codigoStr.length < 6) {
      setErro("Digite o código completo de 6 dígitos.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const resp = await api.post("/auth/password/validar", { email, codigo: codigoStr });
      if (resp.data.valido) {
        navigate("/redefinir-senha", { state: { email, codigo: codigoStr } });
      } else {
        setErro("Código inválido ou expirado. Tente novamente.");
      }
    } catch {
      setErro("Código inválido ou expirado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    try {
      await api.post("/auth/password/solicitar", { email });
      setCodigo(["", "", "", "", "", ""]);
      setErro("");
      inputs.current[0]?.focus();
    } catch {
      setErro("Erro ao reenviar. Tente novamente.");
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
            Verificação de Código
          </h1>
          <p className="text-primary-foreground/70 text-lg">
            Insira o código enviado para o seu e-mail.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
              <ShieldCheck className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Digite o código</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Enviamos um código de 6 dígitos para
            </p>
            <p className="font-semibold text-primary text-sm">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-3 justify-center" onPaste={handlePaste}>
              {codigo.map((digit, i) => (
                <Input
                  key={i}
                  ref={(el) => (inputs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 focus:border-primary"
                />
              ))}
            </div>

            {erro && (
              <div className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                {erro}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verificando..." : "Verificar código"}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Não recebeu o código?{" "}
                <button
                  type="button"
                  onClick={handleReenviar}
                  className="text-primary hover:underline font-medium"
                >
                  Reenviar
                </button>
              </p>
              <Link to="/esqueci-senha" className="text-sm text-primary hover:underline inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ValidarCodigo;