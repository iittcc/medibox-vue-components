import type { AuditResponses, AuditDetails } from '@/types/calculatorTypes'

// Re-export types for convenience
export type { AuditResponses, AuditDetails }

// AUDIT-specific risk categories
export type AuditRiskCategory = 'low' | 'high'

// AUDIT score interpretation
export interface AuditInterpretation {
  interpretation: string
  recommendations: string[]
  riskLevel: AuditRiskCategory
  consumptionScore?: number
  dependenceScore?: number
  harmScore?: number
}

// AUDIT question weights and validation
export const AUDIT_CONFIG = {
  QUESTION_COUNT: 10,
  SCORE_RANGE: { min: 0, max: 40 },
  QUESTION_RANGE: { min: 0, max: 4 },
  RISK_THRESHOLDS: {
    LOW: 0,      // 0-7: Low risk
    HIGH: 8,    // 8-40: High risk
  }
} as const