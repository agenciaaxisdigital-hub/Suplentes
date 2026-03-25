import { BottomNav } from "./BottomNav";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-muted">
      {/* Header gradient bar */}
      <div className="bg-gradient-to-r from-primary via-rose-400 to-pink-300 h-1.5 shrink-0" />
      <header className="bg-card border-b border-border px-4 py-3 sticky top-0 z-40 shrink-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-rose-400 flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">FS</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight">Painel de Suplentes</h1>
              <p className="text-[10px] text-muted-foreground">Dra. Fernanda Sarelli</p>
            </div>
          </div>
        </div>
      </header>
      <main
        className="flex-1 overflow-y-auto overscroll-y-contain"
        style={{
          WebkitOverflowScrolling: "touch",
          paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
