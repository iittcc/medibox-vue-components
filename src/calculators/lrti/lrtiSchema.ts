import { z } from 'zod'
import { PatientInfectionSchema } from '@/schemas/patient'

// Shared validation constants for vital signs
const VITAL_SIGNS_RANGES = {
  temperature: { min: 35, max: 42 },
  respiratoryRate: { min: 10, max: 60 },
  heartRate: { min: 40, max: 200 },
  bloodPressureSystolic: { min: 70, max: 250 },
  oxygenSaturation: { min: 70, max: 100 },
  consciousnessLevel: { min: 0, max: 4 }
} as const

// LRTI (Lower Respiratory Tract Infection) Response Schema
export const LrtiQuestionSchema = z.object({
  temperature: z.number()
    .min(VITAL_SIGNS_RANGES.temperature.min, `Temperatur skal være mindst ${VITAL_SIGNS_RANGES.temperature.min}°C`)
    .max(VITAL_SIGNS_RANGES.temperature.max, `Temperatur skal være højst ${VITAL_SIGNS_RANGES.temperature.max}°C`),
  respiratoryRate: z.number()
    .min(VITAL_SIGNS_RANGES.respiratoryRate.min, `Respirationsfrekvens skal være mindst ${VITAL_SIGNS_RANGES.respiratoryRate.min}/min`)
    .max(VITAL_SIGNS_RANGES.respiratoryRate.max, `Respirationsfrekvens skal være højst ${VITAL_SIGNS_RANGES.respiratoryRate.max}/min`)
    .int(),
  heartRate: z.number()
    .min(VITAL_SIGNS_RANGES.heartRate.min, `Puls skal være mindst ${VITAL_SIGNS_RANGES.heartRate.min}/min`)
    .max(VITAL_SIGNS_RANGES.heartRate.max, `Puls skal være højst ${VITAL_SIGNS_RANGES.heartRate.max}/min`)
    .int(),
  bloodPressureSystolic: z.number()
    .min(VITAL_SIGNS_RANGES.bloodPressureSystolic.min, `Systolisk blodtryk skal være mindst ${VITAL_SIGNS_RANGES.bloodPressureSystolic.min} mmHg`)
    .max(VITAL_SIGNS_RANGES.bloodPressureSystolic.max, `Systolisk blodtryk skal være højst ${VITAL_SIGNS_RANGES.bloodPressureSystolic.max} mmHg`)
    .int(),
  oxygenSaturation: z.number()
    .min(VITAL_SIGNS_RANGES.oxygenSaturation.min, `Iltmætning skal være mindst ${VITAL_SIGNS_RANGES.oxygenSaturation.min}%`)
    .max(VITAL_SIGNS_RANGES.oxygenSaturation.max, `Iltmætning skal være højst ${VITAL_SIGNS_RANGES.oxygenSaturation.max}%`)
    .optional(),
  consciousnessLevel: z.number()
    .min(VITAL_SIGNS_RANGES.consciousnessLevel.min, `Bevidsthedsniveau skal være mindst ${VITAL_SIGNS_RANGES.consciousnessLevel.min}`)
    .max(VITAL_SIGNS_RANGES.consciousnessLevel.max, `Bevidsthedsniveau skal være højst ${VITAL_SIGNS_RANGES.consciousnessLevel.max}`)
    .int()
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
      .min(VITAL_SIGNS_RANGES.temperature.min, `Temperatur skal være mindst ${VITAL_SIGNS_RANGES.temperature.min}°C`)
      .max(VITAL_SIGNS_RANGES.temperature.max, `Temperatur skal være højst ${VITAL_SIGNS_RANGES.temperature.max}°C`),
    respiratoryRate: z.number()
      .min(VITAL_SIGNS_RANGES.respiratoryRate.min, `Respirationsfrekvens skal være mindst ${VITAL_SIGNS_RANGES.respiratoryRate.min}/min`)
      .max(VITAL_SIGNS_RANGES.respiratoryRate.max, `Respirationsfrekvens skal være højst ${VITAL_SIGNS_RANGES.respiratoryRate.max}/min`)
      .int(),
    heartRate: z.number()
      .min(VITAL_SIGNS_RANGES.heartRate.min, `Puls skal være mindst ${VITAL_SIGNS_RANGES.heartRate.min}/min`)
      .max(VITAL_SIGNS_RANGES.heartRate.max, `Puls skal være højst ${VITAL_SIGNS_RANGES.heartRate.max}/min`)
      .int(),
    bloodPressureSystolic: z.number()
      .min(VITAL_SIGNS_RANGES.bloodPressureSystolic.min, `Systolisk blodtryk skal være mindst ${VITAL_SIGNS_RANGES.bloodPressureSystolic.min} mmHg`)
      .max(VITAL_SIGNS_RANGES.bloodPressureSystolic.max, `Systolisk blodtryk skal være højst ${VITAL_SIGNS_RANGES.bloodPressureSystolic.max} mmHg`)
      .int(),
    oxygenSaturation: z.number()
      .min(VITAL_SIGNS_RANGES.oxygenSaturation.min, `Iltmætning skal være mindst ${VITAL_SIGNS_RANGES.oxygenSaturation.min}%`)
      .max(VITAL_SIGNS_RANGES.oxygenSaturation.max, `Iltmætning skal være højst ${VITAL_SIGNS_RANGES.oxygenSaturation.max}%`)
      .optional()
  }),
  riskScore: z.number()
    .min(0, 'Risk score skal være mindst 0')
    .max(100, 'Risk score skal være højst 100')
    .int(),
  riskLevel: z.enum(['low', 'moderate', 'high', 'very_high']),
  recommendation: z.enum(['outpatient', 'observation', 'inpatient', 'icu']),
  completedAt: z.date().optional(),
  notes: z.string().max(500, 'Noter må højst være 500 tegn').optional()
})