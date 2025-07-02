import type { DanpssResponses, DanpssDetails } from '@/types/calculatorTypes'

// Re-export types for convenience
export type { DanpssResponses, DanpssDetails }

// DANPSS-specific types
export type SeverityLevel = 'none' | 'mild' | 'moderate' | 'severe'

// DANPSS configuration
export const DANPSS_CONFIG = {
  QUESTION_COUNT: 12,
  SCORE_RANGE: { min: 0, max: 36 },
  QUESTION_RANGE: { min: 0, max: 3 },
  
  // Question groupings
  DEPRESSION_QUESTIONS: [1, 2, 3, 4, 5, 6, 7] as const,
  ANXIETY_QUESTIONS: [8, 9, 10, 11, 12] as const,
  
  // Thresholds for depression score (0-21)
  DEPRESSION_THRESHOLDS: {
    NONE: 5,     // 0-5: None
    MILD: 10,    // 6-10: Mild
    MODERATE: 15, // 11-15: Moderate
    SEVERE: 21   // 16-21: Severe
  },
  
  // Thresholds for anxiety score (0-15)
  ANXIETY_THRESHOLDS: {
    NONE: 3,     // 0-3: None
    MILD: 6,     // 4-6: Mild
    MODERATE: 9, // 7-9: Moderate
    SEVERE: 15   // 10-15: Severe
  },
  
  // Combined risk thresholds (0-36)
  COMBINED_THRESHOLDS: {
    LOW: 8,      // 0-8: Low risk
    MEDIUM: 16,  // 9-16: Medium risk
    HIGH: 36     // 17+: High risk
  }
} as const