import { z } from 'zod'
import { PatientPregnancySchema } from '@/schemas/patient'

// EPDS (Edinburgh Postnatal Depression Scale) Schema
// Reusable validation schema for a single EPDS question
const EpdsQuestionValidator = z.number()
  .min(0, 'Score skal være mindst 0')
  .max(3, 'Score skal være højst 3')
  .int()

// Generate question schema dynamically for all 10 questions
export const EpdsQuestionSchema = z.object(
  Object.fromEntries(
    Array.from({ length: 10 }, (_, i) => [`question${i + 1}`, EpdsQuestionValidator])
  )
)

export const EpdsSchema = z.object({
  patient: PatientPregnancySchema,
  responses: EpdsQuestionSchema,
  totalScore: z.number()
    .min(0, 'Total score skal være mindst 0')
    .max(30, 'Total score skal være højst 30')
    .int(),
  riskLevel: z.enum(['minimal', 'mild', 'moderate', 'severe']),
  suicidalThoughts: z.boolean(),
  completedAt: z.date().optional(),
  notes: z.string().max(500, 'Noter må højst være 500 tegn').optional()
})