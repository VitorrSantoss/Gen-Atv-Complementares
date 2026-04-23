import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => ({
  server: {
    port: 5173,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      // Habilita o PWA no modo de desenvolvimento (localhost:5173)
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.ico', 'logo_senac_sfundo.png', 'icon-192x192.png', 'icon-512x512.png'],
      manifest: {
        name: 'Atividades Complementares Senac',
        short_name: 'AtvSenac',
        description: 'Gerenciamento de Atividades Complementares para alunos e coordenadores.',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any' // Garante compatibilidade total
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable' // Ícone adaptativo para Android
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any' 
          }
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