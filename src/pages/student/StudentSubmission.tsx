import { useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Camera,
  FileText,
  X,
  CheckCircle,
  Info,
  CalendarDays,
  Clock3,
  FolderOpen,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categoryLabels: Record<string, string> = {
  pesquisa: "Pesquisa",
  extensao: "Extensão",
  ensino: "Ensino",
  cultural: "Cultural",
};

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

  const categoriaFormatada = useMemo(
    () => (categoria ? categoryLabels[categoria] : "Não selecionada"),
    [categoria]
  );

  const limparFormulario = () => {
    setTitulo("");
    setCategoria("");
    setDataInicio("");
    setHoras("");
    setDescricao("");
    setArquivo(null);
    setSubmitted(false);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O limite é 5MB.",
        variant: "destructive",
      });
      return;
    }

    setArquivo(file);
  };

  const handleRemoveFile = () => {
    setArquivo(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo || !categoria || !dataInicio || !horas || !arquivo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos e anexe um comprovante.",
        variant: "destructive",
      });
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl">
          <div className="mb-8">
            <h1
              className="text-3xl sm:text-4xl font-bold text-slate-900"
              style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
            >
              Nova Atividade
            </h1>
            <p className="text-slate-500 mt-1 text-sm sm:text-base">
              Registre uma atividade complementar e envie o comprovante
            </p>
          </div>

          <Card className="border border-slate-200 shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-8 sm:p-10">
              <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
                  <CheckCircle className="h-10 w-10 text-[#00B67A]" />
                </div>

                <h2
                  className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2"
                  style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
                >
                  Enviado com sucesso!
                </h2>

                <p className="text-slate-500 max-w-xl mb-8">
                  Sua atividade foi registrada e será avaliada pela coordenação.
                  Acompanhe o status no seu dashboard.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      Atividade
                    </p>
                    <p className="font-semibold text-slate-900 break-words">
                      {titulo}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      Categoria
                    </p>
                    <p className="font-semibold text-slate-900">
                      {categoriaFormatada}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      Data de início
                    </p>
                    <p className="font-semibold text-slate-900">{dataInicio}</p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      Carga horária
                    </p>
                    <p className="font-semibold text-slate-900">{horas}h</p>
                  </div>
                </div>

                <Button
                  className="bg-[#0066FF] hover:bg-blue-700 text-white px-8 h-12 rounded-xl font-bold"
                  onClick={limparFormulario}
                >
                  Nova Submissão
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1
          className="text-3xl sm:text-4xl font-bold text-slate-900"
          style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
        >
          Nova Atividade
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Registre uma atividade complementar e envie o comprovante
        </p>
      </div>

      {/* Layout principal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Formulário */}
        <Card className="xl:col-span-2 border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardContent className="p-5 sm:p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="titulo" className="text-slate-700 font-medium">
                  Título da Atividade *
                </Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Congresso Nacional de Engenharia"
                  className="bg-slate-50 border-slate-200 focus:bg-white focus-visible:ring-[#0066FF] h-11 rounded-xl"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
              </div>

              {/* Grid principal dos campos */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-5 space-y-2">
                  <Label className="text-slate-700 font-medium">
                    Categoria *
                  </Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl">
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

                <div className="lg:col-span-4 space-y-2">
                  <Label htmlFor="data" className="text-slate-700 font-medium">
                    Data de Início *
                  </Label>
                  <Input
                    id="data"
                    type="date"
                    className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                  />
                </div>

                <div className="lg:col-span-3 space-y-2">
                  <Label
                    htmlFor="horas"
                    className="text-slate-700 font-medium"
                  >
                    Carga Horária *
                  </Label>
                  <Input
                    id="horas"
                    type="number"
                    placeholder="Ex: 20"
                    className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                    value={horas}
                    onChange={(e) => setHoras(e.target.value)}
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label
                  htmlFor="descricao"
                  className="text-slate-700 font-medium"
                >
                  Descrição
                </Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva brevemente a atividade realizada..."
                  className="bg-slate-50 border-slate-200 focus:bg-white min-h-[120px] rounded-xl"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>

              {/* Upload */}
              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">
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
                  <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl animate-in fade-in slide-in-from-top-1">
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0">
                      <FileText className="h-6 w-6 text-[#0066FF]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {arquivo.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(arquivo.size / 1024).toFixed(0)} KB
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="hover:bg-red-50 hover:text-red-500 rounded-full shrink-0"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 h-12 border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl transition-all"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Escolher Arquivo
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 sm:min-w-[160px] border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Câmera
                    </Button>
                  </div>
                )}
              </div>

              {/* Botão */}
              <Button
                type="submit"
                className="w-full bg-[#0066FF] hover:bg-blue-700 text-white h-14 rounded-xl text-base font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
              >
                Enviar Atividade
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
                  <Info className="h-5 w-5 text-[#0066FF]" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Orientações</h2>
                  <p className="text-sm text-slate-500">
                    Antes de enviar sua atividade
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex gap-3">
                  <CalendarDays className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                  <p>Informe corretamente a data de início da atividade.</p>
                </div>

                <div className="flex gap-3">
                  <Clock3 className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                  <p>Preencha a carga horária exatamente como consta no comprovante.</p>
                </div>

                <div className="flex gap-3">
                  <FolderOpen className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                  <p>Envie arquivos em PDF, JPG ou PNG com no máximo 5MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Resumo</h2>
                  <p className="text-sm text-slate-500">
                    Acompanhe o preenchimento
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Título
                  </p>
                  <p className="text-sm font-medium text-slate-900 break-words">
                    {titulo || "Não informado"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Categoria
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    {categoriaFormatada}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      Data
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {dataInicio || "--/--/----"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      Horas
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {horas ? `${horas}h` : "--"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                    Comprovante
                  </p>
                  <p className="text-sm font-medium text-slate-900 break-words">
                    {arquivo ? arquivo.name : "Nenhum arquivo anexado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentSubmission;