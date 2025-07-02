import { BaseCalculator } from '../base/calculatorBase'
import type { CalculationResult, ValidationResult } from '../base/types'
import type { AuditResponses, AuditDetails, RiskLevel } from '@/types/calculatorTypes'
import { AUDIT_CONFIG, type AuditRiskCategory } from './auditTypes'

/**
 * AUDIT (Alcohol Use Disorders Identification Test) Calculator
 * 
 * The AUDIT is a 10-question screening tool to identify persons with hazardous and harmful 
 * patterns of alcohol consumption. Developed by the World Health Organization (WHO).
 * 
 * Score interpretation:
 * - 0-7: Low risk for alcohol problems
 * - 8-15: Medium risk - brief counseling and continued monitoring recommended
 * - 16-19: High risk - further diagnostic evaluation for alcohol dependence recommended
 * - 20-40: Very high risk - referral to specialist for diagnostic evaluation and treatment
 */
export class AuditCalculator extends BaseCalculator<AuditResponses, AuditDetails> {
  readonly metadata = {
    name: 'AUDIT',
    version: '1.0.0',
    description: 'Alcohol Use Disorders Identification Test',
    category: 'psychology' as const,
    estimatedDuration: 5,
    references: [
      'Saunders JB, et al. Development of the Alcohol Use Disorders Identification Test (AUDIT). Addiction. 1993;88:791-804.',
      'World Health Organization. AUDIT: The Alcohol Use Disorders Identification Test. Geneva: WHO; 2001.'
    ]
  }
  
  readonly scoreRange = AUDIT_CONFIG.SCORE_RANGE
  
  /**
   * Validates AUDIT responses
   */
  validate(responses: AuditResponses): ValidationResult {
    const errors = []
    
    // Check base validation first
    const baseValidation = super.validate(responses)
    if (!baseValidation.isValid) {
      return baseValidation
    }
    
    // Validate all 10 questions are present and within range
    for (let i = 1; i <= AUDIT_CONFIG.QUESTION_COUNT; i++) {
      const field = `question${i}` as keyof AuditResponses
      const value = responses[field]
      
      const fieldErrors = this.validateNumericRange(
        field,
        value,
        AUDIT_CONFIG.QUESTION_RANGE.min,
        AUDIT_CONFIG.QUESTION_RANGE.max,
        true // Must be integer
      )
      errors.push(...fieldErrors)
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  /**
   * Calculates AUDIT score and provides interpretation
   */
  protected calculateScore(responses: AuditResponses): CalculationResult<AuditDetails> {
    // Calculate total score by summing all responses
    const score = Object.values(responses).reduce((sum, value) => sum + value, 0)
    
    // Calculate subscores for enhanced details
    const consumptionScore = responses.question1 + responses.question2 + responses.question3
    const dependenceScore = responses.question4 + responses.question5 + responses.question6
    const harmScore = responses.question7 + responses.question8 + responses.question9 + responses.question10
    
    // Get interpretation based on total score
    const interpretation = this.interpretScore(score)
    
    // Create detailed results
    const details: AuditDetails = {
      consumptionScore,
      dependenceScore,
      harmScore,
      riskCategory: interpretation.riskLevel,
      recommendedAction: this.getRecommendedAction(interpretation.riskLevel)
    }
    
    return {
      score,
      interpretation: interpretation.interpretation,
      recommendations: interpretation.recommendations,
      riskLevel: this.mapRiskLevelToStandard(interpretation.riskLevel),
      details
    }
  }
  
  /**
   * Interprets AUDIT score according to WHO guidelines
   */
  private interpretScore(score: number): {
    interpretation: string
    recommendations: string[]
    riskLevel: AuditRiskCategory
  } {
    if (score <= AUDIT_CONFIG.RISK_THRESHOLDS.LOW) {
      return {
        interpretation: 'Lavt risiko for alkoholmisbrug',
        recommendations: [
          'Fortsæt med moderat alkoholforbrug',
          'Regelmæssig sundhedskontrol',
          'Opmærksomhed på eventuelle ændringer i alkoholvaner'
        ],
        riskLevel: 'low'
      }
    } else if (score <= AUDIT_CONFIG.RISK_THRESHOLDS.MEDIUM) {
      return {
        interpretation: 'Moderat risiko for alkoholmisbrug',
        recommendations: [
          'Overvej at reducere alkoholforbrug',
          'Tal med din læge om alkoholvaner',
          'Kort rådgivning og fortsat opfølgning anbefales',
          'Selvovervågning af alkoholforbrug'
        ],
        riskLevel: 'medium'
      }
    } else if (score <= AUDIT_CONFIG.RISK_THRESHOLDS.HIGH) {
      return {
        interpretation: 'Høj risiko for alkoholmisbrug',
        recommendations: [
          'Anbefales at søge professionel hjælp',
          'Overvej alkoholbehandling',
          'Yderligere diagnostisk evaluering for alkoholafhængighed',
          'Struktureret behandlingsprogram kan være nødvendigt'
        ],
        riskLevel: 'high'
      }
    } else {
      return {
        interpretation: 'Meget høj risiko for alkoholmisbrug',
        recommendations: [
          'Søg øjeblikkelig professionel hjælp',
          'Kontakt alkoholbehandling akut',
          'Henvisning til specialist for diagnostisk evaluering',
          'Intensiv behandling stærkt anbefalet'
        ],
        riskLevel: 'very_high'
      }
    }
  }
  
  /**
   * Maps AUDIT-specific risk levels to standard risk levels
   */
  private mapRiskLevelToStandard(auditRiskLevel: AuditRiskCategory): RiskLevel {
    const mapping: Record<AuditRiskCategory, RiskLevel> = {
      'low': 'low',
      'medium': 'medium', 
      'high': 'high',
      'very_high': 'very_high'
    }
    return mapping[auditRiskLevel]
  }
  
  /**
   * Gets recommended action based on risk level
   */
  private getRecommendedAction(riskLevel: AuditRiskCategory): string {
    const actions: Record<AuditRiskCategory, string> = {
      'low': 'Ingen specifik handling påkrævet. Fortsæt nuværende praksis.',
      'medium': 'Kort rådgivning og fortsat opfølgning anbefales.',
      'high': 'Yderligere diagnostisk evaluering for alkoholafhængighed påkrævet.',
      'very_high': 'Øjeblikkelig henvisning til specialist for diagnostisk evaluering og behandling.'
    }
    return actions[riskLevel]
  }
}

// Create and export singleton instance
export const auditCalculator = new AuditCalculator()