import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Camera, FileText, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const StudentSubmission = () => {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [horas, setHoras] = useState("");
  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: "Arquivo muito grande", description: "O limite é 5MB.", variant: "destructive" });
        return;
      }
      setArquivo(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !categoria || !dataInicio || !horas || !arquivo) {
      toast({ title: "Campos obrigatórios", description: "Preencha todos os campos e anexe um comprovante.", variant: "destructive" });
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center animate-in fade-in zoom-in duration-300">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
          <CheckCircle className="h-10 w-10 text-[#00B67A]" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Enviado com sucesso!</h2>
        <p className="text-slate-500 max-w-md mb-8">Sua atividade foi registrada e será avaliada pela coordenação. Acompanhe o status no seu Dashboard.</p>
        <Button 
          className="bg-[#0066FF] hover:bg-blue-700 text-white px-8 h-12 rounded-xl font-bold"
          onClick={() => { setSubmitted(false); setTitulo(""); setCategoria(""); setDataInicio(""); setHoras(""); setDescricao(""); setArquivo(null); }}
        >
          Nova Submissão
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Cabeçalho */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Nova Atividade
        </h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Registre uma atividade complementar e envie o comprovante
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-5 sm:p-8 space-y-5">
            
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="titulo" className="text-slate-700 font-medium">Título da Atividade *</Label>
              <Input 
                id="titulo" 
                placeholder="Ex: Congresso Nacional de Engenharia" 
                className="bg-slate-50 border-slate-100 focus:bg-white focus:ring-[#0066FF] h-11 rounded-lg"
                value={titulo} 
                onChange={(e) => setTitulo(e.target.value)} 
              />
            </div>

            {/* Categoria e Data - Lado a lado no desktop, pilha no mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Categoria *</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger className="bg-slate-50 border-slate-100 h-11 rounded-lg">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pesquisa">Pesquisa</SelectItem>
                    <SelectItem value="extensao">Extensão</SelectItem>
                    <SelectItem value="ensino">Ensino</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data" className="text-slate-700 font-medium">Data de Início *</Label>
                <Input 
                  id="data" 
                  type="date" 
                  className="bg-slate-50 border-slate-100 h-11 rounded-lg"
                  value={dataInicio} 
                  onChange={(e) => setDataInicio(e.target.value)} 
                />
              </div>
            </div>

            {/* Carga Horária */}
            <div className="space-y-2">
              <Label htmlFor="horas" className="text-slate-700 font-medium">Carga Horária (horas) *</Label>
              <Input 
                id="horas" 
                type="number" 
                placeholder="Ex: 20" 
                className="bg-slate-50 border-slate-100 h-11 rounded-lg"
                value={horas} 
                onChange={(e) => setHoras(e.target.value)} 
              />
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="descricao" className="text-slate-700 font-medium">Descrição</Label>
              <Textarea 
                id="descricao" 
                placeholder="Descreva brevemente a atividade realizada..." 
                className="bg-slate-50 border-slate-100 focus:bg-white min-h-[100px] rounded-lg"
                value={descricao} 
                onChange={(e) => setDescricao(e.target.value)} 
              />
            </div>

            {/* Upload Section */}
            <div className="space-y-3 pt-2">
              <Label className="text-slate-700 font-medium text-sm">
                Comprovante (PDF, JPG, PNG — até 5MB) *
              </Label>
              <input 
                ref={fileRef} 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png" 
                className="hidden" 
                onChange={handleFileChange} 
              />
              
              {arquivo ? (
                <div className="flex items-center gap-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-top-1">
                  <FileText className="h-8 w-8 text-[#0066FF]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{arquivo.name}</p>
                    <p className="text-xs text-slate-500">{(arquivo.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="hover:bg-red-50 hover:text-red-500 rounded-full"
                    onClick={() => setArquivo(null)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-row gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 h-12 border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-all"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    <span className="text-xs sm:text-sm">Escolher Arquivo</span>
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="h-12 px-4 border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline text-sm">Câmera</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-[#0066FF] hover:bg-blue-700 text-white h-14 rounded-xl text-base font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98] mt-4"
            >
              Enviar Atividade
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default StudentSubmission;