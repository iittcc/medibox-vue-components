import { z } from 'zod'
import { PatientBaseSchema } from '@/schemas/patient'

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