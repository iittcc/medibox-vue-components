# Vitest Browser API Version Compatibility

## Issue Description
Vitest browser tests failing due to using deprecated v2 API in a v3 environment, causing configuration warnings and test execution failures.

## Problem Details
- Framework: Vitest v3.2.4
- Context: Browser E2E testing configuration
- Error: `The "browser.name" field is deprecated since Vitest 3`
- Impact: Tests not running, configuration warnings, API incompatibility

## Legacy Configuration (Vitest v2)
```typescript
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      name: 'chromium',           // ❌ Deprecated
      provider: 'playwright',
      headless: true,             // ❌ Deprecated at root level
      viewport: {                 // ❌ Deprecated structure
        width: 1280,
        height: 720
      }
    }
  }
})
```

## Updated Configuration (Vitest v3)
```typescript
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: false,            // ✅ Can be set at root or instance level
      instances: [                // ✅ New instances array pattern
        {
          browser: 'chromium'     // ✅ Browser specified per instance
        }
      ]
    }
  }
})
```

## Key Changes in Vitest v3
1. **Instances Array Pattern**: Browser configurations now use an `instances` array
2. **Per-Instance Configuration**: Each browser can have its own settings
3. **Removed Flat Configuration**: No more `browser.name` at root level
4. **Enhanced Flexibility**: Support for multiple browser instances

## Multiple Browser Example
```typescript
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      instances: [
        {
          browser: 'chromium',
          launch: { devtools: true }
        },
        {
          browser: 'firefox',
          setupFiles: ['./setup.firefox.ts']
        },
        {
          browser: 'webkit'
        }
      ]
    }
  }
})
```

## Migration Checklist
- [ ] Replace `browser.name` with `instances[].browser`
- [ ] Move browser-specific options into instance objects
- [ ] Update any browser-specific setup files
- [ ] Test configuration with new API
- [ ] Update documentation and examples

## Dependency Optimization
```typescript
// Add to prevent reload issues with new API
optimizeDeps: {
  include: [
    'vue',
    '@primevue/icons/*',
    'primevue/*',
    'playwright',
    // ... other dependencies
  ]
}
```

## Common Pitfalls
1. **Mixing v2 and v3 syntax** - Ensure complete migration
2. **Missing instance configuration** - At least one instance is required
3. **Incorrect provider setup** - Ensure provider matches installed packages
4. **Dependency reload issues** - Add proper optimizeDeps configuration

## Testing the Migration
```bash
# Run with updated configuration
npx vitest --config vitest.browser.config.ts

# Should not show deprecation warnings
# Should properly initialize browser instances
```

## Documentation References
- [Vitest v3 Browser Testing Guide](https://vitest.dev/guide/browser/)
- [Migration Guide](https://vitest.dev/guide/migration.html)
- [Browser Configuration API](https://vitest.dev/config/browser.html)

## Related Files
- `/vitest.browser.config.ts` - Updated browser test configuration
- `/tests/browser/medicinBoern.e2e.test.ts` - Browser tests using new API
- `/package.json` - Vitest v3.2.4 dependency

## Date
2025-07-05

## Impact
- ✅ Browser tests now use current API
- ✅ No more deprecation warnings
- ✅ Better performance with optimized dependencies
- ✅ Future-proof configuration
- ✅ Support for multiple browser testing scenarios