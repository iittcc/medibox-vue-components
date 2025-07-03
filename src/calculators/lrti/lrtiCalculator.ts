import { BaseCalculator } from '../base/calculatorBase'
import type { CalculationResult, ValidationResult, CalculatorMetadata, ScoreRange } from '../base/types'
import type { LrtiResponses, LrtiDetails } from './lrtiTypes'
import { LrtiQuestionSchema } from './lrtiSchema'

export class LrtiCalculator extends BaseCalculator<LrtiResponses, LrtiDetails> {
  readonly metadata: CalculatorMetadata = {
    name: 'LRTI',
    version: '1.0.0',
    description: 'Lower Respiratory Tract Infection - Risk assessment for respiratory infections',
    category: 'infection',
    references: ['Pneumonia severity assessment guidelines and clinical protocols.']
  }

  readonly scoreRange: ScoreRange = {
    min: 0,
    max: 6
  }

  validate(responses: LrtiResponses): ValidationResult {
    try {
      LrtiQuestionSchema.parse(responses)
      return { isValid: true, errors: [] }
    } catch (error: any) {
      const errors = []
      const zodErrors = error.errors?.map((err: any) => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
        value: err.input
      })) || []
      errors.push(...zodErrors)

      return {
        isValid: false,
        errors
      }
    }
  }

  protected calculateScore(responses: LrtiResponses): CalculationResult<LrtiDetails> {
    // Use validated values (validation ensures these are present)
    const temperature = Number(responses.temperature)
    const respiratoryRate = Number(responses.respiratoryRate)
    const heartRate = Number(responses.heartRate)
    const bloodPressureSystolic = Number(responses.bloodPressureSystolic)

    // LRTI risk calculation with validated inputs
    let score = 0

    if (temperature > 38.5) score += 2
    if (respiratoryRate > 25) score += 1
    if (heartRate > 100) score += 1
    if (bloodPressureSystolic < 100) score += 2
    const riskLevel = score <= 1 ? 'low' : score <= 3 ? 'moderate' : score <= 5 ? 'high' : 'very_high'
    
    let vitalSignsCategory: 'normal' | 'concerning' | 'critical'
    if (score <= 1) {
      vitalSignsCategory = 'normal'
    } else if (score <= 3) {
      vitalSignsCategory = 'concerning'
    } else {
      vitalSignsCategory = 'critical'
    }

    const details: LrtiDetails = {
      riskFactors: score,
      validatedInputs: { temperature, respiratoryRate, heartRate, bloodPressureSystolic },
      vitalSignsCategory,
      antibioticRecommended: score >= 2
    }

    const interpretation = `LRTI risiko: ${riskLevel === 'low' ? 'lav' : 
      riskLevel === 'moderate' ? 'moderat' :
      riskLevel === 'high' ? 'høj' : 'meget høj'}`
    
    const recommendations = riskLevel === 'low' 
      ? ['Symptomatisk behandling', 'Observation hjemme']
      : ['Antibiotika behandling', 'Symptomatisk behandling']

    return {
      score,
      interpretation,
      recommendations,
      riskLevel,
      details
    }
  }
}

export const lrtiCalculator = new LrtiCalculator()