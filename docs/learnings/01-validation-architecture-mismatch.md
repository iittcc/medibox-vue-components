# Learning: Validation Architecture Mismatch

## Issue Description

**Problem**: Components had dual validation systems running independently:
1. Component-level validation (`validateQuestions()` checking `question.answer === null`)
2. Framework-level validation (Zod schema validation through `useFormValidation`)

This created sync issues where one validation system would pass while the other failed, leading to "Validation failed before submission" errors despite all questions being answered.

## Root Cause

- **Multiple Sources of Truth**: Component maintained its own validation state separate from framework
- **Disconnected Systems**: No communication between component validation and framework validation
- **Timing Issues**: Component validation ran before framework validation, creating race conditions

## How We Mitigated

### 1. Unified Validation System
```typescript
// BEFORE: Dual validation systems
const validateQuestions = (): boolean => {
  const unansweredQuestions = questionsSection1.filter(isUnanswered);
  // Component-specific validation logic
};

// AFTER: Single framework validation
const handleSubmit = async () => {
  try {
    await framework.submitCalculation(); // Framework handles all validation
  } catch (error) {
    // Unified error handling
  }
};
```

### 2. Single Source of Truth
- Removed component-level validation functions
- Framework validation instances became the authoritative source
- Component UI reflects framework validation state

### 3. Proper Integration
```typescript
// Framework validation integrated into UI
:is-unanswered="formSubmitted && (question.answer === null || question.answer === undefined)"
```

## Key Learnings

1. **Avoid Validation Duplication**: Never implement validation in multiple places
2. **Framework First**: Let the framework handle complex validation logic
3. **UI Reflects State**: Component UI should reflect framework state, not maintain separate state
4. **Single Source of Truth**: All validation state should come from one authoritative source

## Best Practices Going Forward

1. **Design Phase**: Always identify validation architecture before implementation
2. **Framework Integration**: Use framework validation capabilities rather than rolling custom solutions
3. **State Management**: Keep validation state centralized and accessible
4. **Testing**: Test validation flows end-to-end, not just individual components

## Prevention Strategy

- [ ] Always map out data flow and validation flow before implementation
- [ ] Identify single source of truth for each piece of state
- [ ] Question any time validation logic appears in multiple places
- [ ] Use framework capabilities first before building custom solutions