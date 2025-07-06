# Learning 23: Calculator Framework Integration Patterns

## Issue Description
When integrating the WestleyCroupScore component with the calculator framework, there were challenges understanding the proper patterns for state management, form binding, and event handling within the framework architecture.

## Root Cause Analysis
The transition from manual state management to framework-based state management required understanding:
- How to properly initialize framework state
- Correct patterns for form field binding
- Framework's reactive data flow
- Integration with existing calculator logic

## Solution Implemented
Established clear patterns for framework integration:

### 1. Framework Configuration Pattern
```typescript
const config: CalculatorConfig = {
  type: 'westleycroupscore',
  name: 'Westley Croup Score',
  version: '2.0.0',
  category: 'general',
  theme: 'orange',
  estimatedDuration: 2,
};

const framework = useCalculatorFramework(config);
```

### 2. Steps Initialization Pattern
```typescript
const steps: CalculatorStep[] = [
  { id: 'calculator', title: 'Westley Croup Assessment', order: 1, validation: true },
];
framework.initializeSteps(steps);
```

### 3. Form Field Binding Pattern
```typescript
// Patient data binding
@update:name="framework.setFieldValue('patient', 'name', $event)"
@update:age="framework.setFieldValue('patient', 'age', $event)"

// Calculator data binding
@update:answer="framework.setFieldValue('calculator', question.id, $event)"
```

### 4. State Access Pattern
```typescript
// Reactive state access
:name="framework.patientData.value.name || ''"
:disabled="framework.state.value.isSubmitting"
v-if="framework.state.value.isComplete && framework.result.value"
```

### 5. Default Value Initialization Pattern
```typescript
// Initialize with default patient data
framework.setFieldValue('patient', 'age', 6);
framework.setFieldValue('patient', 'gender', 'male');

// Initialize calculator defaults from question configuration
questionsSection1.forEach(question => {
  framework.setFieldValue('calculator', question.id, question.answer);
});
```

## Prevention Strategies
1. **Reference Template**: Always use a working framework component (like EPDSScore) as reference
2. **Consistent Patterns**: Follow established patterns for all framework integrations
3. **State Flow Understanding**: Understand framework's reactive data flow before implementation
4. **Default Initialization**: Always initialize default values explicitly
5. **Testing Integration**: Test framework integration with proper mocking patterns

## Code Examples
**Complete Framework Integration Template:**
```typescript
<script setup lang="ts">
import { useCalculatorFramework, type CalculatorConfig, type CalculatorStep } from '@/composables/useCalculatorFramework';

const config: CalculatorConfig = {
  type: 'calculator-type',
  name: 'Calculator Name',
  version: '2.0.0',
  category: 'general',
  theme: 'orange',
  estimatedDuration: 2,
};

const framework = useCalculatorFramework(config);

const steps: CalculatorStep[] = [
  { id: 'calculator', title: 'Assessment', order: 1, validation: true },
];
framework.initializeSteps(steps);

// Initialize defaults
framework.setFieldValue('patient', 'age', defaultAge);
framework.setFieldValue('patient', 'gender', 'male');

// Event handlers
const handleSubmit = async () => {
  try {
    await framework.submitCalculation();
  } catch (error) {
    console.error('Submit error:', error);
  }
};

const handleReset = () => {
  framework.resetCalculator();
};
</script>
```

## Key Takeaways
- Framework integration follows predictable patterns that should be consistently applied
- State management is centralized through the framework, eliminating manual reactive state
- Form binding uses framework.setFieldValue for all data updates
- Default value initialization is crucial for proper component behavior
- Error handling and loading states are managed by the framework

## Impact
Following these patterns significantly reduces development time and ensures consistent behavior across all calculator components. It also provides better error handling and state management out of the box.