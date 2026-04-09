import { api } from "@/lib/api";

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

export const certificadoService = {
  async getAll(): Promise<SubmissaoResponse[]> {
    const response = await api.get<SubmissaoResponse[]>("/submissoes");
    return response.data;
  },

  async getById(id: number): Promise<SubmissaoResponse> {
    const response = await api.get<SubmissaoResponse>(`/submissoes/${id}`);
    return response.data;
  },

  /**
   * Aprova a submissão enviando o feedback do coordenador no body.
   * O back-end salva o feedback e dispara o email de aprovação para o aluno.
   */
  async aprovar(id: number, feedback?: string): Promise<void> {
    await api.patch(`/submissoes/${id}/aprovar`, { feedback: feedback ?? "" });
  },

  /**
   * Rejeita a submissão enviando o motivo no body.
   * O back-end salva o feedback e dispara o email de reprovação para o aluno.
   */
  async rejeitar(id: number, feedback?: string): Promise<void> {
    await api.patch(`/submissoes/${id}/rejeitar`, { feedback: feedback ?? "" });
  },
};