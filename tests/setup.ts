import { vi, afterEach, afterAll, beforeEach } from 'vitest'
import { config } from '@vue/test-utils'

// Mock environment variables
vi.stubEnv('VITE_API_URL', 'https://test.example.com')

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

// Aggressive memory management
afterEach(() => {
  // Clean up DOM completely
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  
  // Clear any timers and intervals
  vi.clearAllTimers()
  
  // Clear all event listeners
  const events = ['click', 'change', 'input', 'submit', 'focus', 'blur', 'keyup', 'keydown']
  events.forEach(event => {
    document.removeEventListener(event, () => {}, true)
    window.removeEventListener(event, () => {}, true)
  })
  
  // Clear any remaining Vue instances or reactive data
  vi.clearAllMocks()
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc()
  }
})

// Force cleanup between test files
afterAll(() => {
  // Final aggressive cleanup
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  vi.restoreAllMocks()
  vi.clearAllMocks()
  
  // Force garbage collection
  if (global.gc) {
    global.gc()
  }
})