import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useLogging, LogLevel, LogCategory, type LoggingConfig } from '@/composables/useLogging'

// Mock nanoid
vi.mock('nanoid', () => ({
  nanoid: vi.fn(() => 'mock-id-123')
}))

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
  configurable: true
})

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

describe('useLogging', () => {
  let wrapper: any
  let addEventListenerSpy: any
  let removeEventListenerSpy: any
  let setIntervalSpy: any
  let clearIntervalSpy: any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    
    // Mock DOM event listeners
    addEventListenerSpy = vi.spyOn(window, 'addEventListener')
    removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    
    // Mock timers
    setIntervalSpy = vi.spyOn(global, 'setInterval')
    clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    
    // Reset navigator.onLine
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
    
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
    if (wrapper) {
      wrapper.unmount()
    }
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      expect(logger.logEntries).toBeDefined()
      expect(logger.sessionId).toBe('mock-id-123')
      expect(logger.correlationId).toBe('mock-id-123')
      expect(logger.isOnline).toBe(true)
      expect(logger.errorLogs).toEqual([])
      expect(logger.auditLogs).toEqual([])
    })

    it('should initialize with custom configuration', () => {
      const config: Partial<LoggingConfig> = {
        maxLocalEntries: 500,
        batchSize: 25,
        enableLocalStorage: false,
        anonymizeData: false
      }

      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging(config)
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      expect(wrapper.vm.logger).toBeDefined()
    })

    it('should load logs from localStorage on initialization', () => {
      const mockLogs = [
        {
          id: 'log-1',
          timestamp: '2023-01-01T00:00:00.000Z',
          level: LogLevel.INFO,
          message: 'Test message',
          category: LogCategory.SYSTEM
        }
      ]
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockLogs))

      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      expect(localStorageMock.getItem).toHaveBeenCalledWith('medicalCalculatorLogs')
      expect(logger.logEntries.length).toBe(1)
    })

    it('should set up event listeners and timers', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)

      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
      expect(addEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
      expect(setIntervalSpy).toHaveBeenCalled()
    })
  })

  describe('basic logging methods', () => {
    it('should log error messages', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logError('Test error', { key: 'value' }, 'audit')

      expect(logger.logEntries.length).toBe(1)
      expect(logger.logEntries[0].level).toBe(LogLevel.ERROR)
      expect(logger.logEntries[0].message).toBe('Test error')
      expect(logger.logEntries[0].calculatorType).toBe('audit')
      expect(consoleMock.error).toHaveBeenCalledWith('[audit] Test error', { key: 'value' })
    })

    it('should log warning messages', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logWarning('Test warning', { key: 'value' }, 'danpss')

      expect(logger.logEntries.length).toBe(1)
      expect(logger.logEntries[0].level).toBe(LogLevel.WARN)
      expect(logger.logEntries[0].message).toBe('Test warning')
      expect(consoleMock.warn).toHaveBeenCalledWith('[danpss] Test warning', { key: 'value' })
    })

    it('should log info messages', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logInfo('Test info', { key: 'value' }, 'epds')

      expect(logger.logEntries.length).toBe(1)
      expect(logger.logEntries[0].level).toBe(LogLevel.INFO)
      expect(logger.logEntries[0].message).toBe('Test info')
    })

    it('should log debug messages only in development', () => {
      // Mock DEV environment
      vi.stubEnv('DEV', true)

      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logDebug('Test debug', { key: 'value' }, 'gcs')

      expect(logger.logEntries.length).toBe(1)
      expect(logger.logEntries[0].level).toBe(LogLevel.DEBUG)
      expect(consoleMock.debug).toHaveBeenCalledWith('[gcs] Test debug', { key: 'value' })

      vi.unstubAllEnvs()
    })

    it('should not log debug messages in production', () => {
      // Mock production environment
      vi.stubEnv('DEV', false)

      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logDebug('Test debug', { key: 'value' }, 'gcs')

      expect(logger.logEntries.length).toBe(0)
      expect(consoleMock.debug).not.toHaveBeenCalled()

      vi.unstubAllEnvs()
    })
  })

  describe('specialized logging methods', () => {
    it('should log calculation events', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      const inputs = { age: 25, weight: 70 }
      const results = { score: 15, risk: 'low' }
      
      logger.logCalculation('audit', inputs, results, 150)

      expect(logger.logEntries.length).toBe(1)
      expect(logger.logEntries[0].level).toBe(LogLevel.AUDIT)
      expect(logger.logEntries[0].category).toBe(LogCategory.CALCULATION)
      expect(logger.logEntries[0].message).toBe('Calculation completed: audit')
      expect(logger.logEntries[0].details?.inputs).toEqual(inputs)
      expect(logger.logEntries[0].details?.results).toEqual(results)
      expect(logger.logEntries[0].details?.duration).toBe(150)
    })

    it('should log user actions', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logUserAction('form_submit', { form: 'patient_info' }, 'ipss')

      expect(logger.logEntries.length).toBe(1)
      expect(logger.logEntries[0].level).toBe(LogLevel.INFO)
      expect(logger.logEntries[0].category).toBe(LogCategory.USER_ACTION)
      expect(logger.logEntries[0].message).toBe('User action: form_submit')
    })

    it('should log validation errors', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logValidationError('age', 'Age must be positive', -5, 'puqe')

      expect(logger.logEntries.length).toBe(1)
      expect(logger.logEntries[0].level).toBe(LogLevel.WARN)
      expect(logger.logEntries[0].category).toBe(LogCategory.VALIDATION)
      expect(logger.logEntries[0].message).toBe('Validation error: age')
      expect(logger.logEntries[0].details?.field).toBe('age')
      expect(logger.logEntries[0].details?.error).toBe('Age must be positive')
      expect(logger.logEntries[0].details?.value).toBe(-5)
    })

    it('should log network events', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logNetworkEvent('api_call', '/api/calculate', 200, 250)

      expect(logger.logEntries.length).toBe(1)
      expect(logger.logEntries[0].level).toBe(LogLevel.INFO)
      expect(logger.logEntries[0].category).toBe(LogCategory.NETWORK)
      expect(logger.logEntries[0].message).toBe('Network event: api_call')
      expect(logger.logEntries[0].details?.url).toBe('/api/calculate')
      expect(logger.logEntries[0].details?.status).toBe(200)
      expect(logger.logEntries[0].details?.duration).toBe(250)
    })

    it('should log performance metrics', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logPerformance('calculation_time', 120, 'ms', { complexity: 'high' })

      expect(logger.logEntries.length).toBe(1)
      expect(logger.logEntries[0].level).toBe(LogLevel.INFO)
      expect(logger.logEntries[0].category).toBe(LogCategory.PERFORMANCE)
      expect(logger.logEntries[0].message).toBe('Performance: calculation_time')
      expect(logger.logEntries[0].details?.metric).toBe('calculation_time')
      expect(logger.logEntries[0].details?.value).toBe(120)
      expect(logger.logEntries[0].details?.unit).toBe('ms')
      expect(logger.logEntries[0].details?.complexity).toBe('high')
    })

    it('should log audit trail events', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      const auditDetails = { userId: 'user123', action: 'data_access', resource: 'patient_data' }
      logger.logAuditTrail('data_access', auditDetails, 'who5')

      expect(logger.logEntries.length).toBe(1)
      expect(logger.logEntries[0].level).toBe(LogLevel.AUDIT)
      expect(logger.logEntries[0].category).toBe(LogCategory.AUDIT_TRAIL)
      expect(logger.logEntries[0].message).toBe('Audit: data_access')
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        expect.stringMatching(/^audit_who5_\d+$/),
        expect.any(String)
      )
    })
  })

  describe('data anonymization', () => {
    it('should anonymize sensitive data by default', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      const sensitiveData = {
        name: 'John Doe',
        cpr: '1234567890',
        email: 'john@example.com',
        age: 30
      }

      logger.logInfo('Test with sensitive data', sensitiveData)

      expect(logger.logEntries.length).toBe(1)
      const logEntry = logger.logEntries[0]
      
      // Sensitive fields should be masked
      expect(logEntry.details?.name).toMatch(/\*+/)
      expect(logEntry.details?.cpr).toMatch(/\*+/)
      expect(logEntry.details?.email).toMatch(/\*+/)
      
      // Non-sensitive fields should remain unchanged
      expect(logEntry.details?.age).toBe(30)
    })

    it('should not anonymize data when disabled', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging({ anonymizeData: false })
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      const sensitiveData = {
        name: 'John Doe',
        cpr: '1234567890',
        email: 'john@example.com'
      }

      logger.logInfo('Test without anonymization', sensitiveData)

      expect(logger.logEntries.length).toBe(1)
      const logEntry = logger.logEntries[0]
      
      // All fields should remain unchanged
      expect(logEntry.details?.name).toBe('John Doe')
      expect(logEntry.details?.cpr).toBe('1234567890')
      expect(logEntry.details?.email).toBe('john@example.com')
    })
  })

  describe('log filtering and management', () => {
    it('should filter logs by error level', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logError('Error 1')
      logger.logWarning('Warning 1')
      logger.logError('Error 2')
      logger.logInfo('Info 1')

      expect(logger.logEntries.length).toBe(4)
      expect(logger.errorLogs.length).toBe(2)
      expect(logger.errorLogs[0].message).toBe('Error 1')
      expect(logger.errorLogs[1].message).toBe('Error 2')
    })

    it('should filter logs by audit level', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logCalculation('audit', {}, {})
      logger.logError('Error 1')
      logger.logAuditTrail('test_event', {})

      expect(logger.logEntries.length).toBe(3)
      expect(logger.auditLogs.length).toBe(2)
    })

    it('should respect log level configuration', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging({ 
            logLevels: [LogLevel.ERROR, LogLevel.WARN] 
          })
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logError('Should be logged')
      logger.logWarning('Should be logged')
      logger.logInfo('Should NOT be logged')

      expect(logger.logEntries.length).toBe(2)
      expect(logger.logEntries[0].message).toBe('Should be logged')
      expect(logger.logEntries[1].message).toBe('Should be logged')
    })

    it('should maintain max local entries limit', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging({ maxLocalEntries: 3 })
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logInfo('Message 1')
      logger.logInfo('Message 2')
      logger.logInfo('Message 3')
      logger.logInfo('Message 4')
      logger.logInfo('Message 5')

      expect(logger.logEntries.length).toBe(3)
      expect(logger.logEntries[0].message).toBe('Message 3')
      expect(logger.logEntries[1].message).toBe('Message 4')
      expect(logger.logEntries[2].message).toBe('Message 5')
    })

    it('should clear all logs', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logError('Test error')
      logger.logInfo('Test info')
      expect(logger.logEntries.length).toBe(2)

      logger.clearLogs()
      expect(logger.logEntries.length).toBe(0)
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('medicalCalculatorLogs')
    })
  })

  describe('remote logging', () => {
    it('should batch and flush logs to remote endpoint', async () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging({ 
            batchSize: 2,
            enableRemoteLogging: true
          })
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logError('Error 1')
      logger.logError('Error 2') // Should trigger flush

      await nextTick()

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/logs',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Error 1')
        })
      )
    })

    it('should handle remote logging failures', async () => {
      ;(global.fetch as any).mockRejectedValue(new Error('Network error'))

      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging({ 
            batchSize: 1,
            enableRemoteLogging: true
          })
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logError('Test error')
      
      await nextTick()
      await vi.runAllTimersAsync()

      // Should log the failure
      expect(logger.logEntries.some(entry => 
        entry.message.includes('Failed to send log batch')
      )).toBe(true)
    })

    it('should not flush when offline', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })

      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging({ 
            batchSize: 1,
            enableRemoteLogging: true
          })
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logError('Test error')
      
      await nextTick()

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('local storage', () => {
    it('should save logs to localStorage', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging({ enableLocalStorage: true })
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logInfo('Test message')

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'medicalCalculatorLogs',
        expect.any(String)
      )
    })

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging({ enableLocalStorage: true })
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      // Should not throw error
      expect(() => logger.logInfo('Test message')).not.toThrow()
      expect(consoleMock.warn).toHaveBeenCalledWith(
        'Failed to save logs to localStorage:',
        expect.any(Error)
      )
    })
  })

  describe('utility methods', () => {
    it('should generate new correlation ID', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      const initialId = logger.correlationId
      const newId = logger.newCorrelationId()

      expect(newId).toBe('mock-id-123')
      expect(logger.correlationId).toBe(newId)
    })

    it('should export logs with optional filtering', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.logError('Error message')
      logger.logWarning('Warning message')
      logger.logInfo('Info message')

      const exportedAll = logger.exportLogs()
      expect(exportedAll.logs.length).toBe(3)
      expect(exportedAll.sessionId).toBe('mock-id-123')
      expect(exportedAll.exportTime).toBeDefined()

      const exportedErrors = logger.exportLogs([LogLevel.ERROR])
      expect(exportedErrors.logs.length).toBe(1)
      expect(exportedErrors.logs[0].level).toBe(LogLevel.ERROR)
    })
  })

  describe('network status handling', () => {
    it('should update online status and flush logs when coming online', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true })

      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      expect(logger.isOnline).toBe(false)

      // Add a log while offline
      logger.logError('Offline error')

      // Simulate coming online
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true })
      window.dispatchEvent(new Event('online'))

      await nextTick()

      // Should attempt to flush pending logs
      expect(global.fetch).toHaveBeenCalled()
    })
  })

  describe('cleanup', () => {
    it('should clean up resources on cleanup', () => {
      const TestComponent = defineComponent({
        setup() {
          const logger = useLogging()
          return { logger }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { logger } = wrapper.vm

      logger.cleanup()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))
      expect(removeEventListenerSpy).toHaveBeenCalledWith('offline', expect.any(Function))
      expect(clearIntervalSpy).toHaveBeenCalled()
    })
  })
})