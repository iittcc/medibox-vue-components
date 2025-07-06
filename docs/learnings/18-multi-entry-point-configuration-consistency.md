# Learning #18: Multi-Entry Point Configuration Consistency

## Issue Encountered
**Problem:** Inconsistent service registration across different calculator entry points leading to some working (audit, danpss) and others failing (epds).

**Context:** Medical calculator app with multiple entry points where each calculator has its own TypeScript entry file, but configurations were inconsistent.

## Root Cause Analysis
1. **Manual Configuration**: Each entry point was manually configured, leading to copy-paste errors and omissions
2. **No Shared Template**: No standardized template or pattern for new entry points
3. **Silent Inconsistencies**: Different configurations worked until specific features (like error handling) were used
4. **Evolution Over Time**: Entry points were created at different times with different patterns

## Solution Implemented
1. **Standardized epds.ts Configuration**:
   ```typescript
   // src/epds.ts - EPDS Calculator Entry Point
   import { createApp } from 'vue';
   import 'material-design-icons-iconfont/dist/material-design-icons.css';
   import './assets/sky.css';
   import App from './EPDS.vue';
   import PrimeVue from 'primevue/config';
   import ToastService from 'primevue/toastservice';
   
   // Enhanced error handling
   import { withErrorBoundary } from '@/utils/errorBoundary';
   
   const app = createApp(App);
   
   // Configure PrimeVue with Danish locale
   app.use(PrimeVue, { /* standard config */ });
   
   // Add Toast service for notifications
   app.use(ToastService);
   
   // Wrap with error boundary for enhanced error handling
   withErrorBoundary(app, { /* standard config */ });
   
   app.mount('#app');
   ```

2. **Matched Pattern from Working Entry Points**: Used audit.ts and danpss.ts as reference

## Debugging Approach That Worked
1. **Comparative Analysis**: Used multiple file reads to compare working vs broken entry points
2. **Pattern Recognition**: Identified common patterns in working configurations
3. **Systematic Verification**: Checked each configuration element one by one

## Prevention Strategies
1. **Entry Point Template**: Create a standardized template for new calculators:
   ```typescript
   // template-entry-point.ts
   import { createApp } from 'vue';
   import 'material-design-icons-iconfont/dist/material-design-icons.css';
   import './assets/{theme}.css'; // Replace {theme} with appropriate theme
   import App from './{CalculatorName}.vue'; // Replace {CalculatorName}
   import PrimeVue from 'primevue/config';
   import ToastService from 'primevue/toastservice';
   import { withErrorBoundary } from '@/utils/errorBoundary';
   
   const app = createApp(App);
   
   // Standard PrimeVue configuration
   app.use(PrimeVue, STANDARD_PRIMEVUE_CONFIG);
   app.use(ToastService);
   
   // Standard error boundary
   withErrorBoundary(app, STANDARD_ERROR_BOUNDARY_CONFIG);
   
   app.mount('#app');
   ```

2. **Configuration Constants**: Extract common configurations:
   ```typescript
   // src/config/entryPointConfig.ts
   export const STANDARD_PRIMEVUE_CONFIG = {
     unstyled: true,
     locale: {
       monthNames: ['Januar', 'Februar', ...],
       // ... rest of Danish locale
     }
   };
   
   export const STANDARD_ERROR_BOUNDARY_CONFIG = {
     enableAutoRecovery: true,
     maxRetries: 3,
     showToast: true,
     onError: (error, errorInfo) => {
       console.error(`Calculator Error:`, {
         error: error.message,
         errorInfo,
         timestamp: new Date().toISOString()
       });
     }
   };
   ```

3. **Automated Verification**: Create a test or linter rule to verify entry points:
   ```typescript
   // Test to verify all entry points have required services
   describe('Entry Point Configuration', () => {
     const entryPoints = ['audit', 'danpss', 'epds', /* ... */];
     
     entryPoints.forEach(entry => {
       test(`${entry} has required service registrations`, () => {
         const content = readFileSync(`src/${entry}.ts`, 'utf8');
         expect(content).toContain('ToastService');
         expect(content).toContain('withErrorBoundary');
         expect(content).toContain('PrimeVue');
       });
     });
   });
   ```

## Architecture Improvement
**Recommended Pattern for Multi-Entry Apps:**
```typescript
// src/config/createCalculatorApp.ts
export function createCalculatorApp(config: {
  component: any;
  theme: string;
  calculatorName: string;
}) {
  const app = createApp(config.component);
  
  // Standard imports
  import('material-design-icons-iconfont/dist/material-design-icons.css');
  import(`./assets/${config.theme}.css`);
  
  // Standard service registration
  app.use(PrimeVue, STANDARD_PRIMEVUE_CONFIG);
  app.use(ToastService);
  
  // Standard error handling
  withErrorBoundary(app, {
    ...STANDARD_ERROR_BOUNDARY_CONFIG,
    onError: (error, errorInfo) => {
      console.error(`${config.calculatorName} Error:`, {
        error: error.message,
        errorInfo,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  return app;
}
```

## Key Takeaways
- **Consistency is Critical**: Inconsistent configurations create hard-to-debug issues
- **Template-Driven Development**: Use templates and shared configurations for similar components
- **Early Standardization**: Establish patterns early before they proliferate
- **Automated Verification**: Use tests to verify configuration consistency
- **Documentation**: Document required services and configuration patterns clearly

## Related Files
- `src/audit.ts` - Working entry point example
- `src/danpss.ts` - Working entry point example  
- `src/epds.ts` - Fixed entry point
- `vite.config.ts` - Multi-entry build configuration