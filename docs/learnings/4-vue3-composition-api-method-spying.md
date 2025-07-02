# Learning: Vue 3 Composition API Method Spying Challenges

## Issue Encountered
**Problem**: Traditional method spying approaches (`vi.spyOn(component, 'methodName')`) don't work reliably with Vue 3 Composition API components, causing test failures and unreliable behavior verification.

**Manifestation**:
```typescript
// PROBLEMATIC TEST CODE
it('calls calculation method when values change', async () => {
  const component = wrapper.vm as any
  const calcRiskSpy = vi.spyOn(component, 'calcRisk')  // Often fails
  
  component.sysBP = 160
  await nextTick()
  
  expect(calcRiskSpy).toHaveBeenCalled()  // Assertion fails
})
```

**Error Messages**:
```
AssertionError: expected "calcRisk" to be called at least once
TypeError: Cannot spy on a property that is not a function
```

## Root Cause Analysis
- **Composition API structure**: Methods aren't directly attached to component instance like in Options API
- **Proxy-based reactivity**: Vue 3's proxy system interferes with traditional spying
- **Setup function scope**: Methods defined in `setup()` have different binding than Options API methods
- **Watcher timing**: Watchers may execute before spies are established
- **Component instance access**: `wrapper.vm` doesn't always expose methods the same way

## Impact on Development
- **Reactive behavior tests failing**: Unable to verify that watchers trigger calculations
- **False test failures**: Tests failing even when component behavior was correct
- **Debugging complexity**: Hard to distinguish between real bugs and spy setup issues
- **Test reliability**: Intermittent test failures due to timing issues

## Solution Applied

### 1. State-Based Testing Instead of Method Spying
```typescript
// BEFORE: Method spying (unreliable)
it('calls calculation when values change', async () => {
  const spy = vi.spyOn(component, 'calcRisk')
  component.sysBP = 160
  expect(spy).toHaveBeenCalled()
})

// AFTER: State change verification (reliable)
it('recalculates risk when values change', async () => {
  const initialRisk = component.risk
  
  component.sysBP = 180
  component.LDLCholesterol = 7.0
  component.smoking = true
  await nextTick()
  
  expect(component.risk).not.toBe(initialRisk)
  expect(component.risk).toBeGreaterThan(initialRisk)
})
```

### 2. Direct Method Testing
```typescript
// BEFORE: Testing through watchers
it('watcher triggers calculation', async () => {
  const spy = vi.spyOn(component, 'calcRisk')
  component.sysBP = 160
  expect(spy).toHaveBeenCalled()
})

// AFTER: Testing method directly
it('calculation method works correctly', () => {
  const oldRisk = component.risk
  component.sysBP = 180
  component.calcRisk()  // Call directly
  
  expect(component.risk).toBeGreaterThan(oldRisk)
})
```

### 3. Behavior Verification Over Implementation Details
```typescript
// BEFORE: Testing implementation (how)
it('calls calcRiskValues after setting risks', () => {
  const spy = vi.spyOn(component, 'calcRiskValues')
  component.risk = 20
  component.targetRisk = 10
  expect(spy).toHaveBeenCalled()
})

// AFTER: Testing behavior (what)
it('calculates risk metrics correctly', () => {
  component.risk = 20
  component.targetRisk = 10
  component.calcRiskValues()
  
  expect(component.arr).toBe(10)
  expect(component.rrr).toBe(0.5)
  expect(component.nnt).toBe(0.1)
})
```

### 4. Watcher Effect Testing
```typescript
// BEFORE: Trying to spy on watcher callbacks
it('watcher updates chart data', async () => {
  const spy = vi.spyOn(component, 'updateChartData')
  component.risk = 15
  await nextTick()
  expect(spy).toHaveBeenCalled()
})

// AFTER: Testing watcher effects
it('chart data updates when risk changes', async () => {
  component.risk = 15
  component.targetRisk = 8
  await nextTick()
  
  expect(component.chartData.datasets[0].data[0]).toBe(component.risk)
  expect(component.chartData.datasets[0].data[1]).toBe(component.targetRisk)
})
```

## Prevention Strategies

### 1. Test Strategy Guidelines
**DO:**
- Test component state changes
- Test method outputs when called directly
- Test end-to-end behavior flows
- Verify reactive effects through state
- Use relationship assertions

**DON'T:**
- Spy on Composition API methods
- Test implementation details
- Rely on method call counts
- Test private internal methods
- Mock reactive watchers

### 2. Testing Patterns for Vue 3

#### Pattern 1: Input-Output Testing
```typescript
// Test what goes in and what comes out
it('transforms input to expected output', () => {
  const input = { age: 70, sysBP: 180, LDL: 7.0, smoking: true }
  
  Object.assign(component, input)
  component.calcRisk()
  
  expect(component.risk).toBeGreaterThan(20)
  expect(component.riskGroup).toBe('Meget høj risiko')
})
```

#### Pattern 2: State Transition Testing
```typescript
// Test state transitions
it('transitions from low to high risk correctly', () => {
  // Set low risk state
  component.age = 45
  component.sysBP = 120
  component.smoking = false
  component.calcRisk()
  const lowRisk = component.risk
  
  // Transition to high risk state
  component.age = 75
  component.sysBP = 180
  component.smoking = true
  component.calcRisk()
  
  expect(component.risk).toBeGreaterThan(lowRisk)
})
```

