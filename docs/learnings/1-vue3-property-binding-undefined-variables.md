# Learning: Vue 3 Property Binding with Undefined Variables

## Issue Encountered
**Problem**: Vue components using `:prop="variableName"` syntax where `variableName` is not defined, causing Vue warnings and test failures.

**Manifestation**: 
```vue
<!-- PROBLEMATIC CODE -->
<NumberSliderInput
  v-model="sysBP"
  :sliderType="custom"  <!-- 'custom' is undefined -->
/>
```

**Error Messages**:
```
[Vue warn]: Property "custom" was accessed during render but is not defined on instance.
```

## Root Cause Analysis
- **Template binding confusion**: Developer intended to pass a string literal but used property binding syntax
- **Missing variable declaration**: The variable `custom` was never declared in the component's setup
- **Vue 3 reactivity system**: Vue 3's proxy-based reactivity detects undefined property access more strictly than Vue 2

## Impact on Development
- **Test failures**: All component tests failed due to Vue warnings
- **Runtime errors**: Component couldn't render properly
- **Debug time**: Significant time spent tracking down seemingly simple issue
- **CI/CD pipeline**: Blocked deployment due to test failures

## Solution Applied
```vue
<!-- SOLUTION 1: Use string literal -->
<NumberSliderInput
  v-model="sysBP"
  sliderType="custom"  <!-- String literal, no binding -->
/>

<!-- SOLUTION 2: Define the variable (if dynamic needed) -->
<script setup lang="ts">
const custom = 'custom'  // Define the variable
</script>
<template>
  <NumberSliderInput
    v-model="sysBP"
    :sliderType="custom"  <!-- Now properly bound -->
  />
</template>
```

## Prevention Strategies

### 1. ESLint Rules
Add Vue-specific ESLint rules to catch undefined variables:
```json
{
  "rules": {
    "vue/no-undef-properties": "error",
    "vue/require-prop-types": "error"
  }
}
```

### 2. TypeScript Strict Mode
Enable strict TypeScript checking:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noUndeclaredVars": true
  }
}
```

### 3. Template Syntax Guidelines
**DO:**
- Use string literals for static values: `prop="value"`
- Use v-bind only for reactive data: `:prop="reactiveVariable"`
- Declare all template variables in setup()

**DON'T:**
- Use `:prop="undefinedVariable"`
- Mix string literals with property binding syntax
- Assume variables exist without declaration

### 4. Code Review Checklist
- [ ] All `:prop="variable"` bindings have corresponding variable declarations
- [ ] Static strings use literal syntax `prop="value"`
- [ ] Component props are properly typed
- [ ] Template variables are declared in setup()

## Testing Considerations
```typescript
// Test to catch undefined variable issues
it('renders without Vue warnings', () => {
  const consoleSpy = vi.spyOn(console, 'warn')
  mount(Component)
  expect(consoleSpy).not.toHaveBeenCalled()
})
```

## Related Patterns

### Vue 2 vs Vue 3 Differences
Vue 2 was more permissive with undefined variables, while Vue 3's reactivity system is stricter.

### Common Anti-patterns
```vue
<!-- ANTI-PATTERN: Undefined binding -->
:class="undefinedVariable"

<!-- ANTI-PATTERN: Mixed syntax -->
:static-prop="'literal-value'"

<!-- PATTERN: Correct usage -->
class="static-class"
:dynamic-prop="reactiveVariable"
```

## References
- [Vue 3 Template Syntax Guide](https://vuejs.org/guide/essentials/template-syntax.html)
- [Vue 3 Reactivity in Depth](https://vuejs.org/guide/extras/reactivity-in-depth.html)
- [ESLint Plugin Vue Rules](https://eslint.vuejs.org/rules/)

## Keywords
`vue3`, `template-binding`, `undefined-variables`, `property-binding`, `reactivity`, `eslint`