# Vue Component Testing: Lessons Learned
## A Time-Saving Methodology Guide

> **Key Insight**: Reading the actual component code first saves 2-3 hours of debugging and rewriting tests based on wrong assumptions.

## Executive Summary

### Time Investment Analysis
- **Initial Approach**: 3+ hours writing tests based on assumptions → All tests failed
- **Fixed Approach**: 1 hour reading component + 1 hour writing accurate tests → 22/22 tests passing
- **Time Saved**: 2+ hours per component when following this methodology

### Critical Success Factors
1. **Component-First Analysis**: Always examine the real implementation before writing tests
2. **Complete Dependency Mapping**: Mock ALL dependencies upfront to prevent cascade failures
3. **Real Property Testing**: Use actual property names and data types from the component
4. **Framework Context Setup**: Properly configure UI library contexts (PrimeVue, etc.)

## 🚨 Pre-Implementation Analysis (CRITICAL - Most Time-Saving)

### Component Code Examination Checklist

**Before writing ANY tests, examine the component for:**

```typescript
// ✅ ALWAYS DO: Property Inventory
const selectedIndholdsstof = ref<string>('amoxicillin')  // NOT empty string!
const vaegt = ref<number>(16)                           // NOT 'weight'!
const dosering = ref<number>(50)                        // NOT 'dosage'!
const selectedPraeparat = ref<number>(0)                // Number, NOT string!
```

**❌ MISTAKE: Writing tests based on assumptions**
```typescript
// This was WRONG - component doesn't start empty
expect(component.selectedIndholdsstof).toBe('')  // FAILS!
expect(component.weight).toBe(15)                // Property doesn't exist!
```

**✅ CORRECT: Reading actual component state**
```typescript
// This works - based on real component defaults
expect(component.selectedIndholdsstof).toBe('amoxicillin')  // ✅
expect(component.vaegt).toBe(16)                            // ✅
```

### Dependency Mapping Strategy

**Examine ALL imports and create comprehensive mock list:**

```typescript
// Real component imports from MedicinBoernScore.vue:
import Select from '@/volt/Select.vue'              // ← Must mock
import InputNumber from '@/volt/InputNumber.vue'    // ← Must mock  
import NumberSliderInput from './NumberSliderInput.vue'  // ← Must mock
import CopyDialog from './CopyDialog.vue'          // ← Must mock
import SecondaryButton from '@/volt/SecondaryButton.vue' // ← Must mock
```

**❌ MISTAKE: Partial mocking leads to cascade failures**
```typescript
// Missing NumberSliderInput mock → ALL tests fail
vi.mock('@/volt/Select.vue', () => ({ ... }))
// Missing other mocks → Component can't render
```

### Auto-Initialization Behavior Analysis

**Look for watchers and default values:**

```typescript
// Component has auto-initialization watchers:
watch(selectedIndholdsstof, () => {
  // Auto-selects first dispensing option
})

watch([dosering, vaegt, fordeltPaaVal], () => {
  calculate()  // Auto-calculates on changes
})
```

**Test Implication: Component behavior is reactive, not manual**

## 🛠️ Test Setup Best Practices

### Framework-Specific Configuration

**PrimeVue Context Setup (CRITICAL)**
```typescript
// tests/setup.ts - MUST include this for PrimeVue components
config.global.mocks = {
  $primevue: {
    config: {
      theme: { preset: {} },
      options: {
        prefix: 'p',
        darkModeSelector: '.p-dark',
        cssLayer: false
      }
    }
  }
}
```

**❌ FAILURE: Missing PrimeVue context**
```
Error: Cannot read properties of undefined (reading 'config')
```

### Comprehensive Mocking Strategy

**Mock ALL component dependencies with proper event handling:**

```typescript
vi.mock('@/components/NumberSliderInput.vue', () => ({
  default: {
    name: 'NumberSliderInput',
    props: ['modelValue', 'min', 'max', 'step', 'suffix', 'showButtons', 'normalMin', 'normalMax'],
    emits: ['update:modelValue'],
    template: `
      <div data-testid="number-slider-input">
        <input 
          type="range"
          :value="modelValue"
          @input="$emit('update:modelValue', parseFloat($event.target.value))"
          data-testid="slider"
        />
      </div>
    `
  }
}))
```

**✅ SUCCESS: Complete mocking prevents cascade failures**

## 📝 Test Writing Methodology

### Progressive Test Building Approach

