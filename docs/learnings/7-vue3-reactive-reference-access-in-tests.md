# Learning: Vue 3 Reactive Reference Access in Tests

## Issue Encountered
**Problem**: Test assertions failing because Vue 3 reactive references return `RefImpl` objects instead of expected primitive values when accessed directly.

**Manifestation**:
```typescript
// TEST CODE
expect(logger.correlationId).toBe('mock-id-123')  // Fails

// ERROR MESSAGE
AssertionError: expected RefImpl{ dep: Dep{ …(9) }, …(4) } to be 'mock-id-123'
Expected: "mock-id-123"
Received: RefImpl {
  "__v_isRef": true,
  "__v_isShallow": false, 
  "_rawValue": "mock-id-123",
  "_value": "mock-id-123",
  // ... more Vue internal properties
}
```

**Error Messages**:
- `expected RefImpl{ ... } to be 'mock-id-123'`
- `expected { Object (fn, setter, ...) } to deeply equal []`
- `expected +0 to be 1` (when accessing length on ref)

## Root Cause Analysis
- **Vue 3 Composition API reactivity**: Values wrapped in `ref()` are reactive references, not primitive values
- **Test expectation mismatch**: Tests written expecting direct value access like Vue 2 or JavaScript primitives
- **Readonly computed properties**: Computed properties also return reactive references that need `.value` access
- **Test isolation from implementation**: Tests didn't account for Vue's reactivity system changes

**Specific Code Issues**:
```typescript
// useLogging.ts - Reactive references
const correlationId = ref<string>(nanoid())     // Returns RefImpl
const isOnline = ref(navigator.onLine)         // Returns RefImpl
const logEntries = ref<LogEntry[]>([])         // Returns RefImpl

// Computed properties also return refs
const errorLogs = computed(() => 
  logEntries.value.filter(entry => entry.level === LogLevel.ERROR)
)  // Returns ComputedRefImpl

// Return object exposes refs
return {
  correlationId: readonly(correlationId),  // Still a ref
  isOnline: readonly(isOnline),           // Still a ref
  errorLogs,                              // Still a ref
  logEntries: readonly(logEntries)        // Still a ref
}
```

## Impact on Development
- **High test failure rate**: Multiple test assertions failing with confusing error messages
- **Debugging complexity**: RefImpl output is verbose and hard to interpret
- **False negative tests**: Tests failing when component logic was actually correct
- **Framework knowledge gaps**: Required deep understanding of Vue 3 reactivity system

## Solution Applied

### 1. Systematic Reference Value Access
```typescript
// BEFORE: Direct access (fails)
expect(logger.correlationId).toBe('mock-id-123')
expect(logger.isOnline).toBe(true)
expect(logger.errorLogs).toEqual([])
expect(logger.logEntries.length).toBe(1)

// AFTER: .value access (works)
expect(logger.correlationId.value).toBe('mock-id-123')
expect(logger.isOnline.value).toBe(true)
expect(logger.errorLogs.value).toEqual([])
expect(logger.logEntries.value.length).toBe(1)
```

### 2. Array and Object Access Patterns
```typescript
// BEFORE: Direct array access (fails)
expect(logger.logEntries.length).toBe(2)
expect(logger.logEntries[0].message).toBe('Error 1')
expect(logger.errorLogs.some(entry => entry.level === 'error')).toBe(true)

// AFTER: .value array access (works)
expect(logger.logEntries.value.length).toBe(2)
expect(logger.logEntries.value[0].message).toBe('Error 1')
expect(logger.errorLogs.value.some(entry => entry.level === 'error')).toBe(true)
```

### 3. Helper Function for Value Extraction
```typescript
// Helper to safely extract values from refs
const getValue = (ref: any) => {
  return ref && typeof ref === 'object' && '__v_isRef' in ref ? ref.value : ref
}

// Usage in tests
expect(getValue(logger.correlationId)).toBe('mock-id-123')
expect(getValue(logger.logEntries)).toHaveLength(2)
```

### 4. Comprehensive Test Updates
```typescript
// Batch update pattern used in implementation
const edits = [
  {
    old: "logger.correlationId",
    new: "logger.correlationId.value"
  },
  {
    old: "logger.isOnline", 
    new: "logger.isOnline.value"
  },
  {
    old: "logger.errorLogs",
    new: "logger.errorLogs.value"
  },
  {
    old: "logger.logEntries",
    new: "logger.logEntries.value"
  }
]
```

## Prevention Strategies

### 1. Vue 3 Test Writing Guidelines
**DO:**
- ✅ Always use `.value` when accessing reactive references in tests
- ✅ Check if returned values are refs before asserting
- ✅ Test behavior rather than implementation when possible
- ✅ Use type annotations to understand what's being returned

**DON'T:**
- ❌ Assume direct value access will work with Composition API
- ❌ Mix Vue 2 and Vue 3 testing patterns
- ❌ Ignore TypeScript warnings about ref access
- ❌ Test Vue internals instead of component behavior

### 2. Type-Safe Testing Patterns
```typescript
// Define proper types for test subjects
interface LoggerInterface {
  correlationId: Readonly<Ref<string>>
  isOnline: Readonly<Ref<boolean>>
  errorLogs: ComputedRef<LogEntry[]>
  logEntries: Readonly<Ref<LogEntry[]>>
}

// Use typed access in tests
const testLogger = (logger: LoggerInterface) => {
  expect(logger.correlationId.value).toBe('expected-id')
  expect(logger.isOnline.value).toBe(true)
  expect(logger.errorLogs.value).toHaveLength(0)
}
```

