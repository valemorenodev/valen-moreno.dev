import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // Las capturas de verificación y los perfiles de Chrome no deben disparar
      // recargas del servidor de desarrollo.
      ignored: ['**/tmp-screens/**', '**/tmp-chrome-profile/**', '**/dist/**'],
    },
  },
  build: {
    target: 'es2020',
    // three.js + drei is the single heaviest chunk: keep it isolated so the
    // landing content can paint before the 3D scene is hydrated.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('three') || id.includes('@react-three')) return 'three'
          if (id.includes('motion')) return 'motion'
          if (id.includes('react')) return 'react'
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
})
