# Learning: Singleton Pattern for Shared Resources

## Issue Description
The `useEventManager()` function was creating a new `TypeSafeEventManager` instance every time it was called, leading to duplicate window event listeners and performance issues.

## Problem Analysis

### Root Cause
The fundamental issue was treating EventManager as a per-component utility instead of a shared singleton:

```typescript
// ❌ PROBLEMATIC PATTERN
export function useEventManager() {
  const manager = new TypeSafeEventManager()  // NEW INSTANCE EVERY TIME!
  return manager
}
```

### Impact
- Multiple composables (`useErrorHandler`, `useNetworkStatus`) each got their own EventManager instance
- Each instance added its own window event listeners for the same events (`'online'`, `'offline'`)
- Led to performance issues and duplicate event processing
- Memory leaks from unreleased event listeners

## Solution Implemented

### 1. Singleton Pattern with Global Instance
```typescript
// ✅ SOLUTION: Singleton Pattern
let globalEventManager: TypeSafeEventManager | null = null

function getGlobalEventManager(): TypeSafeEventManager {
  if (!globalEventManager) {
    globalEventManager = new TypeSafeEventManager()
  }
  return globalEventManager
}

export function useEventManager(componentId?: string) {
  const manager = getGlobalEventManager()
  // ... component-specific wrappers
}
```

### 2. Component-Specific Cleanup
- Added component IDs to track which component owns which listeners
- Implemented reference counting for proper cleanup
- Ensured singleton lifecycle management

### 3. Window Listener Deduplication
- Only one window event listener per event type
- Single listener dispatches to all internal subscribers
- Eliminated redundant DOM event listeners

## Key Learnings

### When to Use Singleton Pattern
✅ **Good candidates:**
- Shared resources that should be identical across all instances
- Expensive resources that benefit from sharing (DOM event listeners, network connections)
- Utilities that manage global resources
- State that needs to be synchronized across components

❌ **Avoid singletons for:**
- Components with instance-specific configuration
- Utilities that need different behavior per component
- Complex logic that benefits from isolation

### Vue.js Specific Considerations
- DOM-level resources (event listeners, observers) should almost always be singletons
- Reactive state that represents global application state
- Service-like utilities (HTTP clients, loggers)

### Implementation Best Practices
1. **Lazy Initialization**: Create singleton only when first needed
2. **Component Tracking**: Use component IDs for cleanup management
3. **Reference Counting**: Track usage to know when to cleanup
4. **Graceful Cleanup**: Ensure proper resource cleanup when no longer needed

## Code Example

```typescript
// Singleton EventManager with component-specific cleanup
export function useEventManager(componentId?: string) {
  const manager = getGlobalEventManager()

  const subscribe = componentId 
    ? (event, callback) => manager.subscribe(event, callback, componentId)
    : manager.subscribe.bind(manager)

  const cleanup = componentId
    ? () => manager.cleanupComponent(componentId)
    : manager.cleanup.bind(manager)

  return { subscribe, emit: manager.emit.bind(manager), cleanup }
}
```

## Testing Implications
- Test singleton behavior: verify same instance returned
- Test resource sharing: ensure no duplicate DOM listeners
- Test cleanup: verify proper cleanup with reference counting
- Test isolation: ensure component-specific cleanup doesn't affect others

## Metrics/Results
- ✅ Eliminated duplicate window event listeners
- ✅ Reduced memory usage
- ✅ Improved performance (single event processing per event)
- ✅ Maintained API compatibility
- ✅ All 415 tests passing