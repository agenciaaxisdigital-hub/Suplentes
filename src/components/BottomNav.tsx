import { NavLink } from "@/components/NavLink";
import { PlusCircle, List, BarChart3, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export function BottomNav() {
  const { signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex justify-around items-stretch max-w-lg mx-auto">
        <NavLink
          to="/"
          end
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] py-3 px-2 min-w-[52px] min-h-[52px] transition-colors text-muted-foreground active:scale-90 active:opacity-70"
          activeClassName="text-primary font-semibold"
        >
          <PlusCircle size={22} strokeWidth={1.8} />
          <span>Cadastrar</span>
        </NavLink>
        <NavLink
          to="/cadastros"
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] py-3 px-2 min-w-[52px] min-h-[52px] transition-colors text-muted-foreground active:scale-90 active:opacity-70"
          activeClassName="text-primary font-semibold"
        >
          <List size={22} strokeWidth={1.8} />
          <span>Fichas</span>
        </NavLink>
        <NavLink
          to="/dashboard"
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] py-3 px-2 min-w-[52px] min-h-[52px] transition-colors text-muted-foreground active:scale-90 active:opacity-70"
          activeClassName="text-primary font-semibold"
        >
          <BarChart3 size={22} strokeWidth={1.8} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink
          to="/usuarios"
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] py-3 px-2 min-w-[52px] min-h-[52px] transition-colors text-muted-foreground active:scale-90 active:opacity-70"
          activeClassName="text-primary font-semibold"
        >
          <UserPlus size={22} strokeWidth={1.8} />
          <span>Usuários</span>
        </NavLink>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex flex-col items-center justify-center gap-0.5 text-[10px] py-3 px-2 min-w-[52px] min-h-[52px] transition-colors text-muted-foreground border-0 bg-transparent cursor-pointer active:scale-90 active:opacity-70 disabled:opacity-50"
        >
          {signingOut ? (
            <div className="w-[22px] h-[22px] border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          ) : (
            <LogOut size={22} strokeWidth={1.8} />
          )}
          <span>{signingOut ? "Saindo..." : "Sair"}</span>
        </button>
      </div>
    </nav>
  );
}
