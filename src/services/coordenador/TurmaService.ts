import { api } from "@/lib/api";

// Alinhado com o Turma.java e TurnoTurma.java do seu back-end
export type Turno = "MANHA" | "TARDE" | "NOITE";

export interface TurmaResponse {
  id: number;
  codigo: string;
  nome: string;
  turno: Turno;
  semestre: string;
  ativa: boolean;
  curso: {
    id: number;
    nome: string;
  };
}

// Alinhado com o TurmaCreateDTO.java
export interface TurmaCreateDTO {
  codigo: string;
  turno: Turno;
  semestre: string;
  cursoId: number;
}

export const turmaService = {
  async getAll() {
    const response = await api.get<TurmaResponse[]>("/turmas");
    return response.data;
  },

  async create(data: TurmaCreateDTO) {
    const response = await api.post<TurmaResponse>("/turmas", data);
    return response.data;
  },

  async update(id: number, data: TurmaCreateDTO) {
    const response = await api.put<TurmaResponse>(`/turmas/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    await api.delete(`/turmas/${id}`);
  }
};