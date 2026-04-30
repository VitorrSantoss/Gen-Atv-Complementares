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

export interface AlunoCsvResponse {
  totalLinhas: number;
  sucessos: number;
  falhas: number;
  detalhes: {
    linha: number;
    email: string;
    matricula: string;
    sucesso: boolean;
    motivo?: string;
  }[];
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

  //  NOVO MÉTODO (CSV)
  async uploadCsv(file: File): Promise<AlunoCsvResponse> {
    const formData = new FormData();
    formData.append("arquivo", file); // ⚠️ TEM QUE SER "arquivo"

    const response = await api.post<AlunoCsvResponse>(
      "/alunos/lote/csv",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        validateStatus: (status) => status >= 200 && status < 300 || status === 207,
      }
    );

    return response.data;
  },
};