# Learning #29: Framework Data Binding Patterns

## Issue
Converting component data binding from direct Vue refs to framework-based patterns requires understanding the correct framework API usage and computed property patterns.

## Context
During PUQE migration, had to replace:
- Direct `ref()` declarations with framework data access
- Manual event handlers with `framework.setFieldValue()` calls
- Direct data mutations with framework-mediated updates

## Root Cause
Framework encapsulates data management and requires specific API calls for data updates, but the patterns weren't immediately obvious from existing examples.

## Solution Applied
1. **Computed Data Access**: Use computed properties for type-safe framework data access
2. **Framework Field Updates**: Replace direct mutations with `framework.setFieldValue()`
3. **Consistent Patterns**: Follow established patterns from GCS component

## Code Example
```typescript
// Before (direct refs)
const nausea = ref<number>(1)
const vomiting = ref<number>(1)

// After (framework pattern)
const puqeData = computed(() => framework.calculatorData.value as Partial<PuqeResponses>)

// Before (direct mutation)
@input="nausea = $event"

// After (framework API)
@update:answer="framework.setFieldValue('calculator', 'nausea', $event)"
```

## Key Patterns Learned
1. **Data Access**: Always use computed properties for framework data
2. **Field Updates**: Use `framework.setFieldValue(category, field, value)`
3. **Type Safety**: Cast framework data to specific types
4. **Event Binding**: Connect component events to framework methods

## Framework API Categories
- `patient`: Patient demographic data
- `calculator`: Calculator-specific responses
- `metadata`: Additional calculation metadata

## Prevention Strategy
- Study existing framework components for patterns
- Use TypeScript for type-safe framework integration
- Create computed properties for all framework data access
- Test framework integration thoroughly

## Impact
- Successful conversion from refs to framework pattern
- Type-safe data access throughout component
- Consistent API usage across all framework components

## Tags
`framework`, `data-binding`, `vue3`, `computed-properties`, `api-patterns`