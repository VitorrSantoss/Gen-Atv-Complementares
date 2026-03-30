import { api } from "@/lib/api";

export type LoginRequest = {
  email: string;
  senha: string;
};

export type LoginResponse = {
  token: string;
  type: string;
};

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post("/api/auth/login", data);
    return response.data;
  },
};