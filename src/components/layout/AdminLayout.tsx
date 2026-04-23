import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LayoutDashboard, BookOpen, Users, Layers, LogOut, Menu, UserCog } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
// Componentes do Sheet para o menu mobile
// Layouts (Menu Responsivo com Shadcn)
// Foi ocultada a lógica manual de Sidebar e aplicada o componente Sheet nativo da sua biblioteca UI
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/cursos", icon: BookOpen, label: "Cursos" },
  { to: "/admin/turmas", icon: Layers, label: "Turmas" },
  { to: "/admin/coordenadores", icon: Users, label: "Acessos" },
  { to: "/admin/usuarios", icon: UserCog, label: "Usuários" },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleLogout = () => { 
    logout(); 
    navigate("/"); 
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center text-accent-foreground font-bold text-sm">
            SA
          </div>
          <div>
            <p className="text-sm font-semibold text-sidebar-foreground">{user?.email || "Admin"}</p>
            <p className="text-xs text-sidebar-foreground/60">Super Admin</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setSheetOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? "bg-sidebar-accent text-sidebar-primary" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-sidebar-border mt-auto">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 min-h-[44px]" 
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" /> Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:w-64 flex-col fixed inset-y-0 z-30">
        <SidebarContent />
      </aside>

      {/* Conteúdo Principal */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Header Mobile com Sheet */}
        <header className="lg:hidden flex items-center gap-3 p-4 border-b border-border bg-card">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
                <Menu className="h-6 w-6 text-foreground" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <span className="font-semibold text-foreground">Painel Admin</span>
        </header>
        
        <div className="p-4 md:p-6 lg:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;