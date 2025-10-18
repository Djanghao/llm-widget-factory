import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { widgetWriterPlugin } from './vite-plugin-widget-writer.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendPort = env.BACKEND_PORT || '8000'
  const frontendPort = env.FRONTEND_PORT || '5173'

  return {
    plugins: [react(), widgetWriterPlugin()],
    resolve: {
      alias: {
        '@widget-factory/primitives': path.resolve(__dirname, '../packages/primitives/src'),
        '@widget-factory/compiler': path.resolve(__dirname, '../packages/compiler/src'),
        '@widget-factory/icons': path.resolve(__dirname, '../packages/icons/src'),
      }
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          headless: path.resolve(__dirname, 'headless.html')
        }
      }
    },
    server: {
      port: parseInt(frontendPort),
      proxy: {
        '^/api/(?!.*\\.md).*': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true
        }
      }
    }
  }
})
