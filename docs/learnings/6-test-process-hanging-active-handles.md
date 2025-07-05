# Learning: Test Process Hanging Due to Active Handles

## Issue Encountered
**Problem**: Test processes hang indefinitely, preventing any tests from completing. Running `npm test` would start but never finish, requiring manual termination.

**Manifestation**:
```bash
$ npm test
> vitest

 RUN  v3.2.4 /project
# Process hangs here indefinitely - no progress, no output
```

**Error Messages**: No error messages - just complete silence and hanging.

## Root Cause Analysis
- **Active handles preventing Node.js exit**: Timers (`setInterval`) and event listeners created during test setup weren't being cleaned up
- **Composable initialization side effects**: The `useLogging` composable immediately creates a `setInterval` timer and adds window event listeners when instantiated
- **Test isolation failure**: Each test was creating new instances without cleaning up previous ones
- **Async operations**: Pending network requests and flush operations keeping the event loop active

**Specific Code Issues**:
```typescript
// useLogging.ts - Line 533
startFlushTimer()  // Creates setInterval immediately

// Line 536-537
window.addEventListener('online', handleOnlineStatusChange)
window.addEventListener('offline', handleOnlineStatusChange)
```

## Impact on Development
- **Complete testing blockage**: No tests could run at all
- **False failure assumptions**: Initially thought tests were failing when they weren't even executing
- **Development workflow disruption**: Unable to validate any code changes
- **Debugging complexity**: Hard to identify root cause since there were no error messages

## Solution Applied

### 1. Logger Instance Tracking System
```typescript
// Track all logger instances for cleanup
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

### 2. Comprehensive Cleanup in afterEach
```typescript
afterEach(() => {
  // Clear all timers immediately to prevent hanging
  vi.clearAllTimers()
  
  // Clean up all logger instances
  loggerInstances.forEach(logger => {
    if (logger && typeof logger.cleanup === 'function') {
      try {
        logger.cleanup()  // Removes event listeners and clears timers
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  })
  loggerInstances = []
  
  // Clear any remaining timers and restore
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
})
```

### 3. Safe Test Configuration
```typescript
const createTestComponent = (config?: any) => {
  // Default config that disables problematic features
  const safeConfig = {
    enableRemoteLogging: false,
    enableLocalStorage: false,
    flushInterval: 999999999, // Very long interval to prevent auto-flush
    ...config
  }
  
  const logger = useLogging(safeConfig)
  
  // Mock flushLogs to prevent hanging async operations
  logger.flushLogs = vi.fn().mockResolvedValue(undefined)
  
  return logger
}
```

### 4. Proper Timer Mocking Order
```typescript
beforeEach(() => {
  // Set up fake timers FIRST before anything else
  vi.useFakeTimers()
  vi.clearAllMocks()
  // ... rest of setup
})
```

## Prevention Strategies

### 1. Test Resource Management Guidelines
**DO:**
- ✅ Track all instances that create timers or event listeners
- ✅ Call cleanup methods in test teardown
- ✅ Use fake timers when testing components with intervals
- ✅ Mock async operations that might not complete
- ✅ Clear all timers in both beforeEach and afterEach

**DON'T:**
- ❌ Create real timers in test environments
- ❌ Leave event listeners attached after tests
- ❌ Allow network requests in unit tests
- ❌ Ignore cleanup methods provided by composables

### 2. Composable Design Patterns
```typescript
// GOOD: Provide cleanup method
export function useLogging() {
  const cleanup = () => {
    stopFlushTimer()
    window.removeEventListener('online', handleOnlineStatusChange)
    window.removeEventListener('offline', handleOnlineStatusChange)
  }
  
  return {
    // ... other methods
    cleanup
  }
}

// BAD: No cleanup method
export function useLogging() {
  setInterval(flushLogs, 30000)  // No way to clean this up
  window.addEventListener('online', handler)  // Leaks listeners
}
```

### 3. Test Setup Best Practices
```typescript
describe('Component with side effects', () => {
  let instances: any[] = []
  
  beforeEach(() => {
    vi.useFakeTimers()  // FIRST
    instances = []      // Reset tracking
  })
  
  afterEach(() => {
    // Clean up in reverse order of creation
    instances.forEach(instance => instance.cleanup?.())
    instances = []
    vi.clearAllTimers()
    vi.useRealTimers()
  })
})
```

### 4. Diagnostic Techniques
```typescript
// Add to test setup to diagnose hanging
afterEach(() => {
  // Log active handles for debugging
  if (process.env.DEBUG_HANDLES) {
    console.log('Active handles:', process._getActiveHandles().length)
    console.log('Active requests:', process._getActiveRequests().length)
  }
})
```

## Advanced Techniques

### 1. Handle Leak Detection
```typescript
// Detect handle leaks between tests
let initialHandles: number

beforeEach(() => {
  initialHandles = process._getActiveHandles().length
})

afterEach(() => {
  const currentHandles = process._getActiveHandles().length
  if (currentHandles > initialHandles) {
    console.warn(`Handle leak detected: ${currentHandles - initialHandles} new handles`)
  }
})
```

### 2. Timeout-Based Debugging
```typescript
// Use timeouts to identify which tests hang
it('test that might hang', async () => {
  const promise = new Promise(resolve => {
    // Test logic here
    resolve(result)
  })
  
  // Timeout after 5 seconds to prevent hanging
  const result = await Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Test timeout')), 5000)
    )
  ])
})
```

### 3. Selective Feature Disabling
```typescript
// Create test variants that disable specific features
const createSafeLogger = () => useLogging({
  enableRemoteLogging: false,    // Disable network calls
  enableLocalStorage: false,     // Disable storage operations
  flushInterval: Number.MAX_VALUE, // Effectively disable auto-flush
})

