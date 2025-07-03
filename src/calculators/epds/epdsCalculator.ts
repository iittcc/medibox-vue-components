import { BaseCalculator } from '../base/calculatorBase'
import type { CalculationResult, ValidationResult, CalculatorMetadata, ScoreRange } from '../base/types'
import type { EpdsResponses, EpdsDetails } from './epdsTypes'
import { EpdsQuestionSchema } from './epdsSchema'

export class EpdsCalculator extends BaseCalculator<EpdsResponses, EpdsDetails> {
  readonly metadata: CalculatorMetadata = {
    name: 'EPDS',
    version: '1.0.0',
    description: 'Edinburgh Postnatal Depression Scale - Screening for perinatal depression',
    category: 'pregnancy',
    references: ['Cox, J.L., Holden, J.M., and Sagovsky, R. 1987. Detection of postnatal depression.']
  }

  readonly scoreRange: ScoreRange = {
    min: 0,
    max: 30
  }

  validate(responses: EpdsResponses): ValidationResult {
    try {
      EpdsQuestionSchema.parse(responses)
      return { isValid: true, errors: [] }
    } catch (error: any) {
      const errors = error.errors?.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        value: err.input
      })) || [{
        field: 'responses',
        message: 'Invalid responses format',
        code: 'INVALID_INPUT'
      }]
      
      return {
        isValid: false,
        errors
      }
    }
  }

  protected calculateScore(responses: EpdsResponses): CalculationResult<EpdsDetails> {
    // Calculate total score
    const score = Object.values(responses).reduce((sum: number, value: any) => sum + (Number(value) || 0), 0)
    
    // Check for suicidal thoughts (question 10)
    const suicidalThoughts = (Number(responses.question10) || 0) > 0
    
    // Determine risk level and interpretation
    let interpretation: string
    let recommendations: string[]
    let riskLevel: 'minimal' | 'mild' | 'moderate' | 'severe'
    let urgentReferralNeeded = false
    
    if (score <= 9) {
      interpretation = 'Minimal risiko for postnatal depression'
      recommendations = ['Fortsat observation', 'Støt fra familie og venner']
      riskLevel = 'minimal'
    } else if (score <= 12) {
      interpretation = 'Mild risiko for postnatal depression'
      recommendations = ['Tal med sundhedsplejerske', 'Overvej støttegrupper']
      riskLevel = 'mild'
    } else {
      interpretation = 'Moderat til høj risiko for postnatal depression'
      if (suicidalThoughts) {
        recommendations = ['Søg øjeblikkelig hjælp', 'Kontakt læge eller akutmodtagelse']
        riskLevel = 'severe'
        urgentReferralNeeded = true
      } else {
        recommendations = ['Kontakt læge', 'Psykologisk vurdering anbefales']
        riskLevel = 'moderate'
      }
    }

    const details: EpdsDetails = {
      depressionRisk: riskLevel,
      suicidalThoughts,
      urgentReferralNeeded,
      scoreCategory: riskLevel
    }

    return {
      score,
      interpretation,
      recommendations,
      riskLevel,
      details
    }
  }
}

export const epdsCalculator = new EpdsCalculator()