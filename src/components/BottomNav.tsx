import { NavLink } from "@/components/NavLink";
import { PlusCircle, List, BarChart3, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function BottomNav() {
  const { signOut } = useAuth();

  const linkClass = "flex flex-col items-center gap-1 text-[10px] py-2 px-3 rounded-lg transition-colors text-muted-foreground";
  const activeClass = "text-primary bg-primary/10";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-t border-border safe-area-bottom">
      <div className="flex justify-around items-center max-w-lg mx-auto px-2 pb-1">
        <NavLink to="/" end className={linkClass} activeClassName={activeClass}>
          <PlusCircle size={22} />
          <span>Cadastrar</span>
        </NavLink>
        <NavLink to="/cadastros" className={linkClass} activeClassName={activeClass}>
          <List size={22} />
          <span>Cadastros</span>
        </NavLink>
        <NavLink to="/dashboard" className={linkClass} activeClassName={activeClass}>
          <BarChart3 size={22} />
          <span>Dashboard</span>
        </NavLink>
        <button onClick={signOut} className={`${linkClass} border-0 bg-transparent`}>
          <LogOut size={22} />
          <span>Sair</span>
        </button>
      </div>
    </nav>
  );
}