const createNetworkLogger = () => useLogging({
  enableRemoteLogging: true,
  // Mock fetch to prevent real network calls
})
```

## Common Anti-Patterns

### 1. Ignoring Cleanup
```typescript
// ANTI-PATTERN: No cleanup
it('test with side effects', () => {
  const logger = useLogging()  // Creates timers and listeners
  // Test completes but timers/listeners still active
})

// PATTERN: Proper cleanup
it('test with side effects', () => {
  const logger = useLogging()
  // ... test logic
  logger.cleanup()  // Clean up resources
})
```

### 2. Real Timers in Tests
```typescript
// ANTI-PATTERN: Real timers
beforeEach(() => {
  // Don't use real timers for composables that create intervals
})

// PATTERN: Fake timers
beforeEach(() => {
  vi.useFakeTimers()  // Mock all timer functions
})
```

### 3. Batch Cleanup Delays
```typescript
// ANTI-PATTERN: Cleanup at end of test suite
afterAll(() => {
  instances.forEach(i => i.cleanup())  // Too late - tests already hung
})

// PATTERN: Immediate cleanup
afterEach(() => {
  instances.forEach(i => i.cleanup())  // Clean up after each test
})
```

## Framework-Specific Considerations

### 1. Vitest Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 10000,  // Prevent infinite hangs
    hookTimeout: 5000,   // Limit setup/teardown time
    teardownTimeout: 5000, // Limit cleanup time
  }
})
```

### 2. Vue Test Utils
```typescript
// Ensure Vue components are properly unmounted
afterEach(() => {
  if (wrapper) {
    wrapper.unmount()  // Triggers component cleanup
  }
})
```

### 3. Node.js Process Management
```typescript
// Force exit if tests hang (last resort)
process.on('SIGINT', () => {
  console.log('Force exiting due to hanging tests')
  process.exit(1)
})
```

## References
- [Node.js Event Loop and Handles](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/)
- [Vitest Testing Best Practices](https://vitest.dev/guide/testing-types.html)
- [Vue Test Utils Cleanup](https://test-utils.vuejs.org/guide/advanced/vue-router.html)

## Keywords
`test-hanging`, `active-handles`, `timer-cleanup`, `event-listeners`, `vitest`, `resource-management`