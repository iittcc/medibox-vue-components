import { z } from 'zod'
import { PatientBaseSchema } from '@/schemas/patient'

// Westley Croup Score Schema
export const WestleyCroupQuestionSchema = z.object({
  levelOfConsciousness: z.number()
    .min(0, 'Bevidsthedsniveau score skal være mindst 0')
    .max(5, 'Bevidsthedsniveau score skal være højst 5')
    .int('Bevidsthedsniveau score skal være et helt tal'),
  cyanosis: z.number()
    .min(0, 'Cyanose score skal være mindst 0')
    .max(5, 'Cyanose score skal være højst 5')
    .int('Cyanose score skal være et helt tal'),
  stridor: z.number()
    .min(0, 'Stridor score skal være mindst 0')
    .max(2, 'Stridor score skal være højst 2')
    .int('Stridor score skal være et helt tal'),
  airEntry: z.number()
    .min(0, 'Luftindstrømning score skal være mindst 0')
    .max(2, 'Luftindstrømning score skal være højst 2')
    .int('Luftindstrømning score skal være et helt tal'),
  retractions: z.number()
    .min(0, 'Indtrækninger score skal være mindst 0')
    .max(3, 'Indtrækninger score skal være højst 3')
    .int('Indtrækninger score skal være et helt tal')
})

export const WestleyCroupSchema = z.object({
  patient: PatientBaseSchema.extend({
    age: z.number()
      .min(0, 'Alder skal være mindst 0 måneder')
      .max(72, 'Westley Croup Score er typisk for børn under 6 år')
      .int('Alder skal være et helt tal (i måneder)')
  }),
  responses: WestleyCroupQuestionSchema,
  totalScore: z.number()
    .min(0, 'Total score skal være mindst 0')
    .max(14, 'Total score skal være højst 14')
    .int('Total score skal være et helt tal'),
  severity: z.enum(['mild', 'moderate', 'severe']),
  treatmentRecommendation: z.enum(['observation', 'nebulized_epinephrine', 'steroid_therapy', 'hospital_admission']),
  completedAt: z.date().optional(),
  notes: z.string().max(500, 'Noter må højst være 500 tegn').optional()
})