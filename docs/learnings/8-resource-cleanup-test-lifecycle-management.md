# Learning: Resource Cleanup in Test Lifecycle Management

## Issue Encountered
**Problem**: Test resources (timers, event listeners, network connections) not being properly cleaned up between tests, leading to memory leaks, test interference, and process hanging.

**Manifestation**:
```typescript
// Each test creates resources but doesn't clean them up
it('test 1', () => {
  const logger = useLogging()  // Creates setInterval, event listeners
  // Test ends but resources remain active
})

it('test 2', () => {
  const logger = useLogging()  // Creates MORE resources
  // Now we have 2x the active resources
})
```

**Error Messages**:
- Tests hanging indefinitely
- Memory usage increasing with each test
- `MaxListenersExceededWarning: Possible EventEmitter memory leak detected`
- Intermittent test failures due to interference

## Root Cause Analysis
- **Shared global state**: Event listeners on `window` object persist across tests
- **Timer accumulation**: `setInterval` timers continue running after test completion
- **Missing cleanup patterns**: Test framework provides lifecycle hooks but they weren't being used
- **Composable design gaps**: No cleanup methods provided for resource management
- **Test isolation failure**: Resources from one test affecting subsequent tests

**Specific Code Issues**:
```typescript
// useLogging.ts - Resources created but not tracked
export function useLogging() {
  // Timer created but never cleaned up in tests
  const flushTimer = setInterval(() => {
    flushLogs()
  }, finalConfig.flushInterval)
  
  // Event listeners added but never removed in tests
  window.addEventListener('online', handleOnlineStatusChange)
  window.addEventListener('offline', handleOnlineStatusChange)
  
  // No way for tests to clean up these resources
  return { /* methods but no cleanup */ }
}
```

## Impact on Development
- **Test reliability degradation**: Later tests failing due to interference from earlier tests
- **Memory leaks**: Test process consuming increasing amounts of memory
- **CI/CD pipeline issues**: Tests timing out in automated environments
- **Developer experience**: Slow test execution and unpredictable results

## Solution Applied

### 1. Resource Tracking System
```typescript
// Track all instances that create resources
let loggerInstances: any[] = []

const createTestComponent = (config?: any) => {
  const TestComponent = defineComponent({
    setup() {
      const logger = useLogging(config)
      loggerInstances.push(logger)  // Track for cleanup
      return { logger }
    },
    template: '<div></div>'
  })
  return mount(TestComponent)
}
```

### 2. Comprehensive Cleanup Strategy
```typescript
afterEach(() => {
  // Clear all timers immediately to prevent hanging
  vi.clearAllTimers()
  
  // Clean up all tracked instances
  loggerInstances.forEach(logger => {
    if (logger && typeof logger.cleanup === 'function') {
      try {
        logger.cleanup()  // Remove listeners, clear timers
      } catch (error) {
        // Ignore cleanup errors to prevent test failures
        console.warn('Cleanup error:', error)
      }
    }
  })
  loggerInstances = []
  
  // Component cleanup
  if (wrapper) {
    wrapper.unmount()
  }
  
  // Final safety cleanup
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
})
```

### 3. Enhanced Composable Design
```typescript
// useLogging.ts - Added cleanup method
export function useLogging(config: Partial<LoggingConfig> = {}) {
  let flushTimer: ReturnType<typeof setTimeout> | null = null
  
  const startFlushTimer = () => {
    if (flushTimer) clearInterval(flushTimer)
    flushTimer = setInterval(flushLogs, finalConfig.flushInterval)
  }
  
  const stopFlushTimer = () => {
    if (flushTimer) {
      clearInterval(flushTimer)
      flushTimer = null
    }
  }
  
  // Cleanup method for tests
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
    // ... other methods
    cleanup  // Expose cleanup method
  }
}
```