#### Pattern 3: Side Effect Testing
```typescript
// Test side effects of operations
it('updating age affects multiple calculated values', async () => {
  const oldValues = {
    risk: component.risk,
    riskGroup: component.riskGroup,
    minLDL: component.minLDLCholesterol
  }
  
  component.age = 75
  component.updateMinMaxRanges()
  component.calcRisk()
  await nextTick()
  
  expect(component.risk).not.toBe(oldValues.risk)
  expect(component.minLDLCholesterol).not.toBe(oldValues.minLDL)
})
```

### 3. When Method Testing is Necessary
```typescript
// Sometimes you do need to test methods directly
describe('Core calculation methods', () => {
  it('calcRiskGroup classifies correctly', () => {
    const result = component.calcRiskGroup(5, 45)
    expect(result[0]).toBe('Høj risiko')
    expect(result[1]).toBeTruthy()  // Color
    expect(result[2]).toBe('risk-high')  // Style
  })
  
  it('calcRiskValues computes metrics correctly', () => {
    component.risk = 20
    component.targetRisk = 10
    component.calcRiskValues()
    
    expect(component.arr).toBe(10)
    expect(component.rrr).toBeCloseTo(0.5)
    expect(component.nnt).toBeCloseTo(0.1)
  })
})
```

## Advanced Techniques

### 1. Mock-Free Testing
```typescript
// Test with real component instances
const createRealComponent = (overrides = {}) => {
  return mount(RiskAssessment, {
    props: { ...defaultProps, ...overrides }
  })
}

it('real component behavior', () => {
  const wrapper = createRealComponent()
  const component = wrapper.vm
  
  // Test real behavior without mocks
})
```

### 2. Integration Testing
```typescript
// Test component integration rather than isolated methods
it('complete risk assessment workflow', async () => {
  // 1. Set patient data
  component.name = 'Test Patient'
  component.age = 65
  component.gender = 'Mand'
  
  // 2. Set examination data
  component.sysBP = 160
  component.LDLCholesterol = 6.0
  component.smoking = true
  
  // 3. Set treatment goals
  component.targetSysBP = 120
  component.targetLDLCholesterol = 2.0
  component.targetSmoking = false
  
  await nextTick()
  
  // 4. Verify complete calculation chain
  expect(component.risk).toBeGreaterThan(0)
  expect(component.targetRisk).toBeGreaterThan(0)
  expect(component.targetRisk).toBeLessThan(component.risk)
  expect(component.arr).toBeGreaterThan(0)
})
```

### 3. Component Communication Testing
```typescript
// Test parent-child communication without spying
it('component emits events correctly', async () => {
  const parentWrapper = mount(ParentComponent)
  const childComponent = parentWrapper.findComponent(ChildComponent)
  
  await childComponent.vm.$emit('update:value', 160)
  
  expect(parentWrapper.vm.parentValue).toBe(160)
})
```

## Common Anti-Patterns

### 1. Over-Spying
```typescript
// ANTI-PATTERN: Spying on everything
const spy1 = vi.spyOn(component, 'method1')
const spy2 = vi.spyOn(component, 'method2')
const spy3 = vi.spyOn(component, 'method3')

// PATTERN: Test behavior
expect(component.finalState).toBe(expectedValue)
```

### 2. Implementation Detail Testing
```typescript
// ANTI-PATTERN: Testing how it works
expect(calcMethod).toHaveBeenCalledWith(param1, param2)

// PATTERN: Testing what it produces
expect(component.result).toBe(expectedResult)
```

### 3. Mock Method Complexity
```typescript
// ANTI-PATTERN: Complex method mocking
vi.spyOn(component, 'complexMethod').mockImplementation(() => {
  // Complex mock logic that duplicates real logic
})

// PATTERN: Use real methods or simplified behavior tests
component.complexMethod()
expect(component.state).toMatchExpectedState()
```

## Vue 3 Specific Considerations

### 1. Composition API vs Options API
```typescript
// Composition API (harder to spy)
setup() {
  const calcRisk = () => { /* logic */ }
  return { calcRisk }
}

// Options API (easier to spy)
methods: {
  calcRisk() { /* logic */ }
}
```

### 2. Reactive System Integration
```typescript
// Work with the reactive system, not against it
it('reactive calculation updates', async () => {
  const risk = ref(10)
  const targetRisk = ref(5)
  const arr = computed(() => risk.value - targetRisk.value)
  
  expect(arr.value).toBe(5)
  
  risk.value = 20
  await nextTick()
  
  expect(arr.value).toBe(15)
})
```

## References
- [Vue 3 Composition API Testing](https://vuejs.org/guide/scaling-up/testing.html)
- [Testing Library Principles](https://testing-library.com/docs/guiding-principles/)
- [Vue Test Utils v2](https://test-utils.vuejs.org/)
- [Vitest Mocking Guide](https://vitest.dev/guide/mocking.html)

## Keywords
`vue3`, `composition-api`, `spying`, `method-testing`, `state-testing`, `behavior-testing`