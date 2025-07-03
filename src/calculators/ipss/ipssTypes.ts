import type { CalculatorDetails, RiskLevel } from '@/types/calculatorTypes'

// IPSS Calculator Types
export interface IpssResponses {
  incompleteEmptying: number  // 0-5: Never to almost always
  frequency: number           // 0-5: Never to almost always
  intermittency: number       // 0-5: Never to almost always
  urgency: number            // 0-5: Never to almost always
  weakStream: number         // 0-5: Never to almost always
  straining: number          // 0-5: Never to almost always
  nocturia: number           // 0-5: Never to 5 or more times
  qualityOfLife: number      // 0-6: Delighted to terrible
}

export interface IpssDetails extends CalculatorDetails {
  symptomScore: number
  qualityOfLifeScore: number
  symptomSeverity: 'mild' | 'moderate' | 'severe'
  qualityImpact: 'minimal' | 'moderate' | 'significant' | 'severe'
}

export interface IpssCalculationResult {
  score: number
  interpretation: string
  recommendations: string[]
  riskLevel: RiskLevel
  details: IpssDetails
}