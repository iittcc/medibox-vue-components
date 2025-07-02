import { ref, computed, readonly } from 'vue'
import { nanoid } from 'nanoid'

export interface LogEntry {
  id: string
  timestamp: Date
  level: LogLevel
  message: string
  category: LogCategory
  details?: Record<string, any>
  correlationId?: string
  sessionId?: string
  calculatorType?: string
  userId?: string
  anonymizedData?: Record<string, any>
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  AUDIT = 'audit'
}

export enum LogCategory {
  CALCULATION = 'calculation',
  VALIDATION = 'validation',
  NETWORK = 'network',
  USER_ACTION = 'user_action',
  SYSTEM = 'system',
  SECURITY = 'security',
  PERFORMANCE = 'performance',
  AUDIT_TRAIL = 'audit_trail'
}

export interface MaskingRule {
  keepLast?: number
  keepFirst?: number
  replacement?: string
  customMask?: (value: string) => string
}

export interface LoggingConfig {
  maxLocalEntries?: number
  batchSize?: number
  flushInterval?: number
  enableLocalStorage?: boolean
  enableRemoteLogging?: boolean
  logLevels?: LogLevel[]
  anonymizeData?: boolean
  remoteEndpoint?: string
  sensitiveFields?: string[]
  maskingRules?: Record<string, MaskingRule>
  defaultMaskingRule?: MaskingRule
}

const DEFAULT_CONFIG: LoggingConfig = {
  maxLocalEntries: 1000,
  batchSize: 50,
  flushInterval: 30000, // 30 seconds
  enableLocalStorage: true,
  enableRemoteLogging: true,
  logLevels: [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.AUDIT],
  anonymizeData: true,
  remoteEndpoint: '/api/logs',
  sensitiveFields: [
    'cpr', 'personnummer', 'phone', 'telefon', 'email', 'navn', 'name',
    'adresse', 'address', 'password', 'token', 'ssn', 'birthdate', 'fødselsdato'
  ],
  maskingRules: {},
  defaultMaskingRule: {
    keepLast: 2,
    replacement: '*'
  }
}

