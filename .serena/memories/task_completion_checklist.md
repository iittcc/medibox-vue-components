# Task Completion Checklist

## Required Steps After Completing Code Changes

### 1. Code Quality Checks
- **MUST RUN**: `npm run type-check` - Verify TypeScript compilation
- **MUST RUN**: `npm run lint` - Fix linting issues
- **RECOMMENDED**: `npm run format` - Ensure consistent formatting

### 2. Testing
- **RECOMMENDED**: `npm run test` - Run existing tests
- **MANUAL**: Test functionality manually in browser
- **MANUAL**: Test all affected medical calculators

### 3. Build Verification
- **RECOMMENDED**: `npm run build` - Verify production build succeeds
- **OPTIONAL**: `npm run preview` - Test built application

### 4. Multi-Entry Point Verification
Since this is a multi-entry point application, verify:
- Each calculator builds independently
- All entry points work correctly
- No shared state conflicts between calculators

### 5. Security Verification
- Verify no sensitive data is exposed
- Check encryption is properly implemented
- Ensure no secrets are committed to repository

### 6. Documentation
- Update component documentation if needed
- Update CLAUDE.md if architectural changes made
- Update README.md if new features added

## Critical Requirements
- **All Vue components must be wrapped in `<div class="medical-calculator-container">`**
- **Use `<script setup lang="ts">` syntax for all Vue components**
- **Follow Danish locale for medical terminology**
- **Maintain color-coded themes per medical domain**

## Pre-commit Checklist
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] Manual testing completed
- [ ] Build succeeds
- [ ] No sensitive data exposed
- [ ] Documentation updated if needed