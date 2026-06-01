import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    headers: {
      // Desactiva toda forma de caché en el servidor de desarrollo.
      // Evita que F5 sirva módulos JS/CSS desactualizados.
      'Cache-Control': 'no-store',
    },
  },
  preview: {
    headers: {
      // Lo mismo para `npm run preview` (build local).
      // Para producción real, el servidor de hosting gestiona estas cabeceras.
      'Cache-Control': 'no-store',
    },
  },
})
