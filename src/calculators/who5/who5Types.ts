import type { CalculatorDetails, RiskLevel } from '@/types/calculatorTypes'

// WHO-5 Calculator Types
export interface Who5Responses {
  question1: number  // I have felt cheerful and in good spirits
  question2: number  // I have felt calm and relaxed
  question3: number  // I have felt active and vigorous
  question4: number  // I woke up feeling fresh and rested
  question5: number  // My daily life has been filled with things that interest me
}

export interface Who5Details extends CalculatorDetails {
  rawScore: number
  percentageScore: number
  wellBeingLevel: 'poor' | 'below_average' | 'average' | 'good' | 'excellent'
  depressionRisk: boolean
  screeningRecommended: boolean
}

export interface Who5CalculationResult {
  score: number
  interpretation: string
  recommendations: string[]
  riskLevel: RiskLevel
  details: Who5Details
}