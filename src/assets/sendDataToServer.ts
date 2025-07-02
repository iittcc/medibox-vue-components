import Axios from 'axios'
import forge from 'node-forge'
import type { LogLevel } from '@/composables/useLogging'

export interface SendDataOptions {
  maxRetries?: number
  timeout?: number
  retryDelay?: number
  exponentialBackoff?: boolean
  onProgress?: (attempt: number, maxRetries: number) => void
  onError?: (error: Error, attempt: number) => void
  calculatorType?: string
  correlationId?: string
}

export interface SendDataResponse<T = any> {
  data: T
  success: boolean
  attempt: number
  duration: number
  correlationId?: string
}

export interface NetworkError extends Error {
  isNetworkError: boolean
  status?: number
  statusText?: string
  attempt: number
  isTimeout: boolean
  isRetryable: boolean
}

// Enhanced error types for better categorization
export class PublicKeyError extends Error {
  isRetryable = false
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'PublicKeyError'
  }
}

export class EncryptionError extends Error {
  isRetryable = false
  constructor(message: string, public originalError?: Error) {
    super(message)
    this.name = 'EncryptionError'
  }
}

export class NetworkTimeoutError extends Error implements NetworkError {
  isNetworkError = true
  isTimeout = true
  isRetryable = true
  
  constructor(message: string, public attempt: number, public status?: number, public statusText?: string) {
    super(message)
    this.name = 'NetworkTimeoutError'
  }
}

export class NetworkRequestError extends Error implements NetworkError {
  isNetworkError = true
  isTimeout = false
  
  constructor(
    message: string, 
    public attempt: number, 
    public status?: number, 
    public statusText?: string,
    public isRetryable: boolean = true
  ) {
    super(message)
    this.name = 'NetworkRequestError'
  }
}

const DEFAULT_OPTIONS: Required<Omit<SendDataOptions, 'onProgress' | 'onError' | 'calculatorType' | 'correlationId'>> = {
  maxRetries: 3,
  timeout: 30000,
  retryDelay: 1000,
  exponentialBackoff: true
}

async function fetchPublicKey(url: string, timeout: number = 10000): Promise<string> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const response = await Axios.get(url, {
      signal: controller.signal,
      timeout: timeout
    })
    
    clearTimeout(timeoutId)

    if (response.data && response.data.publicKey) {
      return response.data.publicKey
    } else if (typeof response.data === 'string') {
      return response.data
    } else {
      throw new PublicKeyError('Invalid response format for public key')
    }
  } catch (error) {
    if (Axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        throw new PublicKeyError('Public key fetch timeout', error)
      } else if (error.response) {
        throw new PublicKeyError(
          `Public key fetch failed: HTTP ${error.response.status}`, 
          error
        )
      } else {
        throw new PublicKeyError(`Network error fetching public key: ${error.message}`, error)
      }
    }
    throw new PublicKeyError('Failed to fetch public key', error as Error)
  }
}

function getRetryDelay(attempt: number, baseDelay: number, exponentialBackoff: boolean): number {
  if (!exponentialBackoff) {
    return baseDelay
  }
  
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, attempt)
  const jitter = Math.random() * 0.1 * exponentialDelay
  return Math.min(exponentialDelay + jitter, 30000) // Max 30 seconds
}

function isRetryableError(error: Error): boolean {
  if (error instanceof NetworkRequestError || error instanceof NetworkTimeoutError) {
    return error.isRetryable
  }
  
  if (Axios.isAxiosError(error)) {
    // Retry on network errors, timeouts, and certain HTTP status codes
    if (!error.response) {
      return true // Network error
    }
    
    const status = error.response.status
    return status >= 500 || status === 408 || status === 429 // Server errors, timeout, rate limit
  }
  
  return false
}

function createNetworkError(error: unknown, attempt: number): NetworkError {
  if (Axios.isAxiosError(error)) {
    const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
    
    if (isTimeout) {
      return new NetworkTimeoutError(
        `Request timeout on attempt ${attempt}`,
        attempt,
        error.response?.status,
        error.response?.statusText
      )
    }
    
    if (error.response) {
      return new NetworkRequestError(
        `HTTP ${error.response.status}: ${error.response.statusText}`,
        attempt,
        error.response.status,
        error.response.statusText,
        isRetryableError(error)
      )
    } else {
      return new NetworkRequestError(
        `Network error: ${error.message}`,
        attempt,
        undefined,
        undefined,
        true
      )
    }
  }
  
  return new NetworkRequestError(
    `Unknown error: ${error instanceof Error ? error.message : 'Unknown'}`,
    attempt,
    undefined,
    undefined,
    false
  )
}

