# Learning: Vitest Environment Variable Mocking Limitations

## Issue Encountered
**Problem**: Unable to mock `import.meta.env` variables in Vitest due to immutability constraints, causing tests that depend on environment-specific behavior to fail or behave unexpectedly.

**Manifestation**:
```typescript
// TEST CODE - Attempted mocking
vi.stubEnv('DEV', true)  // Doesn't affect import.meta.env.DEV

// ACTUAL CODE
if (!import.meta.env.DEV) return  // Always false in tests

// ERROR MESSAGE
TypeError: 'process.env' only accepts a configurable, writable, and enumerable data descriptor
```

**Error Messages**:
- `TypeError: Cannot redefine property: DEV`
- `'process.env' only accepts a configurable, writable, and enumerable data descriptor`
- Tests expecting development behavior in production test environment

## Root Cause Analysis
- **Immutable environment objects**: `import.meta.env` is frozen and non-configurable in Vitest
- **Build-time vs runtime**: `import.meta.env` values are determined at build time, not runtime
- **Vite vs Node.js environments**: Different environment variable systems between development and testing
- **Mock API limitations**: `vi.stubEnv()` affects `process.env` but not `import.meta.env`

**Specific Code Issues**:
```typescript
// useLogging.ts - Environment-dependent behavior
const logDebug = (message: string) => {
  if (!import.meta.env.DEV) return  // Can't be mocked in tests
  
  const entry = createLogEntry(LogLevel.DEBUG, message)
  addLogEntry(entry)
}

// Test attempting to mock
vi.stubEnv('DEV', true)  // ❌ Doesn't work
Object.defineProperty(import.meta.env, 'DEV', {  // ❌ Throws error
  value: true,
  writable: true
})
```

## Impact on Development
- **Incomplete test coverage**: Unable to test both development and production code paths
- **False test assumptions**: Tests assuming environment state that doesn't match reality
- **Debugging complexity**: Hard to distinguish between real bugs and environment mocking issues
- **CI/CD inconsistencies**: Different behavior in local tests vs deployed environments

## Solution Applied

### 1. Adaptive Test Expectations
```typescript
// BEFORE: Assuming mockable environment
it('should log debug in development', () => {
  vi.stubEnv('DEV', true)  // Doesn't work
  
  logger.logDebug('Test debug')
  expect(logger.logEntries.value.length).toBe(1)  // Fails
})

// AFTER: Adaptive to actual environment
it('should log debug messages only in development', () => {
  const isDevMode = import.meta.env.DEV  // Check actual state
  
  logger.logDebug('Test debug', { key: 'value' }, 'gcs')
  
  if (isDevMode) {
    expect(logger.logEntries.value.length).toBe(1)
    expect(logger.logEntries.value[0].level).toBe(LogLevel.DEBUG)
  } else {
    expect(logger.logEntries.value.length).toBe(0)
  }
})
```

### 2. Configuration Override Pattern
```typescript
// Include DEBUG in log levels for environment-dependent tests
wrapper = createTestComponent({ 
  logLevels: [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.AUDIT] 
})

// This bypasses environment check by explicitly enabling DEBUG logs
```

### 3. Test Skipping Strategy
```typescript
// Skip tests that require specific environments
it.skip('should not log debug messages in production', () => {
  // Skip this test since import.meta.env.DEV is immutable in Vitest
  // This would need a more complex mocking setup to test properly
})

// Or conditional skipping
it.skipIf(!import.meta.env.DEV)('development-only behavior', () => {
  // Test only runs in development environment
})
```

### 4. Dependency Injection Pattern
```typescript
// BEFORE: Direct environment access
const logDebug = (message: string) => {
  if (!import.meta.env.DEV) return
  // ... logging logic
}

// AFTER: Injectable environment
const logDebug = (message: string, env = import.meta.env) => {
  if (!env.DEV) return
  // ... logging logic
}

// Test with injected environment
it('logs debug in development', () => {
  const mockEnv = { DEV: true }
  logger.logDebug('Test', mockEnv)
  expect(logger.logEntries.value.length).toBe(1)
})
```

## Prevention Strategies

### 1. Environment-Agnostic Design
**DO:**
- ✅ Use configuration objects instead of direct environment access
- ✅ Design features to work regardless of environment
- ✅ Test behavior rather than environment-specific code paths
- ✅ Use dependency injection for environment values

**DON'T:**
- ❌ Rely heavily on `import.meta.env` for core functionality
- ❌ Write tests that require specific environment states
- ❌ Mix build-time and runtime environment concerns
- ❌ Assume environment mocking will work like Node.js

### 2. Configuration-Driven Testing
```typescript
// Instead of mocking environment, use explicit config
const createLogger = (options = {}) => {
  const config = {
    enableDebugLogs: import.meta.env.DEV,  // Default from env
    ...options  // Allow override
  }
  
  return {
    logDebug(message: string) {
      if (!config.enableDebugLogs) return
      // ... logging logic
    }
  }
}

// Test with explicit config
it('logs debug when enabled', () => {
  const logger = createLogger({ enableDebugLogs: true })
  logger.logDebug('Test')
  expect(/* debug logged */)
})
```

### 3. Feature Flag Pattern
```typescript
// Use feature flags instead of environment checks
interface FeatureFlags {
  debugLogging: boolean
  remoteLogging: boolean
  localStorage: boolean
}

const createLogger = (flags: Partial<FeatureFlags> = {}) => {
  const features = {
    debugLogging: import.meta.env.DEV,
    remoteLogging: import.meta.env.PROD,
    localStorage: true,
    ...flags
  }
  
  return {
    logDebug(message: string) {
      if (!features.debugLogging) return
      // ... logging logic
    }
  }
}
```