### 4. Mock Resource Operations
```typescript
const createTestComponent = (config?: any) => {
  const TestComponent = defineComponent({
    setup() {
      const safeConfig = {
        enableRemoteLogging: false,    // Prevent network requests
        enableLocalStorage: false,     // Prevent storage operations
        flushInterval: 999999999,      // Effectively disable auto-flush
        ...config
      }
      
      const logger = useLogging(safeConfig)
      
      // Mock async operations to prevent hanging
      logger.flushLogs = vi.fn().mockResolvedValue(undefined)
      
      loggerInstances.push(logger)
      return { logger }
    },
    template: '<div></div>'
  })
  return mount(TestComponent)
}
```

## Prevention Strategies

### 1. Resource Management Guidelines
**DO:**
- ✅ Track all instances that create persistent resources
- ✅ Provide cleanup methods in composables
- ✅ Use test lifecycle hooks consistently
- ✅ Mock external resources in tests
- ✅ Clean up in reverse order of creation

**DON'T:**
- ❌ Create global resources without cleanup
- ❌ Ignore test lifecycle management
- ❌ Use real timers or network calls in tests
- ❌ Assume garbage collection will handle cleanup
- ❌ Mix real and mocked resources

### 2. Composable Design Patterns
```typescript
// GOOD: Composable with cleanup
export function useResource() {
  const resource = createResource()
  
  const cleanup = () => {
    resource.destroy()
  }
  
  // Auto-cleanup on component unmount
  onBeforeUnmount(cleanup)
  
  return {
    resource,
    cleanup  // Also expose for manual cleanup
  }
}

// BAD: No cleanup provided
export function useResource() {
  const resource = createResource()  // Leaks on unmount
  return { resource }
}
```

### 3. Test Setup Best Practices
```typescript
describe('Component with resources', () => {
  let instances: any[] = []
  let cleanup: (() => void)[] = []
  
  beforeEach(() => {
    vi.useFakeTimers()
    instances = []
    cleanup = []
  })
  
  afterEach(() => {
    // Execute all cleanup functions
    cleanup.forEach(fn => {
      try {
        fn()
      } catch (error) {
        console.warn('Cleanup failed:', error)
      }
    })
    cleanup = []
    
    // Clean up tracked instances
    instances.forEach(instance => instance.cleanup?.())
    instances = []
    
    // Framework cleanup
    vi.clearAllTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })
  
  const createInstance = () => {
    const instance = useComposable()
    instances.push(instance)
    return instance
  }
})
```

### 4. Memory Leak Detection
```typescript
// Add to test setup for debugging
let initialMemory: NodeJS.MemoryUsage
let initialHandles: number

beforeEach(() => {
  initialMemory = process.memoryUsage()
  initialHandles = process._getActiveHandles().length
})

afterEach(() => {
  const currentMemory = process.memoryUsage()
  const currentHandles = process._getActiveHandles().length
  
  // Warn about potential leaks
  if (currentMemory.heapUsed > initialMemory.heapUsed * 1.5) {
    console.warn('Potential memory leak detected')
  }
  
  if (currentHandles > initialHandles) {
    console.warn(`Handle leak: ${currentHandles - initialHandles} new handles`)
  }
})
```

## Advanced Techniques

### 1. Resource Pool Management
```typescript
// Centralized resource management
class TestResourceManager {
  private resources: Set<{ cleanup: () => void }> = new Set()
  
  track<T extends { cleanup: () => void }>(resource: T): T {
    this.resources.add(resource)
    return resource
  }
  
  cleanup() {
    this.resources.forEach(resource => {
      try {
        resource.cleanup()
      } catch (error) {
        console.warn('Resource cleanup failed:', error)
      }
    })
    this.resources.clear()
  }
}

// Usage in tests
const resourceManager = new TestResourceManager()

afterEach(() => {
  resourceManager.cleanup()
})

it('test with resources', () => {
  const logger = resourceManager.track(useLogging())
  // Test logic - resources automatically cleaned up
})
```

### 2. Automatic Resource Detection
```typescript
// Detect and track resources automatically
const trackableResources = new WeakSet()

const createProxy = (obj: any) => {
  return new Proxy(obj, {
    get(target, prop) {
      const value = target[prop]
      if (typeof value === 'function' && prop === 'cleanup') {
        trackableResources.add(target)
      }
      return value
    }
  })
}
```

