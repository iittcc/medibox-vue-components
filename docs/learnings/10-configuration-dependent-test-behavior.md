# Learning: Configuration-Dependent Test Behavior

## Issue Encountered
**Problem**: Tests failing due to mismatches between expected configuration and actual default configuration, particularly when composables have complex default settings that affect behavior.

**Manifestation**:
```typescript
// TEST CODE - Expecting debug logs
it('should log debug messages', () => {
  const logger = useLogging()
  logger.logDebug('Test debug')
  expect(logger.logEntries.value.length).toBe(1)  // FAILS: Expected 1, got 0
})

// ACTUAL CONFIGURATION - Debug level not included
const DEFAULT_CONFIG = {
  logLevels: [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.AUDIT]
  // LogLevel.DEBUG is missing!
}
```

**Error Messages**:
- `expected +0 to be 1` (no debug logs created)
- `AssertionError: expected "spy" to be called with arguments: [ …(2) ] Number of calls: 0` (localStorage not called)
- Tests passing individually but failing when run together

## Root Cause Analysis
- **Complex default configurations**: Composables with multi-layered default settings
- **Conditional feature enablement**: Features disabled by default that tests expect to be enabled
- **Environment-dependent defaults**: Configuration varying based on build environment
- **Test isolation failures**: Shared configuration state affecting test independence
- **Implicit assumptions**: Tests assuming specific configuration without explicitly setting it

**Specific Code Issues**:
```typescript
// useLogging.ts - Complex default configuration
const DEFAULT_CONFIG: LoggingConfig = {
  maxLocalEntries: 1000,
  batchSize: 50,
  flushInterval: 30000,
  enableLocalStorage: true,      // ✓ Enabled by default
  enableRemoteLogging: true,     // ✓ Enabled by default  
  logLevels: [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.AUDIT],  
  // ❌ LogLevel.DEBUG not included!
  anonymizeData: true,
  // ... more config options
}

// Test assumes DEBUG logging works
logger.logDebug('Test debug')  // Filtered out by logLevels
```

## Impact on Development
- **Inconsistent test results**: Tests passing/failing based on configuration state
- **False negative tests**: Valid functionality appearing broken due to config mismatch
- **Debugging complexity**: Hard to trace failures to configuration issues
- **Test maintenance burden**: Tests breaking when default configurations change

## Solution Applied

### 1. Explicit Test Configuration
```typescript
// BEFORE: Implicit configuration dependency
it('should log debug messages', () => {
  const logger = useLogging()  // Uses defaults
  logger.logDebug('Test debug')
  expect(logger.logEntries.value.length).toBe(1)  // Fails
})

// AFTER: Explicit configuration for test needs
it('should log debug messages only in development', () => {
  // Include DEBUG in log levels for this test
  wrapper = createTestComponent({ 
    logLevels: [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG, LogLevel.AUDIT] 
  })
  const { logger } = wrapper.vm

  logger.logDebug('Test debug', { key: 'value' }, 'gcs')
  expect(logger.logEntries.value.length).toBe(1)
})
```

### 2. Configuration-Aware Test Helper
```typescript
// Safe configuration that prevents test hanging
const createTestComponent = (config?: any) => {
  const TestComponent = defineComponent({
    setup() {
      // Default config that disables problematic features
      const safeConfig = {
        enableRemoteLogging: false,    // Prevent network calls
        enableLocalStorage: false,     // Prevent storage operations
        flushInterval: 999999999,      // Disable auto-flush
        ...config  // Allow test-specific overrides
      }
      
      const logger = useLogging(safeConfig)
      loggerInstances.push(logger)
      return { logger }
    },
    template: '<div></div>'
  })
  return mount(TestComponent)
}
```

### 3. Feature-Specific Test Configuration
```typescript
// Tests that need localStorage explicitly enable it
it('should log audit trail events', () => {
  wrapper = createTestComponent({ enableLocalStorage: true })
  const { logger } = wrapper.vm
  
  logger.logAuditTrail('data_access', auditDetails, 'who5')
  expect(localStorageMock.setItem).toHaveBeenCalledWith(
    expect.stringMatching(/^audit_who5_\d+$/),
    expect.any(String)
  )
})

// Tests that need remote logging explicitly enable it
it('should batch and flush logs to remote endpoint', async () => {
  wrapper = createTestComponent({ 
    batchSize: 2,
    enableRemoteLogging: true  // Explicitly enable for this test
  })
  // ... test logic
})
```