async function sendDataToServer<T = any>(
  url: string, 
  publicKeyUrl: string, 
  payload: object, 
  options: SendDataOptions = {}
): Promise<SendDataResponse<T>> {
  const startTime = Date.now()
  const finalOptions = { ...DEFAULT_OPTIONS, ...options }
  const correlationId = options.correlationId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // Emit logging event for request start
  window.dispatchEvent(new CustomEvent('medicalCalculatorLog', {
    detail: {
      level: 'info' as LogLevel,
      message: 'Starting data transmission',
      category: 'network',
      details: {
        url: url.replace(/\/\/[^\/]+/, '//***'), // Anonymize domain
        correlationId,
        calculatorType: options.calculatorType,
        payloadSize: JSON.stringify(payload).length
      }
    }
  }))

  try {
    // Fetch public key with timeout
    const publicKeyPem = await fetchPublicKey(publicKeyUrl, finalOptions.timeout / 3)

    if (!publicKeyPem) {
      throw new PublicKeyError('Public key is undefined')
    }
  
    // Encrypt data
    let publicKey: forge.pki.rsa.PublicKey
    let encryptedPayloadBase64: string
    let encryptedAesKeyBase64: string
    let ivBase64: string
    
    try {
      publicKey = forge.pki.publicKeyFromPem(publicKeyPem)

      // Generate a random AES key
      const aesKey = forge.random.getBytesSync(16)
      const iv = forge.random.getBytesSync(16)

      // Encrypt the payload using AES
      const cipher = forge.cipher.createCipher('AES-CBC', aesKey)
      cipher.start({ iv: iv })
      cipher.update(forge.util.createBuffer(JSON.stringify(payload), 'utf8'))
      cipher.finish()
      const encryptedPayload = cipher.output.getBytes()

      // Encrypt the AES key with the public key
      const encryptedAesKey = publicKey.encrypt(aesKey)

      // Convert to base64 for transmission
      encryptedPayloadBase64 = forge.util.encode64(encryptedPayload)
      encryptedAesKeyBase64 = forge.util.encode64(encryptedAesKey)
      ivBase64 = forge.util.encode64(iv)
    } catch (error) {
      throw new EncryptionError('Failed to encrypt payload', error as Error)
    }

    let lastError: NetworkError | null = null
    let attempt = 0

    // Retry loop with enhanced error handling
    while (attempt < finalOptions.maxRetries) {
      attempt++
      
      try {
        // Notify progress
        if (options.onProgress) {
          options.onProgress(attempt, finalOptions.maxRetries)
        }
        
        // Emit logging event for attempt
        window.dispatchEvent(new CustomEvent('medicalCalculatorLog', {
          detail: {
            level: 'debug' as LogLevel,
            message: `Transmission attempt ${attempt}/${finalOptions.maxRetries}`,
            category: 'network',
            details: {
              correlationId,
              attempt,
              calculatorType: options.calculatorType
            }
          }
        }))

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout)
        
        const response = await Axios.post(url, {
          payload: encryptedPayloadBase64,
          key: encryptedAesKeyBase64,
          iv: ivBase64,
          correlationId
        }, {
          signal: controller.signal,
          timeout: finalOptions.timeout,
          headers: {
            'X-Correlation-ID': correlationId,
            'X-Calculator-Type': options.calculatorType || 'unknown'
          }
        })
        
        clearTimeout(timeoutId)

        if (response.status === 200) {
          const duration = Date.now() - startTime
          
          // Emit success logging event
          window.dispatchEvent(new CustomEvent('medicalCalculatorLog', {
            detail: {
              level: 'info' as LogLevel,
              message: 'Data transmission successful',
              category: 'network',
              details: {
                correlationId,
                attempt,
                duration,
                calculatorType: options.calculatorType,
                status: response.status
              }
            }
          }))
          
          return {
            data: response.data,
            success: true,
            attempt,
            duration,
            correlationId
          }
        }
      } catch (error) {
        lastError = createNetworkError(error, attempt)
        
        // Call error handler
        if (options.onError) {
          options.onError(lastError, attempt)
        }
        
        // Emit error logging event
        window.dispatchEvent(new CustomEvent('medicalCalculatorLog', {
          detail: {
            level: 'error' as LogLevel,
            message: `Transmission attempt ${attempt} failed`,
            category: 'network',
            details: {
              correlationId,
              attempt,
              error: lastError.message,
              status: lastError.status,
              isRetryable: lastError.isRetryable,
              calculatorType: options.calculatorType
            }
          }
        }))

        // Don't retry if error is not retryable
        if (!lastError.isRetryable) {
          break
        }

        // Wait before retrying (except on last attempt)
        if (attempt < finalOptions.maxRetries) {
          const delay = getRetryDelay(attempt - 1, finalOptions.retryDelay, finalOptions.exponentialBackoff)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    // All attempts failed
    const duration = Date.now() - startTime
    const finalError = lastError || new NetworkRequestError('Unknown transmission failure', attempt)
    
    // Emit final failure logging event
    window.dispatchEvent(new CustomEvent('medicalCalculatorLog', {
      detail: {
        level: 'error' as LogLevel,
        message: 'Data transmission failed after all attempts',
        category: 'network',
        details: {
          correlationId,
          totalAttempts: attempt,
          duration,
          finalError: finalError.message,
          calculatorType: options.calculatorType
        }
      }
    }))

    throw finalError
  } catch (error) {
    const duration = Date.now() - startTime
    
    // Handle preparation errors (public key, encryption)
    if (error instanceof PublicKeyError || error instanceof EncryptionError) {
      window.dispatchEvent(new CustomEvent('medicalCalculatorLog', {
        detail: {
          level: 'error' as LogLevel,
          message: 'Data preparation failed',
          category: 'system',
          details: {
            correlationId,
            error: error.message,
            errorType: error.name,
            duration,
            calculatorType: options.calculatorType
          }
        }
      }))
      
      throw error
    }
    
    // Re-throw network errors
    if (error instanceof NetworkRequestError || error instanceof NetworkTimeoutError) {
      throw error
    }
    
    // Handle unexpected errors
    const unexpectedError = new Error(`Failed to prepare data for sending: ${error instanceof Error ? error.message : 'Unknown error'}`)
    
    window.dispatchEvent(new CustomEvent('medicalCalculatorLog', {
      detail: {
        level: 'error' as LogLevel,
        message: 'Unexpected transmission error',
        category: 'system',
        details: {
          correlationId,
          error: unexpectedError.message,
          duration,
          calculatorType: options.calculatorType
        }
      }
    }))
    
    throw unexpectedError
  }
}

export default sendDataToServer;
