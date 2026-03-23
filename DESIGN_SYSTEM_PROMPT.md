# PROMPT DE PADRONIZAÇÃO — Dra. Fernanda Sarelli / Axis Digital
> Cole este prompt inteiro ao iniciar qualquer nova aplicação do cliente.
> O dev/Claude deve seguir TODOS os itens abaixo sem desvio.

---

## CONTEXTO

Você é o dev sênior responsável por todas as aplicações do cliente **Dra. Fernanda Sarelli / Agência Axis Digital**.
Todas as aplicações devem parecer **uma única plataforma** — mesma identidade visual, mesma animação de login, mesmas cores, mesmo comportamento PWA.
Nunca quebre nenhuma funcionalidade existente ao aplicar padronização.

---

## TECH STACK OBRIGATÓRIO

```
React 18 + TypeScript
Vite 5
Tailwind CSS 3
shadcn/ui (Radix UI)
Supabase (auth + banco)
TanStack React Query 5
React Router DOM 6
Lucide React (ícones)
Sonner (toasts)
Three.js + postprocessing (animação de login)
vite-plugin-pwa (PWA)
```

---

## 1. CORES E TOKENS CSS — `src/index.css`

Substitua completamente o bloco `:root` e `.dark` por este:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 220 20% 15%;
    --card: 0 0% 100%;
    --card-foreground: 220 20% 15%;
    --popover: 0 0% 100%;
    --popover-foreground: 220 20% 15%;
    --primary: 340 82% 55%;
    --primary-foreground: 0 0% 100%;
    --secondary: 340 30% 96%;
    --secondary-foreground: 220 20% 25%;
    --muted: 220 10% 96%;
    --muted-foreground: 220 10% 45%;
    --accent: 340 82% 55%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 220 10% 90%;
    --input: 220 10% 90%;
    --ring: 340 82% 55%;
    --radius: 0.75rem;
    --sidebar-background: 0 0% 98%;
    --sidebar-foreground: 220 20% 25%;
    --sidebar-primary: 340 82% 55%;
    --sidebar-primary-foreground: 0 0% 100%;
    --sidebar-accent: 340 30% 96%;
    --sidebar-accent-foreground: 220 20% 25%;
    --sidebar-border: 220 10% 90%;
    --sidebar-ring: 340 82% 55%;
  }

  .dark {
    --background: 240 10% 6%;
    --foreground: 0 0% 95%;
    --card: 240 10% 9%;
    --card-foreground: 0 0% 95%;
    --popover: 240 10% 9%;
    --popover-foreground: 0 0% 95%;
    --primary: 340 82% 60%;
    --primary-foreground: 0 0% 100%;
    --secondary: 340 20% 15%;
    --secondary-foreground: 0 0% 90%;
    --muted: 240 8% 14%;
    --muted-foreground: 220 10% 55%;
    --accent: 340 82% 60%;
    --accent-foreground: 0 0% 100%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 0 0% 100%;
    --border: 240 8% 16%;
    --input: 240 8% 16%;
    --ring: 340 82% 60%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    -webkit-tap-highlight-color: transparent;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overscroll-behavior: none;
    touch-action: manipulation;
  }

  /* Esconde scrollbar — feel de app nativo */
  ::-webkit-scrollbar { display: none; }
  * { scrollbar-width: none; }

  /* Safe area para celulares com notch */
  #root {
    min-height: 100dvh;
    padding-top: env(safe-area-inset-top);
  }

  html {
    overscroll-behavior: none;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }

  * { -webkit-tap-highlight-color: transparent; }

  button, a, input, select, textarea, [role="button"] {
    touch-action: manipulation;
  }

  /* Cor de seleção de texto */
  ::selection {
    background: hsl(340 82% 55% / 0.3);
  }

  /* Previne zoom em inputs no iOS */
  input, select, textarea {
    font-size: 16px !important;
  }

  /* Modo standalone PWA */
  @media (display-mode: standalone) {
    body {
      overscroll-behavior-y: none;
      user-select: text;
    }
  }
}
```

---

## 2. TAILWIND CONFIG — `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

---

## 3. VITE CONFIG — `vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: { overlay: false },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png"],
      manifest: {
        // ADAPTE: nome do app específico
        name: "NOME DO APP — Dra. Fernanda Sarelli",
        short_name: "SIGLA FS",
        description: "Descrição do app",
        theme_color: "#ec4899",
        background_color: "#0f0f0f",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any maskable" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
}));
```

---

## 4. COMPONENTE HYPERSPEED — `src/components/Hyperspeed.tsx`

Copie exatamente o arquivo `Hyperspeed.tsx` do projeto `painel-de-suplentes`.
Ele usa Three.js + postprocessing para renderizar a animação 3D de rodovia infinita.

**Dependências obrigatórias para instalar:**
```bash
npm install three postprocessing
npm install -D @types/three
```

---

## 5. TELA DE LOGIN — `src/pages/Login.tsx`

A tela de login É A IDENTIDADE VISUAL MAIS IMPORTANTE. Deve ser idêntica em todas as aplicações, mudando apenas:
- `APP_TITLE` — nome do painel específico (ex: "Painel Financeiro", "Painel de Mídia")
- `EMAIL_DOMAIN` — domínio do email Supabase do app específico
- `PHOTO_URL` — foto da Dra. Fernanda (mesma em todos)
- `FOOTER_LINK` — link do site da Dra.

```tsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, LogIn, Lock, User } from "lucide-react";
import Hyperspeed from "@/components/Hyperspeed";
import { toast } from "@/hooks/use-toast";