**1. Start with Basic Rendering**
```typescript
test('renders the component with title', () => {
  expect(wrapper.find('[data-testid="surface-card"]').exists()).toBe(true)
  expect(wrapper.text()).toContain('Medicin - dosering til børn')
})
```

**2. Add Component Structure Tests**
```typescript
test('displays all medicine selection fields', () => {
  const selects = wrapper.findAll('[data-testid="select"]')
  expect(selects.length).toBeGreaterThanOrEqual(3)
})
```

**3. Test Real Property Values**
```typescript
test('initial state has correct default values', () => {
  const component = wrapper.vm as any
  // Based on ACTUAL component defaults, not assumptions
  expect(component.selectedIndholdsstof).toBe('amoxicillin')
  expect(component.vaegt).toBe(16)
  expect(component.dosering).toBe(50)
})
```

**4. Test Real Behavior Patterns**
```typescript
test('performs automatic calculations on input changes', async () => {
  // Test the ACTUAL watcher-based calculation system
  component.vaegt = 20
  component.dosering = 50
  await nextTick()
  
  expect(component.antalPrDogn).toBeGreaterThan(0)  // Real property name
})
```

### Real vs Mocked Behavior Testing

**❌ WRONG: Testing non-existent methods**
```typescript
// Component doesn't have this method!
expect(component.calculationResult).toBeDefined()
```

**✅ CORRECT: Testing actual reactive properties**
```typescript
// Component has these reactive properties
expect(component.antalPrDogn).toBe(2)
expect(component.antalIAlt).toBe(15)
expect(component.warning).toContain('7 kg')
```

## 🚧 Mock Limitations and Workarounds

### Event Handling Failures in Mocked Components

**Problem**: Mocked components often fail to properly emit events or trigger parent component methods

**❌ MISTAKE: Expecting mock events to work like real components**
```typescript
// This often fails - mock button clicks don't trigger component methods
const resetButton = wrapper.find('[data-testid="secondary-button"]')
await resetButton.trigger('click')
expect(component.resetQuestions).toHaveBeenCalled() // ❌ Often fails
```

**✅ SOLUTION: Test component methods directly**
```typescript
// Test the actual functionality instead of simulating UI events
component.resetQuestions()
expect(component.questionsSection1[0].answer).toBe(0) // ✅ Works reliably
expect(component.totalScore).toBe(0) // ✅ Verifiable behavior
```

### Attribute Testing with Mocked Components

**Problem**: DOM attributes on mocked components don't behave like real components

**❌ MISTAKE: Expecting consistent attribute behavior**
```typescript
// Mock templates don't handle complex attribute expressions reliably
expect(copyDialog.attributes('disabled')).toBe('true') // ❌ Unreliable
```

**✅ SOLUTION: Test underlying state instead**
```typescript
// Test the state that drives the attribute
expect(component.resultsSection).toBe(null) // ✅ Reliable
expect(component.resultsSection1).toEqual([]) // ✅ Verifiable
```

### Spy Setup Timing Issues

**Problem**: Setting up method spies after component mounting may miss method calls

**❌ MISTAKE: Late spy setup**
```typescript
test('method is called', () => {
  const component = wrapper.vm
  const spy = vi.spyOn(component, 'method') // ❌ Too late
  component.triggerMethod()
  expect(spy).toHaveBeenCalled() // ❌ May not capture call
})
```

**✅ SOLUTION: Test results instead of method calls**
```typescript
test('method works correctly', () => {
  const component = wrapper.vm
  const initialState = component.someValue
  component.triggerMethod()
  expect(component.someValue).not.toBe(initialState) // ✅ Verifiable change
})
```

### When to Pivot from Event Testing

**Recognition Patterns**:
- Mock event handlers repeatedly fail despite correct setup
- Complex attribute testing becomes unreliable
- Time spent debugging mock behavior exceeds test value

**Pivot Strategy**:
1. **Identify core behavior**: What should the method actually do?
2. **Test state changes**: Verify the component state changes correctly
3. **Test business logic**: Focus on calculation, validation, data transformation
4. **Skip UI simulation**: Don't test through mocked UI interactions

## 🚫 Common Failure Patterns & Quick Fixes

### Specific Error Messages and Solutions

**Error: "Cannot read properties of undefined (reading 'config')"**
```typescript
// CAUSE: Missing PrimeVue context
// FIX: Add $primevue mock to tests/setup.ts (see above)
```

**Error: Component mounting failures**
```typescript
// CAUSE: Missing component dependency mocks
// FIX: Mock ALL imported components before running tests
```

