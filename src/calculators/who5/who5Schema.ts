import { z } from 'zod'
import { PatientPsychologySchema } from '@/schemas/patient'

// WHO-5 Well-Being Index Schema
export const Who5QuestionSchema = z.object({
  question1: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int(),
  question2: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int(),
  question3: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int(),
  question4: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int(),
  question5: z.number()
    .min(0, 'Score skal være mindst 0')
    .max(5, 'Score skal være højst 5')
    .int()
})

export const Who5Schema = z.object({
  patient: PatientPsychologySchema,
  responses: Who5QuestionSchema,
  rawScore: z.number()
    .min(0, 'Råscore skal være mindst 0')
    .max(25, 'Råscore skal være højst 25')
    .int(),
  percentageScore: z.number()
    .min(0, 'Procentscore skal være mindst 0')
    .max(100, 'Procentscore skal være højst 100'),
  wellBeingLevel: z.enum(['poor', 'below_average', 'average', 'good', 'excellent']),
  depressionRisk: z.boolean(),
  completedAt: z.date().optional(),
  notes: z.string().max(500, 'Noter må højst være 500 tegn').optional()
})