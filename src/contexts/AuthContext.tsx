import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "aluno" | "coordenador" | "superadmin";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  coordinatedCourses?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const mockUsers: Record<UserRole, User> = {
  superadmin: {
    id: "1",
    name: "Admin Master",
    email: "admin@sistema.com",
    role: "superadmin",
  },
  coordenador: {
    id: "2",
    name: "Prof. Maria Silva",
    email: "maria@universidade.com",
    role: "coordenador",
    coordinatedCourses: ["1", "2"],
  },
  aluno: {
    id: "3",
    name: "João Santos",
    email: "joao@aluno.com",
    role: "aluno",
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback((email: string, _password: string, role: UserRole) => {
    setUser(mockUsers[role]);
  }, []);

  const logout = useCallback(() => {
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
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};