### 3. Timeout-Based Cleanup
```typescript
// Force cleanup after timeout
const withTimeout = (cleanupFn: () => void, timeoutMs = 5000) => {
  const timeoutId = setTimeout(() => {
    console.warn('Forcing cleanup due to timeout')
    cleanupFn()
  }, timeoutMs)
  
  return () => {
    clearTimeout(timeoutId)
    cleanupFn()
  }
}

// Usage
const cleanup = withTimeout(() => logger.cleanup(), 5000)
```

### 4. Lifecycle Hooks Integration
```typescript
// Vue-specific cleanup integration
const useTestResource = () => {
  const resource = useResource()
  
  // Register for cleanup in current test context
  getCurrentInstance()?.scope.stop.then(() => {
    resource.cleanup()
  })
  
  return resource
}
```

## Common Anti-Patterns

### 1. No Cleanup Tracking
```typescript
// ANTI-PATTERN: Create without tracking
it('test', () => {
  const logger1 = useLogging()
  const logger2 = useLogging() 
  // No way to clean these up
})

// PATTERN: Track for cleanup
it('test', () => {
  const logger1 = createTrackedLogger()
  const logger2 = createTrackedLogger()
  // Automatically cleaned up in afterEach
})
```

### 2. Cleanup Order Issues
```typescript
// ANTI-PATTERN: Wrong cleanup order
afterEach(() => {
  vi.useRealTimers()  // Before clearing timers
  vi.clearAllTimers() // Too late
})

// PATTERN: Correct cleanup order
afterEach(() => {
  vi.clearAllTimers() // Clear first
  vi.useRealTimers()  // Then restore
})
```

### 3. Ignoring Cleanup Errors
```typescript
// ANTI-PATTERN: Let cleanup errors fail tests
afterEach(() => {
  instances.forEach(i => i.cleanup()) // May throw
})

// PATTERN: Handle cleanup errors gracefully
afterEach(() => {
  instances.forEach(i => {
    try {
      i.cleanup()
    } catch (error) {
      console.warn('Cleanup error:', error)
    }
  })
})
```

## Framework-Specific Considerations

### 1. Vitest Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    teardownTimeout: 10000,  // Allow time for cleanup
    isolate: true,           // Isolate test environments
    pool: 'threads',         // Use threads for better isolation
  }
})
```

### 2. Vue Test Utils
```typescript
// Ensure component unmounting triggers cleanup
afterEach(() => {
  if (wrapper) {
    wrapper.unmount()  // Triggers onBeforeUnmount hooks
  }
})
```

### 3. DOM Cleanup
```typescript
// Clean up DOM state between tests
afterEach(() => {
  document.body.innerHTML = ''
  document.head.innerHTML = ''
  
  // Remove all event listeners
  const events = ['click', 'change', 'input', 'submit']
  events.forEach(event => {
    document.removeEventListener(event, () => {}, true)
    window.removeEventListener(event, () => {}, true)
  })
})
```

## Performance Considerations

### 1. Lazy Cleanup
```typescript
// Only clean up resources that were actually created
const lazyCleanup = (cleanupFn: () => void) => {
  let cleaned = false
  return () => {
    if (!cleaned) {
      cleanupFn()
      cleaned = true
    }
  }
}
```

### 2. Batch Cleanup
```typescript
// Batch cleanup operations for efficiency
const batchCleanup = (resources: any[]) => {
  return Promise.all(
    resources.map(async resource => {
      try {
        await resource.cleanup?.()
      } catch (error) {
        console.warn('Cleanup failed:', error)
      }
    })
  )
}
```

## References
- [Jest Lifecycle Hooks](https://jestjs.io/docs/setup-teardown)
- [Vitest Lifecycle and Hooks](https://vitest.dev/guide/test-context.html)
- [Node.js Memory Management](https://nodejs.org/en/docs/guides/simple-profiling/)

## Keywords
`resource-cleanup`, `test-lifecycle`, `memory-leaks`, `event-listeners`, `timer-management`, `composable-design`