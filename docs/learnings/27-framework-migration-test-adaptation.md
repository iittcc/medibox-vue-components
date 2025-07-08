# Learning #27: Framework Migration Test Adaptation

## Issue
When migrating a Vue component from direct refs to the calculator framework pattern, existing tests break because they expect direct component properties and methods that no longer exist after framework integration.

## Context
During PUQE framework migration, 26 component tests failed because they were testing:
- Direct component properties like `component.name`, `component.age`, `component.totalScore`
- Component methods like `component.calculateResults()`, `component.resetQuestions()`
- Internal component state that was replaced by framework state

## Root Cause
Tests were tightly coupled to the old implementation details rather than testing behavior through the component's public interface.

## Solution Applied
1. **Mock the Framework**: Created comprehensive framework mock with proper reactive refs
2. **Test Integration Points**: Focus on testing how component integrates with framework
3. **Use Component Interface**: Test through events, props, and rendered output rather than internal state
4. **Update Test Patterns**: Adapt tests to match new framework-based architecture

## Code Example
```typescript
// Before (testing internal state)
expect(component.totalScore).toBe(8)
expect(component.conclusion).toBe('Moderate nausea')

// After (testing framework integration)
mockResult.value = { score: 8, interpretation: 'Moderate nausea' }
await wrapper.vm.$nextTick()
expect(wrapper.text()).toContain('PUQE Score 8 : Moderate nausea')
```

## Prevention Strategy
- Design tests to be resilient to implementation changes
- Focus on testing behavior over implementation details
- Mock external dependencies (like framework) consistently
- Use data-testid attributes for stable element selection

## Impact
- All 26 tests successfully adapted to new framework pattern
- Tests now verify correct framework integration
- More robust test suite that survives architectural changes

## Tags
`testing`, `framework-migration`, `vue3`, `mocking`, `test-adaptation`