# Refactoring Risk Analysis and Mitigation Plan

This document outlines the potential risks of refactoring `AuditScore.vue` to use the `useCalculatorFramework` and provides strategies to mitigate them. While the refactoring offers significant long-term benefits, it's crucial to manage the transition carefully to avoid introducing bugs or regressions.

---

#### **1. Functional Regressions**

These are the most critical risks, as they could impact the correctness of the calculator and the data sent to the backend.

*   **Risk 1.1: Calculation Logic Divergence**
    *   **Description**: The manual calculation logic inside `AuditScore.vue` might have subtle differences from the new, centralized logic that will be created in `src/calculators/audit/index.ts`. Even a small change could lead to a different final score or interpretation for the same set of answers.
    *   **Impact**: **High**. Incorrect medical scores could lead to improper clinical assessments.
    *   **Mitigation Strategy**:
        1.  **Create a "Golden" Test Suite**: Before refactoring, create a dedicated unit test file (e.g., `tests/unit/audit-calculation.test.ts`).
        2.  **Test the Old Logic**: In this file, write tests that call the *original* `calculateResults` function from `AuditScore.vue` with a wide range of inputs and assert the exact expected score and conclusion (`"Tegn på alkoholafhængighed"`, etc.). Cover all edge cases (score of 7, 8, 0, max score).
        3.  **Test the New Logic**: As you create the new `src/calculators/audit/index.ts` module, run the *exact same test suite* against it.
        4.  **Guarantee Equivalence**: The refactoring is only considered safe when the new, extracted logic passes the golden test suite identically to the old logic.

*   **Risk 1.2: Data Payload Incompatibility**
    *   **Description**: The `useCalculatorFramework` formats the data payload for the server automatically. This format may differ from the one created by the manual `generatePayload` function in the original `AuditScore.vue`.
    *   **Impact**: **High**. If the backend API does not receive the data in the expected format, all AUDIT score submissions from the refactored component will fail, resulting in data loss.
    *   **Mitigation Strategy**:
        1.  **Analyze and Compare**: Before starting, log the output of the original `generatePayload()` function and the output of the `useCalculatorFramework`'s submission data. Document the differences in structure, field names, and data types.
        2.  **Backend Coordination (If Necessary)**: If the formats are different, a decision must be made. The ideal long-term solution is to update the backend to accept the new, standardized format from the framework. If this is not feasible, the framework's submission logic can be slightly adapted (e.g., with a "transformer" function) to match the old format for this specific calculator.
        3.  **End-to-End Testing**: In a development or staging environment, perform a full end-to-end test to confirm that the data from the refactored component is successfully received and processed by the backend.

---

#### **2. Technical and Implementation Risks**

These risks relate to the development process and the integrity of the codebase.

*   **Risk 2.1: Incomplete or Incorrect Validation**
    *   **Description**: The new Zod schema might not perfectly replicate all validation rules, especially implicit ones, from the original component (e.g., patient info validation that was tied into the `validateQuestionsEnhanced` function).
    *   **Impact**: **Medium**. Could allow invalid data to be submitted or block valid data, leading to user frustration and data quality issues.
    *   **Mitigation Strategy**:
        1.  **Thorough Schema Review**: Carefully review the `validateQuestionsEnhanced` and `validateQuestions` functions in the original component.
        2.  **Enhance the Zod Schema**: Ensure the `AuditSchema` and `PatientPsychologySchema` in `src/schemas/` include all checks that were previously done manually (e.g., required fields for patient name, age ranges).
        3.  **Test Validation Logic**: Write specific unit tests for the Zod schema itself to ensure it correctly accepts valid data and rejects invalid data, mirroring the old component's behavior.

*   **Risk 2.2: Loss of Subtle UI Behavior**
    *   **Description**: The original component might have subtle UI behaviors (e.g., how and when the "Copy" button is enabled, the exact text of a validation message) that are overlooked during the refactoring.
    *   **Impact**: **Low**. Primarily affects user experience, not core functionality.
    *   **Mitigation Strategy**:
        1.  **Side-by-Side Comparison**: Before finalizing the refactoring, run the original application and the refactored version in a browser side-by-side.
        2.  **Manual UI Testing**: Click through every possible user interaction on both versions: fill out the form, trigger validation errors, reset the form, successfully submit, etc. Ensure the visual feedback and component states are identical.

---

#### **3. Testing and Verification Risks**

This category covers the risk of not being able to adequately verify the success of the refactoring.

*   **Risk 3.1: Existing Component Tests Will Break**
    *   **Description**: The existing test file, `tests/components/AuditScore.test.ts`, is tightly coupled to the old implementation (mocking manual composables, checking local refs). It will fail completely and require a full rewrite.
    *   **Impact**: **Medium**. Without a valid test suite, there is no automated way to prevent future regressions for this component.
    *   **Mitigation Strategy**:
        1.  **Acknowledge and Plan**: Accept that the test suite must be rewritten. This is a feature, not a bug, of the refactoring process.
        2.  **New Testing Approach**: The new tests will be simpler. They will focus on:
            *   Providing mock state from a "mocked" `useCalculatorFramework`.
            *   Asserting that the component renders the correct data from the framework's state (`props` are passed correctly to child components).
            *   Verifying that user actions (like `@click`) correctly call methods on the framework (e.g., `framework.submitCalculation`).
        3.  **Budget Time**: Allocate specific time for the test rewrite as part of the refactoring task.

*   **Risk 3.2: Unsafe Development Process**
    *   **Description**: Making such significant changes directly on the main development branch could destabilize the application for other developers.
    *   **Impact**: **High**. Could block other development work and introduce broken code into the main branch.
    *   **Mitigation Strategy**:
        1.  **Use a Feature Branch**: All refactoring work must be done on a dedicated Git branch (e.g., `refactor/audit-score-to-framework`).
        2.  **Draft Pull Request**: Open a "Draft" Pull Request early in the process. This allows for continuous integration checks and visibility for other team members without signaling it's ready for review.
        3.  **Thorough Code Review**: Once all tests are passing and manual verification is complete, the Pull Request should be thoroughly reviewed by at least one other developer before merging.

By systematically addressing these risks, the refactoring of `AuditScore.vue` can be executed with a high degree of confidence, leading to a more robust and maintainable application.
