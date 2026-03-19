import { BottomNav } from "./BottomNav";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted pb-20">
      {/* Header gradient bar */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-400 to-pink-300 h-1.5" />
      <header className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center">
              <span className="text-xs font-bold text-white">FS</span>
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight">Painel de Suplentes</h1>
              <p className="text-[10px] text-muted-foreground">Dra. Fernanda Sarelli</p>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-4">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
