import type { CalculatorDetails, RiskLevel } from '@/types/calculatorTypes'

// Westley Croup Score Types
export interface WestleyCroupResponses {
  levelOfConsciousness: number // 0-5: Normal to lethargy/confusion
  cyanosis: number            // 0-5: None to cyanosis at rest
  stridor: number             // 0-2: None to at rest
  airEntry: number            // 0-2: Normal to markedly decreased
  retractions: number         // 0-3: None to severe
}

export interface WestleyCroupDetails extends CalculatorDetails {
  consciousnessScore: number
  respiratoryDistress: RiskLevel
  urgency: 'observe' | 'treat' | 'urgent' | 'critical'
}

export interface WestleyCroupCalculationResult {
  score: number
  interpretation: string
  recommendations: string[]
  riskLevel: RiskLevel
  details: WestleyCroupDetails
}