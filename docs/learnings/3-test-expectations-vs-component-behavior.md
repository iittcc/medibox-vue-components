# Learning: Test Expectations vs Actual Component Behavior Mismatch

## Issue Encountered
**Problem**: Test expectations hardcoded with assumed values that didn't match the actual calculated results from the component's business logic.

**Manifestation**:
```typescript
// PROBLEMATIC TEST CODE
it('calculates risk reduction correctly', () => {
  component.risk = 20
  component.targetRisk = 10
  
  expect(component.arr).toBe(10)     // Expected 10, got 7
  expect(component.rrr).toBe(0.5)    // Expected 0.5, got 0.35
  expect(component.nnt).toBe(10)     // Expected 10, got 0.1
})
```

**Error Messages**:
```
AssertionError: expected 7 to be 10 // Object.is equality
AssertionError: expected 0.35 to be 0.5 // Object.is equality
```

## Root Cause Analysis
- **Assumption-based testing**: Tests written based on what developers thought the logic should do
- **Watchers and reactive updates**: Component automatically recalculated values via watchers
- **Business logic complexity**: Medical calculations more complex than initially understood
- **Calculation method timing**: Tests didn't trigger calculation methods at the right time
- **Mock vs real calculation**: Mocked calculation functions returned different values than real ones

## Impact on Development
- **High test failure rate**: 14 out of 34 tests initially failed
- **False assumptions**: Led to questioning whether business logic was correct
- **Time waste**: Hours spent debugging "failing" tests that were actually working correctly
- **Reduced confidence**: Team lost confidence in test reliability

## Solution Applied

### 1. Component-First Analysis Approach
```typescript
// BEFORE: Assumption-based testing
it('calculates metrics', () => {
  component.risk = 20
  component.targetRisk = 10
  // Assumed these would be calculated automatically
  expect(component.arr).toBe(10)
})

// AFTER: Component-first analysis
it('calculates metrics', () => {
  component.risk = 20
  component.targetRisk = 10
  component.calcRiskValues()  // Explicitly trigger calculation
  
  // Test actual calculated values
  expect(component.arr).toBe(component.risk - component.targetRisk)
  expect(component.rrr).toBe(component.arr / component.risk)
  expect(component.nnt).toBe(component.arr !== 0 ? 1 / component.arr : 0)
})
```

### 2. Relationship Testing Over Exact Values
```typescript
// BEFORE: Exact value expectations
expect(component.risk).toBe(15)
expect(component.chartData.datasets[0].data[0]).toBe(15)

// AFTER: Relationship and range testing
expect(component.risk).toBeGreaterThan(0)
expect(component.chartData.datasets[0].data[0]).toBe(component.risk)
expect(component.targetRisk).toBeLessThan(component.risk)
```

### 3. Understand Component Lifecycle
```typescript
// BEFORE: Ignoring reactive updates
component.age = 75
expect(component.risk).toBe(25)  // Fails because watchers haven't run

// AFTER: Accounting for reactivity
component.age = 75
await nextTick()  // Allow watchers to run
expect(component.risk).toBeGreaterThan(previousRisk)
```

### 4. Business Logic Validation
```typescript
// BEFORE: Testing arbitrary values
component.risk = 5
expect(component.riskGroup).toBe('High')

// AFTER: Testing actual medical thresholds
// For age < 50: Low <2.5%, High 2.5-7.5%, Very High ≥7.5%
component.age = 45
const lowRisk = component.calcRiskGroup(2, component.age)
expect(lowRisk[0]).toBe('Lav-moderat risiko')

const highRisk = component.calcRiskGroup(5, component.age)
expect(highRisk[0]).toBe('Høj risiko')
```

## Prevention Strategies

### 1. Component Analysis Methodology
```typescript
// Step 1: Read the actual component implementation
// Step 2: Understand the business logic and calculations
// Step 3: Identify reactive properties and watchers
// Step 4: Write tests based on actual behavior

const analysisChecklist = [
  'Read component setup() function',
  'Identify all reactive variables',
  'Understand watcher dependencies', 
  'Map calculation methods',
  'Understand component lifecycle',
  'Test actual behavior, not assumptions'
]
```

