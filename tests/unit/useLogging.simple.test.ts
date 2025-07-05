import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useLogging, LogLevel, LogCategory } from '@/composables/useLogging'

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'mock-id-123')
}))

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
})

// Mock console methods
const consoleMock = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
}
Object.defineProperty(console, 'error', { value: consoleMock.error })
Object.defineProperty(console, 'warn', { value: consoleMock.warn })
Object.defineProperty(console, 'info', { value: consoleMock.info })
Object.defineProperty(console, 'debug', { value: consoleMock.debug })

describe('useLogging (simplified)', () => {
  let logger: ReturnType<typeof useLogging>

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    
    // Reset localStorage mock
    localStorageMock.getItem.mockReturnValue(null)
    localStorageMock.setItem.mockImplementation(() => {})
    localStorageMock.removeItem.mockImplementation(() => {})
    
    // Reset fetch mock
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK'
    })
  })

  afterEach(() => {
    if (logger && typeof logger.cleanup === 'function') {
      logger.cleanup()
    }
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('basic functionality', () => {
    it('should initialize with safe configuration', () => {
      logger = useLogging({
        enableRemoteLogging: false,
        enableLocalStorage: false,
        flushInterval: 999999999,
        maxLocalEntries: 5
      })

      expect(logger.logEntries).toBeDefined()
      expect(logger.sessionId).toBe('mock-id-123')
      expect(logger.correlationId.value).toBe('mock-id-123')
    })

    it('should log error messages', () => {
      logger = useLogging({
        enableRemoteLogging: false,
        enableLocalStorage: false,
        flushInterval: 999999999,
        maxLocalEntries: 5
      })

      logger.logError('Test error', { key: 'value' }, 'audit')

      expect(logger.logEntries.value.length).toBe(1)
      expect(logger.logEntries.value[0].level).toBe(LogLevel.ERROR)
      expect(logger.logEntries.value[0].message).toBe('Test error')
      expect(logger.logEntries.value[0].calculatorType).toBe('audit')
      expect(consoleMock.error).toHaveBeenCalledWith('[audit] Test error', { key: 'value' })
    })

    it('should log warning messages', () => {
      logger = useLogging({
        enableRemoteLogging: false,
        enableLocalStorage: false,
        flushInterval: 999999999,
        maxLocalEntries: 5
      })

      logger.logWarning('Test warning', { key: 'value' }, 'danpss')

      expect(logger.logEntries.value.length).toBe(1)
      expect(logger.logEntries.value[0].level).toBe(LogLevel.WARN)
      expect(logger.logEntries.value[0].message).toBe('Test warning')
      expect(consoleMock.warn).toHaveBeenCalledWith('[danpss] Test warning', { key: 'value' })
    })

    it('should log info messages', () => {
      logger = useLogging({
        enableRemoteLogging: false,
        enableLocalStorage: false,
        flushInterval: 999999999,
        maxLocalEntries: 5
      })

      logger.logInfo('Test info', { key: 'value' }, 'epds')

      expect(logger.logEntries.value.length).toBe(1)
      expect(logger.logEntries.value[0].level).toBe(LogLevel.INFO)
      expect(logger.logEntries.value[0].message).toBe('Test info')
    })

    it('should clear all logs', () => {
      logger = useLogging({
        enableRemoteLogging: false,
        enableLocalStorage: false,
        flushInterval: 999999999,
        maxLocalEntries: 5
      })

      logger.logError('Test error')
      logger.logInfo('Test info')
      expect(logger.logEntries.value.length).toBe(2)

      logger.clearLogs()
      expect(logger.logEntries.value.length).toBe(0)
    })

    it('should filter logs by error level', () => {
      logger = useLogging({
        enableRemoteLogging: false,
        enableLocalStorage: false,
        flushInterval: 999999999,
        maxLocalEntries: 5
      })

      logger.logError('Error 1')
      logger.logWarning('Warning 1')
      logger.logError('Error 2')
      logger.logInfo('Info 1')

      expect(logger.logEntries.value.length).toBe(4)
      expect(logger.errorLogs.value.length).toBe(2)
      expect(logger.errorLogs.value[0].message).toBe('Error 1')
      expect(logger.errorLogs.value[1].message).toBe('Error 2')
    })
  })

  describe('specialized logging', () => {
    it('should log calculation events', () => {
      logger = useLogging({
        enableRemoteLogging: false,
        enableLocalStorage: false,
        flushInterval: 999999999,
        maxLocalEntries: 5
      })

      const inputs = { age: 25, weight: 70 }
      const results = { score: 15, risk: 'low' }
      
      logger.logCalculation('audit', inputs, results, 150)

      expect(logger.logEntries.value.length).toBe(1)
      expect(logger.logEntries.value[0].level).toBe(LogLevel.AUDIT)
      expect(logger.logEntries.value[0].category).toBe(LogCategory.CALCULATION)
      expect(logger.logEntries.value[0].message).toBe('Calculation completed: audit')
      expect(logger.logEntries.value[0].details?.inputs).toEqual(inputs)
      expect(logger.logEntries.value[0].details?.results).toEqual(results)
      expect(logger.logEntries.value[0].details?.duration).toBe(150)
    })

    it('should log user actions', () => {
      logger = useLogging({
        enableRemoteLogging: false,
        enableLocalStorage: false,
        flushInterval: 999999999,
        maxLocalEntries: 5
      })

      logger.logUserAction('form_submit', { form: 'patient_info' }, 'ipss')

      expect(logger.logEntries.value.length).toBe(1)
      expect(logger.logEntries.value[0].level).toBe(LogLevel.INFO)
      expect(logger.logEntries.value[0].category).toBe(LogCategory.USER_ACTION)
      expect(logger.logEntries.value[0].message).toBe('User action: form_submit')
    })

    it('should log validation errors', () => {
      logger = useLogging({
        enableRemoteLogging: false,
        enableLocalStorage: false,
        flushInterval: 999999999,
        maxLocalEntries: 5
      })

      logger.logValidationError('age', 'Age must be positive', -5, 'puqe')

      expect(logger.logEntries.value.length).toBe(1)
      expect(logger.logEntries.value[0].level).toBe(LogLevel.WARN)
      expect(logger.logEntries.value[0].category).toBe(LogCategory.VALIDATION)
      expect(logger.logEntries.value[0].message).toBe('Validation error: age')
      expect(logger.logEntries.value[0].details?.field).toBe('age')
      expect(logger.logEntries.value[0].details?.error).toBe('Age must be positive')
      expect(logger.logEntries.value[0].details?.value).toBe(-5)
    })
  })
})