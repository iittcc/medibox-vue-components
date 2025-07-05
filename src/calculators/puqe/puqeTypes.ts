import type { CalculatorDetails, RiskLevel } from '@/types/calculatorTypes'

// PUQE Calculator Types
export interface PuqeResponses {
  nausea: number    // 1-5: Length of nausea in hours
  vomiting: number  // 1-5: Number of vomiting episodes
  retching: number  // 1-5: Number of retching episodes
}

export interface PuqeDetails extends CalculatorDetails {
  nauseaHours: number
  vomitingEpisodes: number
  retchingEpisodes: number
  severity: 'mild' | 'moderate' | 'severe'
  hyperemesisRisk: boolean
}

export interface PuqeCalculationResult {
  score: number
  interpretation: string
  recommendations: string[]
  riskLevel: RiskLevel
  details: PuqeDetails
}