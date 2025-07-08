# Testing Code Review Checklist

> **Optimization Target**: Prevent test environment issues and resource management problems through behavior-focused testing

## Overview
This checklist prevents the most expensive testing issues identified in our learnings analysis. Emphasizes **behavior validation over implementation testing** and **comprehensive resource management**.

**Time Investment**: 10-15 minutes upfront prevents test rewrites and hanging processes

---

## Phase 1: Pre-Testing Environment Analysis (5 minutes)
> **Stop Point**: Do not write tests without completing environment analysis

### 🌐 Environment-Appropriate API Selection
- [ ] **Browser vs Non-Browser APIs** - Verified API compatibility with test environment
  - ❌ Using `vitest-browser-vue` in happy-dom environment
  - ✅ Vue Test Utils for integration tests, browser APIs for E2E
- [ ] **Test Framework Compatibility** - Confirmed Vitest version compatibility with APIs
- [ ] **Environment Variables** - Checked for environment-dependent test behavior
- [ ] **Configuration Dependencies** - Verified test doesn't assume specific default configurations

### 🔄 Resource Lifecycle Planning
- [ ] **Timer Management** - Planned cleanup for all setTimeout/setInterval usage
- [ ] **Event Listener Cleanup** - Identified all event listeners requiring removal
- [ ] **Singleton Resource Handling** - Confirmed reference counting for shared resources
- [ ] **Component Lifecycle** - Planned proper component mount/unmount in tests

### 🏥 Medical Domain Test Strategy
- [ ] **Clinical Scenario Planning** - Identified realistic patient data for testing
- [ ] **Evidence-Based Thresholds** - Confirmed test expectations match clinical guidelines
- [ ] **Edge Case Identification** - Mapped clinically significant edge cases
- [ ] **Patient Safety Validation** - Planned tests for safety-critical scenarios

---

## Phase 2: Test Structure Review (10 minutes)

### 🎯 Behavior-Focused Testing
- [ ] **Outcome Testing** - Tests validate behavior, not implementation details
  - ❌ Spying on internal methods
  - ✅ Testing state changes and outputs
- [ ] **User Interaction Focus** - Tests simulate real user workflows
- [ ] **Integration Over Unit** - Prefers integration tests for component behavior
- [ ] **Error Scenario Coverage** - Tests handle error conditions gracefully

### 📱 Component Testing Patterns
- [ ] **Component-First Analysis** - Read component implementation before writing tests
- [ ] **Vue 3 Composition API** - Tests work with Vue 3 reactive patterns
- [ ] **Mock Component Structure** - Mocks use proper `setup(props, { emit })` pattern
- [ ] **Template Requirements** - Component templates include required display components

### 🔧 Resource Management in Tests
- [ ] **Explicit Cleanup** - All created resources have cleanup in test teardown
- [ ] **Timer Cleanup** - All timers cleared in `afterEach` or `afterAll`
- [ ] **Event Listener Removal** - All listeners removed in cleanup
- [ ] **Component Unmounting** - All mounted components properly unmounted
- [ ] **Reference Counting** - Singleton resources properly managed

### 🏥 Medical Domain Testing
- [ ] **Clinical Data Usage** - Tests use realistic medical scenarios
- [ ] **Official Guideline Validation** - Test expectations match published criteria
- [ ] **Patient Safety Testing** - Edge cases with clinical significance covered
- [ ] **Validation Schema Alignment** - Test data matches medical validation rules

---

## Phase 3: Test Execution Validation (5 minutes)

### ⚡ Performance and Stability
- [ ] **No Hanging Processes** - Tests complete without active handles
- [ ] **Memory Leak Prevention** - All resources properly cleaned up
- [ ] **Deterministic Results** - Tests produce consistent results across runs
- [ ] **Timeout Handling** - Appropriate timeouts for async operations

### 🔍 Test Environment Verification
- [ ] **Environment Compatibility** - Tests work in both development and CI environments
- [ ] **Configuration Independence** - Tests don't rely on specific environment setup
- [ ] **Resource Isolation** - Tests don't interfere with each other
- [ ] **Cleanup Verification** - Manual verification of cleanup execution

---

## Critical Testing Anti-Patterns to Avoid

### ❌ Implementation Testing Anti-Patterns
- Testing internal method calls instead of behavior
- Hardcoded expectations without component analysis
- Using wrong test APIs for environment (browser vs non-browser)
- Ignoring Vue 3 reactivity system in test setup

### ❌ Resource Management Anti-Patterns
- Creating resources without cleanup mechanisms
- Mixing real and mocked resources in same test
- Ignoring singleton resource reference counting
- Leaving timers/listeners active between tests

