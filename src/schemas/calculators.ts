import { z } from 'zod'
import { PatientBaseSchema, PatientPsychologySchema, PatientInfectionSchema, PatientPregnancySchema } from './patient'

// Import schemas from their co-located modules
import { EpdsQuestionSchema, EpdsSchema } from '@/calculators/epds'
import { IpssQuestionSchema, IpssSchema } from '@/calculators/ipss'
import { PuqeQuestionSchema, PuqeSchema } from '@/calculators/puqe'
import { WestleyCroupQuestionSchema, WestleyCroupSchema } from '@/calculators/westleyCroup'
import { Who5QuestionSchema, Who5Schema } from '@/calculators/who5'
import { LrtiQuestionSchema, LrtiSchema } from '@/calculators/lrti'
import { Score2QuestionSchema, Score2Schema } from '@/calculators/score2'

// AUDIT (Alcohol Use Disorders Identification Test) Schema
export const AuditQuestionSchema = z.object({
  question1: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int(),
  question2: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int(),
  question3: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int(),
  question4: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int(),
  question5: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int(),
  question6: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int(),
  question7: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int(),
  question8: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int(),
  question9: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int(),
  question10: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int('Score skal være et helt tal')
})

export const AuditSchema = z.object({
  patient: PatientPsychologySchema,
  responses: AuditQuestionSchema,
  totalScore: z.number()
    .min(0, 'Total score skal være mindst 0')
    .max(40, 'Total score skal være højst 40')
    .int('Total score skal være et helt tal'),
  riskLevel: z.enum(['low', 'medium', 'high', 'very_high']),
  completedAt: z.date().optional(),
  notes: z.string().max(500, 'Noter må højst være 500 tegn').optional()
})

// DANPSS (Danish Depression and Anxiety Screening Scale) Schema
export const DanpssQuestionSchema = z.object({
  question1: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int(),
  question2: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int(),
  question3: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int(),
  question4: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int(),
  question5: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int(),
  question6: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int(),
  question7: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int(),
  question8: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int(),
  question9: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int(),
  question10: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int(),
  question11: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int(),
  question12: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal')
})

export const DanpssSchema = z.object({
  patient: PatientPsychologySchema,
  responses: DanpssQuestionSchema,
  depressionScore: z.number()
    .min(0, 'Depression score skal være mindst 0')
    .max(21, 'Depression score skal være højst 21')
    .int('Depression score skal være et helt tal'),
  anxietyScore: z.number()
    .min(0, 'Angst score skal være mindst 0')
    .max(15, 'Angst score skal være højst 15')
    .int('Angst score skal være et helt tal'),
  totalScore: z.number()
    .min(0, 'Total score skal være mindst 0')
    .max(36, 'Total score skal være højst 36')
    .int('Total score skal være et helt tal'),
  depressionLevel: z.enum(['none', 'mild', 'moderate', 'severe']),
  anxietyLevel: z.enum(['none', 'mild', 'moderate', 'severe']),
  completedAt: z.date().optional(),
  notes: z.string().max(500, 'Noter må højst være 500 tegn').optional()
})

// EPDS (Edinburgh Postnatal Depression Scale) Schema - Moved to @/calculators/epds

// EPDS, IPSS, PUQE, WestleyCroup, WHO-5, LRTI, SCORE2 schemas moved to their respective calculator modules

export const GcsSchema = z.object({
  patient: PatientBaseSchema,
  eyeOpening: z.number()
    .min(1, 'Eye opening score skal være mindst 1')
    .max(4, 'Eye opening score skal være højst 4')
    .int('Eye opening score skal være et helt tal'),
  verbalResponse: z.number()
    .min(1, 'Verbal response score skal være mindst 1')
    .max(5, 'Verbal response score skal være højst 5')
    .int('Verbal response score skal være et helt tal'),
  motorResponse: z.number()
    .min(1, 'Motor response score skal være mindst 1')
    .max(6, 'Motor response score skal være højst 6')
    .int('Motor response score skal være et helt tal'),
  totalScore: z.number()
    .min(3, 'Total GCS score skal være mindst 3')
    .max(15, 'Total GCS score skal være højst 15')
    .int('Total GCS score skal være et helt tal'),
  severity: z.enum(['severe', 'moderate', 'mild']),
  completedAt: z.date().optional(),
  notes: z.string().max(500, 'Noter må højst være 500 tegn').optional()
})

