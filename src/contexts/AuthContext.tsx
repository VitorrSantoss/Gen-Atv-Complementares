import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { api } from "@/lib/api";
import { authService } from "@/services/authService";

export type UserRole = "superadmin" | "coordenador" | "aluno";

export interface AuthUser {
  email: string;
  role: UserRole;
  name: string;
  /** ID do registro em tb_usuarios */
  usuarioId?: number;
  /** ID do registro em tb_alunos (só preenchido para perfil aluno) */
  alunoId?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<UserRole>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Decodifica o payload do JWT sem biblioteca externa */
function decodeJwtPayload(token: string): Record<string, any> {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return {};
  }
}

/** Mapeia o perfil vindo do Java (SUPER_ADMIN, COORDENADOR, ALUNO) para o role do front */
function mapRole(perfil: string): UserRole {
  if (perfil.includes("SUPER_ADMIN")) return "superadmin";
  if (perfil.includes("COORDENADOR")) return "coordenador";
  return "aluno";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  /** Restaura a sessão ao carregar a página a partir do localStorage */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (!token || !savedUser) return;

    try {
      const parsed: AuthUser = JSON.parse(savedUser);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(parsed);
      // Se alunoId estiver faltando (sessão antiga), será preenchido no próximo login
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, []);


  const login = async (email: string, senha: string): Promise<UserRole> => {
    // 1. Chama o endpoint de login
    const { token } = await authService.login({ email, senha });

    // 2. Salva o token e configura o header padrão do axios
    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // 3. Decodifica o payload para extrair role e subject (email)
    const payload = decodeJwtPayload(token);
    const roles: string[] = payload.roles ?? [];
    const roleString = roles[0] ?? "ROLE_ALUNO";
    const role = mapRole(roleString);

    // 4. Busca os dados completos do usuário logado (nome + id) via API
    let name = email;
    let usuarioId: number | undefined;
    let alunoId: number | undefined;

    try {
      // Usa /usuarios/me para não depender de permissão SUPER_ADMIN
      const resp = await api.get("/usuarios/me");
      name = resp.data.nome ?? email;
      usuarioId = resp.data.id;

      // 5. Se for aluno, busca o registro de aluno para obter o alunoId
      if (role === "aluno" && usuarioId) {
        try {
          const alunoResp = await api.get("/alunos/me");
          alunoId = alunoResp.data.usuarioId;
        } catch {
          // Aluno ainda não cadastrado na tabela tb_alunos — ok, continua
        }
      }
    } catch {
      // Falha ao buscar dados extras — usa o email como nome
    }

    const authUser: AuthUser = { email, role, name, usuarioId, alunoId };
    localStorage.setItem("user", JSON.stringify(authUser));
    setUser(authUser);

    return role;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}