### ❌ Medical Domain Anti-Patterns
- Using arbitrary test values without clinical basis
- Testing against incorrect medical thresholds
- Ignoring patient safety edge cases
- Missing clinical workflow validation

---

## High-Impact Testing Checks

### 🎯 Most Expensive Issues to Prevent
1. **Test Environment Mismatches** - Wrong API usage requiring complete rewrites
2. **Resource Cleanup Failures** - Hanging test processes preventing CI completion
3. **Medical Validation Errors** - Tests passing but failing clinical accuracy
4. **Vue 3 Reactivity Issues** - Tests not working with composition API patterns
5. **Configuration Dependencies** - Tests failing in different environments

### 📊 Test Quality Metrics
- **Stability**: 100% consistent results across environments
- **Resource Management**: Zero hanging processes or memory leaks
- **Medical Accuracy**: All test scenarios clinically validated
- **Behavior Coverage**: Tests validate user-facing functionality

---

## Testing Framework Patterns

### ✅ Recommended Test Structure
```javascript
describe('Component Behavior', () => {
  let wrapper;
  let cleanup;

  beforeEach(() => {
    // Setup with proper resource tracking
    const result = setupTestComponent();
    wrapper = result.wrapper;
    cleanup = result.cleanup;
  });

  afterEach(() => {
    // Comprehensive cleanup
    cleanup();
    wrapper?.unmount();
    clearAllTimers();
    removeAllListeners();
  });

  it('validates behavior with clinical data', () => {
    // Test with realistic medical scenarios
    const patientData = getClinicalTestData();
    
    // Test behavior, not implementation
    expect(wrapper.find('.result').text()).toBe(expectedClinicalResult);
  });
});
```

### ✅ Medical Domain Test Examples
```javascript
// Patient Safety Test
it('handles critical patient safety scenarios', () => {
  const criticalPatientData = {
    age: 2,
    weight: 8,
    symptoms: ['severe_stridor', 'cyanosis']
  };
  
  const result = calculator.calculate(criticalPatientData);
  expect(result.severity).toBe('severe');
  expect(result.requiresIntubation).toBe(true);
});

// Clinical Accuracy Test
it('calculates Westley Croup Score according to medical guidelines', () => {
  const testCase = {
    stridor: 'at_rest', // +4 points per guidelines
    retraction: 'severe', // +3 points per guidelines
    cyanosis: 'none', // +0 points per guidelines
    consciousness: 'normal' // +0 points per guidelines
  };
  
  const score = calculator.calculateWestleyScore(testCase);
  expect(score).toBe(7); // 4+3+0+0 = 7
});
```

---

## Resource Cleanup Verification

### 🔍 Manual Cleanup Checks
```bash
# Check for hanging processes
npm run test:single -- --reporter=verbose

# Resource leak detection
npm run test:leaks

# Timer cleanup verification
npm run test:timers

# Event listener cleanup
npm run test:listeners
```

### 🔄 Automated Cleanup Patterns
```javascript
// Comprehensive cleanup utility
function createTestCleanup() {
  const timers = [];
  const listeners = [];
  const components = [];
  
  return {
    addTimer: (id) => timers.push(id),
    addListener: (element, event, handler) => {
      listeners.push({ element, event, handler });
    },
    addComponent: (component) => components.push(component),
    cleanup: () => {
      timers.forEach(clearTimeout);
      listeners.forEach(({ element, event, handler }) => {
        element.removeEventListener(event, handler);
      });
      components.forEach(component => component.unmount());
    }
  };
}
```

---

## Emergency Test Debugging Protocol

If tests fail despite following checklist:

1. **Environment Audit** - Verify API compatibility with test environment
2. **Resource Inspection** - Check for active handles preventing process exit
3. **Medical Validation** - Confirm test expectations match clinical guidelines
4. **Cleanup Verification** - Manually verify all cleanup methods executed
5. **Configuration Check** - Ensure tests don't depend on specific environment setup

### 🚨 Critical Failure Signs
- Tests hanging without completion
- Memory usage growing during test execution
- Inconsistent results across test runs
- Medical calculations not matching clinical guidelines
- Tests passing but components failing in production

---

## Quick Reference Commands

```bash
# Run different test suites
npm run test:unit
npm run test:components
npm run test:integration
npm run test:browser

# Test execution modes
npm run test:sequential    # Verbose output for debugging
npm run test:watch        # Watch mode for development
npm run test:ui           # Visual test interface

# Browser testing
npm run test:playwright
npm run test:playwright:headed
npm run test:playwright:debug

# Code quality
npm run test:coverage
npm run lint
npm run type-check
```

**Remember**: Behavior-focused testing with proper resource management prevents 90% of testing issues. When tests fail, check environment compatibility and resource cleanup first.