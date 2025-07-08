import type { GcsResponses, GcsDetails, RiskLevel } from '@/types/calculatorTypes'

// Re-export types for convenience
export type { GcsResponses, GcsDetails }

// GCS-specific calculation result
export interface GcsCalculationResult {
  score: number
  interpretation: string
  recommendations: string[]
  riskLevel: RiskLevel
  details: GcsDetails
}

// GCS configuration
export const GCS_CONFIG = {
  SCORE_RANGE: { min: 3, max: 15 },
  
  // Component score ranges
  EYE_OPENING_RANGE: { min: 1, max: 4 },
  VERBAL_RESPONSE_RANGE: { min: 1, max: 5 },
  MOTOR_RESPONSE_RANGE: { min: 1, max: 6 },
  
  // Severity thresholds
  SEVERITY_THRESHOLDS: {
    SEVERE: 8,    // 3-8: Severe brain injury
    MODERATE: 12, // 9-12: Moderate brain injury
    MILD: 15      // 13-15: Mild brain injury
  }
} as const

// GCS response options for validation
export const GCS_OPTIONS = {
  eyeOpening: [
    { value: 1, label: 'Ingen reaktion' },
    { value: 2, label: 'Åbner øjnene ved smertestimuli' },
    { value: 3, label: 'Åbner øjnene ved verbal stimuli' },
    { value: 4, label: 'Åbner øjnene spontant' }
  ],
  verbalResponse: [
    { value: 1, label: 'Ingen verbal reaktion' },
    { value: 2, label: 'Uforståelige lyde' },
    { value: 3, label: 'Usammenhængende ord' },
    { value: 4, label: 'Forvirrede sætninger' },
    { value: 5, label: 'Orienteret og sammenhængende' }
  ],
  motorResponse: [
    { value: 1, label: 'Ingen motorisk reaktion' },
    { value: 2, label: 'Unormal ekstensorbevægelse' },
    { value: 3, label: 'Unormal fleksorbevægelse' },
    { value: 4, label: 'Trækker væk fra smerte' },
    { value: 5, label: 'Lokaliserer smerte' },
    { value: 6, label: 'Adlyder kommandoer' }
  ]
} as const