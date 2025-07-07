# useErrorHandler.ts - Design Pattern Analysis & Refactoring Plan

## Executive Summary

The current `useErrorHandler.ts` implementation violates multiple design principles and contains several architectural issues that impact maintainability, testability, and extensibility. This analysis identifies critical design pattern violations and provides a comprehensive refactoring plan to improve the codebase.

### Key Issues Identified
- **Single Responsibility Principle Violation**: Composable handles 10+ different concerns
- **Observer Pattern Misuse**: Manual event listener management
- **Missing Strategy Pattern**: Hard-coded error handling logic
- **Tight Coupling**: Direct dependencies on external systems
- **Code Duplication**: Redundant logic across components
- **Type Safety Issues**: Event handling bypasses TypeScript

## Detailed Design Pattern Analysis

### 1. Single Responsibility Principle (SRP) Violation

**Current State**: The `useErrorHandler` composable handles multiple responsibilities:

```typescript
// Current implementation handles ALL of these concerns:
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  // 1. Error state management
  const errors = ref<ErrorInfo[]>([])
  
  // 2. Network status monitoring
  const isOnline = ref(navigator.onLine)
  
  // 3. Retry attempt tracking
  const retryAttempts = ref<Map<string, number>>(new Map())
  
  // 4. Toast notification integration
  const toast = useToast()
  
  // 5. Event listener management (5 different events)
  // 6. Error categorization
  // 7. Recovery mechanisms
  // 8. User notifications
  // 9. Cleanup operations
  // 10. Integration with errorBoundaryManager
}
```

**Problem**: This violates SRP as changes to retry logic affect notification logic, network monitoring affects error storage, etc.

**Recommended Solution**: Extract focused composables:
- `useErrorState` - Error storage and computed properties
- `useNetworkStatus` - Online/offline monitoring
- `useNotifications` - Toast abstraction
- `useRetryManager` - Retry logic and exponential backoff
- `useEventManager` - Type-safe event handling

### 2. Observer Pattern Misuse

**Current State**: Manual event listener management:

```typescript
// Problematic manual event management
onMounted(() => {
  window.addEventListener('online', handleOnlineStatusChange)
  window.addEventListener('offline', handleOnlineStatusChange)
  window.addEventListener('medicalCalculatorError', handleMedicalCalculatorError)
  window.addEventListener('medicalCalculatorRecovery', handleMedicalCalculatorRecovery)
  window.addEventListener('showErrorToast', handleShowErrorToast)
})

onUnmounted(() => {
  // Manual cleanup of 5 event listeners
  window.removeEventListener('online', handleOnlineStatusChange)
  // ... repeat for all events
})
```

**Problems**:
- Error-prone manual cleanup
- Type safety issues with event casting
- Memory leak potential
- Difficult to test
- No centralized event management

**Recommended Solution**: Implement proper Observer pattern:

```typescript
// Proposed EventManager with type safety
interface EventMap {
  'network:online': void
  'network:offline': void
  'error:medical-calculator': ErrorInfo
  'error:recovery': ErrorInfo
  'notification:show-toast': ToastOptions
}

class TypeSafeEventManager {
  private listeners = new Map<keyof EventMap, Set<Function>>()
  
  subscribe<K extends keyof EventMap>(
    event: K, 
    callback: (data: EventMap[K]) => void
  ): () => void {
    // Implementation with automatic cleanup
  }
  
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    // Type-safe event emission
  }
}
```

### 3. Strategy Pattern Missing

**Current State**: Hard-coded error handling logic:

```typescript
const attemptRecovery = async (errorInfo: ErrorInfo, context?: any): Promise<boolean> => {
  try {
    if (errorInfo.errorType === ErrorType.NETWORK) {
      // Network recovery logic
      if (!isOnline.value) {
        await waitForOnline()
      }
      // Exponential backoff logic
    }
    
    if (errorInfo.errorType === ErrorType.VALIDATION) {
      // Validation error logic
      return false
    }
    
    // More if/else chains...
  } catch (recoveryError) {
    console.error('Recovery attempt failed:', recoveryError)
    return false
  }
}
```