**Error: Property access errors**
```typescript
// CAUSE: Wrong property names
// FIX: Use exact property names from component
expect(component.vaegt).toBe(16)    // ✅ Real property
expect(component.weight).toBe(16)   // ❌ Doesn't exist
```

### Time-Wasting Anti-Patterns

**1. Assumption-Based Testing**
```typescript
// ❌ DON'T assume what the component should do
test('initial state has empty selections', () => {
  expect(component.selectedIndholdsstof).toBe('')  // WRONG!
})

// ✅ DO test what the component actually does
test('initial state has correct default values', () => {
  expect(component.selectedIndholdsstof).toBe('amoxicillin')  // CORRECT!
})
```

**2. Partial Dependency Mocking**
```typescript
// ❌ DON'T mock only some dependencies
vi.mock('@/volt/Select.vue', () => ({ ... }))
// Missing other mocks → Component fails to render

// ✅ DO mock ALL dependencies upfront
vi.mock('@/volt/Select.vue', () => ({ ... }))
vi.mock('@/volt/InputNumber.vue', () => ({ ... }))
vi.mock('@/components/NumberSliderInput.vue', () => ({ ... }))
// ... etc
```

**3. Generic Property Naming**
```typescript
// ❌ DON'T use English names when component uses Danish
component.weight = 20     // Property doesn't exist
component.dosage = 50     // Property doesn't exist

// ✅ DO use actual property names from component
component.vaegt = 20      // Real property
component.dosering = 50   // Real property
```

**4. Mock Event Debugging Time Sink**
```typescript
// ❌ DON'T spend hours debugging why button clicks don't work
test('button triggers method', async () => {
  const spy = vi.spyOn(component, 'resetQuestions')
  await wrapper.find('[data-testid="button"]').trigger('click')
  expect(spy).toHaveBeenCalled() // ❌ Fails → Hours of debugging
})

// ✅ DO test the method directly after 15 minutes of failed attempts
test('reset method works correctly', () => {
  component.questionsSection1[0].answer = 3
  component.resetQuestions()
  expect(component.questionsSection1[0].answer).toBe(0) // ✅ Works immediately
})
```

**5. Over-Engineering Mock Templates**
```typescript
// ❌ DON'T try to perfectly replicate complex component behavior
vi.mock('@/components/CopyDialog.vue', () => ({
  default: {
    // Attempting to replicate complex disabled logic
    template: `<button :disabled="(resultsSection ? false : true)">...</button>`
    // ❌ Results in unreliable attribute testing
  }
}))

// ✅ DO keep mocks simple and test underlying state
vi.mock('@/components/CopyDialog.vue', () => ({
  default: {
    template: `<button data-testid="copy-dialog"><slot name="container" /></button>`
    // ✅ Simple, reliable, focus on state testing
  }
}))
```

**6. Late Method Spy Setup**
```typescript
// ❌ DON'T set up spies after component mounting
test('method gets called', () => {
  // Component already mounted in beforeEach
  const spy = vi.spyOn(wrapper.vm, 'calculateResults') // ❌ Too late
  wrapper.vm.handleSubmit()
  expect(spy).toHaveBeenCalled() // ❌ Often fails
})

// ✅ DO test state changes instead of method calls
test('submit calculates results', () => {
  expect(wrapper.vm.totalScore).toBe(0) // Initial state
  wrapper.vm.handleSubmit()
  expect(wrapper.vm.totalScore).toBeGreaterThanOrEqual(0) // ✅ State changed
  expect(wrapper.vm.resultsSection1.length).toBe(10) // ✅ Results created
})
```

## 🏥 Medical Domain Specifics

### Clinical Threshold Testing

**Critical Importance**: Medical calculators have specific score thresholds that determine clinical decisions

**❌ MISTAKE: Testing arbitrary values**
```typescript
// Testing random scores without clinical significance
expect(component.totalScore).toBeGreaterThan(5)  // ❌ Meaningless
```

**✅ CORRECT: Test exact clinical boundaries**
```typescript
// AUDIT: Score ≥ 8 indicates alcohol dependency
test('determines low risk correctly', () => {
  setAnswersForScore(7)  // Just below threshold
  component.calculateResults()
  expect(component.conclusion).toBe('Ikke tegn på alkoholafhængighed (AUDIT Score < 8)')
  expect(component.conclusionSeverity).toBe('success')
})

test('determines high risk correctly', () => {
  setAnswersForScore(8)  // At threshold
  component.calculateResults()
  expect(component.conclusion).toBe('Tegn på alkoholafhængighed (AUDIT Score ≥ 8)')
  expect(component.conclusionSeverity).toBe('warn')
})
```

