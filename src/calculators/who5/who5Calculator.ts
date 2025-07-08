import { BaseCalculator } from '../base/calculatorBase'
import type { CalculationResult, ValidationResult, CalculatorMetadata, ScoreRange } from '../base/types'
import type { Who5Responses, Who5Details } from './who5Types'
import { Who5QuestionSchema } from './who5Schema'

export class Who5Calculator extends BaseCalculator<Who5Responses, Who5Details> {
  readonly metadata: CalculatorMetadata = {
    name: 'WHO-5',
    version: '1.0.0',
    description: 'WHO-5 Well-Being Index - Assessment of psychological well-being',
    category: 'psychology',
    references: ['Bech P, et al. Measuring well-being rather than the absence of distress symptoms.']
  }

  readonly scoreRange: ScoreRange = {
    min: 0,
    max: 100
  }

  validate(responses: Who5Responses): ValidationResult {
    try {
      Who5QuestionSchema.parse(responses)
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

  protected calculateScore(responses: Who5Responses): CalculationResult<Who5Details> {
    const rawScore = Object.values(responses).reduce((sum: number, value: any) => sum + (Number(value) || 0), 0)
    const percentageScore = Math.round((rawScore / 25) * 100)
    
    let wellBeingLevel: 'poor' | 'below_average' | 'average' | 'good' | 'excellent'
    let depressionRisk = false
    
    if (percentageScore < 28) {
      wellBeingLevel = 'poor'
      depressionRisk = true
    } else if (percentageScore < 50) {
      wellBeingLevel = 'below_average'
    } else if (percentageScore < 68) {
      wellBeingLevel = 'average'
    } else if (percentageScore < 85) {
      wellBeingLevel = 'good'
    } else {
      wellBeingLevel = 'excellent'
    }

    const details: Who5Details = {
      rawScore,
      percentageScore,
      wellBeingLevel,
      depressionRisk,
      screeningRecommended: depressionRisk
    }

    const wellBeingTranslations = {
      poor: 'dårligt',
      below_average: 'under gennemsnit',
      average: 'gennemsnitligt',
      good: 'godt',
      excellent: 'fremragende'
    }
    const interpretation = `Velbefindende niveau: ${wellBeingTranslations[wellBeingLevel]}`

    const recommendations = depressionRisk 
      ? ['Kontakt læge for depression screening', 'Overvej psykologisk støtte']
      : ['Fortsæt gode vaner', 'Regelmæssig motion og social kontakt']

    return {
      score: percentageScore,
      interpretation,
      recommendations,
      riskLevel: depressionRisk ? 'high' : 'low',
      details
    }
  }
}

export const who5Calculator = new Who5Calculator()