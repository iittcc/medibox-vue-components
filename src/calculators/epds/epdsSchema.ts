import { z } from 'zod'
import { PatientPregnancySchema } from '@/schemas/patient'

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