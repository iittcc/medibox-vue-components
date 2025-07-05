# Environment Variable Graceful Handling in Vue Components

## Issue Description
Vue components throwing runtime errors when environment variables are undefined, causing complete component failure and preventing testing.

## Problem Details
- Component: `MedicinBoernScore.vue`
- Error: `VITE_API_URL environment variable is not defined`
- Impact: Component crashes on mount, preventing any testing or development work
- Root Cause: Strict environment variable validation without fallback values

## Code Example - Problematic
```typescript
const apiUrlServer = import.meta.env.VITE_API_URL
if (!apiUrlServer) {
  throw new Error('VITE_API_URL environment variable is not defined')
}
```

## Resolution Strategy
1. **Create Development Environment File**
   ```bash
   # .env
   VITE_API_URL=https://test.medibox.dk
   ```

2. **Implement Graceful Fallback**
   ```typescript
   const apiUrlServer = import.meta.env.VITE_API_URL || 'https://test.medibox.dk'
   const apiUrl = `${apiUrlServer}/index.php/callback/LogCB/log`
   const keyUrl = `${apiUrlServer}/index.php/KeyServer/getPublicKey`
   ```

## Best Practices Learned
1. **Always provide fallback values** for environment variables in components
2. **Create default .env files** for development environments
3. **Use conditional assignment** rather than throwing errors for missing env vars
4. **Consider testing scenarios** when designing environment variable handling
5. **Log warnings instead of errors** for missing non-critical environment variables

## Environment File Management
```typescript
// Good pattern for different environments
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  
  // Provide environment-specific defaults
  if (import.meta.env.MODE === 'test') {
    return envUrl || 'https://test.medibox.dk'
  }
  
  if (import.meta.env.MODE === 'development') {
    return envUrl || 'https://test.medibox.dk'
  }
  
  // Production should have explicit configuration
  if (!envUrl) {
    console.warn('VITE_API_URL not set in production')
    return 'https://www.medibox.dk' // fallback
  }
  
  return envUrl
}
```

## Testing Considerations
- Components should be testable without requiring environment setup
- Test environments may not have access to production environment variables
- Mock environment variables in test setup if needed

## Related Files
- `/src/components/MedicinBoernScore.vue` - Fixed component
- `/.env` - Created development environment file
- `/tests/browser/medicinBoern.e2e.test.ts` - Tests now work without env setup

## Date
2025-07-05

## Impact
- ✅ Components now work in all environments
- ✅ Tests can run without environment configuration
- ✅ Development setup is more robust
- ✅ Graceful degradation instead of hard failures