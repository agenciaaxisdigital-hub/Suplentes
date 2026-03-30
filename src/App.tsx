import { useState, useCallback } from "react";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import SplashScreen from "@/components/SplashScreen";
import Index from "./pages/Index";
import Cadastros from "./pages/Cadastros";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Usuarios from "./pages/Usuarios";
import Pagamentos from "./pages/Pagamentos";

// ─── QueryClient com suporte offline ─────────────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // offlineFirst: usa dados em cache sem tentar re-fetch quando offline
      networkMode: "offlineFirst",
      // Dados ficam "frescos" por 5 minutos; em background refetch sempre
      staleTime: 1000 * 60 * 5,
      // Cache de 24h no memory — o localStorage persiste além disso
      gcTime: 1000 * 60 * 60 * 24,
      retry: (failureCount, error: unknown) => {
        // Não tenta novamente se for erro de autenticação; tenta 2x outros erros
        const msg = (error as Error)?.message || "";
        if (msg.includes("JWT") || msg.includes("401")) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      // Mutations também funcionam offline (vão para a fila)
      networkMode: "offlineFirst",
    },
  },
});

// ─── Persiste o cache do React Query no localStorage ─────────────────────────
// Isso permite que o app funcione sem internet: na próxima abertura,
// os dados do último fetch ficam disponíveis instantaneamente.
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "rq_cache_v1",
  // Comprime para não usar muito espaço (limita a 4MB)
  throttleTime: 1000,
});

// ─── Rotas protegidas ─────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-3 bg-muted">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-2 border-primary/20" />
          <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin absolute inset-0" />
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">Carregando...</p>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ minHeight: "100dvh", background: "#070510" }} />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

// ─── App ──────────────────────────────────────────────────────────────────────

import VersionMonitor from "./components/VersionMonitor";
import InstallPWA from "./components/InstallPWA";
import { useOfflineSync } from "./hooks/useOfflineSync";

function GlobalOfflineSync() {
  useOfflineSync();
  return null;
}

const App = () => {
  const [showSplash, setShowSplash] = useState(() => {
    if (sessionStorage.getItem("splash_shown")) return false;
    sessionStorage.setItem("splash_shown", "1");
    return true;
  });

  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24,
        dehydrateOptions: {
          shouldDehydrateQuery: (query) =>
            query.state.status === "success",
        },
      }}
    >
      <TooltipProvider>
        <GlobalOfflineSync />
        <InstallPWA />
        <VersionMonitor />
        <Toaster />
        <Sonner />
        {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/cadastros" element={<ProtectedRoute><Cadastros /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
            <Route path="/pagamentos" element={<ProtectedRoute><Pagamentos /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PersistQueryClientProvider>
  );
};

export default App;
