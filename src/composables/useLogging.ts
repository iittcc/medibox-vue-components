import { ref, computed } from 'vue'
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

export interface LoggingConfig {
  maxLocalEntries?: number
  batchSize?: number
  flushInterval?: number
  enableLocalStorage?: boolean
  enableRemoteLogging?: boolean
  logLevels?: LogLevel[]
  anonymizeData?: boolean
  remoteEndpoint?: string
}

const DEFAULT_CONFIG: LoggingConfig = {
  maxLocalEntries: 1000,
  batchSize: 50,
  flushInterval: 30000, // 30 seconds
  enableLocalStorage: true,
  enableRemoteLogging: true,
  logLevels: [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.AUDIT],
  anonymizeData: true,
  remoteEndpoint: '/api/logs'
}

export function useLogging(config: Partial<LoggingConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config }
  const sessionId = nanoid()
  const correlationId = ref<string>(nanoid())
  
  const logEntries = ref<LogEntry[]>([])
  const pendingBatch = ref<LogEntry[]>([])
  const isOnline = ref(navigator.onLine)
  
  let flushTimer: NodeJS.Timeout | null = null

  // Computed properties
  const errorLogs = computed(() => 
    logEntries.value.filter(entry => entry.level === LogLevel.ERROR)
  )
  const auditLogs = computed(() => 
    logEntries.value.filter(entry => entry.level === LogLevel.AUDIT)
  )

  // Data anonymization
  const anonymizeUserData = (data: Record<string, any>): Record<string, any> => {
    if (!finalConfig.anonymizeData) {
      return data
    }

    const sensitiveFields = [
      'name', 'navn', 'email', 'telefon', 'phone', 'address', 'adresse',
      'cpr', 'ssn', 'personnummer', 'patient_id', 'patientId'
    ]

    const anonymized = { ...data }
    
    for (const [key, value] of Object.entries(anonymized)) {
      const lowerKey = key.toLowerCase()
      
      if (sensitiveFields.some(field => lowerKey.includes(field))) {
        if (typeof value === 'string' && value.length > 0) {
          anonymized[key] = `***${value.slice(-2)}` // Keep last 2 chars
        } else {
          anonymized[key] = '***'
        }
      }
      
      // Anonymize nested objects
      if (typeof value === 'object' && value !== null) {
        anonymized[key] = anonymizeUserData(value)
      }
    }
    
    return anonymized
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
    if (logEntries.value.length > finalConfig.maxLocalEntries!) {
      logEntries.value = logEntries.value.slice(-finalConfig.maxLocalEntries!)
    }
    
    // Add to pending batch for remote logging
    if (finalConfig.enableRemoteLogging) {
      pendingBatch.value.push(entry)
      
      // Flush if batch is full
      if (pendingBatch.value.length >= finalConfig.batchSize!) {
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