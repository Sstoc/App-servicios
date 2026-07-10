import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // En Tailwind v4 ya no necesitamos postcss.config.js si usamos el plugin de Vite
    // Pero como lo configuramos via PostCSS lo dejaremos asi por ahora o usaremos el plugin directo
  ],
  server: {
    host: true, // Expone el servidor en todas las interfaces (0.0.0.0) → accesible desde hotspot
    port: 5173,
  },
})
