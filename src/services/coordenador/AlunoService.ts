import { api } from "@/lib/api";

export interface AlunoResponse {
  usuarioId: number;
  matricula: string;
  email: string;
  cursoId: number | null;
}

export interface AlunoRequest {
  email: string;
  matricula: string;
  cursoId: number;
}

export const alunoService = {
  async getAll(): Promise<AlunoResponse[]> {
    const response = await api.get<AlunoResponse[]>("/alunos");
    return response.data;
  },

  async getById(id: number): Promise<AlunoResponse> {
    const response = await api.get<AlunoResponse>(`/alunos/${id}`);
    return response.data;
  },

  async create(data: AlunoRequest): Promise<AlunoResponse> {
    const response = await api.post<AlunoResponse>("/alunos", data);
    return response.data;
  },

  async update(id: number, data: AlunoRequest): Promise<AlunoResponse> {
    const response = await api.put<AlunoResponse>(`/alunos/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/alunos/${id}`);
  },
};