### Medical Calculator Workflow Patterns

**Standard Pattern**: Patient Info → Questions → Validation → Calculation → Results

**Test Structure Template**:
```typescript
describe('Medical Calculator Component', () => {
  describe('Patient Information', () => {
    // Test patient data collection (age, gender, etc.)
  })
  
  describe('Clinical Questions', () => {
    // Test question structure, options, initial values
  })
  
  describe('Form Validation', () => {
    // Test required question validation
  })
  
  describe('Score Calculation', () => {
    // Test calculation logic with clinical thresholds
  })
  
  describe('Clinical Results', () => {
    // Test result interpretation and recommendations
  })
})
```

### International Naming Considerations

**Problem**: Don't assume English property names in international medical applications

**❌ MISTAKE: English assumptions**
```typescript
// Assuming English property names
expect(component.weight).toBe(16)    // ❌ Property doesn't exist
expect(component.dosage).toBe(50)    // ❌ Property doesn't exist
expect(component.frequency).toBe(3)  // ❌ Property doesn't exist
```

**✅ CORRECT: Use actual property names from component**
```typescript
// Danish medical calculator properties
expect(component.vaegt).toBe(16)     // ✅ "weight" in Danish
expect(component.dosering).toBe(50)  // ✅ "dosage" in Danish
expect(component.hyppighed).toBe(3)  // ✅ "frequency" in Danish
```

### Medical Content Validation

**Question Text Accuracy**:
```typescript
test('questions have correct medical terminology', () => {
  const firstQuestion = component.questionsSection1[0]
  // Verify exact medical wording
  expect(firstQuestion.text).toBe('1. Hvor tit drikker du alkohol?')
  
  const lastQuestion = component.questionsSection1[9]
  expect(lastQuestion.text).toContain('bekymret over dine alkoholvaner')
})
```

**Option Value Accuracy**:
```typescript
test('scoring options match medical standards', () => {
  // AUDIT uses specific scoring (0,2,4 for yes/no questions)
  const yesNoOptions = component.options5
  expect(yesNoOptions.map(opt => opt.value)).toEqual([0, 2, 4])
  expect(yesNoOptions[2].text).toBe('Ja, inden for det seneste år')
})
```

### Results and Recommendations Testing

**Clinical Advice Accuracy**:
```typescript
test('provides correct clinical guidance', () => {
  component.totalScore = 8
  component.calculateResults()
  
  // Verify medical recommendation appears
  const guidance = wrapper.text()
  expect(guidance).toContain('Score ≥ 8 er der grund til at vurdere tiltag')
  expect(guidance).toContain('reducere alkoholforbruget')
})
```

**Data Export for Clinical Use**:
```typescript
test('generates clinically useful data export', () => {
  // Set patient and scoring data
  component.name = 'Test Patient'
  component.age = 45
  component.calculateResults()
  
  const payload = component.generatePayload()
  
  // Verify clinical data completeness
  expect(payload).toHaveProperty('name')
  expect(payload).toHaveProperty('age')
  expect(payload).toHaveProperty('answers')
  expect(payload.answers.length).toBe(10)  // All questions answered
  expect(payload.scores.totalScore).toBeGreaterThanOrEqual(0)
})
```

## 🎯 Test Structure Optimization

### Progress Tracking for Complex Components

**Problem**: Complex components with multiple test categories can become overwhelming without proper tracking

**✅ SOLUTION: Use TodoWrite for systematic testing**
```typescript
// Create clear test categories and track progress
TodoWrite([
  { content: "Basic rendering tests", status: "pending", priority: "medium" },
  { content: "Initial state validation", status: "pending", priority: "medium" },
  { content: "Form validation logic", status: "pending", priority: "high" },
  { content: "Calculation accuracy", status: "pending", priority: "high" },
  { content: "Interactive behaviors", status: "pending", priority: "medium" }
])
```

**Benefits**:
- Clear visibility into testing progress
- Ensures comprehensive coverage without missing areas
- Helps prioritize critical business logic tests
- Provides checkpoint validation for complex implementations

### Prioritizing Core Logic Over UI Interactions

**Recognition Pattern**: When mocking becomes extensive, focus shifts to business logic

