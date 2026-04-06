// src/services/courseService.ts
import { api } from "@/lib/api";

export interface CourseRequest {
  nome: string;
  codCurso: string;
  statusCurso: boolean;
  cargaHorariaMinima: number;
}

export interface CourseResponse {
  id: number;
  nome: string;
  codCurso: string;
  statusCurso: boolean;
  cargaHorariaMinima: number;
}

export const courseService = {
  // Nota: Verifique se existe o endpoint de listagem no seu Back-end
  async getAll(): Promise<CourseResponse[]> {
    const response = await api.get<CourseResponse[]>("/cursos");
    return response.data;
  },

  async create(data: CourseRequest): Promise<CourseResponse> {
    const response = await api.post<CourseResponse>("/cursos", data);
    return response.data;
  },

  async update(id: number, data: CourseRequest): Promise<CourseResponse> {
    const response = await api.put<CourseResponse>(`/cursos/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/cursos/${id}`);
  }
};