# Browser vs Non-Browser Test Environment Selection

## Issue Description
Integration tests incorrectly using browser-specific APIs in a non-browser test environment, causing import errors and API incompatibilities.

## Problem Details
- Test Location: `/tests/integration/medicinBoern.workflow.test.ts`
- Environment: happy-dom (non-browser)
- Wrong APIs: `vitest-browser-vue`, `@vitest/browser/context`
- Error: API mismatches and import failures

## Environment Types in Vitest

### 1. Node Environment
- **Purpose**: Server-side logic, utilities, pure functions
- **Test Runner**: Node.js runtime
- **DOM**: No DOM available
- **Use Cases**: Business logic, data processing, API utilities

### 2. Happy-DOM Environment
- **Purpose**: Component testing, integration tests
- **Test Runner**: Node.js with simulated DOM
- **DOM**: Lightweight DOM simulation
- **Use Cases**: Vue component testing, form validation, reactive logic

### 3. Browser Environment
- **Purpose**: End-to-end testing, real browser interactions
- **Test Runner**: Real browser (Chromium, Firefox, WebKit)
- **DOM**: Real browser DOM
- **Use Cases**: User interactions, cross-browser testing, visual testing

## Wrong Implementation (Browser APIs in Non-Browser Environment)
```typescript
// ❌ Using browser APIs in integration test
import { render } from 'vitest-browser-vue'       // Browser-specific
import { page } from '@vitest/browser/context'     // Browser-specific

describe('Integration Tests', () => {
  beforeEach(async () => {
    await page.reload()  // ❌ page API not available in happy-dom
  })

  test('component workflow', async () => {
    const screen = render(Component)  // ❌ render from wrong package
    await medicineSelect.selectOptions('value')  // ❌ Browser API
  })
})
```

## Correct Implementation (Vue Test Utils for Integration)
```typescript
// ✅ Using appropriate APIs for integration testing
import { mount } from '@vue/test-utils'           // Standard Vue testing
import PrimeVue from 'primevue/config'            // Plugin configuration

describe('Integration Tests', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(Component, {                   // ✅ Vue Test Utils mount
      global: {
        plugins: [[PrimeVue, { unstyled: true }]]
      }
    })
  })

  test('component workflow', async () => {
    wrapper.vm.selectedValue = 'new-value'        // ✅ Direct state manipulation
    await wrapper.vm.$nextTick()                  // ✅ Vue reactivity
    expect(wrapper.vm.selectedValue).toBe('new-value')
  })
})
```

## When to Use Each Environment

### Use Browser Tests When:
- Testing actual user interactions (clicks, typing, navigation)
- Cross-browser compatibility testing
- Visual regression testing
- Testing browser-specific features (localStorage, geolocation)
- End-to-end workflows with real network requests

### Use Integration Tests (happy-dom) When:
- Testing component integration and data flow
- Testing Vue reactivity and computed properties
- Testing form validation and business logic
- Testing component props and events
- Testing component lifecycle hooks

### Use Unit Tests (node) When:
- Testing pure functions and utilities
- Testing business logic without UI
- Testing data transformations
- Testing API service functions
- Testing calculation algorithms

## API Selection Guide

### Browser Environment APIs
```typescript
// Browser-specific imports
import { page, userEvent } from '@vitest/browser/context'
import { render } from 'vitest-browser-vue'

// Browser-specific actions
await page.goto('/url')
await userEvent.click(element)
await page.screenshot()
```

### Integration Environment APIs  
```typescript
// Integration testing imports
import { mount, shallowMount } from '@vue/test-utils'
import { nextTick } from 'vue'

// Component testing actions
const wrapper = mount(Component)
wrapper.vm.property = 'value'
await nextTick()
expect(wrapper.text()).toContain('content')
```

### Unit Testing APIs
```typescript
// Standard Vitest/Jest APIs
import { expect, test, vi } from 'vitest'

// Pure function testing
expect(calculateDosage(weight, medicine)).toBe(expectedResult)
expect(mockFunction).toHaveBeenCalledWith(expectedParams)
```

## File Organization

```
tests/
├── unit/                    # Node environment
│   ├── utilities.test.ts    # Pure functions
│   └── calculations.test.ts # Business logic
├── integration/             # happy-dom environment
│   ├── component.test.ts    # Component integration
│   └── workflow.test.ts     # Multi-component workflows
└── browser/                 # Browser environment
    ├── e2e.test.ts         # End-to-end user journeys
    └── visual.test.ts      # Visual regression tests
```

## Configuration Setup

### Integration Tests (happy-dom)
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: [
      'tests/unit/**/*.test.ts',
      'tests/integration/**/*.test.ts'
    ]
  }
})
```

### Browser Tests
```typescript
// vitest.browser.config.ts
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [{ browser: 'chromium' }]
    },
    include: ['tests/browser/**/*.test.ts']
  }
})
```

## Migration Checklist
- [ ] Identify current test environment from file location
- [ ] Choose appropriate APIs for the environment
- [ ] Update imports to match environment
- [ ] Adjust test patterns (DOM vs state testing)
- [ ] Update assertions to match available APIs
- [ ] Ensure configuration matches test type

## Common Migration Patterns

### Browser → Integration
```typescript
// Before: Browser API
await medicineSelect.selectOptions('value')

// After: Direct state manipulation  
wrapper.vm.selectedMedicine = 'value'
await wrapper.vm.$nextTick()
```

### Integration → Browser
```typescript
// Before: Direct state access
expect(wrapper.vm.property).toBe('value')

// After: DOM interaction
await userEvent.selectOptions(select, 'value')
await expect.element(page.getByText('value')).toBeVisible()
```

## Related Files
- `/tests/integration/medicinBoern.workflow.test.ts` - Fixed integration test
- `/tests/browser/medicinBoern.e2e.test.ts` - Browser test example
- `/vitest.config.ts` - Integration test configuration
- `/vitest.browser.config.ts` - Browser test configuration

## Date
2025-07-05

## Impact
- ✅ Clear separation of test types and environments
- ✅ Appropriate API usage for each environment
- ✅ Better test performance and reliability
- ✅ Easier maintenance and debugging
- ✅ Consistent testing patterns across codebase