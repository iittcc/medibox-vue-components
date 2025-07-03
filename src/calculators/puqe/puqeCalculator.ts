import { BaseCalculator } from '../base/calculatorBase'
import type { CalculationResult, ValidationResult, CalculatorMetadata, ScoreRange } from '../base/types'
import type { PuqeResponses, PuqeDetails } from './puqeTypes'
import { PuqeQuestionSchema } from './puqeSchema'

export class PuqeCalculator extends BaseCalculator<PuqeResponses, PuqeDetails> {
  readonly metadata: CalculatorMetadata = {
    name: 'PUQE',
    version: '1.0.0',
    description: 'Pregnancy-Unique Quantification of Emesis - Assessment of nausea and vomiting in pregnancy',
    category: 'pregnancy',
    references: ['Koren G, et al. The PUQE (pregnancy-unique quantification of emesis and nausea) score.']
  }

  readonly scoreRange: ScoreRange = {
    min: 3,
    max: 15
  }

  validate(responses: PuqeResponses): ValidationResult {
    try {
      PuqeQuestionSchema.parse(responses)
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

  protected calculateScore(responses: PuqeResponses): CalculationResult<PuqeDetails> {
    const score = (responses.nausea || 0) + (responses.vomiting || 0) + (responses.retching || 0)
    
    let interpretation: string
    let recommendations: string[]
    let severity: 'mild' | 'moderate' | 'severe'
    let hyperemesisRisk = false
    
    if (score <= 6) {
      interpretation = 'Mild graviditetskvalme'
      recommendations = ['Små hyppige måltider', 'Undgå trigger foods']
      severity = 'mild'
    } else if (score <= 12) {
      interpretation = 'Moderat graviditetskvalme'
      recommendations = ['Kontakt jordemoder', 'Overvej anti-emetika']
      severity = 'moderate'
    } else {
      interpretation = 'Alvorlig graviditetskvalme (Hyperemesis)'
      recommendations = ['Kontakt læge øjeblikkeligt', 'Hospitalsindlæggelse kan være nødvendig']
      severity = 'severe'
      hyperemesisRisk = true
    }

    const details: PuqeDetails = {
      nauseaHours: responses.nausea,
      vomitingEpisodes: responses.vomiting,
      retchingEpisodes: responses.retching,
      severity,
      hyperemesisRisk
    }

    return {
      score,
      interpretation,
      recommendations,
      riskLevel: severity,
      details
    }
  }
}

export const puqeCalculator = new PuqeCalculator()