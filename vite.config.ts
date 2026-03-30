import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

process.env.VITE_APP_VERSION = Date.now().toString(36).toUpperCase();

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      includeAssets: ["icon-192.png", "icon-512.png"],
      manifest: {
        name: "Suplentes - Dra. Fernanda Sarelli",
        short_name: "Suplentes",
        description: "Painel de Suplentes e Equipes de Campanha",
        theme_color: "#ec4899",
        background_color: "#070510",
        display: "standalone",
        display_override: ["standalone", "fullscreen"],
        orientation: "portrait",
        start_url: "/",
        scope: "/",
        lang: "pt-BR",
        categories: ["productivity", "utilities"],
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
          { name: "Novo Cadastro", short_name: "Cadastrar", description: "Cadastrar novo suplente", url: "/", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
          { name: "Pagamentos", short_name: "Pagamentos", description: "Ver pagamentos do mês", url: "/pagamentos", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
          { name: "Dashboard", short_name: "Dashboard", description: "Ver resumo da campanha", url: "/dashboard", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
        ],
      },
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        navigateFallbackDenylist: [/^\/~oauth/],
        maximumFileSizeToCacheInBytes: 5000000,
        // Cache de assets estáticos (JS, CSS, imagens)
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: { cacheName: "google-fonts-cache", expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 } },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: "CacheFirst",
            options: { cacheName: "supabase-storage", expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 } },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));