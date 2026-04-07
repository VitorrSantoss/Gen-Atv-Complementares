import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Settings,
  FileCheck,
  LogOut,
  Menu,
  X,
  GraduationCap,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/coordenador", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/coordenador/turmas", icon: GraduationCap, label: "Turmas" },
  { to: "/coordenador/alunos", icon: Users, label: "Alunos" },
  { to: "/coordenador/regras", icon: Settings, label: "Regras" },
  { to: "/coordenador/solicitacoes", icon: FileCheck, label: "Solicitações" },
];

const CoordinatorLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          {/* Restaurado: gradient-primary e text-primary-foreground */}
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            CO
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {/* Mantido: user?.email (pois user?.name não existe no AuthContext) */}
              {user?.email}
            </p>
            <p className="text-xs text-sidebar-foreground/60">Coordenador</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary" // Restaurado: Cores originais da sidebar
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="hidden lg:flex lg:w-64 flex-col bg-sidebar fixed inset-y-0 z-30 border-r border-sidebar-border">
        <SidebarContent />
      </aside>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-foreground/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 h-full bg-sidebar flex flex-col">
            <button
              className="absolute top-4 right-4 text-sidebar-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <main className="flex-1 lg:ml-64">
        <header className="lg:hidden flex items-center gap-3 p-4 border-b border-border bg-card">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6 text-foreground" />
          </button>
          <span className="font-semibold text-foreground">
            Painel Coordenador
          </span>
        </header>

        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CoordinatorLayout;