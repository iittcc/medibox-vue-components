import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    // Exclude browser tests from regular test runs
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/tests/browser/**',
      '**/tests/integration/**'
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})