import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  RotateCw,
  Crop as CropIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// MODIFICAÇÃO 1: Importando o hook
import { useCourse } from "@/contexts/CourseContext";

// IMPORTAÇÃO DA BIBLIOTECA DE RECORTAR IMAGENS
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// ✅ Categoria Cultural removida
const categoryLabels: Record<string, string> = {
  pesquisa: "Pesquisa",
  extensao: "Extensão",
  ensino: "Ensino",
};

const StudentSubmission = () => {
  // MODIFICAÇÃO 2: Puxando o curso ativo do contexto
  const { activeCourse } = useCourse();

  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  // MODIFICAÇÃO: Alterado de dataInicio para semestre
  const [semestre, setSemestre] = useState("");
  const [horas, setHoras] = useState("");
  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // NOVOS ESTADOS PARA O MODAL DE CROP
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  
  const imageRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const categoriaFormatada = useMemo(
    () => (categoria ? categoryLabels[categoria] : "Não selecionada"),
    [categoria]
  );

  // =========================================================================
  // MODO OFFLINE / AUTO-SAVE
  // =========================================================================
  // Para melhorar a experiência do aluno no celular e evitar perda de dados por queda de internet ou atualização acidental da página, 
  // implementamos um sistema de salvamento automático (Auto-Save).

/* Explicando a logica criada. 
        Criamos uma lógica usando o localStorage do navegador. Agora, sempre que o aluno digita qualquer coisa no formulário (Título, Horas, etc.), o aplicativo salva esses dados em segundo plano.
        Isolamento por Curso: O rascunho é atrelado ao ID do curso selecionado. Se o aluno começar a preencher algo em "Engenharia" e mudar para "Administração", o formulário limpa. 
        Mas quando ele voltar para "Engenharia", os dados retornam magicamente tudo através deesta logica implementada!
        Limpeza Inteligente: Quando a atividade é enviada com sucesso, o sistema apaga o rascunho daquele curso para deixar o formulário limpo para a próxima submissão.
 */

  const draftKey = `draft_submission_${activeCourse.id}`;

  // 1. CARREGAR o rascunho quando entra na página ou muda de curso
  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setTitulo(parsedDraft.titulo || "");
        setCategoria(parsedDraft.categoria || "");
        // ✅ Recupera o semestre
        setSemestre(parsedDraft.semestre || "");
        setHoras(parsedDraft.horas || "");
        setDescricao(parsedDraft.descricao || "");

        // Um pequeno delay evita que o toast dispare antes da interface estar pronta
        setTimeout(() => {
          toast({
            title: "Rascunho recuperado",
            description: "Os dados que estava a preencher foram restaurados.",
          });
        }, 300);
      } catch (error) {
        console.error("Erro ao ler rascunho", error);
      }
    } else {
      // Se mudar para um curso que não tem rascunho, limpa a tela de texto
      setTitulo("");
      setCategoria("");
      setSemestre("");
      setHoras("");
      setDescricao("");
    }
  }, [activeCourse.id, toast]);

  // 2. Deixar salvo o rascunho automaticamente quando o usuário digita
  useEffect(() => {
    if (titulo || categoria || semestre || horas || descricao) {
      const draft = { titulo, categoria, semestre, horas, descricao };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    }
  }, [titulo, categoria, semestre, horas, descricao, draftKey]);

  // =========================================================================
  // LÓGICA DE FICHEIROS E AJUSTE DE IMAGEM
  // =========================================================================
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Ficheiro muito grande",
        description: "O limite é 5MB.",
        variant: "destructive",
      });
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    // Se for uma imagem, abrimos o modal de edição (CROP)
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewSrc(event.target?.result as string);
        setCrop(undefined);
        setCompletedCrop(null);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      // Se for PDF, anexa diretamente
      setArquivo(file);
    }
  };

  // Rodar a imagem num Canvas e recarregá-la na interface
  const handleRotate = async () => {
    if (!previewSrc) return;
    
    const image = new Image();
    image.src = previewSrc;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Roda a imagem 90 graus
    canvas.width = image.height;
    canvas.height = image.width;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);

    setPreviewSrc(canvas.toDataURL("image/jpeg", 1));
    // Reset ao Crop após rodar
    setCrop(undefined);
    setCompletedCrop(null);
  };

  // Aplicar o recorte escolhido
  const handleConfirmCrop = async () => {
    if (!previewSrc) return;

    // Se o utilizador não desenhou um recorte, guarda a imagem como está
    if (!completedCrop || completedCrop.width === 0 || completedCrop.height === 0 || !imageRef.current) {
      const res = await fetch(previewSrc);
      const blob = await res.blob();
      const file = new File([blob], "comprovante_ajustado.jpg", { type: "image/jpeg" });
      setArquivo(file);
      handleCancelCrop();
      return;
    }

    const image = imageRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calcula a proporção entre o tamanho visual na ecrã e o tamanho real do ficheiro
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    // Desenha apenas a área selecionada no Canvas
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // Converte o Canvas no novo ficheiro Final
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "comprovante_recortado.jpg", { type: "image/jpeg" });
        setArquivo(file);
        handleCancelCrop();
      }
    }, "image/jpeg", 0.9);
  };

  const handleCancelCrop = () => {
    setIsCropModalOpen(false);
    setPreviewSrc(null);
    setCrop(undefined);
    setCompletedCrop(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRemoveFile = () => {
    setArquivo(null);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  // =========================================================================

  const limparFormulario = () => {
    setTitulo("");
    setCategoria("");
    setSemestre("");
    setHoras("");
    setDescricao("");
    setArquivo(null);
    setSubmitted(false);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!titulo || !categoria || !semestre || !horas || !arquivo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos e anexe um comprovante.",
        variant: "destructive",
      });
      return;
    }

    // Forçando a tipagem como 'any' para evitar que o TypeScript
    // quebre a aplicação caso o CourseContext.tsx não esteja fortemente tipado.
    const cursoAtual = activeCourse as any;

    if (cursoAtual.categorias) {
      // ✅ Categoria Cultural removida do keyMap
      const keyMap: Record<string, string> = {
        ensino: "Ensino",
        pesquisa: "Pesquisa",
        extensao: "Extensao",
      };

      const catKey = keyMap[categoria];
      const regraCategoria = cursoAtual.categorias[catKey];

      if (regraCategoria) {
        const horasRestantes = regraCategoria.limite - regraCategoria.aprovadas;
        const horasSolicitadas = Number(horas);

        if (horasSolicitadas > horasRestantes) {
          toast({
            title: "Limite de horas excedido",
            description: `Apenas restam ${Math.max(
              0,
              horasRestantes
            )}h disponíveis na categoria ${
              categoryLabels[categoria]
            }. (Limite total: ${regraCategoria.limite}h).`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    // Apaga o rascunho quando a submissão dá certo
    localStorage.removeItem(draftKey);
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
            {/* MODIFICAÇÃO 3: Exibindo o nome do curso para o aluno na tela de sucesso */}
            <p className="text-slate-500 mt-1 text-sm sm:text-base">
              Registe uma atividade complementar para o curso de{" "}
              <strong className="text-[#0066FF]">{activeCourse.name}</strong>
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
                  A sua atividade foi registada e será avaliada pela coordenação.
                  Acompanhe o estado no seu painel.
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
                      Semestre
                    </p>
                    <p className="font-semibold text-slate-900">{semestre}</p>
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
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 relative">
      {/* Cabeçalho */}
      <div>
        <h1
          className="text-3xl sm:text-4xl font-bold text-slate-900"
          style={{ fontFamily: "Plus Jakarta Sans, sans-serif" }}
        >
          Nova Atividade
        </h1>
        {/* Exibindo o nome do curso para o aluno na tela de formulário */}
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Registe uma atividade complementar para o curso de{" "}
          <strong className="text-[#0066FF]">{activeCourse.name}</strong>
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
                      {/* ✅ Categoria Cultural removida das opções */}
                      <SelectItem value="pesquisa">Pesquisa</SelectItem>
                      <SelectItem value="extensao">Extensão</SelectItem>
                      <SelectItem value="ensino">Ensino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/*  MODIFICAÇÃO: Trocado Data de Início por Semestre */}
                <div className="lg:col-span-4 space-y-2">
                  <Label htmlFor="semestre" className="text-slate-700 font-medium">
                    Semestre *
                  </Label>
                  <Input
                    id="semestre"
                    type="text"
                    placeholder="Ex: 2024.1"
                    className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                    value={semestre}
                    onChange={(e) => setSemestre(e.target.value)}
                  />
                </div>

                <div className="lg:col-span-3 space-y-2">
                  <Label htmlFor="horas" className="text-slate-700 font-medium">
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
                      Escolher Ficheiro
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
                    Antes de enviar a sua atividade
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-sm text-slate-600">
                <div className="flex gap-3">
                  <CalendarDays className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                  <p>Informe corretamente o semestre em que realizou a atividade.</p>
                </div>

                <div className="flex gap-3">
                  <Clock3 className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                  <p>
                    Preencha a carga horária exatamente como consta no comprovante.
                  </p>
                </div>

                <div className="flex gap-3">
                  <FolderOpen className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                  <p>Envie ficheiros em PDF, JPG ou PNG com no máximo 5MB.</p>
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
                      Semestre
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {semestre || "--"}
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
                    {arquivo ? arquivo.name : "Nenhum ficheiro anexado"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL DE EDIÇÃO DE IMAGEM COM A BIBLIOTECA DE CROP */}
      {isCropModalOpen && previewSrc &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-3xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[95vh]">
              
              {/* CABEÇALHO DO MODAL */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-50 text-[#0066FF] rounded-xl flex items-center justify-center">
                    <CropIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">
                      Ajustar Comprovante
                    </h3>
                    <p className="text-xs text-slate-500 font-medium hidden sm:block">
                      Arraste o rato sobre a imagem para desenhar o recorte.
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelCrop}
                  className="h-8 w-8 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* CORPO CENTRAL DO MODAL (Onde fica a imagem) */}
              <div className="p-4 bg-slate-100 flex flex-col items-center justify-center relative overflow-auto h-[50vh] sm:h-[60vh]">
                <div className="relative shadow-sm rounded-lg overflow-hidden bg-white max-w-full">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                  >
                    <img
                      ref={imageRef}
                      src={previewSrc}
                      alt="Pré-visualização"
                      className="max-h-[45vh] sm:max-h-[55vh] w-auto object-contain"
                    />
                  </ReactCrop>
                </div>
                <p className="text-xs text-slate-400 mt-4 text-center sm:hidden">
                  Deslize o dedo sobre a imagem para recortar.
                </p>
              </div>

              {/* RODAPÉ DO MODAL (Botões) */}
              <div className="p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRotate}
                  className="w-full sm:w-auto h-12 gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl"
                >
                  <RotateCw className="h-5 w-5" />
                  Rodar 90º
                </Button>

                <div className="flex gap-3 w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCancelCrop}
                    className="flex-1 sm:flex-none h-12 px-6 font-bold text-slate-600 rounded-xl"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmCrop}
                    className="flex-1 sm:flex-none h-12 px-8 bg-[#00B67A] hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200"
                  >
                    Confirmar
                  </Button>
                </div>
              </div>

            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default StudentSubmission;