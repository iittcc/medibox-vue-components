# Learning 22: Validation Schema Medical Criteria Mismatch

## Issue Description
During the Westley Croup Score framework integration, the component was failing validation with the error "Validation failed before submission". The component would calculate correctly but fail during the submission process.

## Root Cause Analysis
The component option values did not match the official Westley Croup Score medical criteria:

**Incorrect Implementation:**
```typescript
// Cyanosis options were wrong (0,1,2) instead of official (0,4,5)
const options2 = ref<Option[]>([
  { text: "Ingen", value: 0 },
  { text: "Ved ophidselse", value: 1 },  // Should be 4
  { text: "I hvile", value: 2 }          // Should be 5
]);
```

**Schema Validation:**
```typescript
cyanosis: z.number()
  .min(0, 'Cyanose score skal være mindst 0')
  .max(5, 'Cyanose score skal være højst 5')  // Allowed max 5, but component used max 2
```

## Solution Implemented
1. **Researched Official Criteria**: Verified the official Westley Croup Score ranges
2. **Corrected Option Values**: Updated all component options to match medical standards
3. **Added Separate Option Sets**: Created distinct option sets for different scoring ranges

**Corrected Implementation:**
```typescript
// Cyanosis options (0, 4, 5) - matches official criteria
const options2 = ref<Option[]>([
  { text: "Ingen", value: 0 },
  { text: "Ved ophidselse", value: 4 },
  { text: "I hvile", value: 5 }
]);

// Stridor options (0, 1, 2) - separate option set
const options3 = ref<Option[]>([
  { text: "Ingen", value: 0 },
  { text: "Ved ophidselse", value: 1 },
  { text: "I hvile", value: 2 }
]);
```

## Prevention Strategies
1. **Medical Validation First**: Always verify medical scoring criteria before implementation
2. **Schema-Component Alignment**: Ensure component options match schema validation ranges
3. **Official Documentation**: Reference official medical literature for scoring systems
4. **End-to-End Testing**: Test full submission flow, not just calculation logic
5. **Validation Error Debugging**: Add detailed error logging for validation failures

## Code Examples
**Schema Validation Debug Pattern:**
```typescript
const validate = (responses: WestleyCroupResponses): ValidationResult => {
  try {
    WestleyCroupQuestionSchema.parse(responses)
    return { isValid: true, errors: [] }
  } catch (error: any) {
    console.error('Validation failed:', error.errors)
    // Log specific field values that failed
    error.errors.forEach(err => {
      console.error(`Field ${err.path}: ${err.message}, received: ${err.input}`)
    })
    return { isValid: false, errors: error.errors }
  }
}
```

## Key Takeaways
- Medical scoring systems have specific, non-negotiable value ranges
- Component implementation must exactly match schema validation
- Always validate against official medical criteria, not assumptions
- Full end-to-end testing is crucial for catching validation mismatches
- Detailed error logging helps identify validation failures quickly

## Impact
This issue caused a critical failure during user testing, potentially affecting clinical workflow. The fix ensures medical accuracy and prevents submission failures.