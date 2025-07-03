import { z } from 'zod'
import { PatientInfectionSchema } from '@/schemas/patient'

// LRTI (Lower Respiratory Tract Infection) Response Schema
export const LrtiQuestionSchema = z.object({
  temperature: z.number()
    .min(30, 'Temperatur skal være mindst 30°C')
    .max(45, 'Temperatur skal være højst 45°C'),
  respiratoryRate: z.number()
    .min(5, 'Respirationsfrekvens skal være mindst 5/min')
    .max(60, 'Respirationsfrekvens skal være højst 60/min')
    .int('Respirationsfrekvens skal være et helt tal'),
  heartRate: z.number()
    .min(30, 'Puls skal være mindst 30/min')
    .max(250, 'Puls skal være højst 250/min')
    .int('Puls skal være et helt tal'),
  bloodPressureSystolic: z.number()
    .min(50, 'Systolisk blodtryk skal være mindst 50 mmHg')
    .max(250, 'Systolisk blodtryk skal være højst 250 mmHg')
    .int('Systolisk blodtryk skal være et helt tal'),
  oxygenSaturation: z.number()
    .min(70, 'Iltmætning skal være mindst 70%')
    .max(100, 'Iltmætning skal være højst 100%')
    .optional(),
  consciousnessLevel: z.number()
    .min(0, 'Bevidsthedsniveau skal være mindst 0')
    .max(4, 'Bevidsthedsniveau skal være højst 4')
    .int('Bevidsthedsniveau skal være et helt tal')
    .optional()
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