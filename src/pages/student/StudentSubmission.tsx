import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    toast({ title: "Submissão enviada!", description: "Seu certificado será analisado pela coordenação." });
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans' }}>Enviado com sucesso!</h2>
        <p className="text-muted-foreground text-center max-w-md">Sua atividade foi registrada e será avaliada pela coordenação. Acompanhe o status no seu Dashboard.</p>
        <Button className="gradient-primary text-primary-foreground" onClick={() => { setSubmitted(false); setTitulo(""); setCategoria(""); setDataInicio(""); setHoras(""); setDescricao(""); setArquivo(null); }}>
          Nova Submissão
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'Plus Jakarta Sans' }}>Nova Atividade</h1>
        <p className="text-muted-foreground mt-1">Registre uma atividade complementar e envie o comprovante</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="glass-card border-0">
          <CardContent className="p-6 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título da Atividade *</Label>
              <Input id="titulo" placeholder="Ex: Congresso Nacional de Engenharia" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pesquisa">Pesquisa</SelectItem>
                    <SelectItem value="extensao">Extensão</SelectItem>
                    <SelectItem value="ensino">Ensino</SelectItem>
                    <SelectItem value="cultural">Cultural</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="data">Data de Início *</Label>
                <Input id="data" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="horas">Carga Horária (horas) *</Label>
              <Input id="horas" type="number" min="1" max="200" placeholder="Ex: 20" value={horas} onChange={(e) => setHoras(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" placeholder="Descreva brevemente a atividade realizada..." value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
            </div>

            {/* File upload */}
            <div className="space-y-2">
              <Label>Comprovante (PDF, JPG, PNG — até 5MB) *</Label>
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={handleFileChange} />
              
              {arquivo ? (
                <div className="flex items-center gap-3 p-4 bg-secondary rounded-xl">
                  <FileText className="h-8 w-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{arquivo.name}</p>
                    <p className="text-xs text-muted-foreground">{(arquivo.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setArquivo(null)}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />Escolher Arquivo
                  </Button>
                  <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                    <Camera className="h-4 w-4 mr-2" />Câmera
                  </Button>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground h-12 text-base font-semibold">
              Enviar Atividade
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default StudentSubmission;
