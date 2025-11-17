import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Adiciona o diretório base para forçar o Netlify a iniciar corretamente
  base: '/',
  build: {
    outDir: 'dist', // O Netlify publica o conteúdo desta pasta
  }
})