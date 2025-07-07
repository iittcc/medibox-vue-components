# Learning 24: Framework Test Configuration and Mocking

## Issue Description
When testing framework-integrated components, there were challenges with:
- Proper mocking of the useCalculatorFramework composable
- PrimeVue plugin configuration in test environments
- Framework state management testing patterns
- Toast service integration testing

## Root Cause Analysis
The framework integration introduced dependencies that required specific mocking patterns:
- useCalculatorFramework composable returns complex reactive state
- PrimeVue components require plugin configuration
- ToastService needs proper injection setup
- Framework methods need to be mockable for testing

## Solution Implemented

### 1. Framework Mocking Pattern
```typescript
// Create comprehensive framework mock
const createFrameworkMock = () => ({
  patientData: ref({
    name: 'Test Patient',
    age: 6,
    gender: 'male'
  }),
  calculatorData: ref({
    levelOfConsciousness: 0,
    cyanosis: 0,
    stridor: 0,
    airEntry: 0,
    retractions: 0
  }),
  state: ref({
    isComplete: false,
    isSubmitting: false,
    currentStep: 1
  }),
  result: ref(null),
  setFieldValue: vi.fn(),
  submitCalculation: vi.fn(),
  resetCalculator: vi.fn(),
  initializeSteps: vi.fn()
});
```

### 2. PrimeVue Test Configuration
```typescript
// Proper PrimeVue plugin setup for tests
const mountComponent = (props = {}) => {
  return mount(WestleyCroupScore, {
    props,
    global: {
      plugins: [[PrimeVue, { unstyled: true }]],
      stubs: {
        Toast: true,
        SurfaceCard: true,
        PersonInfo: true
      }
    }
  });
};
```

### 3. ToastService Integration Testing
```typescript
// Mock ToastService for testing
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
    remove: vi.fn(),
    clear: vi.fn()
  })
}));
```

### 4. Framework State Testing Pattern
```typescript
// Test framework integration properly
it('should update calculator data through framework', async () => {
  const mockFramework = createFrameworkMock();
  vi.mocked(useCalculatorFramework).mockReturnValue(mockFramework);
  
  const wrapper = mountComponent();
  
  // Simulate form interaction
  await wrapper.find('[data-testid="question-input"]').setValue('2');
  
  // Verify framework method called
  expect(mockFramework.setFieldValue).toHaveBeenCalledWith(
    'calculator', 
    'levelOfConsciousness', 
    2
  );
});
```

## Prevention Strategies
1. **Standardized Mocking**: Create reusable mock factories for framework components
2. **Plugin Configuration**: Always configure required plugins in test setup
3. **Complete Mock Coverage**: Mock all framework methods and reactive properties
4. **Test Environment Consistency**: Ensure test environment matches production dependencies
5. **Framework State Validation**: Test framework integration, not just component behavior

## Code Examples
**Complete Test Setup Template:**
```typescript
import { mount } from '@vue/test-utils';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ref } from 'vue';
import PrimeVue from 'primevue/config';
import { useCalculatorFramework } from '@/composables/useCalculatorFramework';
import ComponentUnderTest from './ComponentUnderTest.vue';

// Mock the framework composable
vi.mock('@/composables/useCalculatorFramework');

describe('ComponentUnderTest', () => {
  let mockFramework: any;

  beforeEach(() => {
    mockFramework = {
      patientData: ref({ name: '', age: 0, gender: 'male' }),
      calculatorData: ref({}),
      state: ref({ isComplete: false, isSubmitting: false }),
      result: ref(null),
      setFieldValue: vi.fn(),
      submitCalculation: vi.fn().mockResolvedValue({}),
      resetCalculator: vi.fn(),
      initializeSteps: vi.fn()
    };
    
    vi.mocked(useCalculatorFramework).mockReturnValue(mockFramework);
  });

  const mountComponent = (props = {}) => {
    return mount(ComponentUnderTest, {
      props,
      global: {
        plugins: [[PrimeVue, { unstyled: true }]],
        stubs: {
          Toast: true,
          // Stub other complex components
        }
      }
    });
  };

  it('should integrate with framework correctly', () => {
    const wrapper = mountComponent();
    expect(useCalculatorFramework).toHaveBeenCalled();
    expect(mockFramework.initializeSteps).toHaveBeenCalled();
  });
});
```

## Key Takeaways
- Framework mocking requires comprehensive coverage of all reactive properties and methods
- PrimeVue components need proper plugin configuration in test environments
- Test framework integration patterns, not just isolated component behavior
- Standardized mocking patterns improve test maintainability
- Always test both successful and error scenarios for framework interactions

## Impact
Proper test configuration ensures reliable testing of framework-integrated components and prevents false positives/negatives in the test suite. It also provides confidence in framework integration correctness.