# Error Handling System Architecture Diagram

## Overview

This diagram illustrates the comprehensive error handling system in the Vue.js medical calculator application. The system follows a centralized orchestration pattern with strategy-based recovery mechanisms and event-driven communication.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ERROR HANDLING SYSTEM                                │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    PRESENTATION LAYER                                │   │
│  │                                                                     │   │
│  │  ┌─────────────────┐     ┌─────────────────┐     ┌───────────────┐ │   │
│  │  │  Vue Components │     │  Error Boundary │     │  PrimeVue     │ │   │
│  │  │  (Medical Calc) │────▶│   Components    │────▶│   Toast       │ │   │
│  │  │                 │     │                 │     │ Notifications │ │   │
│  │  └─────────────────┘     └─────────────────┘     └───────────────┘ │   │
│  │           │                        │                       ▲       │   │
│  └───────────┼────────────────────────┼───────────────────────┼───────┘   │
│              │                        │                       │           │
│              ▼                        ▼                       │           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    ORCHESTRATION LAYER                              │   │
│  │                                                                     │   │
│  │  ┌─────────────────────────────────────────────────────────────┐   │   │
│  │  │                   useErrorHandler                           │   │   │
│  │  │                  (Central Orchestrator)                    │   │   │
│  │  │                                                            │   │   │
│  │  │  • Error Detection & Categorization                       │   │   │
│  │  │  • Recovery Coordination                                  │   │   │
│  │  │  • Retry Logic (Max 3 attempts)                          │   │   │
│  │  │  • State Management                                       │   │   │
│  │  │  • Event Coordination                                     │   │   │
│  │  │  • Notification Dispatch                                  │   │   │
│  │  └─────────────────────────────────────────────────────────────┘   │   │
│  │                                    │                               │   │
│  └────────────────────────────────────┼───────────────────────────────┘   │
│                                       │                                   │
│                                       ▼                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      SERVICE LAYER                                  │   │
│  │                                                                     │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │   │
│  │  │ errorBoundary   │  │ RecoveryManager │  │   useErrorState │    │   │
│  │  │    Manager      │  │                 │  │                 │    │   │
│  │  │                 │  │  ┌───────────┐  │  │  ┌───────────┐  │    │   │
│  │  │ • Categorize    │  │  │  Network  │  │  │  │  Errors   │  │    │   │
│  │  │ • User Messages │  │  │ Strategy  │  │  │  │   Array   │  │    │   │
│  │  │ • Error Boundaries│ │  └───────────┘  │  │  └───────────┘  │    │   │
│  │  │ • Global Handler││  │  ┌───────────┐  │  │  ┌───────────┐  │    │   │
│  │  │                 │  │  │Validation │  │  │  │ Computed  │  │    │   │
│  │  │ 7 Error Types:  │  │  │ Strategy  │  │  │  │ Filtered  │  │    │   │
│  │  │ • Network       │  │  └───────────┘  │  │  │  Errors   │  │    │   │
│  │  │ • Validation    │  │  ┌───────────┐  │  │  └───────────┘  │    │   │
│  │  │ • Calculation   │  │  │Calculation│  │  │                 │    │   │
│  │  │ • UI            │  │  │ Strategy  │  │  │                 │    │   │
│  │  │ • Security      │  │  └───────────┘  │  │                 │    │   │
│  │  │ • Data          │  │                 │  │                 │    │   │
│  │  │ • Unknown       │  │                 │  │                 │    │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │   │
│  │                                                                     │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │   │
│  │  │useNotifications │  │ useNetworkStatus│  │  useEventManager│    │   │
│  │  │                 │  │                 │  │                 │    │   │
│  │  │ • Toast Messages│  │ • Online/Offline│  │ • Type-safe     │    │   │
│  │  │ • Severity Map  │  │ • Reactive State│  │   Events        │    │   │
│  │  │ • Auto-dismiss  │  │ • Navigator API │  │ • Pub/Sub       │    │   │
│  │  │ • Danish Locale │  │                 │  │ • Cleanup       │    │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                       │                                   │
│                                       ▼                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      UTILITY LAYER                                  │   │
│  │                                                                     │   │
│  │  ┌─────────────────┐               ┌─────────────────┐             │   │
│  │  │  ErrorFactory   │               │  Event Types    │             │   │
│  │  │                 │               │                 │             │   │
│  │  │ • Create Error  │               │ • network:*     │             │   │
│  │  │   Info Objects  │               │ • error:*       │             │   │
│  │  │ • Generate Keys │               │ • notification:*│             │   │
│  │  │ • Standardize   │               │                 │             │   │
│  │  │   Error Data    │               │                 │             │   │
│  │  └─────────────────┘               └─────────────────┘             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Error Flow Diagram

