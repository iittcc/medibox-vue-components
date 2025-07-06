# Learning #16: PrimeVue Toast Service Injection Dependencies

## Issue Encountered
**Error:** `[Vue warn]: injection "Symbol()" not found` and `Uncaught Error: No PrimeVue Toast provided!`

**Context:** EPDS component failing to start due to missing Toast service injection when `useToast()` was called in `useErrorHandler.ts`.

## Root Cause Analysis
1. **Service Registration Missing**: The `ToastService` was not imported and registered in the EPDS entry point (`epds.ts`)
2. **Dependency Chain**: The `useCalculatorFramework` composable depends on `useErrorHandler`, which depends on `useToast()`, creating a dependency chain that required Toast service
3. **Inconsistent Configuration**: Other calculators (audit, danpss) had ToastService properly configured, but EPDS was missing it

## Solution Implemented
1. **Added ToastService Import**: 
   ```typescript
   import ToastService from 'primevue/toastservice';
   ```

2. **Registered Service with App**:
   ```typescript
   app.use(ToastService);
   ```

3. **Added Error Boundary Configuration**:
   ```typescript
   withErrorBoundary(app, {
       enableAutoRecovery: true,
       maxRetries: 3,
       showToast: true,
       onError: (error, errorInfo) => {
           console.error('EPDS Calculator Error:', {
               error: error.message,
               errorInfo,
               timestamp: new Date().toISOString()
           });
       }
   });
   ```

## Debugging Approach That Worked
1. **Follow Error Stack Trace**: Traced the error from `useToast` call back to missing service registration
2. **Compare Working Examples**: Examined `audit.ts` and `danpss.ts` to see the proper configuration pattern
3. **Understand Dependency Chain**: Identified that `useCalculatorFramework` → `useErrorHandler` → `useToast` created the dependency

## Prevention Strategies
1. **Entry Point Checklist**: Create a standard template for all calculator entry points that includes:
   - PrimeVue configuration
   - ToastService registration
   - Error boundary setup
   - Consistent locale settings

2. **Dependency Documentation**: Document composable dependencies clearly:
   ```typescript
   // useCalculatorFramework depends on:
   // - useErrorHandler (requires ToastService)
   // - useValidation 
   ```

3. **Automated Checks**: Consider adding a linter rule or test to ensure ToastService is registered when useToast is used

## Key Takeaways
- **Vue Injection System**: Understanding that `useToast()` relies on dependency injection that must be configured at the app level
- **Service Registration Pattern**: All PrimeVue services must be explicitly registered with `app.use()`
- **Error Propagation**: Missing services at the app level can cause seemingly unrelated component failures
- **Consistency Matters**: When multiple entry points exist, maintain consistent service registration patterns

## Related Files
- `src/epds.ts` - Entry point configuration
- `src/composables/useErrorHandler.ts` - Toast service consumer
- `src/audit.ts`, `src/danpss.ts` - Working examples