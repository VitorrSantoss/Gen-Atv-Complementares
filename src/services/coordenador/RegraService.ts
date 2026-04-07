import { api } from "@/lib/api";

export interface ItemRegraAtividade {
  id?: number;
  descricao: string;
  aproveitamento: string;
  explicacao?: string;
}

export interface RegraAtividade {
  id: string;
  area: string;
  limiteHoras: number;
  exigeComprovante: boolean;
  cursoId: number;
  itens: ItemRegraAtividade[];
}

export const regraService = {
  async getByCurso(cursoId: number): Promise<RegraAtividade[]> {
    const response = await api.get<RegraAtividade[]>(`/regras/curso/${cursoId}`);
    return response.data;
  },

  async save(regra: Partial<RegraAtividade>): Promise<RegraAtividade> {
    const response = await api.post<RegraAtividade>("/regras", regra);
    return response.data;
  },

  async update(id: string, regra: Partial<RegraAtividade>): Promise<RegraAtividade> {
    const response = await api.put<RegraAtividade>(`/regras/${id}`, regra);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/regras/${id}`);
  }
};