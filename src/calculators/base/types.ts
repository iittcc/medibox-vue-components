import type { RiskLevel, CalculatorDetails } from '@/types/calculatorTypes'

// Enhanced calculation result with proper generics
export interface CalculationResult<TDetails extends CalculatorDetails = CalculatorDetails> {
  score: number
  interpretation: string
  recommendations: string[]
  riskLevel: RiskLevel
  details?: TDetails
  warnings?: string[]
}

// Validation result for input validation
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export interface ValidationError {
  field: string
  message: string
  code: string
  value?: any
}

// Score range definition
export interface ScoreRange {
  min: number
  max: number
}

// Calculator metadata
export interface CalculatorMetadata {
  name: string
  version: string
  description: string
  category: 'psychology' | 'infection' | 'pregnancy' | 'general'
  estimatedDuration?: number // in minutes
  references?: string[]
}