// ─── ADAPTE ESTAS CONSTANTES POR APP ───────────────────────────────────────
const APP_TITLE = "Painel de Suplentes";          // nome visível no login
const EMAIL_DOMAIN = "@painel.sarelli.com";        // domínio Supabase do app
const PHOTO_URL =
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699400706d955b03c8c19827/16e72069d_WhatsAppImage2026-02-17at023641.jpeg";
// ───────────────────────────────────────────────────────────────────────────

// Preset Hyperspeed — NÃO ALTERE (identidade visual padronizada)
const hyperspeedPreset = {
  onSpeedUp: () => {},
  onSlowDown: () => {},
  distortion: "turbulentDistortion",
  length: 800,
  roadWidth: 18,
  islandWidth: 4,
  lanesPerRoad: 3,
  fov: 100,
  fovSpeedUp: 140,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 40,
  lightPairsPerRoadWay: 80,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5],
  lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 100],
  movingCloserSpeed: [-120, -180],
  carLightsLength: [800 * 0.04, 800 * 0.14],
  carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080510,
    islandColor: 0x0a0812,
    background: 0x070510,
    shoulderLines: 0x1a0a1a,
    brokenLines: 0x1a0a1a,
    leftCars: [0xec4899, 0xf9a8d4, 0xbe185d, 0xfda4af],
    rightCars: [0xf43f5e, 0xff6b9d, 0xc026d3, 0xe879f9],
    sticks: 0xf472b6,
  },
};

