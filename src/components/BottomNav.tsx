import { NavLink } from "@/components/NavLink";
import { PlusCircle, List, BarChart3, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function BottomNav() {
  const { signOut } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border">
      <div
        className="flex justify-around items-stretch max-w-lg mx-auto"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <NavLink
          to="/"
          end
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] py-3 px-3 min-w-[56px] transition-colors text-muted-foreground active:scale-95"
          activeClassName="text-primary font-semibold"
        >
          <PlusCircle size={22} strokeWidth={1.8} />
          <span>Cadastrar</span>
        </NavLink>
        <NavLink
          to="/cadastros"
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] py-3 px-3 min-w-[56px] transition-colors text-muted-foreground active:scale-95"
          activeClassName="text-primary font-semibold"
        >
          <List size={22} strokeWidth={1.8} />
          <span>Fichas</span>
        </NavLink>
        <NavLink
          to="/dashboard"
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] py-3 px-3 min-w-[56px] transition-colors text-muted-foreground active:scale-95"
          activeClassName="text-primary font-semibold"
        >
          <BarChart3 size={22} strokeWidth={1.8} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/usuarios"
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] py-3 px-3 min-w-[56px] transition-colors text-muted-foreground active:scale-95"
          activeClassName="text-primary font-semibold"
        >
          <UserPlus size={22} strokeWidth={1.8} />
          <span>Usuários</span>
        </NavLink>
        <button
          onClick={signOut}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] py-3 px-3 min-w-[56px] transition-colors text-muted-foreground border-0 bg-transparent cursor-pointer active:scale-95"
        >
          <LogOut size={22} strokeWidth={1.8} />
          <span>Sair</span>
        </button>
      </div>
    </nav>
  );
}