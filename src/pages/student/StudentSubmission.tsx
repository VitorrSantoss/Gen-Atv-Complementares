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
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCourse } from "@/contexts/CourseContext";
import { useAuth } from "@/contexts/AuthContext";
import { submissaoService } from "@/services/aluno/SubmissaoService";
import { api } from "@/lib/api";

// Importação da biblioteca de recortar imagens
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// ─── Constantes ──────────────────────────────────────────────────────────────

const categoryLabels: Record<string, string> = {
  pesquisa: "Pesquisa",
  extensao: "Extensão",
  ensino: "Ensino",
};

// ─── Componente ──────────────────────────────────────────────────────────────

const StudentSubmission = () => {
  const { activeCourse, activeCourseId } = useCourse();
  const { user } = useAuth();
  const { toast } = useToast();

  // ── Formulário ────────────────────────────────────────────────────────────
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [semestre, setSemestre] = useState("");
  const [horas, setHoras] = useState("");
  const [descricao, setDescricao] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);

  // ── Estado de envio ───────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState<number | null>(null);

  // ── Crop ──────────────────────────────────────────────────────────────────
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const categoriaFormatada = useMemo(
    () => (categoria ? categoryLabels[categoria] : "Não selecionada"),
    [categoria]
  );

  // ── Auto-Save (rascunho) ──────────────────────────────────────────────────
  const draftKey = `draft_submission_${activeCourseId}`;

  useEffect(() => {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        setTitulo(d.titulo || "");
        setCategoria(d.categoria || "");
        setSemestre(d.semestre || "");
        setHoras(d.horas || "");
        setDescricao(d.descricao || "");
        setTimeout(() => {
          toast({
            title: "Rascunho recuperado",
            description: "Os dados que estava a preencher foram restaurados.",
          });
        }, 300);
      } catch {
        /* ignora */
      }
    } else {
      setTitulo("");
      setCategoria("");
      setSemestre("");
      setHoras("");
      setDescricao("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCourseId]);

  useEffect(() => {
    if (titulo || categoria || semestre || horas || descricao) {
      localStorage.setItem(
        draftKey,
        JSON.stringify({ titulo, categoria, semestre, horas, descricao })
      );
    }
  }, [titulo, categoria, semestre, horas, descricao, draftKey]);

  // ── Upload / Crop ─────────────────────────────────────────────────────────

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

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviewSrc(ev.target?.result as string);
        setCrop(undefined);
        setCompletedCrop(null);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    } else {
      setArquivo(file);
    }
  };

  const handleRotate = async () => {
    if (!previewSrc) return;
    const image = new Image();
    image.src = previewSrc;
    await new Promise((res) => (image.onload = res));
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = image.height;
    canvas.height = image.width;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    setPreviewSrc(canvas.toDataURL("image/jpeg", 1));
    setCrop(undefined);
    setCompletedCrop(null);
  };

  const handleConfirmCrop = async () => {
    if (!previewSrc) return;

    if (
      !completedCrop ||
      completedCrop.width === 0 ||
      completedCrop.height === 0 ||
      !imageRef.current
    ) {
      const res = await fetch(previewSrc);
      const blob = await res.blob();
      setArquivo(new File([blob], "comprovante.jpg", { type: "image/jpeg" }));
      handleCancelCrop();
      return;
    }

    const image = imageRef.current;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;
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
    canvas.toBlob((blob) => {
      if (blob) {
        setArquivo(
          new File([blob], "comprovante_recortado.jpg", { type: "image/jpeg" })
        );
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
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Lógica de envio ───────────────────────────────────────────────────────

  /**
   * Converte um File em Base64 (necessário para enviar como URL de certificado
   * enquanto o back-end não tem upload real de arquivos).
   *
   * NOTA: Quando o back-end implementar um endpoint de upload de arquivo,
   * substitua esta função pelo upload real e use a URL retornada.
   */
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── Validações de campos ──────────────────────────────────────────────
    if (!titulo || !categoria || !semestre || !horas || !arquivo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos e anexe um comprovante.",
        variant: "destructive",
      });
      return;
    }

    if (!activeCourseId) {
      toast({
        title: "Curso não selecionado",
        description: "Selecione um curso antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // ── Resolve o alunoId dinamicamente ──────────────────────────────────
      // Busca primeiro o usuário pelo e-mail do token, depois o registro de aluno.
      // Isso funciona mesmo que o AuthContext original não exponha alunoId.
      let alunoId: number;

      // Tenta pegar do contexto (funciona se AuthContext já foi substituído)
      if ((user as any)?.alunoId) {
        alunoId = (user as any).alunoId as number;
      } else {
        // Fallback: busca via API usando o e-mail do usuário logado
        const email = (user as any)?.email ?? "";
        // /usuarios/me é acessível por qualquer autenticado (não exige SUPER_ADMIN)
        const usuarioResp = await api.get("/usuarios/me");
        const usuarioId: number = usuarioResp.data.id;
        // /alunos/me retorna os dados do aluno logado sem precisar de SUPER_ADMIN
        const alunoResp = await api.get("/alunos/me");
        alunoId = alunoResp.data.usuarioId as number;
      }

      // ── PASSO 1: Criar a submissão ────────────────────────────────────────
      const novaSubmissao = await submissaoService.criar({
        titulo,
        descricao,
        horas: Number(horas),
        alunoId,
        cursoId: Number(activeCourseId),
      });

      // ── PASSO 2: Anexar o certificado ─────────────────────────────────────
      // Converte o arquivo para base64 (substitua por upload real quando disponível)
      const base64Url = await toBase64(arquivo);

      await submissaoService.anexarCertificado({
        nomeArquivo: arquivo.name,
        urlArquivo: base64Url,
        submissaoId: novaSubmissao.id,
      });

      // ── Sucesso ───────────────────────────────────────────────────────────
      localStorage.removeItem(draftKey);
      setSubmittedId(novaSubmissao.id);
      setSubmitted(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.response?.data ??
        "Erro ao enviar a atividade. Tente novamente.";
      toast({
        title: "Erro ao enviar",
        description: typeof msg === "string" ? msg : "Erro desconhecido.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const limparFormulario = () => {
    setTitulo("");
    setCategoria("");
    setSemestre("");
    setHoras("");
    setDescricao("");
    setArquivo(null);
    setSubmitted(false);
    setSubmittedId(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Tela de sucesso ───────────────────────────────────────────────────────

  if (submitted) {
    return (
      <div className="w-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
              Nova Atividade
            </h1>
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

                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                  Enviado com sucesso!
                </h2>

                <p className="text-slate-500 max-w-xl mb-2">
                  A sua atividade foi registada e será avaliada pela coordenação.
                </p>
                {submittedId && (
                  <p className="text-xs text-slate-400 mb-8">
                    Protocolo de envio: <strong>#{submittedId}</strong>
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl mb-8">
                  {[
                    { label: "Atividade", value: titulo },
                    { label: "Categoria", value: categoriaFormatada },
                    { label: "Semestre", value: semestre },
                    { label: "Carga horária", value: `${horas}h` },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                        {label}
                      </p>
                      <p className="font-semibold text-slate-900 break-words">
                        {value}
                      </p>
                    </div>
                  ))}
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

  // ── Tela principal do formulário ──────────────────────────────────────────

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 space-y-6 relative">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Nova Atividade
        </h1>
        <p className="text-slate-500 mt-1 text-sm sm:text-base">
          Registe uma atividade complementar para o curso de{" "}
          <strong className="text-[#0066FF]">{activeCourse.name}</strong>
        </p>
      </div>



      {/* Layout */}
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

              {/* Campos secundários */}
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
                    </SelectContent>
                  </Select>
                </div>
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
                    min="1"
                    className="bg-slate-50 border-slate-200 h-11 rounded-xl"
                    value={horas}
                    onChange={(e) => setHoras(e.target.value)}
                  />
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-slate-700 font-medium">
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

              {/* Botão de envio */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#0066FF] hover:bg-blue-700 text-white h-14 rounded-xl text-base font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Enviando...
                  </span>
                ) : (
                  "Enviar Atividade"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Orientações */}
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
                    Preencha a carga horária exatamente como consta no
                    comprovante.
                  </p>
                </div>
                <div className="flex gap-3">
                  <FolderOpen className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                  <p>Envie ficheiros em PDF, JPG ou PNG com no máximo 5MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resumo */}
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
                {[
                  { label: "Título", value: titulo || "Não informado" },
                  { label: "Categoria", value: categoriaFormatada },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-slate-50 border border-slate-200 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
                      {label}
                    </p>
                    <p className="text-sm font-medium text-slate-900 break-words">
                      {value}
                    </p>
                  </div>
                ))}

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

      {/* ─── MODAL DE CROP ───────────────────────────────────────────────────── */}
      {isCropModalOpen &&
        previewSrc &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl w-full max-w-3xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[95vh]">
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
                      Arraste sobre a imagem para desenhar o recorte.
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

              <div className="p-4 bg-slate-100 flex flex-col items-center justify-center relative overflow-auto h-[50vh] sm:h-[60vh]">
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