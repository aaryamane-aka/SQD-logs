import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages serves this project at /SQD-logs/, but keep the local dev
// server at the root so `npm run dev` still works at http://localhost:5173/.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/SQD-logs/' : '/',
  plugins: [react()],
}))
