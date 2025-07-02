import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Mock the PrimeVue locale configuration
vi.mock('@primeuix/themes', () => ({
  default: vi.fn()
}))

// Mock the custom theme files
vi.mock('@/assets/teal.css', () => ({}))

// Mock server data sending
vi.mock('@/assets/sendDataToServer', () => ({
  default: vi.fn().mockResolvedValue(undefined)
}))

// Global Vue Test Utils configuration
config.global.mocks = {
  $primevue: {
    config: {
      theme: {
        preset: {}
      },
      options: {
        prefix: 'p',
        darkModeSelector: '.p-dark',
        cssLayer: false
      }
    }
  }
}

// Global plugins and provides
config.global.plugins = []
config.global.provide = {}

// Global test setup
beforeEach(() => {
  // Reset all mocks before each test
  vi.clearAllMocks()
})