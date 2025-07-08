# Learning #30: Medical Logic Centralization

## Issue
Medical recommendations and clinical descriptions were hardcoded in Vue components instead of being centralized in calculator logic, making maintenance difficult and risking inconsistency.

## Context
Original PUQE component had hardcoded severity descriptions in the `getDetailedDescription()` function:
- Different medical recommendations scattered across UI layer
- Risk of inconsistent medical guidance
- Difficult to update medical protocols

## Root Cause
- Separation of concerns not properly maintained
- Medical domain knowledge mixed with presentation logic  
- No clear ownership of medical content

## Solution Applied
1. **Enhanced Calculator Interface**: Added `clinicalDescription` field to calculator results
2. **Centralized Medical Logic**: Moved all severity-based descriptions to calculator
3. **Simplified Component**: Reduced component to simple data retrieval from calculator
4. **Single Source of Truth**: Calculator now owns all medical decision logic

## Code Example
```typescript
// Before (in Vue component)
const getDetailedDescription = (details: any): string => {
  if (puqeDetails.severity === 'severe') {
    return 'Patienten bør eventuelt henvises til læge...'
  } else if (puqeDetails.severity === 'moderate') {
    return 'Kontakt jordemoder for rådgivning...'
  }
  // ...more hardcoded logic
}

// After (in calculator)
clinicalDescription = 'Patienten bør eventuelt henvises til læge for udredning og behandling af hyperemesis gravidarum'

// Component simplified to:
const getDetailedDescription = (details: any): string => {
  return details?.clinicalDescription || ''
}
```

## Benefits Achieved
- **Single Source of Truth**: All medical logic in calculator
- **Easier Updates**: Medical protocol changes only need calculator updates
- **Consistency**: Same descriptions used across application
- **Better Testing**: Medical logic can be unit tested separately

## Prevention Strategy
- Keep medical/business logic in domain layer (calculators)
- Components should only handle presentation and user interaction
- Create clear interfaces between domain and presentation layers
- Regular reviews to catch logic drift into UI components

## Impact
- Reduced component complexity from 11 lines to 4 lines
- Centralized medical knowledge in appropriate layer
- Made medical content updates much easier to maintain

## Tags
`medical-logic`, `separation-of-concerns`, `architecture`, `maintainability`, `domain-logic`