### 3. Test Helper Utilities
```typescript
// Create utilities for common ref testing patterns
const expectRefValue = (ref: Ref<any>, expected: any) => {
  expect(ref.value).toBe(expected)
}

const expectRefArray = (ref: Ref<any[]>, expected: any[]) => {
  expect(ref.value).toEqual(expected)
}

const expectRefLength = (ref: Ref<any[]>, length: number) => {
  expect(ref.value).toHaveLength(length)
}

// Usage
expectRefValue(logger.correlationId, 'mock-id-123')
expectRefArray(logger.errorLogs, [])
expectRefLength(logger.logEntries, 2)
```

### 4. ESLint Rules for Ref Access
```typescript
// Custom ESLint rule to catch ref access issues
{
  "rules": {
    "vue/no-ref-object-destructuring": "error",
    "vue/require-ref-value-access": "warn"  // Custom rule
  }
}
```

## Advanced Techniques

### 1. Deep Ref Testing
```typescript
// Testing nested reactive structures
const expectNestedRefValue = (
  parentRef: Ref<any>, 
  path: string, 
  expected: any
) => {
  const value = path.split('.').reduce((obj, key) => obj[key], parentRef.value)
  expect(value).toBe(expected)
}

// Usage
expectNestedRefValue(logger.logEntries, '0.details.timestamp', expectedTime)
```

### 2. Reactive State Testing
```typescript
// Test reactive updates properly
it('updates reactive values', async () => {
  const initialValue = logger.correlationId.value
  
  // Trigger reactive update
  const newId = logger.newCorrelationId()
  
  // Wait for reactivity to propagate
  await nextTick()
  
  expect(logger.correlationId.value).toBe(newId)
  expect(logger.correlationId.value).not.toBe(initialValue)
})
```

### 3. Computed Property Testing
```typescript
// Test computed properties correctly
it('computed properties update reactively', async () => {
  expect(logger.errorLogs.value).toHaveLength(0)
  
  // Add error log
  logger.logError('Test error')
  await nextTick()
  
  expect(logger.errorLogs.value).toHaveLength(1)
  expect(logger.errorLogs.value[0].message).toBe('Test error')
})
```

### 4. Ref vs Reactive Testing
```typescript
// Distinguish between ref and reactive
const isRef = (value: any): value is Ref => {
  return value && typeof value === 'object' && '__v_isRef' in value
}

const isReactive = (value: any): boolean => {
  return value && typeof value === 'object' && '__v_isReactive' in value
}

// Use in tests
expect(isRef(logger.correlationId)).toBe(true)
expect(isReactive(logger.state)).toBe(true)  // If using reactive()
```

## Common Anti-Patterns

### 1. Direct Object Access
```typescript
// ANTI-PATTERN: Treating refs like plain objects
expect(logger.logEntries[0]).toBe(expectedEntry)
expect(logger.errorLogs.length).toBe(2)

// PATTERN: Proper ref access
expect(logger.logEntries.value[0]).toBe(expectedEntry)
expect(logger.errorLogs.value.length).toBe(2)
```

### 2. Destructuring Refs
```typescript
// ANTI-PATTERN: Destructuring loses reactivity
const { correlationId, isOnline } = logger
expect(correlationId).toBe('expected')  // Will fail

// PATTERN: Access via parent object
expect(logger.correlationId.value).toBe('expected')
expect(logger.isOnline.value).toBe(true)
```

### 3. Mixed Access Patterns
```typescript
// ANTI-PATTERN: Inconsistent access
expect(logger.sessionId).toBe('id')           // Direct (string)
expect(logger.correlationId.value).toBe('id') // Ref access

// PATTERN: Consistent based on return type
expect(logger.sessionId).toBe('id')           // String from composable
expect(logger.correlationId.value).toBe('id') // Ref from composable
```

## Framework-Specific Considerations

### 1. Vue Test Utils Integration
```typescript
// Accessing component reactive data
const wrapper = mount(Component)
const componentData = wrapper.vm

// If using Composition API
expect(componentData.reactiveValue.value).toBe(expected)

// If using Options API  
expect(componentData.reactiveValue).toBe(expected)
```

### 2. Pinia Store Testing
```typescript
// Pinia stores with Composition API
const store = useStore()

// State is reactive
expect(store.count.value).toBe(0)  // If count is ref
expect(store.items.value).toHaveLength(0)  // If items is ref

// Getters are computed
expect(store.doubleCount.value).toBe(0)
```

### 3. Custom Composable Testing
```typescript
// Test composables in isolation
const { reactive, computed } = useCustomComposable()

expect(reactive.value).toBe(expectedValue)
expect(computed.value).toBe(expectedComputed)
```

## Vue 2 vs Vue 3 Migration

### 1. Data Property Changes
```typescript
// Vue 2 (Options API)
data() {
  return {
    count: 0  // Direct access: this.count
  }
}

// Vue 3 (Composition API)
setup() {
  const count = ref(0)  // Ref access: count.value
  return { count }
}
```

### 2. Test Migration Patterns
```typescript
// Vue 2 test
expect(wrapper.vm.count).toBe(0)

// Vue 3 test (if count is ref)
expect(wrapper.vm.count.value).toBe(0)

// Vue 3 test (if count is not wrapped)
expect(wrapper.vm.count).toBe(0)
```

## References
- [Vue 3 Reactivity Fundamentals](https://vuejs.org/guide/essentials/reactivity-fundamentals.html)
- [Vue Test Utils v2](https://test-utils.vuejs.org/)
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)

## Keywords
`vue3`, `reactive-references`, `composition-api`, `ref-access`, `test-assertions`, `reactivity-system`