import { api } from "@/lib/api";

// 1. Interface atualizada para refletir o SubmissaoResponseDTO do Java
export interface SubmissaoResponse {
  id: number;
  titulo: string;
  descricao: string;
  horas: number;
  // O status deve bater exatamente com o Enum StatusSubmissao do Java
  status: "PENDENTE" | "APROVADA" | "REPROVADA"; 
  feedback?: string;
  dataSubmissao: string;
  alunoNome: string;
  cursoNome: string;
  turmaNome: string; // Campo integrado para exibir a turma do aluno
  coordenadorNome?: string; // Nome do coordenador que avaliou
  
  // Lista de certificados vinculados à submissão
  certificados: {
    id: number;
    nomeArquivo: string;
    urlArquivo: string;
  }[];
}

export const certificadoService = {
  // Busca todas as submissões (usando o endpoint do SubmissaoController)
  async getAll(): Promise<SubmissaoResponse[]> {
    const response = await api.get<SubmissaoResponse[]>("/submissoes");
    return response.data;
  },

  // Busca uma submissão específica por ID
  async getById(id: number): Promise<SubmissaoResponse> {
    const response = await api.get<SubmissaoResponse>(`/submissoes/${id}`);
    return response.data;
  },

  // Método para aprovar a submissão via PATCH
  async aprovar(id: number): Promise<void> {
    // Certifique-se de que o PatchMapping exist no SubmissaoController do Java
    await api.patch(`/submissoes/${id}/aprovar`);
  },

  // Método para rejeitar a submissão via PATCH
  async rejeitar(id: number): Promise<void> {
    // Certifique-se de que o PatchMapping existe no SubmissaoController do Java
    await api.patch(`/submissoes/${id}/rejeitar`);
  }
};