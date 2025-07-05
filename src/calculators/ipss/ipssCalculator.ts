import { BaseCalculator } from '../base/calculatorBase'
import type { CalculationResult, ValidationResult, CalculatorMetadata, ScoreRange } from '../base/types'
import type { IpssResponses, IpssDetails } from './ipssTypes'
import { IpssQuestionSchema } from './ipssSchema'

export class IpssCalculator extends BaseCalculator<IpssResponses, IpssDetails> {
  readonly metadata: CalculatorMetadata = {
    name: 'IPSS',
    version: '1.0.0',
    description: 'International Prostate Symptom Score - Assessment of prostate-related urinary symptoms',
    category: 'general',
    references: ['Barry MJ, et al. The American Urological Association symptom index for benign prostatic hyperplasia.']
  }

  readonly scoreRange: ScoreRange = {
    min: 0,
    max: 35
  }

  validate(responses: IpssResponses): ValidationResult {
    try {
      IpssQuestionSchema.parse(responses)
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

  protected calculateScore(responses: IpssResponses): CalculationResult<IpssDetails> {
    const symptomQuestions = ['incompleteEmptying', 'frequency', 'intermittency', 'urgency', 'weakStream', 'straining', 'nocturia']
    const symptomScore = symptomQuestions.reduce((sum, q) => sum + (Number(responses[q as keyof IpssResponses]) || 0), 0)
    const qualityOfLife = Number(responses.qualityOfLife) || 0
    
    // Determine symptom severity
    const severity: 'mild' | 'moderate' | 'severe' = symptomScore <= 7 ? 'mild' : symptomScore <= 19 ? 'moderate' : 'severe'
    
    // Determine quality of life impact
    let qualityImpact: 'minimal' | 'moderate' | 'significant' | 'severe'
    if (qualityOfLife <= 1) {
      qualityImpact = 'minimal'
    } else if (qualityOfLife <= 3) {
      qualityImpact = 'moderate'
    } else if (qualityOfLife <= 5) {
      qualityImpact = 'significant'
    } else {
      qualityImpact = 'severe'
    }

    const details: IpssDetails = {
      symptomScore,
      qualityOfLifeScore: qualityOfLife,
      symptomSeverity: severity,
      qualityImpact
    }

    const interpretation = `${severity === 'mild' ? 'Lette' : severity === 'moderate' ? 'Moderate' : 'Svære'} prostata symptomer`
    const recommendations = ['Diskuter med læge', 'Overvej behandlingsmuligheder']

    return {
      score: symptomScore,
      interpretation,
      recommendations,
      riskLevel: severity,
      details
    }
  }
}

export const ipssCalculator = new IpssCalculator()