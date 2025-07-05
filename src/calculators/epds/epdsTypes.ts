import type { CalculatorDetails, RiskLevel } from '@/types/calculatorTypes'

// EPDS Calculator Types
export interface EpdsResponses {
  question1: number  // Able to laugh and see funny side
  question2: number  // Look forward with enjoyment
  question3: number  // Blamed self unnecessarily
  question4: number  // Anxious or worried for no good reason
  question5: number  // Scared or panicky for no good reason
  question6: number  // Things have been getting on top of me
  question7: number  // Unhappy that I have had difficulty sleeping
  question8: number  // Sad or miserable
  question9: number  // Unhappy that I have been crying
  question10: number // Thought of harming myself
}

export interface EpdsDetails extends CalculatorDetails {
  depressionRisk: RiskLevel
  suicidalThoughts: boolean
  urgentReferralNeeded: boolean
  scoreCategory: 'minimal' | 'mild' | 'moderate' | 'severe'
}

export interface EpdsCalculationResult {
  score: number
  interpretation: string
  recommendations: string[]
  riskLevel: RiskLevel
  details: EpdsDetails
}