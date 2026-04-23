import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CourseProvider } from "@/contexts/CourseContext";

// Os Layouts são mantidos como importação normal para a navegação não "piscar"
import AdminLayout from "./components/layout/AdminLayout";
import CoordinatorLayout from "./components/layout/CoordinatorLayout";
import StudentLayout from "./components/layout/StudentLayout";

// Componente de Loading para o Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Lazy Loading das Páginas (Code Splitting) 
// Foi aplicado o React.lazy nas páginas e o Suspense em volta das rotas para fazer o Code Splitting 
// Assim melhorar a performance de carregamento no PWA.
const Login = lazy(() => import("./pages/Login"));
const EsqueciSenha = lazy(() => import("./pages/EsqueciSenha"));
const ValidarCodigo = lazy(() => import("./pages/ValidarCodigo"));
const RedefinirSenha = lazy(() => import("./pages/RedefinirSenha"));
const NotFound = lazy(() => import("./pages/NotFound"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminCourses = lazy(() => import("./pages/admin/AdminCourses"));
const AdminCoordinators = lazy(() => import("./pages/admin/AdminCoordinators"));
const AdminClasses = lazy(() => import("./pages/admin/AdminClasses"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));

const CoordinatorDashboard = lazy(() => import("./pages/coordinator/CoordinatorDashboard"));
const CoordinatorStudents = lazy(() => import("./pages/coordinator/CoordinatorStudents"));
const CoordinatorRules = lazy(() => import("./pages/coordinator/CoordinatorRules"));
const CoordinatorSubmissions = lazy(() => import("./pages/coordinator/CoordinatorSubmissions"));
const CoordinatorClasses = lazy(() => import("./pages/coordinator/CoordinatorClasses"));

const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const StudentSubmission = lazy(() => import("./pages/student/StudentSubmission"));
const StudentNotifications = lazy(() => import("./pages/student/StudentNotifications"));
const StudentRules = lazy(() => import("./pages/student/StudentRules"));

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
    <Suspense fallback={<PageLoader />}>
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

        {/* ROTAS DO ALUNO */}
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
    </Suspense>
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