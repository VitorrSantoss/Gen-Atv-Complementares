import { api } from "@/lib/api";

export interface AlunoTurmaResponse {
  usuarioId: number;
  matricula: string;
  nome: string;
  email: string;
  turmaNome?: string;
}

export const turmaAlunoService = {
  async listarAlunos(turmaId: number): Promise<AlunoTurmaResponse[]> {
    const resp = await api.get(`/turmas/${turmaId}/alunos`);
    return resp.data;
  },

  async vincular(turmaId: number, alunoId: number): Promise<void> {
    await api.patch(`/turmas/${turmaId}/alunos/${alunoId}`);
  },

  async desvincular(turmaId: number, alunoId: number): Promise<void> {
    await api.delete(`/turmas/${turmaId}/alunos/${alunoId}`);
  },
};