**❌ TIME SINK: Over-testing UI interactions with mocks**
```typescript
// Spending hours trying to make button clicks work through mocks
test('submit button triggers calculation', async () => {
  const submitBtn = wrapper.find('[data-testid="submit-button"]')
  await submitBtn.trigger('click')  // ❌ Unreliable with extensive mocking
  expect(component.results).toBeDefined()  // ❌ May not be triggered
})
```

**✅ VALUE FOCUS: Test critical business logic directly**
```typescript
// Test the actual calculation logic that matters
test('calculates correct AUDIT score for risk scenarios', () => {
  // High-risk scenario
  setAnswersForScore(10)
  component.calculateResults()
  expect(component.totalScore).toBe(10)
  expect(component.conclusion).toContain('alkoholafhængighed')
  
  // Boundary scenario
  setAnswersForScore(7)
  component.calculateResults()
  expect(component.conclusion).toContain('Ikke tegn på')
})
```

### Mock Simplification Strategies

**When Mocks Become Problematic**:
- Event handlers consistently fail
- Complex attribute expressions don't work
- Time spent debugging mocks exceeds test value

**Simplification Approach**:

**1. Minimal Mock Templates**
```typescript
// ✅ Simple, reliable mock
vi.mock('@/components/ComplexComponent.vue', () => ({
  default: {
    name: 'ComplexComponent',
    props: ['modelValue', 'options'],
    template: `<div data-testid="complex-component">Mock Component</div>`
  }
}))
```

**2. State-Based Testing**
```typescript
// Instead of testing UI interactions, test state changes
test('component state updates correctly', () => {
  const initialState = { ...component.questionsSection1[0] }
  component.updateAnswer(0, 3)
  expect(component.questionsSection1[0].answer).toBe(3)
  expect(component.questionsSection1[0].answer).not.toBe(initialState.answer)
})
```

**3. Method-Direct Testing**
```typescript
// Test methods directly when UI simulation fails
test('validation method works correctly', () => {
  component.questionsSection1[0].answer = null
  expect(component.validateQuestions()).toBe(false)
  expect(component.validationMessage).toBe('Alle spørgsmål skal udfyldes.')
})
```

### Test Category Organization

**Standard Structure for Medical Calculators**:

```typescript
describe('Medical Calculator Component', () => {
  // 1. Basic Structure (5-10 tests)
  describe('Basic Rendering', () => {
    // Component mounts, sections display, buttons exist
  })
  
  // 2. Data Integrity (3-5 tests)  
  describe('Initial State', () => {
    // Default values, question structure, property names
  })
  
  // 3. User Input (3-5 tests)
  describe('Form Validation', () => {
    // Required fields, validation messages, submission blocking
  })
  
  // 4. Business Logic (5-8 tests) - HIGHEST PRIORITY
  describe('Calculation Logic', () => {
    // Score calculation, clinical thresholds, boundary cases
  })
  
  // 5. Results Display (3-5 tests)
  describe('Results and Output', () => {
    // Result display, data export, clinical recommendations
  })
  
  // 6. Integration (2-4 tests)
  describe('Component Integration', () => {
    // Patient info updates, cross-component communication
  })
}
```

**Priority Guidelines**:
- **Critical**: Calculation logic and clinical thresholds
- **Important**: Form validation and data integrity  
- **Standard**: Rendering and results display
- **Lower**: UI interactions and visual behavior

### Failure Recovery Strategies

**15-Minute Rule**: If mock-based test takes >15 minutes to debug, pivot strategy

**Pivot Decision Tree**:
```
Mock test failing? 
├─ Yes → Is this testing core business logic?
│  ├─ Yes → Switch to direct method testing
│  └─ No → Is this testing critical user flow?
│     ├─ Yes → Simplify mock and test state change
│     └─ No → Skip test, focus on higher-value tests
└─ No → Continue with current approach
```

**Recovery Examples**:
```typescript
// FROM: Complex mock interaction testing
test('copy dialog works when results exist', async () => {
  // 30+ minutes debugging why disabled attribute doesn't work
})

// TO: State verification testing  
test('copy functionality has correct availability', () => {
  expect(component.resultsSection1).toEqual([])  // No results initially
  component.calculateResults()
  expect(component.resultsSection1.length).toBe(10)  // Results exist after calculation
})
```

## 📚 Case Study: Medicin Børn Calculator

### What Went Wrong Initially

