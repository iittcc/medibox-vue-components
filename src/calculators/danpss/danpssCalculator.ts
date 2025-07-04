import { BaseCalculator } from '../base/calculatorBase'
import type { CalculationResult, ValidationResult } from '../base/types'
import type { DanpssResponses, DanpssDetails, RiskLevel } from '@/types/calculatorTypes'
import { DANPSS_CONFIG, type SeverityLevel } from './danpssTypes'

/**
 * DANPSS (Danish Depression and Anxiety Symptom Scale) Calculator
 * 
 * A screening instrument for measuring depression and anxiety symptoms
 * specifically developed for Danish healthcare settings.
 * 
 * The scale consists of:
 * - 7 depression questions (score 0-21)
 * - 5 anxiety questions (score 0-15)
 * - Total combined score (0-36)
 */
export class DanpssCalculator extends BaseCalculator<DanpssResponses, DanpssDetails> {
  readonly metadata = {
    name: 'DANPSS',
    version: '1.0.0',
    description: 'Danish Depression and Anxiety Symptom Scale',
    category: 'psychology' as const,
    estimatedDuration: 7,
    references: [
      'Olsen, L.R., et al. The internal and external validity of the Major Depression Inventory. Psychol Med. 2003;33:351-362.',
      'Danish Health Authority. Clinical guidelines for depression and anxiety screening. 2020.'
    ]
  }
  
  readonly scoreRange = DANPSS_CONFIG.SCORE_RANGE
  
