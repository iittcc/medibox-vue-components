import { BaseCalculator } from '../base/calculatorBase'
import type { CalculationResult, ValidationResult, CalculatorMetadata, ScoreRange } from '../base/types'
import type { Score2Responses, Score2Details } from './score2Types'
import { Score2QuestionSchema } from './score2Schema'

export class Score2Calculator extends BaseCalculator<Score2Responses, Score2Details> {
  readonly metadata: CalculatorMetadata = {
    name: 'SCORE2',
    version: '1.0.0',
    description: 'SCORE2 - European cardiovascular risk assessment tool',
    category: 'general',
    references: ['SCORE2 risk prediction algorithms: new models to estimate 10-year risk of cardiovascular disease in Europe.']
  }

  readonly scoreRange: ScoreRange = {
    min: 0,
    max: 100
  }

  validate(responses: Score2Responses): ValidationResult {
    try {
      Score2QuestionSchema.parse(responses)
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

  protected calculateScore(responses: Score2Responses): CalculationResult<Score2Details> {
    // Simplified SCORE2 calculation based on legacy implementation
    let risk = 5 // Base risk
    
    if (responses.smoking) risk *= 2
    if (responses.systolicBP > 140) risk += 2
    if (responses.totalCholesterol > 6) risk += 1
    if (responses.hdlCholesterol < 1.2) risk += 1
    
    // Age factor
    if (responses.age > 60) risk += 2
    else if (responses.age > 50) risk += 1
    
    // Gender factor
    if (responses.gender === 'male') risk += 1
    
    // Region factor
    if (responses.region === 'high_risk') risk += 2
    else if (responses.region === 'moderate_risk') risk += 1
    
    // Cap at 100%
    const riskPercentage = Math.min(risk, 100)
    
    const riskLevel = riskPercentage <= 5 ? 'low' : riskPercentage <= 10 ? 'moderate' : riskPercentage <= 20 ? 'high' : 'very_high'

    const details: Score2Details = {
      riskFactors: {
        smoking: responses.smoking,
        hypertension: responses.systolicBP > 140,
        dyslipidemia: responses.totalCholesterol > 6 || responses.hdlCholesterol < 1.2,
        age: responses.age > 60
      },
      cvdRiskPercentage: riskPercentage,
      riskCategory: riskLevel,
      interventionRecommended: riskPercentage > 10
    }

    const interpretation = `10-års kardiovaskulær risiko: ${riskPercentage}%`
    const recommendations = riskPercentage > 10 
      ? ['Livsstilsændringer', 'Overvej lipidsænkende medicin', 'Regelmæssig kontrol']
      : ['Livsstilsændringer', 'Regelmæssig kontrol']

    return {
      score: riskPercentage,
      interpretation,
      recommendations,
      riskLevel,
      details
    }
  }
}

export const score2Calculator = new Score2Calculator()