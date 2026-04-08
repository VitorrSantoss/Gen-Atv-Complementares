import { api } from "@/lib/api";

export interface SubmissaoRequest {
  titulo: string;
  descricao?: string;
  horas: number;
  alunoId: number;
  cursoId: number;
}

export interface CertificadoRequest {
  nomeArquivo: string;
  urlArquivo: string;
  submissaoId: number;
}

export interface CertificadoResponse {
  id: number;
  nomeArquivo: string;
  urlArquivo: string;
}

export interface SubmissaoResponse {
  id: number;
  titulo: string;
  descricao: string;
  horas: number;
  status: "PENDENTE" | "APROVADA" | "REPROVADA";
  feedback?: string;
  dataSubmissao: string;
  alunoNome: string;
  cursoNome: string;
  turmaNome: string;
  coordenadorNome?: string;
  certificados: CertificadoResponse[];
}

export const submissaoService = {
  /**
   * Busca as submissões do aluno logado.
   *
   * O back-end atual não possui filtro por aluno no endpoint GET /submissoes,
   * por isso buscamos tudo e filtramos pelo alunoId no front.
   *
   * PARA CORRIGIR DEFINITIVAMENTE NO BACK-END:
   *   1. Adicione o campo `alunoId` no SubmissaoResponseDTO:
   *        private Long alunoId;
   *        // no construtor: this.alunoId = s.getAluno().getUsuarioId();
   *
   *   2. (Opcional) Adicione um endpoint filtrado:
   *        @GetMapping("/minha")
   *        public ResponseEntity<List<SubmissaoResponseDTO>> listarMinhas(
   *            @AuthenticationPrincipal UserDetails userDetails) { ... }
   *
   *   Quando isso estiver pronto, substitua a implementação abaixo por:
   *        const response = await api.get<SubmissaoResponse[]>("/submissoes/minha");
   *        return response.data;
   */
  async getMinhas(alunoId: number): Promise<SubmissaoResponse[]> {
    const response = await api.get<SubmissaoResponse[]>("/submissoes");
    // Filtra pelo campo alunoId que precisa ser exposto no SubmissaoResponseDTO.
    // Enquanto o back não expõe esse campo, todas as submissões serão exibidas.
    return response.data.filter((s: any) =>
      s.alunoId !== undefined ? s.alunoId === alunoId : true
    );
  },

  /**
   * Cria uma nova submissão (1ª chamada do fluxo de envio).
   */
  async criar(data: SubmissaoRequest): Promise<SubmissaoResponse> {
    const response = await api.post<SubmissaoResponse>("/submissoes", data);
    return response.data;
  },

  /**
   * Anexa um certificado a uma submissão existente (2ª chamada do fluxo).
   */
  async anexarCertificado(
    data: CertificadoRequest
  ): Promise<CertificadoResponse> {
    const response = await api.post<CertificadoResponse>(
      "/certificados",
      data
    );
    return response.data;
  },

  /**
   * Deleta uma submissão — o back-end só permite quando status = PENDENTE.
   */
  async deletar(id: number): Promise<void> {
    await api.delete(`/submissoes/${id}`);
  },
};