**Problems**:
- Violates Open/Closed Principle
- Difficult to add new error types
- Complex if/else chains
- Testing requires testing all paths
- No extensibility for custom recovery strategies

**Recommended Solution**: Implement Strategy pattern:

```typescript
interface ErrorRecoveryStrategy {
  canRecover(errorInfo: ErrorInfo): boolean
  recover(errorInfo: ErrorInfo, context?: any): Promise<RecoveryResult>
  getRetryDelay(attempt: number): number
}

class NetworkErrorStrategy implements ErrorRecoveryStrategy {
  canRecover(errorInfo: ErrorInfo): boolean {
    return errorInfo.errorType === ErrorType.NETWORK
  }
  
  async recover(errorInfo: ErrorInfo, context?: any): Promise<RecoveryResult> {
    if (!navigator.onLine) {
      await this.waitForOnline()
    }
    
    const delay = this.getRetryDelay(context?.attempt || 1)
    await new Promise(resolve => setTimeout(resolve, delay))
    
    return { success: true, shouldRetry: true }
  }
  
  getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt - 1), 10000)
  }
}

class ValidationErrorStrategy implements ErrorRecoveryStrategy {
  canRecover(errorInfo: ErrorInfo): boolean {
    return errorInfo.errorType === ErrorType.VALIDATION
  }
  
  async recover(errorInfo: ErrorInfo): Promise<RecoveryResult> {
    // Validation errors require user input, no automatic recovery
    return { success: false, shouldRetry: false, requiresUserInput: true }
  }
  
  getRetryDelay(): number {
    return 0 // No retry for validation errors
  }
}

class ErrorRecoveryManager {
  private strategies: ErrorRecoveryStrategy[] = [
    new NetworkErrorStrategy(),
    new ValidationErrorStrategy(),
    new CalculationErrorStrategy(),
    // Easy to add new strategies
  ]
  
  async attemptRecovery(errorInfo: ErrorInfo, context?: any): Promise<RecoveryResult> {
    const strategy = this.strategies.find(s => s.canRecover(errorInfo))
    
    if (!strategy) {
      return { success: false, shouldRetry: false }
    }
    
    return strategy.recover(errorInfo, context)
  }
}
```

### 4. Tight Coupling Issues

**Current State**: Direct dependencies on external systems:

```typescript
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const toast = useToast() // Direct coupling to PrimeVue
  
  // Direct coupling to errorBoundaryManager
  const categorizeError = (error: Error): ErrorType => {
    return errorBoundaryManager.categorizeError(error)
  }
  
  const getUserFriendlyMessage = (errorType: ErrorType, error: Error): string => {
    return errorBoundaryManager.getUserFriendlyMessage(errorType, error)
  }
}
```

**Problems**:
- Difficult to test in isolation
- Cannot swap implementations
- Tight coupling to PrimeVue toast system
- No dependency injection
- Hard to mock for unit tests

**Recommended Solution**: Dependency injection and abstraction:

```typescript
interface NotificationService {
  showSuccess(message: string, detail?: string): void
  showInfo(message: string, detail?: string): void
  showWarning(message: string, detail?: string): void
  showError(message: string, detail?: string): void
}

interface ErrorCategorizationService {
  categorizeError(error: Error): ErrorType
  getUserFriendlyMessage(errorType: ErrorType, error: Error): string
  isRecoverable(errorType: ErrorType): boolean
}

export function useErrorHandler(
  notificationService?: NotificationService,
  categorizationService?: ErrorCategorizationService
) {
  // Default implementations with ability to inject alternatives
  const notifications = notificationService || new PrimeVueNotificationService()
  const categorization = categorizationService || errorBoundaryManager
  
  // Now easily testable and swappable
}
```

### 5. Code Duplication Between Components

**Current State**: Both `useErrorHandler` and `errorBoundaryManager` have similar logic:

