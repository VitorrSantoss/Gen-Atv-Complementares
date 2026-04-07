import { api } from "@/lib/api";

// 1. Ajustado para bater com o SubmissaoResponseDTO do Java
export interface SubmissaoResponse {
  id: number;
  titulo: string;
  descricao: string;
  horas: number;
  status: "PENDENTE" | "APROVADA" | "REPROVADA"; // Ajustado para os nomes do seu Enum no Java
  feedback?: string;
  dataSubmissao: string;
  alunoNome: string;
  cursoNome: string;
  
  // No Java enviamos um Set de certificados, pegamos o primeiro para a URL
  certificados: {
    id: number;
    nomeArquivo: string;
    urlArquivo: string;
  }[];
}

export const certificadoService = {
  // 2. Mudamos de /certificados para /submissoes
  async getAll(): Promise<SubmissaoResponse[]> {
    const response = await api.get<SubmissaoResponse[]>("/submissoes");
    return response.data;
  },

  async getById(id: number): Promise<SubmissaoResponse> {
    const response = await api.get<SubmissaoResponse>(`/submissoes/${id}`);
    return response.data;
  },

  // 3. Ajustado para as rotas que você tem no SubmissaoService do Java
  async aprovar(id: number): Promise<void> {
    // Se você criou o endpoint @PatchMapping("/{id}/aprovar") no SubmissaoController:
    await api.patch(`/submissoes/${id}/aprovar`);
  },

  async rejeitar(id: number): Promise<void> {
    // Se você criou o endpoint @PatchMapping("/{id}/rejeitar") no SubmissaoController:
    await api.patch(`/submissoes/${id}/rejeitar`);
  }
};