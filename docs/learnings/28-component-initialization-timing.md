# Learning #28: Component Initialization Timing

## Issue
Framework-based components need careful timing of default value initialization to prevent validation failures and ensure proper data binding setup.

## Context
During PUQE framework implementation, the component needed default values set immediately to pass validation, but framework initialization happens asynchronously, creating timing issues.

## Root Cause
- Framework initialization takes time to set up reactive bindings
- Default values needed to be set after framework is ready
- Vue's reactivity system requires proper timing for computed properties
- Initial validation checks run before data is properly initialized

## Solution Applied
1. **Immediate Defaults**: Set defaults in script setup after framework initialization
2. **Mounted Guard**: Added `onMounted` check to only set defaults if data is empty
3. **Proper Sequencing**: Ensure framework.setFieldValue calls happen after framework is ready

## Code Example
```typescript
// Set default values immediately after framework setup
setDefaultValues()

// Additional safety check on mount
onMounted(() => {
  if (!puqeData.value.nausea && !puqeData.value.vomiting && !puqeData.value.retching) {
    setDefaultValues()
  }
})

const setDefaultValues = () => {
  // Framework must be initialized before these calls
  framework.setFieldValue('calculator', 'nausea', 1)
  framework.setFieldValue('calculator', 'vomiting', 1)
  framework.setFieldValue('calculator', 'retching', 1)
}
```

## Key Principles
- Initialize framework before setting field values
- Use computed properties for reactive data access
- Guard against double initialization
- Ensure validation passes from the start

## Prevention Strategy
- Always check framework readiness before field operations
- Use Vue lifecycle hooks appropriately for initialization
- Test initialization timing in component tests
- Document initialization requirements for framework components

## Impact
- Prevented validation errors on component load
- Ensured proper data binding from component start
- Created reusable pattern for other framework components

## Tags
`vue3`, `framework`, `initialization`, `timing`, `lifecycle`, `validation`