```mermaid
flowchart TD
    A[Error Occurs] --> B{Error Source}
    B -->|Vue Component| C[Global Error Handler]
    B -->|Promise Rejection| D[Unhandled Promise Handler]
    B -->|Manual Report| E[useErrorHandler.handleError]
    
    C --> F[errorBoundaryManager.categorizeError]
    D --> F
    E --> F
    
    F --> G{Error Type}
    G -->|Network| H[Network Error Type]
    G -->|Validation| I[Validation Error Type]
    G -->|Calculation| J[Calculation Error Type]
    G -->|UI| K[UI Error Type]
    G -->|Security| L[Security Error Type]
    G -->|Data| M[Data Error Type]
    G -->|Unknown| N[Unknown Error Type]
    
    H --> O[ErrorFactory.createErrorInfo]
    I --> O
    J --> O
    K --> O
    L --> O
    M --> O
    N --> O
    
    O --> P[useErrorState.addError]
    P --> Q[Show Notification]
    Q --> R{Recoverable?}
    
    R -->|Yes| S{Auto-Retry Enabled?}
    R -->|No| T[Log Error]
    
    S -->|Yes| U{Max Retries Reached?}
    S -->|No| V[Manual Recovery]
    
    U -->|No| W[RecoveryManager.attemptRecovery]
    U -->|Yes| X[Stop Retry]
    
    W --> Y{Recovery Strategy}
    Y -->|Network| Z[NetworkErrorStrategy]
    Y -->|Validation| AA[ValidationErrorStrategy]
    Y -->|Calculation| BB[CalculationErrorStrategy]
    
    Z --> CC{Recovery Success?}
    AA --> DD[Require User Input]
    BB --> EE[No Auto Recovery]
    
    CC -->|Yes| FF[Clear Error]
    CC -->|No| GG[Increment Retry Count]
    
    GG --> U
    FF --> HH[Show Success]
    DD --> II[Show Validation UI]
    EE --> T
    V --> JJ[User Action Required]
    T --> KK[Error Logged]
    X --> LL[Max Retries Exceeded]
```

## Recovery Strategy Pattern

```mermaid
classDiagram
    class RecoveryManager {
        -strategies: ErrorRecoveryStrategy[]
        +attemptRecovery(errorInfo, context) Promise~RecoveryResult~
        +findStrategy(errorInfo) ErrorRecoveryStrategy
    }
    
    class ErrorRecoveryStrategy {
        <<interface>>
        +canRecover(errorInfo) boolean
        +recover(errorInfo, context) Promise~RecoveryResult~
        +getRetryDelay(attempt) number
    }
    
    class NetworkErrorStrategy {
        +canRecover(errorInfo) boolean
        +recover(errorInfo, context) Promise~RecoveryResult~
        +getRetryDelay(attempt) number
        -waitForNetwork() Promise~void~
    }
    
    class ValidationErrorStrategy {
        +canRecover(errorInfo) boolean
        +recover(errorInfo, context) Promise~RecoveryResult~
        +getRetryDelay(attempt) number
        -requiresUserInput() boolean
    }
    
    class CalculationErrorStrategy {
        +canRecover(errorInfo) boolean
        +recover(errorInfo, context) Promise~RecoveryResult~
        +getRetryDelay(attempt) number
        -logError(errorInfo) void
    }
    
    class RecoveryResult {
        +success: boolean
        +shouldRetry: boolean
        +requiresUserInput: boolean
    }
    
    RecoveryManager --> ErrorRecoveryStrategy
    ErrorRecoveryStrategy <|-- NetworkErrorStrategy
    ErrorRecoveryStrategy <|-- ValidationErrorStrategy
    ErrorRecoveryStrategy <|-- CalculationErrorStrategy
    ErrorRecoveryStrategy --> RecoveryResult
```

## Event System Architecture

```mermaid
sequenceDiagram
    participant C as Vue Component
    participant EH as useErrorHandler
    participant EM as EventManager
    participant NS as NetworkStatus
    participant N as Notifications
    participant RS as RecoveryStrategy
    
    C->>EH: Error occurs
    EH->>EH: Categorize error
    EH->>EH: Add to state
    EH->>N: Show notification
    
    alt Recoverable Error
        EH->>RS: Attempt recovery
        RS->>RS: Execute strategy
        
        alt Network Error
            RS->>NS: Check network status
            NS-->>RS: Network state
            RS->>EM: Emit network event
            EM->>EH: Network status changed
            EH->>EH: Retry recovery
        end
        
        alt Recovery Success
            RS-->>EH: Success result
            EH->>EM: Emit recovery event
            EM->>N: Show success notification
            EH->>EH: Clear error
        else Recovery Failed
            RS-->>EH: Failure result
            EH->>EH: Increment retry count
            EH->>EH: Check max retries
        end
    end
```

## Key Components

- **useErrorHandler**: Central orchestrator managing the entire error lifecycle
- **errorBoundaryManager**: Categorizes errors and provides Vue.js error boundaries
- **RecoveryManager**: Coordinates recovery strategies using the Strategy pattern
- **useErrorState**: Centralized reactive state management for all errors
- **useNetworkStatus**: Monitors network connectivity for recovery decisions
- **useNotifications**: Handles user-facing error communication via PrimeVue Toast
- **useEventManager**: Type-safe event system for loose coupling between components
- **ErrorFactory**: Standardizes error object creation and key generation

## Error Type Categories

1. **Network Errors**: Connection issues, timeouts, fetch failures
2. **Validation Errors**: Form validation, input validation failures
3. **Calculation Errors**: Medical scoring calculation errors
4. **UI Errors**: Vue component rendering errors
5. **Security Errors**: Authentication and authorization failures
6. **Data Errors**: Data parsing and serialization issues
7. **Unknown Errors**: Unclassified errors requiring investigation

## Recovery Strategies

- **NetworkErrorStrategy**: Implements exponential backoff (1s → 2s → 4s → 8s → 10s max)
- **ValidationErrorStrategy**: Requires user input, no automatic recovery
- **CalculationErrorStrategy**: No automatic recovery, logs for debugging

## System Features

- **Automatic Recovery**: Intelligent retry mechanisms for recoverable errors
- **Type Safety**: Full TypeScript support with strong typing
- **Localization**: Danish error messages for medical domain
- **Event-Driven**: Loose coupling via type-safe event system
- **Vue Integration**: Proper lifecycle management and reactivity
- **Medical Domain**: Specialized handling for medical calculator errors
- **State Management**: Centralized error state with reactive updates
- **User Experience**: Appropriate notifications and recovery feedback

This architecture provides a robust, scalable, and maintainable error handling system specifically designed for medical calculator applications, with emphasis on user experience and system reliability.