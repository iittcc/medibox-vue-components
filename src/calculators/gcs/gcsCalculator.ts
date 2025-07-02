import { BaseCalculator } from '../base/calculatorBase'
import type { CalculationResult, ValidationResult } from '../base/types'
import type { GcsResponses, GcsDetails, RiskLevel } from '@/types/calculatorTypes'
import { GCS_CONFIG } from './gcsTypes'

/**
 * GCS (Glasgow Coma Scale) Calculator
 * 
 * The Glasgow Coma Scale is a neurological scale used to assess the level of consciousness
 * after a brain injury. It evaluates three components:
 * - Eye opening response (1-4 points)
 * - Verbal response (1-5 points)  
 * - Motor response (1-6 points)
 * 
 * Total score ranges from 3-15, with lower scores indicating more severe impairment.
 */
export class GcsCalculator extends BaseCalculator<GcsResponses, GcsDetails> {
  readonly metadata = {
    name: 'GCS',
    version: '1.0.0',
    description: 'Glasgow Coma Scale',
    category: 'general' as const,
    estimatedDuration: 3,
    references: [
      'Teasdale G, Jennett B. Assessment of coma and impaired consciousness. Lancet. 1974;2:81-84.',
      'Teasdale GM, et al. The Glasgow Coma Scale at 40 years. Lancet Neurol. 2014;13:844-854.'
    ]
  }
  
  readonly scoreRange = GCS_CONFIG.SCORE_RANGE
  
  /**
   * Validates GCS responses
   */
  validate(responses: GcsResponses): ValidationResult {
    const errors = []
    
    // Check base validation first
    const baseValidation = super.validate(responses)
    if (!baseValidation.isValid) {
      return baseValidation
    }
    
    // Validate eye opening response (1-4)
    const eyeErrors = this.validateNumericRange(
      'eyeOpening',
      responses.eyeOpening,
      GCS_CONFIG.EYE_OPENING_RANGE.min,
      GCS_CONFIG.EYE_OPENING_RANGE.max,
      true
    )
    errors.push(...eyeErrors)
    
    // Validate verbal response (1-5)
    const verbalErrors = this.validateNumericRange(
      'verbalResponse',
      responses.verbalResponse,
      GCS_CONFIG.VERBAL_RESPONSE_RANGE.min,
      GCS_CONFIG.VERBAL_RESPONSE_RANGE.max,
      true
    )
    errors.push(...verbalErrors)
    
    // Validate motor response (1-6)
    const motorErrors = this.validateNumericRange(
      'motorResponse',
      responses.motorResponse,
      GCS_CONFIG.MOTOR_RESPONSE_RANGE.min,
      GCS_CONFIG.MOTOR_RESPONSE_RANGE.max,
      true
    )
    errors.push(...motorErrors)
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  /**
   * Calculates GCS total score and provides clinical interpretation
   */
  protected calculateScore(responses: GcsResponses): CalculationResult<GcsDetails> {
    // Calculate total GCS score
    const score = responses.eyeOpening + responses.verbalResponse + responses.motorResponse
    
    // Determine consciousness level and clinical significance
    const consciousness = this.getConsciousnessLevel(score)
    const clinicalSignificance = this.getClinicalSignificance(score)
    
    // Generate interpretation and recommendations
    const interpretation = this.generateInterpretation(score, consciousness)
    const recommendations = this.generateRecommendations(score, consciousness)
    
    // Create detailed results
    const details: GcsDetails = {
      eyeScore: responses.eyeOpening,
      verbalScore: responses.verbalResponse,
      motorScore: responses.motorResponse,
      consciousness,
      clinicalSignificance
    }
    
    return {
      score,
      interpretation,
      recommendations,
      riskLevel: this.mapToRiskLevel(consciousness),
      details
    }
  }
  
  /**
   * Determines consciousness level based on GCS score
   */
  private getConsciousnessLevel(score: number): 'severe' | 'moderate' | 'mild' | 'normal' {
    if (score <= GCS_CONFIG.SEVERITY_THRESHOLDS.SEVERE) return 'severe'
    if (score <= GCS_CONFIG.SEVERITY_THRESHOLDS.MODERATE) return 'moderate'
    if (score < GCS_CONFIG.SEVERITY_THRESHOLDS.MILD) return 'mild'
    return 'normal'
  }
  
  /**
   * Gets clinical significance description
   */
  private getClinicalSignificance(score: number): string {
    if (score <= 8) {
      return 'Alvorlig bevidsthedspåvirkning - komatøs tilstand'
    } else if (score <= 12) {
      return 'Moderat bevidsthedspåvirkning - kraftigt nedsat bevidsthed'
    } else if (score <= 14) {
      return 'Let bevidsthedspåvirkning - nedsat bevidsthed'
    } else {
      return 'Normal bevidsthed'
    }
  }
  
  /**
   * Generates clinical interpretation
   */
  private generateInterpretation(score: number, consciousness: string): string {
    const scoreText = `GCS ${score}/15`
    
    switch (consciousness) {
      case 'severe':
        return `${scoreText}: Alvorlig bevidsthedspåvirkning`
      case 'moderate':
        return `${scoreText}: Moderat bevidsthedspåvirkning`
      case 'mild':
        return `${scoreText}: Let bevidsthedspåvirkning`
      case 'normal':
        return `${scoreText}: Normal bevidsthed`
      default:
        return `${scoreText}: Bevidsthedstilstand vurderet`
    }
  }
  
  /**
   * Generates recommendations based on GCS score
   */
  private generateRecommendations(_score: number, consciousness: string): string[] {
    const recommendations: string[] = []
    
    switch (consciousness) {
      case 'severe':
        recommendations.push('Øjeblikkelig intensiv behandling påkrævet')
        recommendations.push('Neurolog konsultation akut')
        recommendations.push('Overvej intubation og mekanisk ventilation')
        recommendations.push('Kontinuerlig neurologisk overvågning')
        recommendations.push('CT-scanning af cerebrum inden for 1 time')
        break
        
      case 'moderate':
        recommendations.push('Tæt neurologisk observation påkrævet')
        recommendations.push('Neurolog vurdering inden for 4 timer')
        recommendations.push('CT-scanning af cerebrum')
        recommendations.push('Vurdering af behov for neurologisk intensiv behandling')
        recommendations.push('Hyppig GCS-kontrol (hver time)')
        break
        
      case 'mild':
        recommendations.push('Neurologisk observation i 24 timer')
        recommendations.push('Gentagen GCS-vurdering hver 2-4 timer')
        recommendations.push('CT-scanning ved klinisk forværring')
        recommendations.push('Patientpårørende instruktion om observationstegn')
        break
        
      case 'normal':
        recommendations.push('Fortsat observation anbefales')
        recommendations.push('Opmærksomhed på eventuelle neurologiske ændringer')
        recommendations.push('Follow-up efter behov')
        break
    }
    
    // Add general recommendations
    recommendations.push('Dokumenter bevidsthedsniveau regelmæssigt')
    recommendations.push('Vurder andre neurologiske fund')
    
    return recommendations
  }
  
  /**
   * Maps consciousness level to standard risk level
   */
  private mapToRiskLevel(consciousness: string): RiskLevel {
    const mapping: Record<string, RiskLevel> = {
      'severe': 'severe',
      'moderate': 'moderate',
      'mild': 'mild',
      'normal': 'low'
    }
    return mapping[consciousness] || 'unknown'
  }
}

// Create and export singleton instance
export const gcsCalculator = new GcsCalculator()