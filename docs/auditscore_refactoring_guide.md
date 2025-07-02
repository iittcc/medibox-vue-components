# Refactoring Guide: Converting AuditScore.vue to useCalculatorFramework

This document provides a step-by-step guide with code examples for refactoring `AuditScore.vue` to use the `useCalculatorFramework`.

**Prerequisite:** This refactoring assumes that the core calculation logic for the AUDIT score is extracted into its own module at `src/calculators/audit/index.ts`. The framework will call this module, so the component itself no longer needs to know how the score is calculated.

---

#### **Step 1: Initialize the Framework**

First, remove the manual imports for `useErrorHandler`, `useLogging`, and `useValidation`. Replace them by importing and initializing the `useCalculatorFramework`.

**Before:**
```typescript
// src/components/AuditScore.vue

import { useErrorHandler } from '@/composables/useErrorHandler';
import { useLogging } from '@/composables/useLogging';
import { useValidation } from '@/composables/useValidation';
// ... other imports

const { handleError, showSuccess, showWarning } = useErrorHandler({...});
const { logCalculation, logUserAction, logError } = useLogging();
const patientValidation = useValidation(PatientPsychologySchema);
// ... and so on
```

**After:**
```typescript
// src/components/AuditScore.vue

import { useCalculatorFramework, type CalculatorConfig, type CalculatorStep } from '@/composables/useCalculatorFramework';
// ... other imports

// 1. Define the calculator's configuration
const config: CalculatorConfig = {
  type: 'audit',
  name: 'AUDIT Alkoholafhængighedstest',
  version: '2.0.0', // Mark as refactored version
  category: 'psychology',
  theme: 'teal',
  estimatedDuration: 2 // in minutes
};

// 2. Initialize the framework with the configuration
const framework = useCalculatorFramework(config);

// 3. Define the steps for the UI (can be a single step)
const steps: CalculatorStep[] = [
  { id: 'calculator', title: 'AUDIT Questionnaire', order: 1, validation: true }
];
framework.initializeSteps(steps);
```

---

#### **Step 2: Consolidate State Management**

Remove all the local `ref`s that manage patient data, answers, and results. The framework will now provide this state. The local question definitions can be kept for rendering the UI, but they should be simplified.

**Before:**
```typescript
// src/components/AuditScore.vue

const name = ref<string>("");
const gender = ref<string>("Mand");
const age = ref<number>(50);
const resultsSection1 = ref<Result[]>([]);
const totalScore = ref<number>(0);
const conclusion = ref<string>('');

const questionsSection1 = ref<Question[]>([
  {
    type: 'Listbox',
    text: "1. Hvor tit drikker du alkohol?",
    answer: options1.value[0].value // Manual answer state
  },
  // ... 9 more questions
]);
```

**After:**
```typescript
// src/components/AuditScore.vue

// All the refs for name, age, gender, results, score, etc., are removed.
// State is now accessed from the framework:
// - framework.patientData.value
// - framework.calculatorData.value
// - framework.result.value

// The question definitions are simplified to be static descriptions for the UI.
// An `id` is added to link each question to a field in the calculator's schema.
const questionsSection1 = [
  {
    id: 'question1', // Matches the Zod schema field
    type: 'Listbox',
    text: "1. Hvor tit drikker du alkohol?",
    optionsType: 'options1'
    // 'answer' property is removed
  },
  // ... 9 more questions with unique ids
];
```

---

#### **Step 3: Update Data Binding in the Template**

Modify the template to read from and write to the framework's state using `patientData`, `calculatorData`, and the `setFieldValue` method.

**Before:**
```html
<!-- src/components/AuditScore.vue -->

<PersonInfo
  :name="name"
  :age="age"
  @update:name="name = $event"
  @update:age="age = $event"
  ...
/>

<QuestionSingleComponent
  ...
  :answer="question.answer"
  @update:answer="question.answer = $event"
/>
```

**After:**
```html
<!-- src/components/AuditScore.vue -->

<PersonInfo
  :name="framework.patientData.value.name"
  :age="framework.patientData.value.age"
  @update:name="framework.setFieldValue('patient', 'name', $event)"
  @update:age="framework.setFieldValue('patient', 'age', $event)"
  ...
/>

<QuestionSingleComponent
  ...
  :answer="framework.calculatorData.value[question.id]"
  @update:answer="framework.setFieldValue('calculator', question.id, $event)"
/>
```

---

#### **Step 4: Replace Submission and Calculation Logic**

The biggest simplification comes from removing the large `handleSubmit`, `validateQuestionsEnhanced`, `calculateResults`, and `submitDataEnhanced` methods. The "Submit" button in the template will now call the framework's `submitCalculation` method directly.

**Before:**
```typescript
// src/components/AuditScore.vue

const handleSubmit = async () => {
  if (isSubmitting.value) return;
  // ... complex logic for validation, calculation, submission ...
};

const validateQuestionsEnhanced = async (): Promise<boolean> => { ... };
const calculateResults = () => { ... };
const submitDataEnhanced = async (): Promise<void> => { ... };
```

**After:**
```typescript
// src/components/AuditScore.vue

// The handleSubmit, validateQuestionsEnhanced, calculateResults,
// and submitDataEnhanced functions are completely removed.
```

**Template Change:**

**Before:**
```html
<Button
  type="submit"
  :label="isSubmitting ? 'Beregner...' : 'Beregn'"
  class="pr-6 pl-6 rounded-lg"
  :icon="isSubmitting ? 'pi pi-spin pi-spinner' : 'pi pi-calculator'"
  :disabled="isSubmitting"
/>
<!-- The button was inside a <form @submit.prevent="handleSubmit"> -->
```

**After:**
```html
<!-- The surrounding <form> tag can be removed -->
<Button
  @click="framework.submitCalculation"
  :label="framework.state.isSubmitting ? 'Beregner...' : 'Beregn'"
  class="pr-6 pl-6 rounded-lg"
  :icon="framework.state.isSubmitting ? 'pi pi-spin pi-spinner' : 'pi pi-calculator'"
  :disabled="framework.state.isSubmitting || !framework.canProceed.value"
/>
```

---

#### **Step 5: Unify Result Display**

Update the results section to react to the framework's state (`isComplete`) and display the data from the `result` object.

**Before:**
```html
<div v-if="resultsSection1.length > 0" class="results">
  <Message :severity="conclusionSeverity">
    <h2>AUDIT Score {{ totalScore }} : {{ conclusion }}</h2>
  </Message>
</div>
```

**After:**
```html
<div v-if="framework.state.isComplete && framework.result.value" class="results">
  <Message :severity="framework.result.value.riskLevel === 'low' ? 'success' : 'warn'">
    <h2>
      AUDIT Score {{ framework.result.value.score }} : {{ framework.result.value.interpretation }}
    </h2>
  </Message>
  <!-- Recommendations can be looped here if available -->
  <!-- <p v-for="rec in framework.result.value.recommendations">{{ rec }}</p> -->
</div>
```

---

#### **Step 6: Final Cleanup**

*   Remove all unused variables, imports, and helper functions that have been replaced by the framework (e.g., `sessionId`, `calculationStartTime`, `conclusionSeverity`, `getAuditRiskLevel`, etc.).
*   The `reset` button can be simplified to call `framework.resetCalculator()`.

This refactoring will result in a much cleaner, more maintainable, and more consistent `AuditScore.vue` component that fully leverages the power of the existing architecture.
