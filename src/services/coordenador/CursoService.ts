import { api } from "@/lib/api";

export interface CursoResponse {
  id: number;
  nome: string;
  codigo: string;
  cargaHorariaTotal: number;
}

export const cursoService = {
  // Bate no @GetMapping do seu CursoController
  async getAll(): Promise<CursoResponse[]> {
    const response = await api.get<CursoResponse[]>("/cursos");
    return response.data;
  },

  async getById(id: number): Promise<CursoResponse> {
    const response = await api.get<CursoResponse>(`/cursos/${id}`);
    return response.data;
  }
};