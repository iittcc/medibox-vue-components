import type { CalculatorDetails, RiskLevel } from '@/types/calculatorTypes'

// LRTI Calculator Types
export interface LrtiResponses {
  temperature: number           // Body temperature in Celsius
  respiratoryRate: number       // Breaths per minute
  heartRate: number            // Beats per minute
  bloodPressureSystolic: number // Systolic BP in mmHg
  oxygenSaturation?: number    // SpO2 percentage (optional)
  consciousnessLevel?: number  // 0-4: Alert to unresponsive (optional)
}

export interface LrtiDetails extends CalculatorDetails {
  riskFactors: number
  validatedInputs: {
    temperature: number
    respiratoryRate: number
    heartRate: number
    bloodPressureSystolic: number
  }
  vitalSignsCategory: 'normal' | 'concerning' | 'critical'
  antibioticRecommended: boolean
}

export interface LrtiCalculationResult {
  score: number
  interpretation: string
  recommendations: string[]
  riskLevel: RiskLevel
  details: LrtiDetails
  error?: boolean
}