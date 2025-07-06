# Learning 26: TypeScript Calculator Framework Typing

## Issue Description
During framework integration, there were challenges with TypeScript typing for:
- Calculator data structure access
- Framework reactive properties
- Option types and interfaces
- Type assertions for framework data

## Root Cause Analysis
The framework provides generic types that need proper typing for:
- Calculator-specific data structures
- Form field value types
- Option sets and question configurations
- Type safety for reactive framework properties

## Solution Implemented

### 1. Proper Type Definitions
```typescript
// Define component-specific interfaces
export interface Option {
  text: string;
  value: number;
}

export type OptionsSets = {
  options1: Option[];
  options2: Option[];
  options3: Option[];
  options4: Option[];
  options5: Option[];
};

export interface Question {
  id: string;
  type: string;
  bg?: string;
  text: string;
  description?: string;
  optionsType?: keyof OptionsSets;
  answer: number | null;
}
```

### 2. Framework Data Type Assertions
```typescript
// Safe type assertions for framework data
:framework-answer="(framework.calculatorData.value as any)[question.id]"
:is-unanswered="formSubmitted && ((framework.calculatorData.value as any)[question.id] === null || (framework.calculatorData.value as any)[question.id] === undefined)"
```

### 3. Utility Function Typing
```typescript
// Type-safe utility functions
const getOptions = (type: keyof OptionsSets): Option[] => {
  return optionsSets[type].value;
}

const getSeverityFromRiskLevel = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'mild': return 'success';
    case 'moderate': return 'warn';
    case 'severe': return 'error';
    default: return 'info';
  }
};
```

### 4. Framework Configuration Typing
```typescript
// Properly typed framework configuration
const config: CalculatorConfig = {
  type: 'westleycroupscore',
  name: 'Westley Croup Score',
  version: '2.0.0',
  category: 'general',
  theme: 'orange',
  estimatedDuration: 2,
};
```

## Prevention Strategies
1. **Generic Type Usage**: Understand framework's generic type system
2. **Interface Definitions**: Define component-specific interfaces early
3. **Type Guards**: Use proper type guards instead of `any` where possible
4. **Utility Type Functions**: Create typed utility functions for common operations
5. **Framework Type Integration**: Understand how component types integrate with framework types

## Code Examples
**Better Type Safety Pattern:**
```typescript
// Instead of using 'any', create specific types
interface WestleyCroupData {
  levelOfConsciousness: number | null;
  cyanosis: number | null;
  stridor: number | null;
  airEntry: number | null;
  retractions: number | null;
}

// Type-safe data access
const getCalculatorValue = (field: keyof WestleyCroupData): number | null => {
  const data = framework.calculatorData.value as WestleyCroupData;
  return data[field];
};

// Usage in template
:framework-answer="getCalculatorValue(question.id as keyof WestleyCroupData)"
```

**Type-Safe Option Handling:**
```typescript
// Create an enum for option types
enum OptionTypes {
  OPTIONS1 = 'options1',
  OPTIONS2 = 'options2',
  OPTIONS3 = 'options3',
  OPTIONS4 = 'options4',
  OPTIONS5 = 'options5'
}

// Type-safe option getter
const getOptions = (type: OptionTypes): Option[] => {
  return optionsSets[type].value;
}
```

**Framework Integration with Proper Typing:**
```typescript
// Create typed framework wrapper
interface TypedCalculatorFramework {
  patientData: Ref<PatientData>;
  calculatorData: Ref<WestleyCroupData>;
  state: Ref<CalculatorState>;
  result: Ref<WestleyCroupResult | null>;
  setFieldValue: (section: string, field: string, value: any) => void;
  submitCalculation: () => Promise<void>;
  resetCalculator: () => void;
}

// Use typed framework
const framework = useCalculatorFramework(config) as TypedCalculatorFramework;
```

## Key Takeaways
- Avoid `any` type assertions when possible; create specific interfaces instead
- Framework integration requires understanding generic type patterns
- Component-specific type definitions improve development experience
- Type-safe utility functions reduce runtime errors
- Proper typing enables better IDE support and refactoring safety

## Impact
Proper TypeScript integration provides better development experience, catches type-related errors at compile time, and enables safer refactoring. It also improves code documentation through type definitions and enhances IDE support for autocompletion and error detection.