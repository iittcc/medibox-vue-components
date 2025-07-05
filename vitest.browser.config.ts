import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5174
  },
  optimizeDeps: {
    include: [
      'vue',
      '@primevue/icons/angledown',
      '@primevue/icons/angleup', 
      'primevue/inputnumber',
      '@primevue/icons/chevrondown',
      '@primevue/icons/search',
      '@primevue/icons/spinner',
      '@primevue/icons/times',
      'primevue/select',
      'primevue/button',
      'primevue/message',
      'axios',
      'node-forge',
      '@primevue/icons/windowmaximize',
      '@primevue/icons/windowminimize',
      'primevue/dialog',
      'primevue/slider',
      'tailwind-merge'
    ]
  },
  test: {
    globals: true,
    // Browser-specific settings - using new Vitest v3 API
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: false, // Set to false for debugging
      instances: [
        {
          browser: 'chromium'
        }
      ]
    },
    // Include only browser tests
    include: [
      '**/tests/browser/**/*.test.ts'
    ],
    // Test execution settings for browser tests
    testTimeout: 60000,
    hookTimeout: 10000,
    teardownTimeout: 10000,
    // Disable parallelism for browser tests to avoid conflicts
    fileParallelism: false,
    sequence: {
      shuffle: false,
      concurrent: false
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})