```typescript
// In useErrorHandler
const handleError = async (error: Error, context?: any) => {
  const errorType = categorizeError(error)
  const errorInfo: ErrorInfo = {
    componentName: context?.component,
    errorMessage: error.message,
    errorStack: error.stack,
    timestamp: new Date(),
    calculatorType: context?.calculator,
    errorType,
    recoverable: isRecoverable(errorType)
  }
  // ... processing logic
}

// In errorBoundaryManager (very similar)
async handleError(error: Error, componentName?: string, calculatorType?: string, context?: Record<string, any>): Promise<void> {
  const errorType = this.categorizeError(error)
  const errorInfo: ErrorInfo = {
    componentName,
    errorMessage: error.message,
    errorStack: error.stack,
    timestamp: new Date(),
    calculatorType,
    errorType,
    recoverable: this.isRecoverable(errorType) && currentRetries < this.config.maxRetries!
  }
  // ... similar processing logic
}
```

**Problems**:
- Duplicate error processing logic
- Inconsistent error handling
- Maintenance overhead
- Risk of logic divergence

**Recommended Solution**: Consolidate into shared error processing service:

```typescript
class ErrorProcessor {
  static createErrorInfo(
    error: Error, 
    context: ErrorContext = {}
  ): ErrorInfo {
    return {
      componentName: context.component,
      errorMessage: error.message,
      errorStack: error.stack,
      timestamp: new Date(),
      calculatorType: context.calculator,
      errorType: this.categorizeError(error),
      recoverable: this.isRecoverable(error)
    }
  }
  
  static async processError(
    error: Error, 
    context: ErrorContext,
    handlers: ErrorHandler[]
  ): Promise<void> {
    const errorInfo = this.createErrorInfo(error, context)
    
    // Chain of responsibility pattern
    for (const handler of handlers) {
      if (await handler.canHandle(errorInfo)) {
        await handler.handle(errorInfo, context)
      }
    }
  }
}
```

### 6. Type Safety Issues

**Current State**: Event handling bypasses TypeScript:

```typescript
const handleMedicalCalculatorError = ((event: CustomEvent) => {
  const errorInfo = event.detail as ErrorInfo // Type assertion
  // ...
}) as /* eslint-disable-line no-undef */ EventListener // Type casting
```

**Problems**:
- TypeScript safety bypassed
- Runtime type errors possible
- No compile-time validation
- ESLint rules disabled

**Recommended Solution**: Type-safe event handling:

```typescript
interface TypeSafeEventHandler<T = unknown> {
  (event: CustomEvent<T>): void
}

class TypeSafeEventManager {
  addEventListener<T>(
    type: string,
    handler: TypeSafeEventHandler<T>,
    options?: AddEventListenerOptions
  ): () => void {
    const wrappedHandler = (event: Event) => {
      if (event instanceof CustomEvent) {
        handler(event as CustomEvent<T>)
      }
    }
    
    window.addEventListener(type, wrappedHandler, options)
    
    // Return cleanup function
    return () => window.removeEventListener(type, wrappedHandler, options)
  }
}
```

## Recommended Design Patterns Implementation

### 1. Command Pattern for Recovery Operations

```typescript
interface RecoveryCommand {
  execute(): Promise<RecoveryResult>
  canExecute(): boolean
  getDescription(): string
}

class NetworkRecoveryCommand implements RecoveryCommand {
  constructor(
    private errorInfo: ErrorInfo,
    private context: ErrorContext
  ) {}
  
  canExecute(): boolean {
    return this.errorInfo.errorType === ErrorType.NETWORK
  }
  
  async execute(): Promise<RecoveryResult> {
    // Network recovery implementation
  }
  
  getDescription(): string {
    return "Attempting network recovery with exponential backoff"
  }
}

class RecoveryCommandInvoker {
  private commands: RecoveryCommand[] = []
  
  addCommand(command: RecoveryCommand): void {
    if (command.canExecute()) {
      this.commands.push(command)
    }
  }
  
  async executeAll(): Promise<RecoveryResult[]> {
    return Promise.all(this.commands.map(cmd => cmd.execute()))
  }
}
```