### 4. Environment Detection Utilities
```typescript
// Centralize environment detection
export const Environment = {
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
  
  // Testable environment checker
  checkEnv(env: 'dev' | 'prod' | 'test' = 'auto') {
    if (env === 'auto') {
      return this.isDev ? 'dev' : this.isProd ? 'prod' : 'test'
    }
    return env
  }
}

// Use in composables
const logDebug = (message: string, envOverride?: string) => {
  const env = Environment.checkEnv(envOverride)
  if (env !== 'dev') return
  // ... logging logic
}

// Test with override
logger.logDebug('Test', 'dev')  // Force dev behavior
```

## Advanced Techniques

### 1. Module Mocking Approach
```typescript
// Mock the entire composable module
vi.mock('@/composables/useLogging', () => ({
  useLogging: vi.fn(() => ({
    logDebug: vi.fn(),
    // ... other methods
  }))
}))

// Test the mock behavior
it('debug logging behavior', () => {
  const mockLogger = useLogging()
  mockLogger.logDebug('Test')
  expect(mockLogger.logDebug).toHaveBeenCalledWith('Test')
})
```

### 2. Wrapper Function Strategy
```typescript
// Create testable wrapper
const envWrapper = {
  isDev: () => import.meta.env.DEV,
  isProd: () => import.meta.env.PROD
}

// Use wrapper in code
const logDebug = (message: string) => {
  if (!envWrapper.isDev()) return
  // ... logging logic
}

// Mock wrapper in tests
vi.spyOn(envWrapper, 'isDev').mockReturnValue(true)
```

### 3. Build-Time Configuration
```typescript
// vite.config.ts - Define test-specific environment
export default defineConfig(({ mode }) => ({
  define: {
    __DEV__: mode === 'development',
    __TEST__: mode === 'test',
    __PROD__: mode === 'production'
  },
  test: {
    environment: 'happy-dom',
    globals: true
  }
}))

// Use custom build variables
const logDebug = (message: string) => {
  if (!__DEV__ && !__TEST__) return  // Use build-time constants
  // ... logging logic
}
```

### 4. Runtime Environment Detection
```typescript
// Detect environment at runtime
const detectEnvironment = () => {
  // Check for test environment indicators
  if (typeof vi !== 'undefined') return 'test'
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') return 'dev'
  return 'prod'
}

const environment = detectEnvironment()

const logDebug = (message: string) => {
  if (environment !== 'dev' && environment !== 'test') return
  // ... logging logic
}
```

## Common Anti-Patterns

### 1. Forcing Environment Mocks
```typescript
// ANTI-PATTERN: Trying to force immutable object changes
Object.defineProperty(import.meta.env, 'DEV', { value: true })  // Throws

// PATTERN: Work with environment as-is
const isDevMode = import.meta.env.DEV
if (isDevMode) {
  // Test development behavior
} else {
  // Test production behavior
}
```

### 2. Environment-Dependent Core Logic
```typescript
// ANTI-PATTERN: Core functionality depends on environment
const calculate = (input: number) => {
  if (import.meta.env.DEV) {
    return input * 2  // Different behavior in dev
  }
  return input * 3
}

// PATTERN: Environment affects logging/debugging only
const calculate = (input: number) => {
  const result = input * 3  // Same logic always
  
  if (import.meta.env.DEV) {
    console.log('Debug:', { input, result })  // Only logging differs
  }
  
  return result
}
```

### 3. Test Environment Assumptions
```typescript
// ANTI-PATTERN: Assuming test environment state
expect(import.meta.env.DEV).toBe(true)  // May be false

// PATTERN: Adaptive to actual environment
const actualEnv = import.meta.env.DEV
expect(someFeature.enabled).toBe(actualEnv)
```

## Framework-Specific Considerations

### 1. Vite vs Webpack
```typescript
// Vite uses import.meta.env
if (import.meta.env.DEV) { /* logic */ }

// Webpack uses process.env (can be mocked)
if (process.env.NODE_ENV === 'development') { /* logic */ }
```

### 2. Vitest vs Jest
```typescript
// Vitest - import.meta.env is immutable
// Use configuration-based approach

// Jest - process.env can be mocked
process.env.NODE_ENV = 'test'  // Works in Jest
```

### 3. Vue.js Specifics
```typescript
// Vue development mode detection
const isDev = import.meta.env.DEV || process.env.NODE_ENV === 'development'

// Use in components
export default defineComponent({
  setup() {
    if (isDev) {
      // Development-only setup
    }
  }
})
```

## Alternative Solutions

### 1. Test Configuration Files
```typescript
// test.config.ts
export const testConfig = {
  enableDebugLogs: true,
  mockNetwork: true,
  // ... other test-specific settings
}

// Use in tests
const logger = useLogging(testConfig)
```

### 2. Environment-Specific Test Files
```typescript
// useLogging.dev.test.ts - Only run in development
if (import.meta.env.DEV) {
  describe('Development logging', () => {
    // Tests that require dev environment
  })
}

// useLogging.prod.test.ts - Only run in production
if (import.meta.env.PROD) {
  describe('Production logging', () => {
    // Tests that require prod environment
  })
}
```

### 3. Test Matrix Approach
```typescript
// Run tests with different configurations
const testCases = [
  { name: 'development mode', config: { enableDebugLogs: true } },
  { name: 'production mode', config: { enableDebugLogs: false } }
]

testCases.forEach(({ name, config }) => {
  describe(`Logging in ${name}`, () => {
    it('behaves correctly', () => {
      const logger = useLogging(config)
      // ... test logic
    })
  })
})
```

## References
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)
- [Vue.js Environment Variables](https://cli.vuejs.org/guide/mode-and-env.html)

## Keywords
`vitest`, `environment-variables`, `import-meta-env`, `mocking-limitations`, `vite`, `test-configuration`