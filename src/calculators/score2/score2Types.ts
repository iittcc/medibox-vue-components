import type { CalculatorDetails, RiskLevel } from '@/types/calculatorTypes'

// SCORE2 Calculator Types
export interface Score2Responses {
  age: number
  gender: 'male' | 'female'
  smoking: boolean
  systolicBP: number      // Systolic blood pressure
  totalCholesterol: number // Total cholesterol mmol/L
  hdlCholesterol: number  // HDL cholesterol mmol/L
  region: 'low_risk' | 'moderate_risk' | 'high_risk' // CVD risk region
}

export interface Score2Details extends CalculatorDetails {
  riskFactors: {
    smoking: boolean
    hypertension: boolean
    dyslipidemia: boolean
    age: boolean
  }
  cvdRiskPercentage: number
  riskCategory: RiskLevel
  interventionRecommended: boolean
}

export interface Score2CalculationResult {
  score: number
  interpretation: string
  recommendations: string[]
  riskLevel: RiskLevel
  details: Score2Details
}