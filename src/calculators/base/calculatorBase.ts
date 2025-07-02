import type { CalculationResult, ValidationResult, ScoreRange, CalculatorMetadata } from './types'
import type { CalculatorDetails } from '@/types/calculatorTypes'

/**
 * Base interface that all medical calculators must implement
 * Provides type safety and consistent behavior across all calculators
 */
export interface MedicalCalculator<TResponses = any, TDetails extends CalculatorDetails = CalculatorDetails> {
  /** Calculator metadata */
  readonly metadata: CalculatorMetadata
  
  /** Valid score range for this calculator */
  readonly scoreRange: ScoreRange
  
  /**
   * Validates input responses before calculation
   * @param responses The calculator responses to validate
   * @returns Validation result with any errors
   */
  validate(responses: TResponses): ValidationResult
  
  /**
   * Performs the calculator-specific score calculation
   * @param responses Validated calculator responses
   * @returns Complete calculation result with score, interpretation, and recommendations
   */
  calculate(responses: TResponses): CalculationResult<TDetails>
  
  /**
   * Gets the valid score range for this calculator
   * @returns The minimum and maximum valid scores
   */
  getScoreRange(): ScoreRange
}

/**
 * Abstract base class providing common calculator functionality
 * Implements validation and error handling patterns
 */
export abstract class BaseCalculator<TResponses, TDetails extends CalculatorDetails = CalculatorDetails> implements MedicalCalculator<TResponses, TDetails> {
  abstract readonly metadata: CalculatorMetadata
  abstract readonly scoreRange: ScoreRange
  
  /**
   * Template method that validates inputs then delegates to calculateScore
   */
  calculate(responses: TResponses): CalculationResult<TDetails> {
    // Validate inputs first
    const validationResult = this.validate(responses)
    if (!validationResult.isValid) {
      const errors = validationResult.errors.map(e => e.message).join(', ')
      throw new Error(`Validation failed: ${errors}`)
    }
    
    // Perform calculation with validated inputs
    const result = this.calculateScore(responses)
    
    // Validate calculated score is within expected range
    if (result.score < this.scoreRange.min || result.score > this.scoreRange.max) {
      throw new Error(
        `Calculated score ${result.score} is outside valid range ${this.scoreRange.min}-${this.scoreRange.max}`
      )
    }
    
    return result
  }
  
  /**
   * Gets the valid score range for this calculator
   */
  getScoreRange(): ScoreRange {
    return this.scoreRange
  }
  
  /**
   * Abstract method for calculator-specific score calculation
   * Must be implemented by each calculator
   */
  protected abstract calculateScore(responses: TResponses): CalculationResult<TDetails>
  
  /**
   * Default validation - override for calculator-specific validation
   */
  validate(responses: TResponses): ValidationResult {
    if (!responses || typeof responses !== 'object') {
      return {
        isValid: false,
        errors: [{
          field: 'responses',
          message: 'Responses must be a valid object',
          code: 'INVALID_INPUT'
        }]
      }
    }
    
    return { isValid: true, errors: [] }
  }
  
  /**
   * Helper method to create validation errors
   */
  protected createValidationError(field: string, message: string, code: string = 'VALIDATION_ERROR', value?: any) {
    return {
      field,
      message,
      code,
      value
    }
  }
  
  /**
   * Helper method to validate numeric ranges
   */
  protected validateNumericRange(
    field: string, 
    value: any, 
    min: number, 
    max: number, 
    isInteger: boolean = false
  ) {
    const errors = []
    
    if (value === undefined || value === null) {
      errors.push(this.createValidationError(field, `${field} is required`, 'REQUIRED', value))
      return errors
    }
    
    const num = Number(value)
    if (isNaN(num)) {
      errors.push(this.createValidationError(field, `${field} must be a number`, 'INVALID_TYPE', value))
      return errors
    }
    
    if (isInteger && !Number.isInteger(num)) {
      errors.push(this.createValidationError(field, `${field} must be an integer`, 'INVALID_TYPE', value))
      return errors
    }
    
    if (num < min || num > max) {
      errors.push(this.createValidationError(
        field, 
        `${field} must be between ${min} and ${max}`, 
        'OUT_OF_RANGE', 
        value
      ))
    }
    
    return errors
  }
}