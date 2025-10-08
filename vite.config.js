import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    // Intercetta la rotta SPA di reset per lo sviluppo locale, evitando il proxy /api
    {
      name: 'spa-reset-password-route',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || ''
          if (req.method === 'GET' && url.startsWith('/api/v1/users/reset-password')) {
            const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8')
            res.setHeader('Content-Type', 'text/html')
            res.end(indexHtml)
            return
          }
          next()
        })
      }
    },
    react()
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      '/logout': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  }
})