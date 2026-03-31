import { BottomNav } from "./BottomNav";
import { useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Download, WifiOff, X, RefreshCw } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLDivElement>(null);
  const { canInstall, install } = usePWAInstall();
  const isOnline = useOnlineStatus();
  const { syncing, pendingCount, syncQueue } = useOfflineSync();
  const [dismissedInstall, setDismissedInstall] = useState(() =>
    sessionStorage.getItem("pwa_install_dismissed") === "1"
  );

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
  const [dismissedIOS, setDismissedIOS] = useState(() =>
    !!sessionStorage.getItem("pwa_ios_dismissed")
  );
  const showIOSInstall = isIOS && !isStandalone && !dismissedIOS;

  // Scroll para o topo ao trocar de rota
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0);
  }, [pathname]);

  const handleDismissInstall = () => {
    sessionStorage.setItem("pwa_install_dismissed", "1");
    setDismissedInstall(true);
  };

  const handleDismissIOS = () => {
    sessionStorage.setItem("pwa_ios_dismissed", "1");
    setDismissedIOS(true);
  };

  const showInstallBanner = (canInstall && !dismissedInstall) || showIOSInstall;

  return (
    <div className="h-[100dvh] flex flex-col bg-muted select-none">
      {/* Barra gradiente topo */}
      <div className="bg-gradient-to-r from-primary via-rose-400 to-pink-300 h-1.5 shrink-0" />

      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 shrink-0 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">FS</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight">Painel de Pagamentos</h1>
              <p className="text-[10px] text-muted-foreground">Dra. Fernanda Sarelli</p>
            </div>
          </div>

          {/* Status indicators — small and unobtrusive */}
          <div className="flex items-center gap-1.5">
            {!isOnline && (
              <span className="text-[10px] text-destructive font-semibold flex items-center gap-1 bg-destructive/10 px-2 py-1 rounded-full border border-destructive/20">
                <WifiOff size={9} /> Offline
              </span>
            )}
            {isOnline && syncing && (
              <span className="text-[10px] text-primary font-semibold flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-full">
                <RefreshCw size={9} className="animate-spin" /> Sincronizando
              </span>
            )}
            {isOnline && !syncing && pendingCount > 0 && (
              <button
                onClick={syncQueue}
                className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20 active:opacity-70"
              >
                <RefreshCw size={9} /> {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto overscroll-y-contain min-h-0"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingBottom: showInstallBanner
            ? "calc(140px + env(safe-area-inset-bottom, 0px))"
            : "calc(80px + env(safe-area-inset-bottom, 0px))",
          overscrollBehavior: "none",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4">
          {children}
        </div>
      </main>

      <BottomNav />

      {/* Botão instalar PWA — centralizado acima da BottomNav, sem banner */}
      {canInstall && !dismissedInstall && (
        <div className="fixed bottom-[72px] left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={install}
            className="flex items-center gap-2 bg-primary text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg active:opacity-70"
          >
            <Download size={14} />
            Instalar app
          </button>
        </div>
      )}
    </div>
  );
}
