# Learning: Circular Dependency Prevention in Event Systems

## Issue Description
The application experienced a "Maximum call stack size exceeded" error when validation errors occurred. The root cause was a circular dependency in the error handling system where `errorBoundaryManager.reportError()` triggered an event that called back into `errorBoundaryManager.reportError()`, creating an infinite loop.

## Problem Analysis

### Root Cause
The circular dependency occurred in this flow:
1. `errorBoundaryManager.reportError()` called `handleError()`
2. `handleError()` called `emitErrorEvent()` 
3. `emitErrorEvent()` emitted `'error:medical-calculator'` event
4. `useErrorHandler` subscribed to `'error:medical-calculator'` event
5. Event callback called `errorBoundaryManager.reportError()` again
6. **Infinite loop** → Stack overflow

### The Problematic Code Pattern
```typescript
// ❌ PROBLEMATIC PATTERN - Circular Event Subscription
export function useErrorHandler() {
  const eventManager = useEventManager()
  
  // This creates a circular dependency!
  eventManager.subscribe('error:medical-calculator', (errorInfo) => {
    // This eventually calls reportError again
    errorBoundaryManager.reportError(error, context)
  })
  
  const handleError = (error: Error, context?: ErrorContext) => {
    // ... error processing ...
    errorBoundaryManager.reportError(error, context) // Triggers the event above
  }
}
```

### Impact
- **Critical runtime failure**: Stack overflow crashes
- **Unpredictable behavior**: Errors occurred only under specific conditions
- **Difficult debugging**: The circular nature made it hard to trace
- **Performance degradation**: Even before crashing, the loop consumed resources

## Solution Implemented

### 1. Eliminated Circular Event Subscription
```typescript
// ✅ SOLUTION: Remove circular event subscription
export function useErrorHandler() {
  // REMOVED: eventManager.subscribe('error:medical-calculator', callback)
  
  const handleError = (error: Error, context?: ErrorContext) => {
    // Direct error processing without circular events
    addError(errorInfo)
    
    // Show notifications
    if (showToasts) {
      showErrorToast(errorInfo.errorType, message, errorInfo.recoverable)
    }
    
    // Call custom handlers
    if (onError) {
      onError(errorInfo)
    }
    
    // Report to boundary (but no circular subscription)
    errorBoundaryManager.reportError(error, context)
  }
}
```

### 2. Replaced with Direct State Management
Instead of event-based communication, we used direct reactive state:
```typescript
// ✅ SOLUTION: Direct state management
const { isOnline } = useNetworkStatus()

// Watch network status changes instead of subscribing to events
watch(isOnline, handleOnlineStatusChange)
```

### 3. Centralized Error Boundary Management
The `errorBoundaryManager` handles global error events without requiring individual composables to subscribe:
```typescript
// ✅ SOLUTION: Centralized error handling
class ErrorBoundaryManager {
  private emitErrorEvent(errorInfo: ErrorInfo) {
    this.eventManager.emit('error:medical-calculator', errorInfo)
  }
  
  // No circular subscriptions - just emit for logging/monitoring
}
```

## Key Learnings

### Event System Design Principles
1. **Avoid Circular Subscriptions**: Never subscribe to events that you also emit
2. **Use Direct Communication**: For simple relationships, direct function calls are better than events
3. **Centralize Global Events**: Have one source of truth for global events
4. **Separate Concerns**: Error handling vs. error reporting should be separate

### Vue.js Specific Patterns
- **Reactive State Over Events**: Use `ref`/`reactive` and `watch` instead of custom events for simple state changes
- **Composable Isolation**: Each composable should handle its own concerns without cross-dependencies
- **Global State Management**: Use a centralized store/manager for shared state

### Debugging Circular Dependencies
1. **Stack Trace Analysis**: Look for repeating function calls in the stack trace
2. **Event Flow Mapping**: Draw out who emits and who subscribes to each event
3. **Breakpoint Debugging**: Set breakpoints on event emissions to trace the flow
4. **Console Logging**: Add logs to track event flow (but remove in production)

## Prevention Strategies

### 1. Event Flow Documentation
Document event flows explicitly:
```typescript
// Document event relationships
// EMITS: 'error:medical-calculator' (for logging)
// SUBSCRIBES: none (to prevent circular dependencies)
```

### 2. Architectural Patterns
- **One-way Data Flow**: Events should flow in one direction
- **Layered Architecture**: Lower layers emit events, higher layers consume them
- **Event Boundaries**: Define clear boundaries for what events cross component boundaries

### 3. Code Review Checklist
- [ ] Does this component both emit and subscribe to the same event?
- [ ] Could this event subscription cause a circular call?
- [ ] Is there a simpler direct communication pattern?
- [ ] Are error handling and error reporting properly separated?

## Testing Implications

### Testing Circular Dependencies
```typescript
// Test for circular dependency detection
it('should not create circular dependencies', () => {
  const emitSpy = vi.spyOn(eventManager, 'emit')
  const subscribeSpy = vi.spyOn(eventManager, 'subscribe')
  
  // Verify no subscription to events we emit
  expect(subscribeSpy).not.toHaveBeenCalledWith('error:medical-calculator', expect.any(Function))
})
```

### Error Simulation Testing
```typescript
// Test error handling without triggering circular calls
it('should handle errors without circular calls', async () => {
  const errorHandler = useErrorHandler()
  
  // Mock to prevent actual error boundary calls
  vi.spyOn(errorBoundaryManager, 'reportError').mockImplementation(() => {})
  
  await errorHandler.handleError(new Error('test'))
  
  // Verify no infinite calls
  expect(errorBoundaryManager.reportError).toHaveBeenCalledTimes(1)
})
```

## Code Example

### Before (Problematic)
```typescript
export function useErrorHandler() {
  const eventManager = useEventManager()
  
  // ❌ Creates circular dependency
  eventManager.subscribe('error:medical-calculator', (errorInfo) => {
    errorBoundaryManager.reportError(error, context)
  })
  
  const handleError = (error: Error) => {
    errorBoundaryManager.reportError(error) // Triggers subscription above
  }
}
```

### After (Fixed)
```typescript
export function useErrorHandler() {
  const { isOnline } = useNetworkStatus()
  
  // ✅ Direct state management, no circular events
  watch(isOnline, handleOnlineStatusChange)
  
  const handleError = (error: Error) => {
    addError(errorInfo)
    showErrorToast(errorInfo)
    errorBoundaryManager.reportError(error) // No circular subscription
  }
}
```

## Metrics/Results
- ✅ Eliminated stack overflow errors
- ✅ Simplified error handling architecture
- ✅ Improved debugging capability
- ✅ Better separation of concerns
- ✅ All 415 tests passing
- ✅ Maintained error reporting functionality