  /**
   * Validates DANPSS responses
   */
  validate(responses: DanpssResponses): ValidationResult {
    const errors = []
    
    // Check base validation first
    const baseValidation = super.validate(responses)
    if (!baseValidation.isValid) {
      return baseValidation
    }
    
    // Validate all 12 questions are present and within range
    for (let i = 1; i <= DANPSS_CONFIG.QUESTION_COUNT; i++) {
      const field = `question${i}` as keyof DanpssResponses
      const value = responses[field]
      
      const fieldErrors = this.validateNumericRange(
        field,
        value,
        DANPSS_CONFIG.QUESTION_RANGE.min,
        DANPSS_CONFIG.QUESTION_RANGE.max,
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
   * Calculates DANPSS scores for depression, anxiety, and combined risk
   */
  protected calculateScore(responses: DanpssResponses): CalculationResult<DanpssDetails> {
    // Calculate depression score (questions 1-7)
    const depressionScore = DANPSS_CONFIG.DEPRESSION_QUESTIONS.reduce(
      (sum, questionNum) => sum + responses[`question${questionNum}` as keyof DanpssResponses],
      0
    )
    
    // Calculate anxiety score (questions 8-12)
    const anxietyScore = DANPSS_CONFIG.ANXIETY_QUESTIONS.reduce(
      (sum, questionNum) => sum + responses[`question${questionNum}` as keyof DanpssResponses],
      0
    )
    
    // Calculate total combined score
    const totalScore = depressionScore + anxietyScore
    
    // Determine severity levels
    const depressionLevel = this.getDepressionLevel(depressionScore)
    const anxietyLevel = this.getAnxietyLevel(anxietyScore)
    const combinedRisk = this.getCombinedRisk(totalScore)
    
    // Generate interpretation and recommendations
    const interpretation = this.generateInterpretation(depressionLevel, anxietyLevel, combinedRisk)
    const recommendations = this.generateRecommendations(depressionLevel, anxietyLevel, combinedRisk)
    
    // Create detailed results
    const details: DanpssDetails = {
      depressionScore,
      anxietyScore,
      depressionLevel,
      anxietyLevel,
      combinedRisk
    }
    
    return {
      score: totalScore,
      interpretation,
      recommendations,
      riskLevel: combinedRisk,
      details
    }
  }
  
  /**
   * Determines depression severity level based on score
   */
  private getDepressionLevel(score: number): SeverityLevel {
    if (score <= DANPSS_CONFIG.DEPRESSION_THRESHOLDS.NONE) return 'none'
    if (score <= DANPSS_CONFIG.DEPRESSION_THRESHOLDS.MILD) return 'mild'
    if (score <= DANPSS_CONFIG.DEPRESSION_THRESHOLDS.MODERATE) return 'moderate'
    return 'severe'
  }
  
  /**
   * Determines anxiety severity level based on score
   */
  private getAnxietyLevel(score: number): SeverityLevel {
    if (score <= DANPSS_CONFIG.ANXIETY_THRESHOLDS.NONE) return 'none'
    if (score <= DANPSS_CONFIG.ANXIETY_THRESHOLDS.MILD) return 'mild'
    if (score <= DANPSS_CONFIG.ANXIETY_THRESHOLDS.MODERATE) return 'moderate'
    return 'severe'
  }
  
  /**
   * Determines combined risk level based on total score
   */
  private getCombinedRisk(totalScore: number): RiskLevel {
    if (totalScore <= DANPSS_CONFIG.COMBINED_THRESHOLDS.LOW) return 'low'
    if (totalScore <= DANPSS_CONFIG.COMBINED_THRESHOLDS.MEDIUM) return 'medium'
    return 'high'
  }
  
  /**
   * Generates clinical interpretation based on severity levels
   */
  private generateInterpretation(
    depressionLevel: SeverityLevel,
    anxietyLevel: SeverityLevel,
     
    _combinedRisk: RiskLevel
  ): string {
    const depressionText = this.getSeverityText(depressionLevel, 'depression')
    const anxietyText = this.getSeverityText(anxietyLevel, 'angst')
    
    return `Depression: ${depressionText}, Angst: ${anxietyText}`
  }
  
  /**
   * Gets Danish text for severity level
   */
   
  private getSeverityText(level: SeverityLevel, _symptomType: 'depression' | 'angst'): string {
    const texts: Record<SeverityLevel, string> = {
      'none': 'ingen/minimal',
      'mild': 'let',
      'moderate': 'moderat',
      'severe': 'svær'
    }
    return texts[level]
  }
  
  /**
   * Generates recommendations based on severity levels
   */
  private generateRecommendations(
    depressionLevel: SeverityLevel,
    anxietyLevel: SeverityLevel,
    combinedRisk: RiskLevel
  ): string[] {
    const recommendations: string[] = []
    
    // Base recommendations
    if (combinedRisk === 'low') {
      recommendations.push('Fortsat selvovervågning af symptomer')
      recommendations.push('Fokus på sunde livsstilsvaner')
    }
    
    // Depression-specific recommendations
    if (depressionLevel === 'mild') {
      recommendations.push('Overvej psykoedukation og selvhjælpsressourcer')
      recommendations.push('Øget fysisk aktivitet og sociale aktiviteter')
    } else if (depressionLevel === 'moderate') {
      recommendations.push('Psykologisk behandling anbefales')
      recommendations.push('Overvej kognitiv adfærdsterapi (KBT)')
    } else if (depressionLevel === 'severe') {
      recommendations.push('Øjeblikkelig psykiatrisk vurdering påkrævet')
      recommendations.push('Overvej medicinsk behandling kombineret med psykoterapi')
    }
    
    // Anxiety-specific recommendations
    if (anxietyLevel === 'mild') {
      recommendations.push('Afslapningsteknikker og mindfulness')
      recommendations.push('Stresshåndtering og livsstilsændringer')
    } else if (anxietyLevel === 'moderate') {
      recommendations.push('Angsthåndtering gennem terapi')
      recommendations.push('Gradvis eksponering for angstudløsende situationer')
    } else if (anxietyLevel === 'severe') {
      recommendations.push('Specialiseret angstbehandling påkrævet')
      recommendations.push('Overvej medicinsk intervention')
    }
    
    // Combined high risk recommendations
    if (combinedRisk === 'high') {
      recommendations.push('Regelmæssig opfølgning med sundhedspersonale')
      recommendations.push('Overvej henvisning til psykiatrisk speciallæge')
      recommendations.push('Vurdering af selvmordsrisiko')
    }
    
    // Ensure we have at least basic recommendations
    if (recommendations.length === 0) {
      recommendations.push('Konsulter din læge for yderligere vurdering')
      recommendations.push('Fortsat opfølgning anbefales')
    }
    
    return recommendations
  }
}

// Create and export singleton instance
export const danpssCalculator = new DanpssCalculator()