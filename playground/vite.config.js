import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@widget-factory/primitives': path.resolve(__dirname, '../packages/primitives/src'),
      '@widget-factory/compiler': path.resolve(__dirname, '../packages/compiler/src'),
      '@widget-factory/icons': path.resolve(__dirname, '../packages/icons/src'),
    }
  }
})
