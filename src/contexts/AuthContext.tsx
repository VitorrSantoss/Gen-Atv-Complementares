import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authService } from "@/services/authService";

export type UserRole = "aluno" | "coordenador" | "superadmin";

interface User {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<UserRole>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapRoleFromToken(token: string): UserRole {
  const payloadBase64 = token.split(".")[1];
  const payloadJson = atob(payloadBase64);
  const payload = JSON.parse(payloadJson);

  const authorities: string[] =
    payload.roles ||
    payload.authorities ||
    [];

  if (authorities.includes("ROLE_SUPER_ADMIN")) return "superadmin";
  if (authorities.includes("ROLE_COORDENADOR")) return "coordenador";
  return "aluno";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");

    if (token && email) {
      const role = mapRoleFromToken(token);
      setUser({ email, role });
    }
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const data = await authService.login({ email, senha });

    localStorage.setItem("token", data.token);
    localStorage.setItem("userEmail", email);

    const role = mapRoleFromToken(data.token);
    setUser({ email, role });

    return role;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};