export default function Login() {
  const [username, setUsername] = useState(() => localStorage.getItem("saved_user") || "");
  const [password, setPassword] = useState(() => localStorage.getItem("saved_pass") || "");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem("saved_user"));
  const navigate = useNavigate();

  const preset = useMemo(() => hyperspeedPreset, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const email = username.includes("@")
      ? username
      : username.toLowerCase().replace(/\s+/g, "") + EMAIL_DOMAIN;
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({
        title: "Erro no login",
        description: "Usuário ou senha incorretos",
        variant: "destructive",
      });
    } else {
      if (remember) {
        localStorage.setItem("saved_user", username);
        localStorage.setItem("saved_pass", password);
      } else {
        localStorage.removeItem("saved_user");
        localStorage.removeItem("saved_pass");
      }
      navigate("/");
    }
  };

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#070510" }}
    >
      {/* Animação 3D de fundo — OBRIGATÓRIA em todos os apps */}
      <Hyperspeed effectOptions={preset} />

      {/* Vinheta radial para legibilidade */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(7,5,16,0.5) 100%)",
        }}
      />

      <div className="w-full max-w-sm space-y-6 relative z-10">
        {/* Foto + Identidade */}
        <div className="text-center space-y-3">
          <div className="relative mx-auto w-28 h-28">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 to-rose-400 p-[3px]">
              <div className="w-full h-full rounded-full overflow-hidden bg-black">
                <img
                  src={PHOTO_URL}
                  alt="Dra. Fernanda Sarelli"
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </div>
            <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-black" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Dra. Fernanda Sarelli
            </h1>
            <p className="text-xs font-medium text-pink-400 uppercase tracking-widest mt-1">
              {APP_TITLE}
            </p>
          </div>

          <p className="text-[11px] text-white/40">Acesso exclusivo da equipe</p>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleLogin}
          className="space-y-4 bg-black/60 backdrop-blur-xl p-6 rounded-2xl border border-white/[0.08] shadow-[0_8px_32px_hsl(340_82%_55%/0.15)]"
        >
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-widest text-white/50 font-medium">
              Usuário
            </Label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                type="text"
                placeholder="Ex: Administrador"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/25 focus:border-pink-500/50 focus:ring-pink-500/20 h-11 pl-10 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-widest text-white/50 font-medium">
              Senha
            </Label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/[0.06] border-white/[0.1] text-white placeholder:text-white/25 focus:border-pink-500/50 focus:ring-pink-500/20 h-11 pl-10 pr-10 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              checked={remember}
              onCheckedChange={(v) => setRemember(!!v)}
              className="border-white/20 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
            />
            <label htmlFor="remember" className="text-xs text-white/50 cursor-pointer select-none">
              Lembrar meus dados
            </label>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-400 hover:from-pink-600 hover:to-rose-500 text-white font-semibold h-11 text-sm shadow-[0_4px_16px_hsl(340_82%_55%/0.3)] transition-all active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Entrando...
              </div>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn size={16} />
                Entrar
              </span>
            )}
          </Button>
        </form>

        {/* Rodapé */}
        <div className="text-center space-y-1">
          <p className="text-[10px] text-white/25">
            Pré-candidata a Deputada Estadual — GO 2026
          </p>
          <a
            href="https://drafernandasarelli.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-pink-500/50 hover:text-pink-400 transition-colors"
          >
            drafernandasarelli.com.br
          </a>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. APP.TSX — Estrutura de rotas obrigatória

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Layout } from "@/components/Layout";
import Login from "./pages/Login";
// ... importe suas páginas aqui

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#070510" }}>
        <div className="h-8 w-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          {/* Adicione suas rotas protegidas aqui */}
          <Route path="/" element={<ProtectedRoute>{/* sua página home */}</ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
```

---

## 7. INDEX.HTML — Meta tags PWA obrigatórias

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no" />
    <meta name="theme-color" content="#ec4899" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="SIGLA FS" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <title>NOME DO APP — Dra. Fernanda Sarelli</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 8. REGRAS DE IDENTIDADE VISUAL (NÃO NEGOCIÁVEIS)

### Paleta de cores
| Token | Valor | Uso |
|-------|-------|-----|
| Primary | `hsl(340 82% 55%)` = `#ec4899` | Botões, links, destaques |
| Primary dark | `hsl(340 82% 60%)` | Dark mode |
| Background login | `#070510` | Fundo da tela de login |
| Rose gradient | `from-pink-500 to-rose-400` | Botão de login, rings |
| Accent glow | `hsl(340 82% 55% / 0.3)` | Sombras, glows |

### Animação de login
- **OBRIGATÓRIO**: componente `Hyperspeed` com Three.js rodando atrás do form
- Preset de cores: exclusivamente tons de **pink/rose/magenta** (`0xec4899`, `0xf9a8d4`, `0xbe185d`, `0xf43f5e`, `0xc026d3`)
- Background: `#070510` (roxo escuro quase preto)
- **NUNCA** substituir por gradiente estático, vídeo ou imagem

### Foto da candidata
- Sempre com anel gradiente `from-pink-500 to-rose-400`
- Indicador verde de "online" no canto inferior direito
- Tamanho `w-28 h-28` no login

### Responsividade / PWA
- `min-h-[100dvh]` em vez de `min-h-screen` (respeita barra do navegador no mobile)
- `env(safe-area-inset-top)` no `#root` (notch do iPhone)
- `user-scalable=no` no viewport
- Scrollbar sempre invisível
- `overscroll-behavior: none` para eliminar bounce iOS
- `touch-action: manipulation` em elementos interativos
- Sem zoom em inputs (`font-size: 16px` mínimo)

### Cards / glassmorphism
```
bg-black/60 backdrop-blur-xl
border border-white/[0.08]
shadow-[0_8px_32px_hsl(340_82%_55%/0.15)]
rounded-2xl
```

### Botão primário padrão
```
bg-gradient-to-r from-pink-500 to-rose-400
hover:from-pink-600 hover:to-rose-500
shadow-[0_4px_16px_hsl(340_82%_55%/0.3)]
active:scale-[0.98]
```

### Loading spinner
```
border-2 border-pink-500 border-t-transparent rounded-full animate-spin
```

---

## 9. CHECKLIST AO CRIAR UM NOVO APP

- [ ] `index.css` com tokens CSS exatos acima
- [ ] `tailwind.config.ts` idêntico ao padrão
- [ ] `vite.config.ts` com PWA configurado (theme_color `#ec4899`, background `#0f0f0f`)
- [ ] `index.html` com todas as meta tags PWA e `viewport-fit=cover`
- [ ] Componente `Hyperspeed.tsx` copiado integralmente
- [ ] Tela de Login com animação Hyperspeed + preset de cores pink/rose
- [ ] `ProtectedRoute` / `PublicRoute` no App.tsx
- [ ] Loading spinner com cor `border-pink-500`
- [ ] Scrollbar oculta em toda a aplicação
- [ ] Testado no Chrome mobile (Add to Home Screen → funciona como app nativo)
- [ ] Sem referências a Lovable, Base44 ou qualquer outra plataforma de geração

---

## 10. DEPENDÊNCIAS PACKAGE.JSON

Instale sempre estas dependências base:

```bash
npm install react react-dom react-router-dom
npm install @tanstack/react-query
npm install @supabase/supabase-js
npm install three postprocessing
npm install lucide-react sonner
npm install class-variance-authority clsx tailwind-merge
npm install tailwindcss-animate
npm install vite-plugin-pwa

npm install -D vite @vitejs/plugin-react-swc
npm install -D typescript tailwindcss postcss autoprefixer
npm install -D @types/react @types/react-dom @types/node @types/three
```

---

*Gerado em: 2026-03-22 — Dev sênior responsável: Claude Sonnet 4.6 / Axis Digital*
