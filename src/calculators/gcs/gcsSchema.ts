import { z } from 'zod'
import { PatientBaseSchema } from '@/schemas/patient'

// Glasgow Coma Scale Schema
export const GcsQuestionSchema = z.object({
  eyeOpening: z.number()
    .min(1, 'Øjenåbning score skal være mindst 1')
    .max(4, 'Øjenåbning score skal være højst 4')
    .int('Øjenåbning score skal være et helt tal'),
  verbalResponse: z.number()
    .min(1, 'Verbalt respons score skal være mindst 1')
    .max(5, 'Verbalt respons score skal være højst 5')
    .int('Verbalt respons score skal være et helt tal'),
  motorResponse: z.number()
    .min(1, 'Motorisk respons score skal være mindst 1')
    .max(6, 'Motorisk respons score skal være højst 6')
    .int('Motorisk respons score skal være et helt tal')
})

export const GcsSchema = z.object({
  patient: PatientBaseSchema.extend({
    age: z.number()
      .min(5, 'Glasgow Coma Scale er beregnet til patienter fra 5 år')
      .max(110, 'Alder skal være under 110 år')
      .int('Alder skal være et helt tal')
  }),
  responses: GcsQuestionSchema,
  totalScore: z.number()
    .min(3, 'Total GCS score skal være mindst 3')
    .max(15, 'Total GCS score skal være højst 15')
    .int('Total GCS score skal være et helt tal'),
  consciousness: z.enum(['severe', 'moderate', 'mild', 'normal']),
  clinicalSignificance: z.string().optional(),
  completedAt: z.date().optional(),
  notes: z.string().max(500, 'Noter må højst være 500 tegn').optional()
})