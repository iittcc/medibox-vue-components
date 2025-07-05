# PrimeVue Test Environment Configuration

## Issue Description
Vue components using PrimeVue failing in test environments with "Cannot read properties of undefined (reading 'config')" errors due to missing plugin configuration.

## Problem Details
- UI Library: PrimeVue v4.3.5
- Testing Framework: Vitest + Vue Test Utils
- Error: `Cannot read properties of undefined (reading 'config')`
- Root Cause: PrimeVue components require explicit plugin setup in test environments

## Error Context
```typescript
// Component using PrimeVue Select component
<Select
  v-model="selectedIndholdsstof"
  :options="indholdsstofOptions"
  optionLabel="label"
  optionValue="value"
  placeholder="Vælg indholdsstof"
/>

// Test mounting without PrimeVue setup
const wrapper = mount(MedicinBoernScore) // ❌ Fails - no PrimeVue config
```

## Solution: Proper Plugin Configuration

### For Vue Test Utils
```typescript
import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import MedicinBoernScore from '@/components/MedicinBoernScore.vue'

const wrapper = mount(MedicinBoernScore, {
  global: {
    plugins: [
      [PrimeVue, { 
        theme: 'none',      // Use unstyled components
        unstyled: true      // Match production config
      }]
    ]
  }
})
```

### For Browser Tests
```typescript
import { render } from 'vitest-browser-vue'
import PrimeVue from 'primevue/config'
import MedicinBoernScore from '@/components/MedicinBoernScore.vue'

const screen = render(MedicinBoernScore, {
  global: {
    plugins: [
      [PrimeVue, { 
        theme: 'none',
        unstyled: true
      }]
    ]
  }
})
```

## Configuration Options
```typescript
// Match your production PrimeVue configuration
const primeVueConfig = {
  theme: 'none',           // No default theme
  unstyled: true,          // Use custom styling
  ripple: false,           // Disable ripple effects in tests
  locale: {                // Danish locale if needed
    dayNames: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
    // ... other locale settings
  }
}
```

## Global Test Setup
Create a test setup file to avoid repetition:

```typescript
// tests/setup.ts
import { config } from '@vue/test-utils'
import PrimeVue from 'primevue/config'

config.global.plugins = [
  [PrimeVue, { 
    theme: 'none',
    unstyled: true
  }]
]
```

Then reference in Vitest config:
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
    // ... other config
  }
})
```

## Dependency Optimization
Add PrimeVue components to Vite's dependency optimization:

```typescript
// vitest.config.ts or vitest.browser.config.ts
optimizeDeps: {
  include: [
    'primevue/config',
    'primevue/button',
    'primevue/select',
    'primevue/inputnumber',
    'primevue/message',
    'primevue/dialog',
    'primevue/slider',
    '@primevue/icons/angledown',
    '@primevue/icons/angleup',
    // ... other PrimeVue components used
  ]
}
```

## Common PrimeVue Components Setup
```typescript
// If using specific PrimeVue components globally
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'

config.global.components = {
  Button,
  Select,
  InputNumber
}
```

## Testing Patterns

### Testing PrimeVue Component Props
```typescript
test('PrimeVue select component receives correct props', () => {
  const wrapper = mount(Component, { /* PrimeVue config */ })
  
  const select = wrapper.findComponent({ name: 'Select' })
  expect(select.exists()).toBe(true)
  expect(select.props('options')).toBeDefined()
  expect(select.props('placeholder')).toBe('Vælg indholdsstof')
})
```

### Testing Component Events
```typescript
test('component handles PrimeVue events', async () => {
  const wrapper = mount(Component, { /* PrimeVue config */ })
  
  // Trigger change on component state directly
  wrapper.vm.selectedValue = 'new-value'
  await wrapper.vm.$nextTick()
  
  expect(wrapper.vm.selectedValue).toBe('new-value')
})
```

## Troubleshooting

### Issue: Components not rendering
- **Solution**: Ensure PrimeVue plugin is installed in test global config

### Issue: Style-related errors
- **Solution**: Use `unstyled: true` to avoid CSS dependencies in tests

### Issue: Locale errors
- **Solution**: Provide minimal locale configuration matching production

### Issue: Performance problems
- **Solution**: Add PrimeVue dependencies to `optimizeDeps.include`

## Best Practices
1. **Match production configuration** in tests for consistency
2. **Use unstyled mode** to avoid CSS dependencies
3. **Set up global configuration** to avoid repetition
4. **Test component logic**, not PrimeVue internals
5. **Focus on props and events** rather than DOM manipulation

## Related Files
- `/tests/integration/medicinBoern.workflow.test.ts` - Fixed integration test
- `/tests/browser/medicinBoern.e2e.test.ts` - Fixed browser test
- `/vitest.browser.config.ts` - Browser test configuration with optimizeDeps
- `/src/components/MedicinBoernScore.vue` - Component using PrimeVue

## Date
2025-07-05

## Impact
- ✅ All PrimeVue components now render correctly in tests
- ✅ No more undefined config errors
- ✅ Consistent testing environment with production
- ✅ Better test performance with dependency optimization
- ✅ Reusable test setup for all PrimeVue components