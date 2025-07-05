import type { MedicalCalculator } from './base/calculatorBase'
import type { CalculatorResponses, CalculationResult } from '@/types/calculatorTypes'

// Import calculator implementations
import { auditCalculator } from './audit/auditCalculator'
import { danpssCalculator } from './danpss/danpssCalculator'
import { gcsCalculator } from './gcs/gcsCalculator'
import { epdsCalculator } from './epds/epdsCalculator'
import { ipssCalculator } from './ipss/ipssCalculator'
import { puqeCalculator } from './puqe/puqeCalculator'
import { westleyCroupCalculator } from './westleyCroup/westleyCroupCalculator'
import { who5Calculator } from './who5/who5Calculator'
import { lrtiCalculator } from './lrti/lrtiCalculator'
import { score2Calculator } from './score2/score2Calculator'

// Calculator type mapping
export type CalculatorType = 
  | 'audit'
  | 'danpss'
  | 'epds'
  | 'gcs'
  | 'ipss'
  | 'puqe'
  | 'westleycroupscore'
  | 'who5'
  | 'lrti'
  | 'score2'

/**
 * Type-safe calculator registry
 * Maps calculator type strings to their implementations
 */
const calculatorRegistry = {
  audit: auditCalculator,
  danpss: danpssCalculator,
  gcs: gcsCalculator,
  epds: epdsCalculator,
  ipss: ipssCalculator,
  puqe: puqeCalculator,
  westleycroupscore: westleyCroupCalculator,
  who5: who5Calculator,
  lrti: lrtiCalculator,
  score2: score2Calculator,
} as const

// Type for available calculator keys
type AvailableCalculatorType = keyof typeof calculatorRegistry

/**
 * Gets a calculator instance by type with full type safety
 * @param type The calculator type identifier
 * @returns The calculator instance
 * @throws Error if calculator type is not found or not yet implemented
 */
export function getCalculator(type: string): MedicalCalculator {
  // Check if calculator is available
  if (!isAvailableCalculator(type)) {
    // Check if it's a valid type but not yet implemented
    const validTypes: CalculatorType[] = [
      'audit', 'danpss', 'epds', 'gcs', 'ipss', 
      'puqe', 'westleycroupscore', 'who5', 'lrti', 'score2'
    ]
    
    if (validTypes.includes(type as CalculatorType)) {
      throw new Error(`Calculator '${type}' should be available but is not found in registry. This is likely a bug.`)
    }
    
    throw new Error(`Unknown calculator type: '${type}'. Valid types are: ${validTypes.join(', ')}`)
  }
  
  return calculatorRegistry[type]
}

/**
 * Type guard to check if a calculator type is available in the registry
 */
function isAvailableCalculator(type: string): type is AvailableCalculatorType {
  return type in calculatorRegistry
}

/**
 * Gets all available calculator types
 */
export function getAvailableCalculatorTypes(): AvailableCalculatorType[] {
  return Object.keys(calculatorRegistry) as AvailableCalculatorType[]
}

/**
 * Checks if a calculator type is implemented
 */
export function isCalculatorImplemented(type: string): boolean {
  return isAvailableCalculator(type)
}

/**
 * Gets calculator metadata without instantiating
 */
export function getCalculatorMetadata(type: string) {
  const calculator = getCalculator(type)
  return calculator.metadata
}

/**
 * Gets calculator score range without instantiating
 */
export function getCalculatorScoreRange(type: string) {
  const calculator = getCalculator(type)
  return calculator.getScoreRange()
}

/**
 * High-level function to calculate score with proper error handling
 * This replaces the monolithic calculateScore function
 */
export function calculateMedicalScore(
  calculatorType: string,
  responses: CalculatorResponses
): CalculationResult {
  try {
    // Get the appropriate calculator
    const calculator = getCalculator(calculatorType)
    
    // Perform calculation with built-in validation
    const result = calculator.calculate(responses)
    
    return result as CalculationResult
  } catch (error) {
    // Re-throw with additional context
    if (error instanceof Error) {
      throw new Error(`Calculation failed for ${calculatorType}: ${error.message}`)
    }
    throw new Error(`Unknown error during ${calculatorType} calculation`)
  }
}

// Re-export types and base classes for convenience
export type { MedicalCalculator } from './base/calculatorBase'
export type { CalculationResult, ValidationResult } from './base/types'
export { BaseCalculator } from './base/calculatorBase'

// Export calculator instances for direct use
export {
  auditCalculator,
  danpssCalculator,
  gcsCalculator,
  epdsCalculator,
  ipssCalculator,
  puqeCalculator,
  westleyCroupCalculator,
  who5Calculator,
  lrtiCalculator,
  score2Calculator
}