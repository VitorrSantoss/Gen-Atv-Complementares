import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import Login from "./pages/Login";
import EsqueciSenha from "./pages/EsqueciSenha";
import NotFound from "./pages/NotFound";

import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import AdminCoordinators from "./pages/admin/AdminCoordinators";

import CoordinatorLayout from "./components/layout/CoordinatorLayout";
import CoordinatorDashboard from "./pages/coordinator/CoordinatorDashboard";
import CoordinatorStudents from "./pages/coordinator/CoordinatorStudents";
import CoordinatorRules from "./pages/coordinator/CoordinatorRules";
import CoordinatorSubmissions from "./pages/coordinator/CoordinatorSubmissions";

import StudentLayout from "./components/layout/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentSubmission from "./pages/student/StudentSubmission";
import StudentNotifications from "./pages/student/StudentNotifications";

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
  if (!allowedRoles.includes(user!.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate
              to={
                user!.role === "superadmin"
                  ? "/admin"
                  : user!.role === "coordenador"
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

      <Route
        path="/esqueci-senha"
        element={
          isAuthenticated ? (
            <Navigate to="/" replace />
          ) : (
            <EsqueciSenha />
          )
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["superadmin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="cursos" element={<AdminCourses />} />
        <Route path="coordenadores" element={<AdminCoordinators />} />
      </Route>

      <Route
        path="/coordenador"
        element={
          <ProtectedRoute allowedRoles={["coordenador"]}>
            <CoordinatorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<CoordinatorDashboard />} />
        <Route path="alunos" element={<CoordinatorStudents />} />
        <Route path="regras" element={<CoordinatorRules />} />
        <Route path="solicitacoes" element={<CoordinatorSubmissions />} />
      </Route>

      <Route
        path="/aluno"
        element={
          <ProtectedRoute allowedRoles={["aluno"]}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="submissao" element={<StudentSubmission />} />
        <Route path="notificacoes" element={<StudentNotifications />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
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

export default App;