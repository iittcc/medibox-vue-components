# `useCalculatorFramework` Interaction Flow

This diagram shows the sequence of events and state changes within the `useCalculatorFramework` when a user interacts with a calculator.

```mermaid
graph TD
    subgraph "Setup Phase"
        A[Component calls useCalculatorFramework(config)] --> B{Composable Initialized};
        B --> C[Logging, Error Handling, Validation services are set up];
        B --> D[Reactive state created: currentStep, isComplete, etc.];
        C & D --> E[Component calls initializeSteps(steps)];
        E --> F[State updated: totalSteps, currentStep = 0];
    end

    subgraph "User Interaction Cycle"
        F --> G{Render current step};
        G --> H[User inputs data];
        H --> I[updatePatientData / updateCalculatorData called];
        I --> J{Data validated against Zod schema};
        J -- Valid --> K[canProceed = true];
        J -- Invalid --> L[canProceed = false];
    end

    subgraph "Navigation"
        K --> M{User clicks "Next"};
        M --> N{isLastStep?};
        N -- No --> O[currentStep++];
        O --> G;
        N -- Yes --> P[submitCalculation()];

        G --> Q{User clicks "Back"};
        Q --> R{isFirstStep?};
        R -- No --> S[currentStep--];
        S --> G;
        R -- Yes --> G;
    end

    subgraph "Submission & Calculation"
        P --> T{Final Validation};
        T -- Fails --> U[Show Error, Stop];
        T -- Succeeds --> V[calculateScore(data)];
        V --> W{isCalculatorImplemented?};
        W -- Yes --> X[New System: calculateMedicalScore()];
        W -- No --> Y[Legacy System: Inline calculation];
        X & Y --> Z[Result stored in state];
        Z --> AA[sendDataToServer()];
        AA --> BB[state.isComplete = true];
        BB --> CC{End};
    end

    subgraph "Utilities"
        CC --> DD[exportResults()];
        CC --> EE[resetCalculator()];
    end
```

## Key Components & Flow

-   **Setup Phase**:
    1.  A calculator component (like `AuditScore.vue`) starts by calling `useCalculatorFramework()` with its specific configuration (`config`).
    2.  The composable initializes all its internal services: logging, error handling, and reactive validation handlers (`useFormValidation`).
    3.  The component then provides the specific steps for the calculator by calling `initializeSteps()`.

-   **User Interaction Cycle**:
    1.  The UI renders the view for the `currentStep`.
    2.  As the user enters data, `updatePatientData` or `updateCalculatorData` is called.
    3.  The `useValidation` composable automatically validates the incoming data against the relevant Zod schema in real-time.
    4.  The `canProceed` computed property becomes `true` only when the data for the current step is valid.

-   **Navigation**:
    1.  Clicking "Next" triggers `nextStep()`. If `canProceed` is true and it's not the last step, it simply increments `currentStep`.
    2.  If it *is* the last step, it triggers the submission process.
    3.  Clicking "Back" triggers `previousStep()`, which decrements `currentStep` unless it's already the first step.

-   **Submission & Calculation**:
    1.  `submitCalculation` is the final, critical step. It runs one last validation across all data.
    2.  It then calls `calculateScore`. A crucial check, `isCalculatorImplemented`, determines whether to use the new, modular calculation system (`src/calculators`) or fall back to the older, inline logic still present in the framework file.
    3.  After a successful calculation, the result is sent to the server via `sendDataToServer`.
    4.  Finally, the state is marked as `isComplete`.

-   **Utilities**:
    -   Once the calculation is complete, the user can `exportResults` in various formats or `resetCalculator` to start over.

## Architectural Notes

-   **Decoupling**: The framework is well-decoupled. The host component provides the `config` and `steps`, and the framework handles all the complex state management, validation, and lifecycle logic.
-   **Progressive Migration**: The `isCalculatorImplemented` check is a smart pattern that allows for the progressive migration of legacy calculation logic to the new, more maintainable modular system without breaking existing calculators.
-   **Reusability**: This single composable provides the entire backbone for a wide variety of different medical calculators, which is highly efficient.
