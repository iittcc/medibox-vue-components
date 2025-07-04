import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    // Aggressive memory optimization settings
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // Use single thread to reduce memory usage
        maxThreads: 1,
        minThreads: 1,
        useAtomics: false
      }
    },
    // Test execution limits
    testTimeout: 30000,
    hookTimeout: 10000,
    teardownTimeout: 10000, // Increased teardown timeout
    // Aggressive memory management
    isolate: true,
    fileParallelism: false,
    sequence: {
      shuffle: false,
      concurrent: false
    },
    // Force cleanup between test files
    forceRerunTriggers: [
      '**/*.test.ts'
    ],
    // Limit browser instances and enable proper cleanup
    browser: {
      enabled: false
    },
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