import { api } from "@/lib/api";
import { CourseResponse } from "./courseService";

export interface CoordinatorUser {
  id: number;
  nome: string;
  email: string;
}

export interface CoordCursoLink {
  id: number;
  nome: string; // Nome que vem da tb_coordenadores_curso
  email: string;
  nivelAcesso: string;
  coordenador: { id: number; nome: string };
  curso: { id: number; nome: string };
}

export const coordService = {
  // Busca todos os vínculos existentes (tb_coordenadores_curso)
  async getAllVinculos(): Promise<CoordCursoLink[]> {
    const response = await api.get<CoordCursoLink[]>("/coordenadores-cursos");
    return response.data;
  },

  // Busca usuários que possuem perfil de COORDENADOR (para o Select)
  async getAvailableCoordinators(): Promise<CoordinatorUser[]> {
    const response = await api.get<CoordinatorUser[]>("/usuarios/coordenadores");
    return response.data;
  },

  // Cria o vínculo (Envia o Map que o Java espera: coordenadorId e cursoId)
  async bind(coordenadorId: number, cursoId: number): Promise<void> {
    await api.post("/coordenadores-cursos", {
      coordenadorId,
      cursoId
    });
  },

  // Remove um vínculo pelo ID da tabela de ligação
  async unbind(id: number): Promise<void> {
    await api.delete(`/coordenadores-cursos/${id}`);
  }
};