export function useLogging(config: Partial<LoggingConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const sessionId = nanoid()
  const correlationId = ref<string>(nanoid())
  
  const logEntries = ref<LogEntry[]>([])
  const pendingBatch = ref<LogEntry[]>([])
  const isOnline = ref(navigator.onLine)
  
  let flushTimer: ReturnType<typeof setTimeout> | null = null

  // Computed properties
  const errorLogs = computed(() => 
    logEntries.value.filter(entry => entry.level === LogLevel.ERROR)
  )
  const auditLogs = computed(() => 
    logEntries.value.filter(entry => entry.level === LogLevel.AUDIT)
  )

  // Data anonymization with configurable rules
  const anonymizeUserData = (
    data: Record<string, any>, 
    customSensitiveFields?: string[],
    customMaskingRules?: Record<string, MaskingRule>
  ): Record<string, any> => {
    if (!finalConfig.anonymizeData) {
      return data
    }

    const sensitiveFields = customSensitiveFields ?? finalConfig.sensitiveFields ?? []
    const maskingRules = customMaskingRules ?? finalConfig.maskingRules ?? {}
    const defaultRule = finalConfig.defaultMaskingRule ?? { keepLast: 2, replacement: '*' }

    const anonymized = { ...data }
    
    const maskValue = (value: string, fieldKey: string): string => {
      // Check for field-specific masking rule
      const rule = maskingRules[fieldKey.toLowerCase()] ?? defaultRule
      
      if (rule.customMask) {
        return rule.customMask(value)
      }
      
      if (value.length === 0) return value
      
      const keepFirst = rule.keepFirst ?? 0
      const keepLast = rule.keepLast ?? 2
      const replacement = rule.replacement ?? '*'
      
      if (value.length <= keepFirst + keepLast) {
        return replacement.repeat(Math.max(2, value.length))
      }
      
      const start = keepFirst > 0 ? value.slice(0, keepFirst) : ''
      const end = keepLast > 0 ? value.slice(-keepLast) : ''
      const middleLength = value.length - keepFirst - keepLast
      const middle = replacement.repeat(Math.max(1, middleLength))
      
      return start + middle + end
    }

    const processValue = (value: any, key: string): any => {
      if (value === null || value === undefined) {
        return value
      }
      
      if (Array.isArray(value)) {
        return value.map((item, index) => 
          processValue(item, `${key}[${index}]`)
        )
      }
      
      if (typeof value === 'object') {
        return processObject(value)
      }
      
      return value
    }

    const processObject = (obj: Record<string, any>): Record<string, any> => {
      const result: Record<string, any> = {}
      
      for (const [key, value] of Object.entries(obj)) {
        const lowercaseKey = key.toLowerCase()
        
        // Check if field is sensitive
        const isSensitive = sensitiveFields.some(field => 
          lowercaseKey.includes(field.toLowerCase())
        )
        
        if (isSensitive) {
          if (typeof value === 'string') {
            result[key] = maskValue(value, key)
          } else if (typeof value === 'number') {
            result[key] = maskValue(value.toString(), key)
          } else {
            result[key] = '[REDACTED]'
          }
        } else {
          result[key] = processValue(value, key)
        }
      }
      
      return result
    }

    return processObject(anonymized)
  }

  // Core logging functions
  const createLogEntry = (
    level: LogLevel,
    message: string,
    category: LogCategory,
    details?: Record<string, any>,
    calculatorType?: string
  ): LogEntry => {
    return {
      id: nanoid(),
      timestamp: new Date(),
      level,
      message,
      category,
      details: details ? anonymizeUserData(details) : undefined,
      correlationId: correlationId.value,
      sessionId,
      calculatorType,
      anonymizedData: details ? anonymizeUserData(details) : undefined
    }
  }

  const addLogEntry = (entry: LogEntry) => {
    // Check if this log level is enabled
    if (!finalConfig.logLevels?.includes(entry.level)) {
      return
    }

    logEntries.value.push(entry)
    
    // Maintain max local entries
    const maxEntries = finalConfig.maxLocalEntries ?? 1000
    if (logEntries.value.length > maxEntries) {
      logEntries.value = logEntries.value.slice(-maxEntries)
    }
    
    // Add to pending batch for remote logging
    if (finalConfig.enableRemoteLogging) {
      pendingBatch.value.push(entry)
      
      // Flush if batch is full
      const batchSize = finalConfig.batchSize ?? 10
      if (pendingBatch.value.length >= batchSize) {
        flushLogs()
      }
    }
    
    // Save to local storage
    if (finalConfig.enableLocalStorage) {
      saveToLocalStorage()
    }
  }

  // Logging methods by level
  const logError = (
    message: string,
    details?: Record<string, any>,
    calculatorType?: string
  ) => {
    const entry = createLogEntry(LogLevel.ERROR, message, LogCategory.SYSTEM, details, calculatorType)
    addLogEntry(entry)
    console.error(`[${calculatorType || 'Unknown'}] ${message}`, details)
  }

  const logWarning = (
    message: string,
    details?: Record<string, any>,
    calculatorType?: string
  ) => {
    const entry = createLogEntry(LogLevel.WARN, message, LogCategory.SYSTEM, details, calculatorType)
    addLogEntry(entry)
    console.warn(`[${calculatorType || 'Unknown'}] ${message}`, details)
  }

  const logInfo = (
    message: string,
    details?: Record<string, any>,
    calculatorType?: string
  ) => {
    const entry = createLogEntry(LogLevel.INFO, message, LogCategory.SYSTEM, details, calculatorType)
    addLogEntry(entry)
    
    if (import.meta.env.DEV) {
      console.info(`[${calculatorType || 'Unknown'}] ${message}`, details)
    }
  }

  const logDebug = (
    message: string,
    details?: Record<string, any>,
    calculatorType?: string
  ) => {
    if (!import.meta.env.DEV) return
    
    const entry = createLogEntry(LogLevel.DEBUG, message, LogCategory.SYSTEM, details, calculatorType)
    addLogEntry(entry)
    console.debug(`[${calculatorType || 'Unknown'}] ${message}`, details)
  }

  // Specialized logging methods
  const logCalculation = (
    calculatorType: string,
    inputs: Record<string, any>,
    results: Record<string, any>,
    duration?: number
  ) => {
    const entry = createLogEntry(
      LogLevel.AUDIT,
      `Calculation completed: ${calculatorType}`,
      LogCategory.CALCULATION,
      {
        inputs: anonymizeUserData(inputs),
        results,
        duration,
        timestamp: new Date().toISOString()
      },
      calculatorType
    )
    addLogEntry(entry)
  }

  const logUserAction = (
    action: string,
    details?: Record<string, any>,
    calculatorType?: string
  ) => {
    const entry = createLogEntry(
      LogLevel.INFO,
      `User action: ${action}`,
      LogCategory.USER_ACTION,
      details,
      calculatorType
    )
    addLogEntry(entry)
  }

  const logValidationError = (
    field: string,
    error: string,
    value?: any,
    calculatorType?: string
  ) => {
    const entry = createLogEntry(
      LogLevel.WARN,
      `Validation error: ${field}`,
      LogCategory.VALIDATION,
      {
        field,
        error,
        value: typeof value === 'string' ? value.substring(0, 100) : value // Limit string length
      },
      calculatorType
    )
    addLogEntry(entry)
  }

  const logNetworkEvent = (
    event: string,
    url?: string,
    status?: number,
    duration?: number,
    error?: string
  ) => {
    const entry = createLogEntry(
      error ? LogLevel.ERROR : LogLevel.INFO,
      `Network event: ${event}`,
      LogCategory.NETWORK,
      {
        url,
        status,
        duration,
        error,
        isOnline: isOnline.value
      }
    )
    addLogEntry(entry)
  }

  const logPerformance = (
    metric: string,
    value: number,
    unit: string = 'ms',
    details?: Record<string, any>
  ) => {
    const entry = createLogEntry(
      LogLevel.INFO,
      `Performance: ${metric}`,
      LogCategory.PERFORMANCE,
      {
        metric,
        value,
        unit,
        ...details
      }
    )
    addLogEntry(entry)
  }

  const logAuditTrail = (
    event: string,
    details: Record<string, any>,
    calculatorType?: string
  ) => {
    const entry = createLogEntry(
      LogLevel.AUDIT,
      `Audit: ${event}`,
      LogCategory.AUDIT_TRAIL,
      details,
      calculatorType
    )
    addLogEntry(entry)
    
    // Always save audit logs immediately
    if (finalConfig.enableLocalStorage) {
      saveAuditToLocalStorage(entry)
    }
  }

  // Remote logging
  const flushLogs = async () => {
    if (!finalConfig.enableRemoteLogging || pendingBatch.value.length === 0 || !isOnline.value) {
      return
    }

    const batch = [...pendingBatch.value]
    pendingBatch.value = []

    try {
      const response = await fetch(finalConfig.remoteEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          logs: batch,
          sessionId,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      logInfo('Log batch sent successfully', { count: batch.length })
    } catch (error) {
      // Re-add failed logs to pending batch
      pendingBatch.value.unshift(...batch)
      logError('Failed to send log batch', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        batchSize: batch.length 
      })
    }
  }

  // Local storage management  
  const saveToLocalStorage = () => {
    try {
      const recentLogs = logEntries.value.slice(-100) // Keep last 100 logs
      localStorage.setItem('medicalCalculatorLogs', JSON.stringify(recentLogs))
    } catch (error) {
      console.warn('Failed to save logs to localStorage:', error)
    }
  }

  const saveAuditToLocalStorage = (entry: LogEntry) => {
    try {
      const auditKey = `audit_${entry.calculatorType || 'unknown'}_${Date.now()}`
      localStorage.setItem(auditKey, JSON.stringify(entry))
    } catch (error) {
      console.warn('Failed to save audit log to localStorage:', error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const stored = localStorage.getItem('medicalCalculatorLogs')
      if (stored) {
        const parsed = JSON.parse(stored)
        logEntries.value = parsed.map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }))
      }
    } catch (error) {
      console.warn('Failed to load logs from localStorage:', error)
    }
  }

  // Utility methods
  const newCorrelationId = () => {
    correlationId.value = nanoid()
    return correlationId.value
  }

  const clearLogs = () => {
    logEntries.value = []
    pendingBatch.value = []
    
    if (finalConfig.enableLocalStorage) {
      localStorage.removeItem('medicalCalculatorLogs')
    }
  }

  const exportLogs = (levels?: LogLevel[]) => {
    const filtered = levels 
      ? logEntries.value.filter(entry => levels.includes(entry.level))
      : logEntries.value

    return {
      sessionId,
      exportTime: new Date().toISOString(),
      logs: filtered
    }
  }

  // Lifecycle management
  const startFlushTimer = () => {
    if (flushTimer) clearInterval(flushTimer)
    
    flushTimer = setInterval(() => {
      if (pendingBatch.value.length > 0) {
        flushLogs()
      }
    }, finalConfig.flushInterval)
  }

  const stopFlushTimer = () => {
    if (flushTimer) {
      clearInterval(flushTimer)
      flushTimer = null
    }
  }

  // Network status handling
  const handleOnlineStatusChange = () => {
    isOnline.value = navigator.onLine
    
    if (isOnline.value && pendingBatch.value.length > 0) {
      logInfo('Connection restored, flushing pending logs')
      flushLogs()
    }
  }

  // Initialize
  loadFromLocalStorage()
  startFlushTimer()
  
  // Set up network listeners
  window.addEventListener('online', handleOnlineStatusChange)
  window.addEventListener('offline', handleOnlineStatusChange)

  // Cleanup on unmount
  const cleanup = () => {
    stopFlushTimer()
    window.removeEventListener('online', handleOnlineStatusChange)
    window.removeEventListener('offline', handleOnlineStatusChange)
    
    // Final flush of pending logs
    if (pendingBatch.value.length > 0) {
      flushLogs()
    }
  }

  return {
    // State
    logEntries: readonly(logEntries),
    errorLogs,
    auditLogs,
    sessionId,
    correlationId: readonly(correlationId),
    isOnline: readonly(isOnline),
    
    // Core logging methods
    logError,
    logWarning,
    logInfo,
    logDebug,
    
    // Specialized logging methods
    logCalculation,
    logUserAction,
    logValidationError,
    logNetworkEvent,
    logPerformance,
    logAuditTrail,
    
    // Utility methods
    newCorrelationId,
    clearLogs,
    exportLogs,
    flushLogs,
    cleanup
  }
}