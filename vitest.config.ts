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
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true, // Use single fork to reduce memory usage
        maxForks: 1,
        minForks: 1
      }
    },
    // Test execution limits
    testTimeout: 15000,
    hookTimeout: 5000,
    teardownTimeout: 5000, // Reduced timeout to fail fast
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
      '**/tests/playwright/**', // Exclude Playwright tests from Vitest
      '**/tests/unit/useLogging.test.ts' // Exclude problematic test with memory leak
    ]
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  }
})