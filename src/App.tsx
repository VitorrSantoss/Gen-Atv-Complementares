import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CourseProvider } from "@/contexts/CourseContext";

import Login from "./pages/Login";
import EsqueciSenha from "./pages/EsqueciSenha";
import ValidarCodigo from "./pages/ValidarCodigo";
import RedefinirSenha from "./pages/RedefinirSenha";
import NotFound from "./pages/NotFound";

import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCoordinators from "./pages/admin/AdminCoordinators";
import AdminClasses from "./pages/admin/AdminClasses";
import AdminUsers from "./pages/admin/AdminUsers";

import CoordinatorLayout from "./components/layout/CoordinatorLayout";
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import CoordinatorStudents from "./pages/coordinator/CoordinatorStudents";
import CoordinatorRules from "./pages/coordinator/CoordinatorRules";
import CoordinatorSubmissions from "./pages/coordinator/CoordinatorSubmissions";
import CoordinatorClasses from "./pages/coordinator/CoordinatorClasses";

import StudentLayout from "./components/layout/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentSubmission from "./pages/student/StudentSubmission";
import StudentNotifications from "./pages/student/StudentNotifications";
import StudentRules from "./pages/student/StudentRules";

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated && user ? (
            <Navigate
              to={
                user.role === "superadmin"
                  ? "/admin"
                  : user.role === "coordenador"
                  ? "/coordenador"
                  : "/aluno"
              }
              replace
            />
          ) : (
            <Login />
          )
        }
      />

      {/* Recuperação de senha — públicas */}
      <Route path="/esqueci-senha" element={isAuthenticated ? <Navigate to="/" replace /> : <EsqueciSenha />} />
      <Route path="/validar-codigo" element={isAuthenticated ? <Navigate to="/" replace /> : <ValidarCodigo />} />
      <Route path="/redefinir-senha" element={isAuthenticated ? <Navigate to="/" replace /> : <RedefinirSenha />} />

      {/* ROTAS DO SUPER ADMIN */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["superadmin"]}><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="cursos" element={<AdminCourses />} />
        <Route path="turmas" element={<AdminClasses />} />
        <Route path="coordenadores" element={<AdminCoordinators />} />
        <Route path="usuarios" element={<AdminUsers />} />
      </Route>

      {/* ROTAS DO COORDENADOR */}
      <Route path="/coordenador" element={<ProtectedRoute allowedRoles={["coordenador"]}><CoordinatorLayout /></ProtectedRoute>}>
        <Route index element={<CoordinatorDashboard />} />
        <Route path="turmas" element={<CoordinatorClasses />} />
        <Route path="alunos" element={<CoordinatorStudents />} />
        <Route path="regras" element={<CoordinatorRules />} />
        <Route path="solicitacoes" element={<CoordinatorSubmissions />} />
      </Route>

      {/* ROTAS DO ALUNO — CourseProvider só carrega aqui, após AuthContext já ter restaurado o header */}
      <Route
        path="/aluno"
        element={
          <ProtectedRoute allowedRoles={["aluno"]}>
            <CourseProvider>
              <StudentLayout />
            </CourseProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="submissao" element={<StudentSubmission />} />
        <Route path="regras" element={<StudentRules />} />
        <Route path="notificacoes" element={<StudentNotifications />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;