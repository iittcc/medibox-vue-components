import { z } from 'zod'
import { PatientBaseSchema, PatientPsychologySchema, PatientInfectionSchema, PatientPregnancySchema } from './patient'

// AUDIT (Alcohol Use Disorders Identification Test) Schema
export const AuditQuestionSchema = z.object({
  question1: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int('Score skal være et helt tal'),
  question2: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int('Score skal være et helt tal'),
  question3: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int('Score skal være et helt tal'),
  question4: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int('Score skal være et helt tal'),
  question5: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int('Score skal være et helt tal'),
  question6: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int('Score skal være et helt tal'),
  question7: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int('Score skal være et helt tal'),
  question8: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int('Score skal være et helt tal'),
  question9: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(4, 'Score skal være højst 4')
    .int('Score skal være et helt tal'),
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
    .int('Score skal være et helt tal'),
  question2: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question3: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question4: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question5: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question6: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question7: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question8: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question9: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question10: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question11: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
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

// EPDS (Edinburgh Postnatal Depression Scale) Schema
export const EpdsQuestionSchema = z.object({
  question1: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question2: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question3: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question4: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question5: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question6: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question7: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question8: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question9: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal'),
  question10: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(3, 'Score skal være højst 3')
    .int('Score skal være et helt tal')
})

export const EpdsSchema = z.object({
  patient: PatientPregnancySchema,
  responses: EpdsQuestionSchema,
  totalScore: z.number()
    .min(0, 'Total score skal være mindst 0')
    .max(30, 'Total score skal være højst 30')
    .int('Total score skal være et helt tal'),
  riskLevel: z.enum(['minimal', 'mild', 'moderate', 'severe']),
  suicidalThoughts: z.boolean(),
  completedAt: z.date().optional(),
  notes: z.string().max(500, 'Noter må højst være 500 tegn').optional()
})

// GCS (Glasgow Coma Scale) Schema
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

// IPSS (International Prostate Symptom Score) Schema
export const IpssQuestionSchema = z.object({
  incompleteEmptying: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int('Score skal være et helt tal'),
  frequency: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int('Score skal være et helt tal'),
  intermittency: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int('Score skal være et helt tal'),
  urgency: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int('Score skal være et helt tal'),
  weakStream: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int('Score skal være et helt tal'),
  straining: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int('Score skal være et helt tal'),
  nocturia: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int('Score skal være et helt tal'),
  qualityOfLife: z.number()
    .min(0, 'Livskvalitet score skal være mindst 0')
    .max(6, 'Livskvalitet score skal være højst 6')
    .int('Livskvalitet score skal være et helt tal')
})

export const IpssSchema = z.object({
  patient: PatientBaseSchema.extend({
    gender: z.literal('male', { errorMap: () => ({ message: 'IPSS er kun for mænd' }) })
  }),
  responses: IpssQuestionSchema,
  symptomScore: z.number()
    .min(0, 'Symptom score skal være mindst 0')
    .max(35, 'Symptom score skal være højst 35')
    .int('Symptom score skal være et helt tal'),
  qualityOfLife: z.number()
    .min(0, 'Livskvalitet score skal være mindst 0')
    .max(6, 'Livskvalitet score skal være højst 6')
    .int('Livskvalitet score skal være et helt tal'),
  severity: z.enum(['mild', 'moderate', 'severe']),
  completedAt: z.date().optional(),
  notes: z.string().max(500, 'Noter må højst være 500 tegn').optional()
})

// LRTI (Lower Respiratory Tract Infection) Schema
export const LrtiSchema = z.object({
  patient: PatientInfectionSchema,
  symptoms: z.object({
    cough: z.boolean(),
    sputum: z.boolean(),
    dyspnea: z.boolean(),
    chestPain: z.boolean(),
    fever: z.boolean(),
    malaise: z.boolean()
  }),
  clinicalSigns: z.object({
    temperature: z.number()
      .min(35, 'Temperatur skal være mindst 35°C')
      .max(42, 'Temperatur skal være højst 42°C'),
    respiratoryRate: z.number()
      .min(10, 'Respirationsfrekvens skal være mindst 10/min')
      .max(60, 'Respirationsfrekvens skal være højst 60/min')
      .int('Respirationsfrekvens skal være et helt tal'),
    heartRate: z.number()
      .min(40, 'Puls skal være mindst 40/min')
      .max(200, 'Puls skal være højst 200/min')
      .int('Puls skal være et helt tal'),
    bloodPressureSystolic: z.number()
      .min(70, 'Systolisk blodtryk skal være mindst 70 mmHg')
      .max(250, 'Systolisk blodtryk skal være højst 250 mmHg')
      .int('Systolisk blodtryk skal være et helt tal'),
    oxygenSaturation: z.number()
      .min(70, 'Iltmætning skal være mindst 70%')
      .max(100, 'Iltmætning skal være højst 100%')
      .optional()
  }),
  riskScore: z.number()
    .min(0, 'Risk score skal være mindst 0')
    .max(100, 'Risk score skal være højst 100')
    .int('Risk score skal være et helt tal'),
  riskLevel: z.enum(['low', 'moderate', 'high', 'very_high']),
  recommendation: z.enum(['outpatient', 'observation', 'inpatient', 'icu']),
  completedAt: z.date().optional(),
  notes: z.string().max(500, 'Noter må højst være 500 tegn').optional()
})

// PUQE (Pregnancy-Unique Quantification of Emesis) Schema
export const PuqeQuestionSchema = z.object({
  nausea: z.number()
    .min(1, 'Kvalme score skal være mindst 1')
    .max(5, 'Kvalme score skal være højst 5')
    .int('Kvalme score skal være et helt tal'),
  vomiting: z.number()
    .min(1, 'Opkastning score skal være mindst 1')
    .max(5, 'Opkastning score skal være højst 5')
    .int('Opkastning score skal være et helt tal'),
  retching: z.number()
    .min(1, 'Gylping score skal være mindst 1')
    .max(5, 'Gylping score skal være højst 5')
    .int('Gylping score skal være et helt tal')
})

export const PuqeSchema = z.object({
  patient: PatientPregnancySchema,
  responses: PuqeQuestionSchema,
  totalScore: z.number()
    .min(3, 'Total score skal være mindst 3')
    .max(15, 'Total score skal være højst 15')
    .int('Total score skal være et helt tal'),
  severity: z.enum(['mild', 'moderate', 'severe']),
  completedAt: z.date().optional(),
  notes: z.string().max(500, 'Noter må højst være 500 tegn').optional()
})

// Westley Croup Score Schema
export const WestleyCroupSchema = z.object({
  patient: PatientBaseSchema.extend({
    age: z.number()
      .min(0, 'Alder skal være mindst 0 måneder')
      .max(72, 'Westley Croup Score er typisk for børn under 6 år')
      .int('Alder skal være et helt tal (i måneder)')
  }),
  inspiratoryStridor: z.number()
    .min(0, 'Inspiratorisk stridor score skal være mindst 0')
    .max(2, 'Inspiratorisk stridor score skal være højst 2')
    .int('Inspiratorisk stridor score skal være et helt tal'),
  retractions: z.number()
    .min(0, 'Indtrækninger score skal være mindst 0')
    .max(3, 'Indtrækninger score skal være højst 3')
    .int('Indtrækninger score skal være et helt tal'),
  airEntry: z.number()
    .min(0, 'Luftindstrømning score skal være mindst 0')
    .max(2, 'Luftindstrømning score skal være højst 2')
    .int('Luftindstrømning score skal være et helt tal'),
  cyanosis: z.number()
    .min(0, 'Cyanose score skal være mindst 0')
    .max(2, 'Cyanose score skal være højst 2')
    .int('Cyanose score skal være et helt tal'),
  levelOfConsciousness: z.number()
    .min(0, 'Bevidsthedsniveau score skal være mindst 0')
    .max(5, 'Bevidsthedsniveau score skal være højst 5')
    .int('Bevidsthedsniveau score skal være et helt tal'),
  totalScore: z.number()
    .min(0, 'Total score skal være mindst 0')
    .max(14, 'Total score skal være højst 14')
    .int('Total score skal være et helt tal'),
  severity: z.enum(['mild', 'moderate', 'severe']),
  treatmentRecommendation: z.enum(['observation', 'nebulized_epinephrine', 'steroid_therapy', 'hospital_admission']),
  completedAt: z.date().optional(),
  notes: z.string().max(500, 'Noter må højst være 500 tegn').optional()
})

// WHO-5 Well-Being Index Schema
export const Who5QuestionSchema = z.object({
  question1: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int('Score skal være et helt tal'),
  question2: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int('Score skal være et helt tal'),
  question3: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int('Score skal være et helt tal'),
  question4: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int('Score skal være et helt tal'),
  question5: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int('Score skal være et helt tal')
})

export const Who5Schema = z.object({
  patient: PatientPsychologySchema,
  responses: Who5QuestionSchema,
  rawScore: z.number()
    .min(0, 'Raw score skal være mindst 0')
    .max(25, 'Raw score skal være højst 25')
    .int('Raw score skal være et helt tal'),
  percentageScore: z.number()
    .min(0, 'Percentage score skal være mindst 0')
    .max(100, 'Percentage score skal være højst 100'),
  wellBeingLevel: z.enum(['poor', 'below_average', 'average', 'good', 'excellent']),
  depressionRisk: z.boolean(),
  completedAt: z.date().optional(),
  notes: z.string().max(500, 'Noter må højst være 500 tegn').optional()
})

// SCORE2 (European cardiovascular risk assessment) Schema
export const Score2Schema = z.object({
  patient: PatientBaseSchema.extend({
    age: z.number()
      .min(40, 'SCORE2 er for personer 40-69 år')
      .max(69, 'SCORE2 er for personer 40-69 år')
      .int('Alder skal være et helt tal'),
    gender: z.enum(['male', 'female'])
  }),
  smoking: z.boolean(),
  systolicBP: z.number()
    .min(100, 'Systolisk blodtryk skal være mindst 100 mmHg')
    .max(200, 'Systolisk blodtryk skal være højst 200 mmHg')
    .int('Systolisk blodtryk skal være et helt tal'),
  totalCholesterol: z.number()
    .min(3, 'Total kolesterol skal være mindst 3 mmol/L')
    .max(10, 'Total kolesterol skal være højst 10 mmol/L'),
  hdlCholesterol: z.number()
    .min(0.5, 'HDL kolesterol skal være mindst 0.5 mmol/L')
    .max(3, 'HDL kolesterol skal være højst 3 mmol/L'),
  riskRegion: z.enum(['low_risk', 'moderate_risk', 'high_risk', 'very_high_risk']),
  cardiovascularRisk: z.number()
    .min(0, 'Kardiovaskulær risiko skal være mindst 0%')
    .max(100, 'Kardiovaskulær risiko skal være højst 100%'),
  riskCategory: z.enum(['low', 'moderate', 'high', 'very_high']),
  treatmentRecommendation: z.string().max(200, 'Behandlingsanbefaling må højst være 200 tegn'),
  completedAt: z.date().optional(),
  notes: z.string().max(500, 'Noter må højst være 500 tegn').optional()
})

// Common result interface for all calculators
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

// Validation helpers for score calculation
export const validateCalculatorResponse = (calculatorType: string, data: Record<string, any>): boolean => {
  try {
    const schema = getCalculatorSchema(calculatorType)
    schema.parse(data)
    return true
  } catch {
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