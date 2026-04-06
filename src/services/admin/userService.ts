import { api } from "@/lib/api";

// O que enviamos para a API (Criação ou Atualização)
export interface UserCreateRequest {
  nome: string;
  email: string;
  senha?: string; // Opcional na edição, obrigatório na criação
  perfil: "COORDENADOR" | "ALUNO" | "SUPER_ADMIN";
}

// O que recebemos da API (Usuário já salvo com ID)
export interface UserResponse {
  id: number;
  nome: string;
  email: string;
  perfil: "COORDENADOR" | "ALUNO" | "SUPER_ADMIN";
}

export const userService = {
  // POST: Cria um novo usuário
  async create(data: UserCreateRequest): Promise<UserResponse> {
    const response = await api.post("/usuarios", data);
    return response.data;
  },

  // GET: Busca TODOS os usuários
  async getAll(): Promise<UserResponse[]> {
    const response = await api.get("/usuarios");
    return response.data;
  },

  // GET: Busca APENAS os usuários com perfil COORDENADOR (Usado no seu select)
  async getCoordinators(): Promise<UserResponse[]> {
    const response = await api.get("/usuarios/coordenadores");
    return response.data;
  },

  // GET: Busca um usuário específico pelo ID
  async getById(id: number): Promise<UserResponse> {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  // GET: Busca um usuário específico pelo E-mail
  async getByEmail(email: string): Promise<UserResponse> {
    const response = await api.get(`/usuarios/email/${email}`);
    return response.data;
  },

  // PUT: Atualiza os dados de um usuário existente
  async update(id: number, data: Partial<UserCreateRequest>): Promise<UserResponse> {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  // DELETE: Apaga um usuário do sistema
  async delete(id: number): Promise<void> {
    await api.delete(`/usuarios/${id}`);
  }
};