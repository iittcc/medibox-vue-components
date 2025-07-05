# Learning: Vue 3 Reactive Watching Pitfalls

## Issue Description

**Problem**: Vue warnings about "Invalid watch source: false" appeared repeatedly:
```
[Vue warn]: Invalid watch source: false A watch source can only be a getter/effect function, a ref, a reactive object, or an array of these types.
```

The watch statement was trying to watch reactive object properties directly instead of using proper Vue 3 patterns.

## Root Cause

**Incorrect Pattern**: Watching reactive object properties directly
```typescript
// WRONG: Direct property access in watch
watch([patientValidation.state.isValid, calculatorValidation.state.isValid], ...)
```

**Why It Failed**:
- `validation.state` is a reactive object created with `reactive()`
- Direct property access in watch doesn't establish proper reactivity tracking
- Vue 3 requires getter functions for reactive object properties in watch statements

## How We Mitigated

### Immediate Fix
```typescript
// BEFORE: Direct property watching (broken)
watch([patientValidation.state.isValid, calculatorValidation.state.isValid], ([patientValid, calculatorValid]) => {
  state.value.isValid = patientValid && calculatorValid
})

// AFTER: Getter function watching (correct)
watch([() => patientValidation.state.isValid, () => calculatorValidation.state.isValid], ([patientValid, calculatorValid]) => {
  state.value.isValid = patientValid && calculatorValid
})
```

### Understanding the Pattern
- **Getter Functions**: `() => obj.property` establishes proper reactivity tracking
- **Direct Access**: `obj.property` gets the current value but doesn't track changes
- **Vue 3 Requirement**: Watch sources must be reactive or getter functions

## Key Learnings

### 1. Vue 3 Watch Patterns
```typescript
// ✅ CORRECT ways to watch
watch(ref, callback)                          // Watch a ref
watch(() => obj.prop, callback)               // Watch reactive object property
watch([() => obj.a, () => obj.b], callback)   // Watch multiple properties
watch(reactive, callback)                     // Watch entire reactive object

// ❌ INCORRECT ways to watch
watch(obj.prop, callback)                     // Direct property access
watch([obj.a, obj.b], callback)               // Direct property access in array
```

### 2. Reactivity Understanding
- **`reactive()`**: Creates deeply reactive object
- **Property Access**: Must use getter functions in watch/computed
- **`ref()`**: Can be watched directly as it's a reactive reference

### 3. Debugging Reactive Issues
- Watch console for "Invalid watch source" warnings
- Check if you're accessing reactive object properties directly
- Use Vue DevTools to inspect reactivity relationships

## Best Practices Going Forward

### 1. Always Use Getter Functions for Reactive Objects
```typescript
// Template
watch(() => reactiveObj.property, callback)
```

### 2. Consistent Patterns
```typescript
// For multiple properties
watch([
  () => validation.state.isValid,
  () => validation.state.errors.length
], ([isValid, errorCount]) => {
  // Handle changes
})
```

### 3. Type Safety
```typescript
// Add proper typing for better development experience
watch(
  () => validation.state.isValid,
  (isValid: boolean, oldValue: boolean) => {
    // Type-safe callback
  }
)
```

## Prevention Strategy

- [ ] Always wrap reactive object property access in getter functions for watch/computed
- [ ] Use Vue DevTools to verify reactivity tracking
- [ ] Create linting rules to catch direct property access in watch statements
- [ ] Document reactive patterns in component style guide
- [ ] Review Vue 3 reactivity docs when working with complex state

## Common Gotchas

1. **Nested Properties**: Still need getter functions
   ```typescript
   watch(() => obj.nested.deep.property, callback)
   ```

2. **Computed Dependencies**: Same rules apply
   ```typescript
   const computed = computed(() => obj.property) // ✅
   ```

3. **Template Access**: Templates handle reactivity automatically
   ```vue
   <!-- ✅ This works in templates -->
   <div>{{ obj.property }}</div>
   ```