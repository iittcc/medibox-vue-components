# Refactoring Plan: Unifying Calculator Logic

**1. Executive Summary**

The core recommendation is to refactor the `AuditScore.vue` component to use the centralized `useCalculatorFramework` composable. Currently, this component manually implements its own state management, validation, and submission logic, which is redundant with the framework used by most other calculators in the project. This refactoring will simplify the `AuditScore` component, improve code consistency across the application, and enhance long-term maintainability.

**2. Problem Statement**

The `AuditScore.vue` component is an outlier in the current architecture. It bypasses the `useCalculatorFramework` and duplicates logic for:

*   **State Management**: Manually creates and manages reactive variables (`ref`) for patient data, answers, scores, and UI state (`isSubmitting`, `formSubmitted`).
*   **Validation**: Implements its own validation logic (`validateQuestionsEnhanced`) instead of leveraging the framework's Zod-based schema validation.
*   **Submission Flow**: Contains a custom `handleSubmit` function that manually calls `sendDataToServer`.
*   **Logging & Error Handling**: Directly calls `useLogging` and `useErrorHandler`, which is already encapsulated within the framework.

This leads to code inconsistency, increased maintenance overhead (bug fixes need to be applied in multiple places), and a less feature-rich experience for this specific calculator (it lacks the framework's step-by-step flow, progress indicators, etc.).

**3. Proposed Solution**

The solution is to refactor `AuditScore.vue` to be a "client" of the `useCalculatorFramework`, just like the other modern calculators. This involves the following key changes:

1.  **Integrate `useCalculatorFramework`**: Initialize the framework at the top of the component's `<script setup>`.
2.  **Define Configuration**: Create a `config` object for the AUDIT calculator, specifying its `type`, `name`, `category`, etc.
3.  **Define Steps**: Create a `steps` array to define the flow (e.g., a step for patient info, a step for the questionnaire).
4.  **Replace Manual State**: Remove the numerous local `ref`s for patient data and answers. Instead, use the `patientData`, `calculatorData`, and `result` objects provided by the framework.
5.  **Replace Manual Validation**: Remove the custom validation functions. The framework will handle this automatically via the Zod schemas.
6.  **Replace Manual Submission**: Replace the complex `handleSubmit` function with a simple call to the framework's `nextStep()` or `submitCalculation()` method.
7.  **Simplify the Template**: The template can be simplified to react to the framework's state (e.g., `state.isSubmitting`, `state.isComplete`).

**4. Benefits**

*   **Code Simplification**: The `AuditScore.vue` component will shrink dramatically, becoming mostly declarative UI code with minimal business logic.
*   **Consistency**: The AUDIT calculator will look, feel, and behave exactly like all other calculators.
*   **Maintainability**: Any future improvements or bug fixes to the core framework (e.g., improved error handling, new export formats) will automatically apply to the AUDIT calculator.
*   **Reduced Bugs**: Eliminates a source of potential bugs by removing duplicated and potentially divergent logic.
*   **New Features**: The AUDIT calculator will automatically gain features from the framework, such as multi-step navigation and progress tracking, if desired in the future.