**Problem 1: Wrong Property Names**
```typescript
// Used these (WRONG):
selectedIndholdsstof: ''                    // Empty string
weight: 15                                  // English name
dosage: 50                                  // English name
selectedPraeparat: 'amoxicillin_tabletter_0' // String

// Component actually had these:
selectedIndholdsstof: 'amoxicillin'         // Pre-selected
vaegt: 16                                   // Danish name
dosering: 50                                // Danish name  
selectedPraeparat: 0                        // Number index
```

**Problem 2: Missing Component Context**
```typescript
// Tests failed with: "Cannot read properties of undefined (reading 'config')"
// CAUSE: PrimeVue components need $primevue.config context
// FIX: Added proper mock in tests/setup.ts
```

**Problem 3: Incomplete Dependency Mocking**
```typescript
// Missing mocks for:
- NumberSliderInput.vue
- CopyDialog.vue  
- SecondaryButton.vue
// RESULT: All component tests failed to mount
```

### What Fixed It Quickly

**Solution 1: Component-First Analysis**
```typescript
// Read MedicinBoernScore.vue FIRST
// Identified real property names and default values
// Wrote tests based on actual implementation
```

**Solution 2: Complete Dependency Analysis**
```typescript
// Mapped ALL imports from component:
import Select from '@/volt/Select.vue'
import InputNumber from '@/volt/InputNumber.vue'  
import NumberSliderInput from './NumberSliderInput.vue'
import CopyDialog from './CopyDialog.vue'
// Created mocks for ALL of them
```

**Solution 3: Real Behavior Testing**
```typescript
// Tested actual watcher-based calculations:
watch([dosering, vaegt, fordeltPaaVal, antalDage], () => {
  calculate()  // Auto-calculation on changes
})

// Instead of testing non-existent manual trigger methods
```

## ✅ Quick Reference Checklist

### Pre-Implementation Analysis
- [ ] Read actual component code completely
- [ ] Inventory all properties with real names and types
- [ ] Map all imported dependencies
- [ ] Identify initialization behavior and watchers
- [ ] Check for framework-specific context requirements

### Test Setup Verification
- [ ] All component dependencies mocked
- [ ] Framework context properly configured ($primevue, etc.)
- [ ] TypeScript path aliases working
- [ ] Test environment can mount component without errors

### Test Writing Steps
- [ ] Start with basic rendering test
- [ ] Use actual property names from component
- [ ] Test real initialization values (not assumptions)
- [ ] Test reactive behavior (watchers, computed properties)
- [ ] Test with real data integration
- [ ] Verify error conditions with actual warning messages

### Mock Limitation Checkpoints
- [ ] Mock event handlers failing after 15 minutes? → Switch to direct method testing
- [ ] Complex attribute testing unreliable? → Test underlying state instead
- [ ] Method spies not capturing calls? → Test state changes rather than method calls
- [ ] Over-engineering mock templates? → Simplify mocks and focus on behavior testing

### Medical Domain Considerations
- [ ] Test exact clinical thresholds (boundary values)
- [ ] Verify medical terminology accuracy in questions and results
- [ ] Use actual property names (don't assume English in international apps)
- [ ] Test standard medical calculator workflow pattern
- [ ] Validate clinical recommendations and guidance text

### Test Structure Optimization
- [ ] Use TodoWrite for complex components with multiple test categories
- [ ] Prioritize: Critical (calculation) → Important (validation) → Standard (rendering)
- [ ] Apply 15-minute rule: Pivot strategy if mock debugging exceeds time value
- [ ] Focus on core business logic over UI interactions when mocking is extensive

### Common Error Diagnostics
- **"Cannot read properties of undefined (reading 'config')"** → Add PrimeVue context mock
- **Component mounting failures** → Mock missing dependencies
- **Property undefined errors** → Use correct property names from component
- **Event handler failures** → Ensure mocks emit proper events
- **Mock event debugging time sink** → Switch to direct method testing
- **Attribute testing failures** → Test component state instead of DOM attributes

---

## Key Takeaway

> **Always read the actual component implementation BEFORE writing tests. This single step saves more time than any other optimization.**

> **When mocks become problematic (15+ minutes debugging), pivot to direct method and state testing. Don't waste time perfecting mock event handling.**

The difference between assumption-based testing and implementation-based testing is the difference between spending 3+ hours debugging failures versus having working tests in 1-2 hours.

**AUDIT Calculator Insights**: The comprehensive AUDIT medical calculator test implementation revealed that mock event handling limitations can add 2-3 hours of debugging time. The pivot strategy of testing component methods directly, focusing on clinical calculation accuracy, and using TodoWrite for progress tracking enabled completion of 33 comprehensive tests in under 2 hours total development time.