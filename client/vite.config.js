import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://mentorship-backend-env.eba-3chfwue2.us-east-2.elasticbeanstalk.com',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://mentorship-backend-env.eba-3chfwue2.us-east-2.elasticbeanstalk.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
