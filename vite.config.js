import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serveert deze repo onder /Smullies2ndHalf/.
// Bij hosting onder een ander pad: BASE_PATH zetten bij het builden.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? (process.env.BASE_PATH || '/Smullies2ndHalf/') : '/',
}))