export const CalculatorResultSchema = z.object({
  calculatorType: z.string(),
  patientId: z.string().optional(),
  score: z.number(),
  interpretation: z.string(),
  recommendations: z.array(z.string()),
  riskLevel: z.string(),
  completedAt: z.date(),
  calculatedBy: z.string().optional(),
  version: z.string().optional()
})

// Export all types
export type AuditData = z.infer<typeof AuditSchema>
export type DanpssData = z.infer<typeof DanpssSchema>
export type EpdsData = z.infer<typeof EpdsSchema>
export type GcsData = z.infer<typeof GcsSchema>
export type IpssData = z.infer<typeof IpssSchema>
export type LrtiData = z.infer<typeof LrtiSchema>
export type PuqeData = z.infer<typeof PuqeSchema>
export type WestleyCroupData = z.infer<typeof WestleyCroupSchema>
export type Who5Data = z.infer<typeof Who5Schema>
export type Score2Data = z.infer<typeof Score2Schema>
export type CalculatorResult = z.infer<typeof CalculatorResultSchema>

// Utility function to get schema for calculator type
export const getCalculatorSchema = (calculatorType: string) => {
  const schemas: Record<string, z.ZodSchema> = {
    'audit': AuditSchema,
    'danpss': DanpssSchema,
    'epds': EpdsSchema,
    'gcs': GcsSchema,
    'ipss': IpssSchema,
    'lrti': LrtiSchema,
    'puqe': PuqeSchema,
    'westleycroupscore': WestleyCroupSchema,
    'who5': Who5Schema,
    'score2': Score2Schema
  }
  
  return schemas[calculatorType] || z.object({})
}

// Utility function to get only question/response schema for calculator type
export const getCalculatorQuestionSchema = (calculatorType: string) => {
  const schemas: Record<string, z.ZodSchema> = {
    'audit': AuditQuestionSchema,
    'danpss': DanpssQuestionSchema,
    'epds': EpdsQuestionSchema,
    'gcs': GcsSchema, // GCS doesn't have a separate question schema
    'ipss': IpssQuestionSchema,
    'lrti': LrtiQuestionSchema, // Now has proper question schema
    'puqe': PuqeQuestionSchema,
    'westleycroupscore': WestleyCroupQuestionSchema, // Now has proper question schema
    'who5': Who5QuestionSchema,
    'score2': Score2QuestionSchema // Now has proper question schema
  }
  
  return schemas[calculatorType] || z.object({})
}

// Validation helpers for score calculation
export const validateCalculatorResponse = (calculatorType: string, data: Record<string, any>): boolean => {
  try {
    const schema = getCalculatorSchema(calculatorType)
    schema.parse(data)
    return true
  } catch (error) {
    console.error(`Validation failed for ${calculatorType}:`, error)
    return false
  }
}

export const getScoreRange = (calculatorType: string): { min: number; max: number } => {
  const ranges: Record<string, { min: number; max: number }> = {
    'audit': { min: 0, max: 40 },
    'danpss': { min: 0, max: 36 },
    'epds': { min: 0, max: 30 },
    'gcs': { min: 3, max: 15 },
    'ipss': { min: 0, max: 35 },
    'puqe': { min: 3, max: 15 },
    'westleycroupscore': { min: 0, max: 14 },
    'who5': { min: 0, max: 100 },
    'score2': { min: 0, max: 100 },
    'lrti': { min: 0, max: 100 }
  }
  
  return ranges[calculatorType] || { min: 0, max: 100 }
}