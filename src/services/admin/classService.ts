import { api } from "@/lib/api";

// AJUSTE: O tipo do turno deve bater com o que o Java espera e o que a tela envia
export interface TurmaRequest {
  codigo: string;
  turno: "MANHA" | "TARDE" | "NOITE"; // Alterado aqui
  semestre: string;
  cursoId: number;
}

export interface TurmaResponse {
  id: number;
  codigo: string;
  turno: string;
  semestre: string;
  ativa: boolean;
  curso: {
    id: number;
    nome: string;
  };
}

export const classService = {
  async getAll(): Promise<TurmaResponse[]> {
    const response = await api.get<TurmaResponse[]>("/turmas");
    return response.data;
  },

  async create(data: TurmaRequest): Promise<TurmaResponse> {
    const response = await api.post<TurmaResponse>("/turmas", data);
    return response.data;
  },

  async update(id: number, data: TurmaRequest): Promise<TurmaResponse> {
    const response = await api.put<TurmaResponse>(`/turmas/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/turmas/${id}`);
  }
};