import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/missions/',
  build: {
    outDir: path.resolve(__dirname, 'public_html/MISSIONS'),
    assetsDir: '',
    emptyOutDir: true
  }
})