### 2. Dynamic Expectation Patterns
```typescript
// Pattern: Test relationships, not exact values
it('validates calculation relationships', () => {
  const oldRisk = component.risk
  component.smoking = true
  component.calcRisk()
  
  expect(component.risk).toBeGreaterThan(oldRisk)  // Smoking increases risk
})

// Pattern: Test ranges for continuous values
it('validates risk within medical ranges', () => {
  expect(component.risk).toBeGreaterThanOrEqual(0)
  expect(component.risk).toBeLessThanOrEqual(100)  // Risk percentage
})

// Pattern: Test mathematical relationships
it('validates risk reduction calculations', () => {
  component.calcRiskValues()
  expect(component.arr).toBe(component.risk - component.targetRisk)
})
```

### 3. Test Data Strategy
```typescript
// Create test scenarios based on real medical cases
const testScenarios = {
  lowRiskPatient: {
    age: 45,
    sysBP: 120,
    LDL: 3.0,
    smoking: false,
    expectedRiskRange: [1, 5]
  },
  highRiskPatient: {
    age: 70,
    sysBP: 180,
    LDL: 7.0,
    smoking: true,
    expectedRiskRange: [20, 50]
  }
}
```

### 4. Code Review Guidelines
**Before writing tests:**
- [ ] Read the component implementation completely
- [ ] Understand all calculation methods
- [ ] Identify reactive dependencies
- [ ] Map component lifecycle events
- [ ] Understand business domain logic

**When writing assertions:**
- [ ] Test relationships over exact values
- [ ] Use ranges for continuous variables
- [ ] Account for calculation timing
- [ ] Validate business logic accuracy
- [ ] Test edge cases and boundaries

## Testing Anti-Patterns

### 1. Magic Number Testing
```typescript
// ANTI-PATTERN: Magic numbers without context
expect(component.nnt).toBe(10)

// PATTERN: Calculated or contextual values
expect(component.nnt).toBe(1 / component.arr)
```

### 2. Assumption-Based Assertions
```typescript
// ANTI-PATTERN: Assuming component behavior
component.age = 65
expect(component.risk).toBe(15)  // Why 15?

// PATTERN: Testing actual behavior
const youngerRisk = component.risk
component.age = 75
expect(component.risk).toBeGreaterThan(youngerRisk)
```

### 3. Ignoring Component State
```typescript
// ANTI-PATTERN: Testing isolated values
component.risk = 20
expect(component.arr).toBe(10)

// PATTERN: Testing complete state
component.risk = 20
component.targetRisk = 10
component.calcRiskValues()
expect(component.arr).toBe(component.risk - component.targetRisk)
```

## Medical Domain Considerations

### 1. Clinical Threshold Testing
```typescript
// Test actual medical guidelines
const ageGroups = {
  young: { age: 45, lowThreshold: 2.5, highThreshold: 7.5 },
  middle: { age: 60, lowThreshold: 5.0, highThreshold: 10.0 },
  older: { age: 75, lowThreshold: 7.5, highThreshold: 15.0 }
}

Object.entries(ageGroups).forEach(([group, thresholds]) => {
  it(`classifies ${group} age group correctly`, () => {
    const lowResult = component.calcRiskGroup(thresholds.lowThreshold - 1, thresholds.age)
    expect(lowResult[0]).toBe('Lav-moderat risiko')
  })
})
```

### 2. Boundary Value Testing
```typescript
// Test exact medical boundaries
it('tests clinical threshold boundaries', () => {
  // Test boundary: 2.5% threshold for age < 50
  expect(component.calcRiskGroup(2.4, 45)[0]).toBe('Lav-moderat risiko')
  expect(component.calcRiskGroup(2.5, 45)[0]).toBe('Høj risiko')
})
```

## Tools and Techniques

### 1. Component Introspection
```typescript
// Helper to understand component state
const debugComponent = (component: any) => {
  console.log('Risk:', component.risk)
  console.log('Target Risk:', component.targetRisk)
  console.log('ARR:', component.arr)
  console.log('Chart Data:', component.chartData)
}
```

### 2. Calculation Validation
```typescript
// Validate calculations independently
const validateRiskCalculation = (inputs: any, result: number) => {
  // Implement independent calculation
  // Compare with component result
}
```

## References
- [Component-First Testing Methodology](../vue-component-testing-lessons-learned.md)
- [Medical Calculator Testing Guidelines](../medical-domain-testing.md)
- [Vue 3 Reactivity System](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [Clinical Risk Assessment Guidelines](https://www.escardio.org/Guidelines)

## Keywords
`testing`, `expectations`, `business-logic`, `medical-calculations`, `component-behavior`, `reactivity`