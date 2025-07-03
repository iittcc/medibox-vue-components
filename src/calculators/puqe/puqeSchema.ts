import { z } from 'zod'
import { PatientPregnancySchema } from '@/schemas/patient'

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