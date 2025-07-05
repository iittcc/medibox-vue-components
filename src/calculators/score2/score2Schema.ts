import { z } from 'zod'
import { PatientBaseSchema } from '@/schemas/patient'

// SCORE2 (European cardiovascular risk assessment) Response Schema
export const Score2QuestionSchema = z.object({
  age: z.number()
    .min(40, 'SCORE2 er for personer 40-69 år')
    .max(69, 'SCORE2 er for personer 40-69 år')
    .int('Alder skal være et helt tal'),
  gender: z.enum(['male', 'female']),
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
  region: z.enum(['low_risk', 'moderate_risk', 'high_risk'])
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