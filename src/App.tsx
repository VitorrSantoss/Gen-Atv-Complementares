import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CourseProvider } from "@/contexts/CourseContext";

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
import CoordinatorClasses from "./pages/coordinator/CoordinatorClasses";

import StudentLayout from "./components/layout/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentSubmission from "./pages/student/StudentSubmission";
import StudentNotifications from "./pages/student/StudentNotifications";
import StudentRules from "./pages/student/StudentRules"; //  Importando a nova página de regras para os alunos

const queryClient = new QueryClient();

const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

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

      <Route
        path="/esqueci-senha"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <EsqueciSenha />
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
        <Route path="turmas" element={<CoordinatorClasses />} />
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
        <Route path="regras" element={<StudentRules />} /> {/* Nova rota adicionada com as regras para os alunos */}
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
          <CourseProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </CourseProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;