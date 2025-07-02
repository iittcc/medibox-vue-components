# Development Learnings Index

This directory contains documented learnings from real development challenges encountered during the Score2 medical calculator implementation. Each learning document provides detailed analysis, solutions, and prevention strategies for common issues.

## Top 5 Implementation Challenges

### 1. [Vue 3 Property Binding with Undefined Variables](./1-vue3-property-binding-undefined-variables.md)
**Issue**: Components using `:prop="variableName"` where `variableName` is undefined
- **Impact**: Vue warnings, test failures, component rendering issues
- **Solution**: Use string literals or properly declare variables
- **Prevention**: ESLint rules, TypeScript strict mode, code review checklists

### 2. [Vue 3 Mock Component Event Handling](./2-vue3-mock-component-event-handling.md)
**Issue**: Mock components not properly emitting events in Vue Test Utils
- **Impact**: Form interaction tests failing, unreliable event testing
- **Solution**: Updated mock structure with `setup()` function and proper emit handling
- **Prevention**: Vue 3 specific mock templates, component-based selectors

### 3. [Test Expectations vs Component Behavior Mismatch](./3-test-expectations-vs-component-behavior.md)
**Issue**: Hardcoded test expectations not matching actual component calculations
- **Impact**: High test failure rate, false assumptions about business logic
- **Solution**: Component-first analysis, relationship testing, reactive behavior understanding
- **Prevention**: Read implementation before testing, validate business logic independently

### 4. [Vue 3 Composition API Method Spying Challenges](./4-vue3-composition-api-method-spying.md)
**Issue**: Traditional method spying doesn't work with Vue 3 Composition API
- **Impact**: Reactive behavior tests failing, unreliable spy setup
- **Solution**: State-based testing instead of method spying, behavior verification
- **Prevention**: Test outputs not implementation, use direct method calls

### 5. [Medical Domain Testing Complexity](./5-medical-domain-testing-complexity.md)
**Issue**: Balancing comprehensive medical logic testing with maintainable code
- **Impact**: Test complexity explosion, domain knowledge requirements
- **Solution**: Structured medical testing framework, clinical scenario patterns
- **Prevention**: Medical domain architecture, regulatory compliance patterns

## Learning Categories

### Technical Framework Issues
- Vue 3 property binding (Learning #1)
- Mock component setup (Learning #2)
- Composition API testing (Learning #4)

### Testing Methodology Issues
- Test expectations alignment (Learning #3)
- Medical domain complexity (Learning #5)

### Domain-Specific Challenges
- Medical calculation accuracy (Learning #5)
- Clinical threshold testing (Learning #5)
- Patient safety validation (Learning #5)

## Common Patterns Across Learnings

### 1. Framework Evolution Challenges
Multiple issues stemmed from Vue 2 → Vue 3 migration patterns:
- Property binding syntax changes
- Event handling differences
- Composition API vs Options API testing
- Reactivity system changes

### 2. Mock vs Reality Gaps
Several issues involved differences between mocked and real behavior:
- Mock component event emission
- Test expectations vs actual calculations
- Method spying vs real method calls

### 3. Domain Complexity Management
Medical domain brought unique challenges:
- Clinical accuracy requirements
- Multi-dimensional validation logic
- Patient safety considerations
- Regulatory compliance needs

## Implementation Time Analysis

| Issue | Initial Time Lost | Resolution Time | Prevention Value |
|-------|------------------|-----------------|------------------|
| Undefined Variables | 2+ hours | 15 minutes | High |
| Mock Event Handling | 3+ hours | 1 hour | High |
| Test Expectations | 4+ hours | 2 hours | Very High |
| Method Spying | 2+ hours | 1 hour | Medium |
| Medical Complexity | Ongoing | 3+ hours | Very High |

**Total Time Impact**: 11+ hours of debugging → 7+ hours of solution development

## Key Success Factors

### 1. Component-First Analysis
- Read actual implementation before writing tests
- Understand reactive dependencies and watchers
- Map component lifecycle and calculation flows

### 2. Framework-Specific Patterns
- Use Vue 3 specific testing approaches
- Leverage Composition API strengths
- Work with reactivity system, not against it

### 3. Domain-Driven Testing
- Structure tests around medical scenarios
- Validate against clinical guidelines
- Prioritize patient safety over test convenience

### 4. Iterative Validation
- Test at multiple levels (unit, integration, end-to-end)
- Cross-validate results against independent calculations
- Use real-world patient scenarios

## Best Practices Summary

### DO:
- ✅ Read component implementation before testing
- ✅ Use string literals for static props
- ✅ Test component state changes over method calls
- ✅ Structure medical tests around clinical scenarios
- ✅ Validate against published medical guidelines

### DON'T:
- ❌ Assume component behavior without verification
- ❌ Use property binding for static values
- ❌ Rely on method spying in Vue 3 Composition API
- ❌ Test arbitrary values without clinical context
- ❌ Ignore medical domain requirements

## Future Prevention Strategies

### 1. Development Workflow
- Component-first test development methodology
- Medical domain validation checkpoints
- Vue 3 specific code review guidelines

### 2. Tooling Improvements
- ESLint rules for Vue 3 best practices
- Medical calculation validation utilities
- Automated clinical threshold testing

### 3. Knowledge Sharing
- Medical domain training for developers
- Vue 3 testing pattern documentation
- Regular review of common failure patterns

## References

### Technical Documentation
- [Vue 3 Testing Guide](https://vuejs.org/guide/scaling-up/testing.html)
- [Vue Test Utils v2](https://test-utils.vuejs.org/)
- [Vitest Documentation](https://vitest.dev/)

### Medical Standards
- [European Society of Cardiology Guidelines](https://www.escardio.org/Guidelines)
- [Medical Device Software Standards](https://www.iso.org/standard/54928.html)

### Testing Methodology
- [Testing Library Principles](https://testing-library.com/docs/guiding-principles/)
- [Component Testing Best Practices](../vue-component-testing-lessons-learned.md)

---

*These learnings document real implementation challenges to help future developers avoid similar pitfalls and understand the nuances of Vue 3 testing in medical applications.*