### 4. Configuration Matrix Testing
```typescript
// Test different configuration combinations
const configurationTests = [
  {
    name: 'minimal configuration',
    config: { enableLocalStorage: false, enableRemoteLogging: false }
  },
  {
    name: 'full configuration',
    config: { enableLocalStorage: true, enableRemoteLogging: true }
  },
  {
    name: 'debug configuration',
    config: { logLevels: [LogLevel.DEBUG, LogLevel.INFO, LogLevel.ERROR] }
  }
]

configurationTests.forEach(({ name, config }) => {
  describe(`useLogging with ${name}`, () => {
    it('behaves correctly', () => {
      const logger = useLogging(config)
      // Test behavior specific to this configuration
    })
  })
})
```

## Prevention Strategies

### 1. Configuration Documentation Guidelines
**DO:**
- ✅ Document all configuration options and their defaults
- ✅ Explicitly set configuration in tests that depend on specific features
- ✅ Use descriptive test names that indicate configuration requirements
- ✅ Create configuration presets for common test scenarios

**DON'T:**
- ❌ Assume default configuration will remain stable
- ❌ Write tests that depend on undocumented configuration behavior
- ❌ Use global configuration state that affects multiple tests
- ❌ Hide configuration dependencies in test setup

### 2. Configuration Design Patterns
```typescript
// GOOD: Explicit configuration with clear defaults
interface LoggingConfig {
  enableDebugLogs?: boolean    // Clear boolean option
  enableStorage?: boolean      // Clear feature flag
  logLevels?: LogLevel[]      // Explicit array
}

const DEFAULT_CONFIG: Required<LoggingConfig> = {
  enableDebugLogs: import.meta.env.DEV,  // Environment-based
  enableStorage: true,
  logLevels: [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO]
}

// BAD: Implicit configuration with complex logic
const useLogging = (options = {}) => {
  // Hidden logic determining what gets enabled
  const config = { ...someComplexDefaults, ...options }
}
```

### 3. Test Configuration Management
```typescript
// Configuration preset system
const TestConfigurations = {
  minimal: {
    enableLocalStorage: false,
    enableRemoteLogging: false,
    logLevels: [LogLevel.ERROR]
  },
  
  development: {
    enableLocalStorage: true,
    enableRemoteLogging: false,
    logLevels: [LogLevel.DEBUG, LogLevel.INFO, LogLevel.ERROR]
  },
  
  production: {
    enableLocalStorage: true,
    enableRemoteLogging: true,
    logLevels: [LogLevel.ERROR, LogLevel.WARN, LogLevel.AUDIT]
  }
}

// Use in tests
it('minimal logging behavior', () => {
  const logger = useLogging(TestConfigurations.minimal)
  // Test with minimal configuration
})
```

### 4. Configuration Validation
```typescript
// Validate configuration in tests
const validateConfig = (config: LoggingConfig) => {
  if (config.enableDebugLogs && !config.logLevels?.includes(LogLevel.DEBUG)) {
    throw new Error('DEBUG logs enabled but DEBUG level not in logLevels')
  }
}

// Use in test setup
const createValidatedLogger = (config: Partial<LoggingConfig>) => {
  const fullConfig = { ...DEFAULT_CONFIG, ...config }
  validateConfig(fullConfig)
  return useLogging(fullConfig)
}
```

## Advanced Techniques

### 1. Configuration-Driven Test Generation
```typescript
// Generate tests based on configuration
const generateConfigTests = (configs: Array<{name: string, config: any, expect: any}>) => {
  configs.forEach(({ name, config, expect }) => {
    it(`${name}`, () => {
      const logger = useLogging(config)
      
      // Test behavior matches expected configuration
      Object.entries(expect).forEach(([key, value]) => {
        expect(logger[key]).toBe(value)
      })
    })
  })
}

generateConfigTests([
  {
    name: 'debug enabled shows debug logs',
    config: { logLevels: [LogLevel.DEBUG] },
    expect: { canLogDebug: true }
  }
])
```

### 2. Configuration State Verification
```typescript
// Verify configuration is applied correctly
it('applies configuration correctly', () => {
  const config = {
    enableLocalStorage: false,
    logLevels: [LogLevel.ERROR, LogLevel.DEBUG]
  }
  
  const logger = useLogging(config)
  
  // Verify configuration was applied
  expect(logger.config.enableLocalStorage).toBe(false)
  expect(logger.config.logLevels).toEqual([LogLevel.ERROR, LogLevel.DEBUG])
})
```

### 3. Configuration Override Testing
```typescript
// Test configuration precedence
it('overrides take precedence over defaults', () => {
  const defaultConfig = { enableFeature: false }
  const overrideConfig = { enableFeature: true }
  
  const logger = useLogging({ ...defaultConfig, ...overrideConfig })
  
  expect(logger.config.enableFeature).toBe(true)  // Override wins
})
```