### 2. Factory Pattern for Error Handler Creation

```typescript
interface ErrorHandlerFactory {
  createErrorHandler(type: ErrorType): ErrorHandler
  createRecoveryStrategy(type: ErrorType): ErrorRecoveryStrategy
  createNotificationService(): NotificationService
}

class MedicalCalculatorErrorHandlerFactory implements ErrorHandlerFactory {
  createErrorHandler(type: ErrorType): ErrorHandler {
    switch (type) {
      case ErrorType.NETWORK:
        return new NetworkErrorHandler()
      case ErrorType.VALIDATION:
        return new ValidationErrorHandler()
      case ErrorType.CALCULATION:
        return new CalculationErrorHandler()
      default:
        return new DefaultErrorHandler()
    }
  }
  
  createRecoveryStrategy(type: ErrorType): ErrorRecoveryStrategy {
    // Factory method for recovery strategies
  }
  
  createNotificationService(): NotificationService {
    return new PrimeVueNotificationService()
  }
}
```

### 3. Mediator Pattern for Component Coordination

```typescript
interface ErrorHandlingMediator {
  handleError(error: Error, context: ErrorContext): Promise<void>
  notifyRecovery(errorInfo: ErrorInfo): void
  notifyFailure(errorInfo: ErrorInfo): void
}

class ErrorHandlingCoordinator implements ErrorHandlingMediator {
  constructor(
    private errorState: ErrorStateManager,
    private notifications: NotificationService,
    private recovery: RecoveryManager,
    private events: EventManager
  ) {}
  
  async handleError(error: Error, context: ErrorContext): Promise<void> {
    // Coordinate between all components
    const errorInfo = ErrorProcessor.createErrorInfo(error, context)
    
    // Update state
    this.errorState.addError(errorInfo)
    
    // Show notification
    this.notifications.showError(errorInfo)
    
    // Attempt recovery if applicable
    if (errorInfo.recoverable) {
      const result = await this.recovery.attemptRecovery(errorInfo, context)
      
      if (result.success) {
        this.notifyRecovery(errorInfo)
      } else {
        this.notifyFailure(errorInfo)
      }
    }
    
    // Emit events for other components
    this.events.emit('error:handled', errorInfo)
  }
}
```

## Proposed Refactored Architecture

### Core Composables Structure

```
src/composables/error-handling/
├── useErrorHandler.ts          # Main composable (orchestrator)
├── useErrorState.ts            # Error state management
├── useNetworkStatus.ts         # Network monitoring
├── useNotifications.ts         # Toast abstraction
├── useRetryManager.ts          # Retry logic
├── useEventManager.ts          # Event handling
├── strategies/
│   ├── NetworkErrorStrategy.ts
│   ├── ValidationErrorStrategy.ts
│   ├── CalculationErrorStrategy.ts
│   └── index.ts
├── services/
│   ├── ErrorProcessor.ts       # Shared error processing
│   ├── NotificationService.ts  # Notification abstraction
│   └── RecoveryManager.ts      # Recovery coordination
└── types/
    ├── ErrorTypes.ts
    ├── StrategyTypes.ts
    └── index.ts
```

### Main Composable (Orchestrator)

```typescript
export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  // Inject dependencies
  const errorState = useErrorState()
  const networkStatus = useNetworkStatus()
  const notifications = useNotifications(options.notificationService)
  const retryManager = useRetryManager(options.retryConfig)
  const eventManager = useEventManager()
  
  // Create mediator
  const coordinator = new ErrorHandlingCoordinator(
    errorState,
    notifications,
    retryManager,
    eventManager
  )
  
  // Simplified API
  const handleError = (error: Error, context?: ErrorContext) => {
    return coordinator.handleError(error, context)
  }
  
  return {
    // State (readonly)
    errors: errorState.errors,
    hasErrors: errorState.hasErrors,
    isOnline: networkStatus.isOnline,
    
    // Methods
    handleError,
    clearErrors: errorState.clearErrors,
    showSuccess: notifications.showSuccess,
    showInfo: notifications.showInfo,
    showWarning: notifications.showWarning,
    
    // Utilities
    categorizeError: ErrorProcessor.categorizeError,
    isRecoverable: ErrorProcessor.isRecoverable
  }
}
```

