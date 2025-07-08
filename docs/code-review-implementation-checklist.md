# Implementation Code Review Checklist

> **Optimization Target**: Reduce debugging time by 70% through systematic upfront research and pattern-based implementation

## Overview
This checklist prevents the most expensive implementation issues identified in our learnings analysis. Follow the **Research → Plan → Implement** workflow to avoid reactive debugging cycles.

**Time Investment**: 15-20 minutes upfront saves 3.5+ hours of debugging

---

## Phase 1: Pre-Implementation Research (5-10 minutes)
> **Stop Point**: Do not proceed to implementation without completing this phase

### 🔍 Framework Pattern Verification
- [ ] **Vue 3 Reactivity Patterns** - Reviewed official Vue 3 documentation for specific feature being implemented
- [ ] **Composition API Usage** - Confirmed correct setup() pattern and reactivity handling
- [ ] **Working Example Analysis** - Found and analyzed similar working implementation in codebase
- [ ] **Framework Integration** - Verified PrimeVue service registration requirements if applicable

### 📚 Existing Code Pattern Analysis
- [ ] **Similar Components** - Identified and analyzed 2-3 similar components in codebase
- [ ] **Composable Patterns** - Reviewed existing composables for resource management patterns
- [ ] **Entry Point Templates** - Confirmed required entry point configuration pattern
- [ ] **Import Patterns** - Verified correct import statements and dependency structure

### 🏥 Medical Domain Validation
- [ ] **Clinical Guidelines** - Validated thresholds/calculations against official medical guidelines
- [ ] **Evidence-Based Criteria** - Confirmed implementation matches published clinical criteria
- [ ] **Patient Safety Considerations** - Identified edge cases with clinical significance
- [ ] **Validation Schema** - Ensured validation rules align with medical requirements

---

## Phase 2: Implementation Review (10-15 minutes)

### ⚡ Vue 3 Specific Patterns
- [ ] **Reactive Watching** - All `watch()` calls use getter functions: `() => object.property`
  - ❌ `watch(object.property, callback)` 
  - ✅ `watch(() => object.property, callback)`
- [ ] **Property Binding** - Template bindings use properly declared variables
  - ❌ `:prop="undefinedVariable"`
  - ✅ `:prop="declaredVariable"` or `prop="string literal"`
- [ ] **Composition API** - Setup function properly structured with reactive references
- [ ] **Event Handling** - Events properly emitted using `setup(props, { emit })` pattern

### 🔄 Resource Management Patterns
- [ ] **Cleanup Methods** - All composables have explicit cleanup methods
- [ ] **Lifecycle Management** - Resources created in setup are cleaned up in onUnmounted
- [ ] **Event Listeners** - All event listeners have corresponding removal logic
- [ ] **Timers/Intervals** - All timers properly cleared in cleanup
- [ ] **Singleton Resources** - Reference counting implemented for shared resources

### ⚙️ Configuration Consistency
- [ ] **Entry Point Template** - Matches established calculator entry point pattern
- [ ] **Service Registration** - Required services (Toast, etc.) properly registered
- [ ] **Environment Variables** - Graceful fallbacks for missing environment variables
- [ ] **Multi-Entry Consistency** - Configuration consistent across all entry points

### 🔐 Data Architecture
- [ ] **Single Source of Truth** - Clear data authority established (validation instance as source)
- [ ] **Circular Dependencies** - No circular event subscription patterns
- [ ] **State Synchronization** - Framework data, validation data, and component state aligned
- [ ] **Error Boundaries** - Proper error handling without infinite loops

---

## Phase 3: Pre-Commit Validation (5 minutes)

### 📋 Final Safety Checks
- [ ] **Type Safety** - All TypeScript types properly defined and used
- [ ] **Medical Accuracy** - Clinical calculations double-checked against source material
- [ ] **Resource Cleanup** - Manual verification of cleanup method execution
- [ ] **Configuration Validation** - Entry point configuration tested in isolation

### 🚨 Critical Failure Prevention
- [ ] **No Hardcoded Values** - Medical thresholds come from validated constants
- [ ] **No Global State Mutations** - All state changes through proper channels
- [ ] **No Memory Leaks** - All created resources have corresponding cleanup
- [ ] **No Silent Failures** - All error conditions properly handled and logged

---

## High-Impact Issue Prevention

### 🎯 Most Expensive Issues to Prevent (3.5+ hours each)
1. **Vue 3 Reactivity Misunderstandings** - Direct property access in watch()
2. **PrimeVue Integration Failures** - Missing service registration or component templates
3. **Medical Validation Mismatches** - Component values not matching clinical criteria
4. **Resource Cleanup Failures** - Hanging processes or memory leaks
5. **Configuration Inconsistencies** - Entry point template violations

### 📊 Success Metrics
- **Time Savings**: 70% reduction in debugging time
- **Quality Improvement**: 90% reduction in framework-related issues
- **Medical Accuracy**: 100% compliance with clinical guidelines
- **Resource Efficiency**: Zero hanging processes or memory leaks

---

## Common Anti-Patterns to Avoid

### ❌ Technical Anti-Patterns
- Using direct property access in Vue 3 watch statements
- Creating global resources without cleanup mechanisms
- Mixing real and mocked resources in same context
- Hardcoding medical thresholds without validation

### ❌ Architectural Anti-Patterns
- Multiple disconnected sources of truth for same data
- Circular event subscription patterns
- Environment-dependent core business logic
- Missing interface-implementation alignment

### ❌ Domain Anti-Patterns
- Arbitrary medical values without clinical basis
- Missing patient safety edge case handling
- Non-evidence-based validation criteria
- Ignoring clinical workflow requirements

---

## Quick Reference Commands

```bash
# Type checking and linting
npm run type-check
npm run lint

# Pattern verification
grep -r "watch(" src/composables/
grep -r "setup(" src/components/

# Test different environments
npm run test:unit
npm run test:components
npm run test:integration

# Build validation
npm run build
npm run staging
npm run production

# Resource cleanup verification
npm run test:sequential
```

---

## Emergency Debugging Protocol

If implementation fails despite following checklist:

1. **Stop and Research** - Return to Phase 1, analyze working examples
2. **Pattern Comparison** - Compare with documented successful implementations
3. **Medical Validation** - Verify against clinical guidelines
4. **Resource Audit** - Check for cleanup method execution
5. **Configuration Check** - Ensure entry point template compliance

**Remember**: Systematic research prevents 70% of implementation issues. When in doubt, research first, implement second.