### 4. Runtime Configuration Changes
```typescript
// Test dynamic configuration updates
it('updates behavior when configuration changes', () => {
  const logger = useLogging({ enableDebugLogs: false })
  
  expect(logger.canLogDebug).toBe(false)
  
  logger.updateConfig({ enableDebugLogs: true })
  
  expect(logger.canLogDebug).toBe(true)
})
```

## Common Anti-Patterns

### 1. Hidden Configuration Dependencies
```typescript
// ANTI-PATTERN: Test depends on undocumented config
it('logs debug messages', () => {
  const logger = useLogging()  // What configuration does this use?
  logger.logDebug('test')
  expect(/* something */)  // Will this work?
})

// PATTERN: Explicit configuration requirements
it('logs debug messages when debug level is enabled', () => {
  const logger = useLogging({ 
    logLevels: [LogLevel.DEBUG]  // Clear requirement
  })
  logger.logDebug('test')
  expect(logger.logEntries.value.length).toBe(1)
})
```

### 2. Configuration State Leakage
```typescript
// ANTI-PATTERN: Shared configuration affects multiple tests
let sharedConfig = { enableFeature: false }

it('test 1', () => {
  sharedConfig.enableFeature = true  // Modifies shared state
  const logger = useLogging(sharedConfig)
})

it('test 2', () => {
  const logger = useLogging(sharedConfig)  // Affected by test 1
})

// PATTERN: Isolated configuration per test
it('test 1', () => {
  const config = { enableFeature: true }  // Local configuration
  const logger = useLogging(config)
})
```

### 3. Complex Configuration Logic in Tests
```typescript
// ANTI-PATTERN: Complex configuration logic in every test
it('test', () => {
  const config = {
    ...baseConfig,
    ...environmentConfig,
    ...conditionalConfig,
    // Complex merging logic
  }
  const logger = useLogging(config)
})

// PATTERN: Predefined configuration presets
it('test', () => {
  const logger = useLogging(TestConfigurations.development)
})
```

## Framework-Specific Considerations

### 1. Vue Composable Configuration
```typescript
// Provide configuration at composable level
const useLogging = (config: Partial<LoggingConfig> = {}) => {
  const resolvedConfig = reactive({ ...DEFAULT_CONFIG, ...config })
  
  // Make configuration observable for tests
  const updateConfig = (updates: Partial<LoggingConfig>) => {
    Object.assign(resolvedConfig, updates)
  }
  
  return {
    // ... logging methods
    config: readonly(resolvedConfig),
    updateConfig
  }
}
```

### 2. Test Environment Configuration
```typescript
// Different configs for different test environments
const getTestConfig = () => {
  const baseConfig = {
    enableRemoteLogging: false,
    enableLocalStorage: false
  }
  
  if (import.meta.env.MODE === 'test:integration') {
    return { ...baseConfig, enableRemoteLogging: true }
  }
  
  return baseConfig
}
```

### 3. Vitest-Specific Configuration
```typescript
// Use Vitest context for configuration
import { describe, it, beforeEach } from 'vitest'

describe('useLogging', () => {
  let testConfig: LoggingConfig
  
  beforeEach((ctx) => {
    // Configuration based on test context
    testConfig = {
      enableFeature: ctx.task.name.includes('feature-enabled')
    }
  })
})
```

## Configuration Testing Best Practices

### 1. Document Configuration Requirements
```typescript
/**
 * Tests logging behavior with debug level enabled
 * @requires logLevels to include LogLevel.DEBUG
 * @requires enableLocalStorage: false (to prevent side effects)
 */
it('should log debug messages when configured', () => {
  const logger = useLogging({
    logLevels: [LogLevel.DEBUG],
    enableLocalStorage: false
  })
  // ... test logic
})
```

### 2. Configuration Smoke Tests
```typescript
// Test that default configuration is valid
it('default configuration is valid', () => {
  expect(() => useLogging()).not.toThrow()
  
  const logger = useLogging()
  expect(logger).toBeDefined()
  expect(logger.config).toBeDefined()
})
```

### 3. Configuration Edge Cases
```typescript
// Test edge cases in configuration
it('handles empty log levels array', () => {
  const logger = useLogging({ logLevels: [] })
  
  logger.logError('test')
  expect(logger.logEntries.value.length).toBe(0)  // No levels enabled
})

it('handles invalid configuration gracefully', () => {
  expect(() => useLogging({ maxEntries: -1 })).not.toThrow()
})
```

## References
- [Vue Composables Best Practices](https://vuejs.org/guide/reusability/composables.html)
- [Configuration Management Patterns](https://martinfowler.com/articles/injection.html)
- [Test Configuration Strategies](https://testing.googleblog.com/2008/12/static-methods-are-death-to-testability.html)

## Keywords
`configuration-management`, `test-dependencies`, `default-configuration`, `composable-configuration`, `test-isolation`