import { BaseCalculator } from '../base/calculatorBase'
import type { CalculationResult, ValidationResult, CalculatorMetadata, ScoreRange } from '../base/types'
import type { WestleyCroupResponses, WestleyCroupDetails } from './westleyCroupTypes'
import { WestleyCroupQuestionSchema } from './westleyCroupSchema'

export class WestleyCroupCalculator extends BaseCalculator<WestleyCroupResponses, WestleyCroupDetails> {
  readonly metadata: CalculatorMetadata = {
    name: 'Westley Croup Score',
    version: '1.0.0',
    description: 'Westley Croup Score - Assessment of croup severity in pediatric patients',
    category: 'general',
    references: ['Westley CR, et al. Nebulized racemic epinephrine by IPPB for the treatment of croup.']
  }

  readonly scoreRange: ScoreRange = {
    min: 0,
    max: 14
  }

  validate(responses: WestleyCroupResponses): ValidationResult {
    try {
      WestleyCroupQuestionSchema.parse(responses)
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

  protected calculateScore(responses: WestleyCroupResponses): CalculationResult<WestleyCroupDetails> {
    const score = Number(responses.levelOfConsciousness || 0) + 
                  Number(responses.cyanosis || 0) + 
                  Number(responses.stridor || 0) + 
                  Number(responses.airEntry || 0) + 
                  Number(responses.retractions || 0)
    
    let interpretation: string
    let recommendations: string[]
    let riskLevel: 'mild' | 'moderate' | 'severe'
    let urgency: 'observe' | 'treat' | 'urgent' | 'critical'
    
    if (score <= 2) {
      interpretation = 'Let croup'
      recommendations = ['Observation hjemme', 'Kølig fugtig luft']
      riskLevel = 'mild'
      urgency = 'observe'
    } else if (score <= 5) {
      interpretation = 'Moderat croup'
      recommendations = ['Nebuliseret epinephrin', 'Steroid behandling']
      riskLevel = 'moderate'
      urgency = 'treat'
    } else {
      interpretation = 'Alvorlig croup'
      recommendations = ['Hospitalsindlæggelse', 'Intensiv behandling']
      riskLevel = 'severe'
      urgency = 'critical'
    }

    const details: WestleyCroupDetails = {
      consciousnessScore: responses.levelOfConsciousness,
      respiratoryDistress: riskLevel,
      urgency
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

export const westleyCroupCalculator = new WestleyCroupCalculator()