## Implementation Plan

### Phase 1: Extract Network and Notification Composables (Week 1)
1. Create `useNetworkStatus` composable
2. Create `useNotifications` composable
3. Update `useErrorHandler` to use new composables
4. Maintain backward compatibility
5. Add unit tests for new composables

### Phase 2: Implement Strategy Pattern (Week 2)
1. Create strategy interfaces
2. Implement concrete error recovery strategies
3. Create recovery manager
4. Replace if/else chains in error handling
5. Add strategy factory

### Phase 3: Event Management Refactor (Week 3)
1. Create type-safe event manager
2. Replace direct DOM event handling
3. Implement automatic cleanup
4. Add event bus for component communication
5. Update all event consumers

### Phase 4: State Management Consolidation (Week 4)
1. Create `useErrorState` composable
2. Consolidate duplicate logic between components
3. Implement proper error lifecycle management
4. Add state persistence if needed
5. Update error boundary integration

### Phase 5: Testing and Documentation (Week 5)
1. Add comprehensive unit tests for all composables
2. Add integration tests for error scenarios
3. Create performance tests for error handling
4. Update documentation with new architecture
5. Create migration guide for existing code

## Benefits of Refactoring

### Improved Testability
- Smaller, focused composables are easier to unit test
- Dependency injection enables easy mocking
- Strategy pattern allows testing individual recovery strategies
- Event management can be tested in isolation

### Enhanced Maintainability
- Single responsibility principle makes code easier to understand
- Strategy pattern makes adding new error types simple
- Dependency injection reduces coupling
- Clear separation of concerns

### Better Type Safety
- Type-safe event handling prevents runtime errors
- Proper interfaces ensure compile-time validation
- Strategy pattern with interfaces prevents implementation errors
- Generic types provide better IntelliSense

### Increased Reusability
- Individual composables can be used independently
- Strategies can be reused across different components
- Notification service can be swapped for different UI libraries
- Network status monitoring can be used anywhere

### Performance Improvements
- Lazy loading of error strategies
- Reduced bundle size through tree shaking
- Optimized event handling with automatic cleanup
- Configurable error processing pipeline

## Migration Strategy

### Backward Compatibility
Maintain existing API while gradually introducing new architecture:

```typescript
// Current API still works
const { handleError, showSuccess, hasErrors } = useErrorHandler()

// New options available
const { handleError, showSuccess, hasErrors } = useErrorHandler({
  strategies: [new CustomErrorStrategy()],
  notificationService: new CustomNotificationService(),
  eventManager: new CustomEventManager()
})
```

### Gradual Migration Steps
1. **Phase 1**: Extract composables without breaking changes
2. **Phase 2**: Add new strategy system alongside existing logic
3. **Phase 3**: Gradually replace old logic with new patterns
4. **Phase 4**: Remove deprecated code after migration period
5. **Phase 5**: Optimize and add advanced features

## Conclusion

The current `useErrorHandler.ts` implementation violates multiple design principles and contains architectural issues that impact maintainability, testability, and extensibility. The proposed refactoring plan addresses these issues by:

1. **Applying SOLID Principles**: Single responsibility, dependency injection, strategy pattern
2. **Implementing Proper Design Patterns**: Observer, Strategy, Command, Factory, Mediator
3. **Improving Type Safety**: Proper TypeScript usage, type-safe events
4. **Enhancing Testability**: Smaller composables, dependency injection, mocking
5. **Increasing Maintainability**: Clear separation of concerns, documented interfaces

This refactoring will result in a more robust, maintainable, and extensible error handling system that follows Vue 3 best practices and modern software architecture principles.