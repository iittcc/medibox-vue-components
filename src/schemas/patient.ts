import { z } from 'zod'

// Base patient information schema
export const PatientBaseSchema = z.object({
  name: z.string()
    .max(100, 'Navn må højst være 100 tegn')
    .regex(/^[\p{L}\s\-'\.]*$/u, 'Navn må kun indeholde bogstaver, mellemrum, bindestreg, apostrof og punktum')
    .optional()
    .or(z.literal('')),
    
  age: z.number()
    .min(0, 'Alder skal være mindst 0')
    .max(150, 'Alder skal være højst 150')
    .int('Alder skal være et helt tal'),
    
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Vælg køn: mand, kvinde eller andet' })
  }),
  
  weight: z.number()
    .min(0.1, 'Vægt skal være mindst 0.1 kg')
    .max(1000, 'Vægt skal være højst 1000 kg')
    .optional(),
    
  height: z.number()
    .min(10, 'Højde skal være mindst 10 cm')
    .max(300, 'Højde skal være højst 300 cm')
    .optional()
})

// Extended patient schema with optional medical information
export const PatientExtendedSchema = PatientBaseSchema.extend({
  cpr: z.string()
    .regex(/^\d{6}-?\d{4}$/, 'CPR nummer skal have formatet DDMMYY-XXXX')
    .optional(),
    
  email: z.string()
    .email('Indtast en gyldig email adresse')
    .optional()
    .or(z.literal('')),
    
  phone: z.string()
    .regex(/^(\+45\s?)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{8})$/, 'Indtast et gyldigt dansk telefonnummer')
    .optional()
    .or(z.literal('')),
    
  address: z.string()
    .max(200, 'Adresse må højst være 200 tegn')
    .optional(),
    
  zipCode: z.string()
    .regex(/^\d{4}$/, 'Postnummer skal være 4 cifre')
    .optional(),
    
  city: z.string()
    .max(50, 'By må højst være 50 tegn')
    .optional(),
    
  medicalHistory: z.string()
    .max(1000, 'Sygehistorie må højst være 1000 tegn')
    .optional(),
    
  allergies: z.string()
    .max(500, 'Allergier må højst være 500 tegn')
    .optional(),
    
  medications: z.string()
    .max(500, 'Medicin må højst være 500 tegn')
    .optional(),
    
  contactPerson: z.string()
    .max(100, 'Kontaktperson må højst være 100 tegn')
    .optional(),
    
  contactPhone: z.string()
    .regex(/^(\+45\s?)?(\d{2}\s?\d{2}\s?\d{2}\s?\d{2}|\d{8})$/, 'Indtast et gyldigt dansk telefonnummer')
    .optional()
    .or(z.literal(''))
})

// Patient schema for different calculator contexts
export const PatientPsychologySchema = PatientBaseSchema.extend({
  previousTreatment: z.boolean()
    .optional(),
    
  currentSymptoms: z.string()
    .max(500, 'Nuværende symptomer må højst være 500 tegn')
    .optional(),
    
  onsetDate: z.date()
    .optional(),
    
  severityLevel: z.enum(['mild', 'moderate', 'severe'])
    .optional()
})

export const PatientInfectionSchema = PatientBaseSchema.extend({
  temperature: z.number()
    .min(30, 'Temperatur skal være mindst 30°C')
    .max(45, 'Temperatur skal være højst 45°C')
    .optional(),
    
  symptomDuration: z.number()
    .min(0, 'Symptomvarighed skal være mindst 0 dage')
    .max(365, 'Symptomvarighed skal være højst 365 dage')
    .int('Symptomvarighed skal være et helt tal')
    .optional(),
    
  antibioticTreatment: z.boolean()
    .optional(),
    
  hospitalAdmission: z.boolean()
    .optional(),
    
  comorbidities: z.array(z.string())
    .max(10, 'Højst 10 komorbide tilstande')
    .optional()
})

export const PatientPregnancySchema = PatientBaseSchema.extend({
  gestationalWeek: z.number()
    .min(0, 'Graviditetsuge skal være mindst 0')
    .max(45, 'Graviditetsuge skal være højst 45')
    .optional(),
    
  previousPregnancies: z.number()
    .min(0, 'Antal tidligere graviditeter skal være mindst 0')
    .max(20, 'Antal tidligere graviditeter skal være højst 20')
    .int('Antal tidligere graviditeter skal være et helt tal')
    .optional(),
    
  birthDate: z.date()
    .optional(),
    
  breastfeeding: z.boolean()
    .optional(),
    
  complications: z.string()
    .max(500, 'Komplikationer må højst være 500 tegn')
    .optional()
})

// Age-specific validation functions
export const validateAgeForCalculator = (age: number, calculatorType: string): boolean => {
  const ageRanges: Record<string, { min: number; max: number }> = {
    'audit': { min: 18, max: 150 },
    'danpss': { min: 18, max: 150 },
    'epds': { min: 16, max: 50 },
    'gcs': { min: 0, max: 150 },
    'ipss': { min: 40, max: 150 },
    'puqe': { min: 16, max: 50 },
    'who5': { min: 18, max: 150 },
    'westleycroupscore': { min: 0, max: 6 },
    'lrti': { min: 0, max: 150 },
    'score2': { min: 40, max: 69 }
  }
  
  const range = ageRanges[calculatorType]
  if (!range) return true // Allow if calculator not found
  
  return age >= range.min && age <= range.max
}

// Gender-specific validation
export const validateGenderForCalculator = (gender: string, calculatorType: string): boolean => {
  const genderRequirements: Record<string, string[]> = {
    'ipss': ['male'], // International Prostate Symptom Score - males only
    'epds': ['female'], // Edinburgh Postnatal Depression Scale - typically females
    'puqe': ['female'] // Pregnancy-Unique Quantification of Emesis - females only
  }
  
  const allowedGenders = genderRequirements[calculatorType]
  if (!allowedGenders) return true // Allow all genders if no restriction
  
  return allowedGenders.includes(gender)
}

// BMI calculation and validation
export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100
  return Number((weight / (heightInMeters * heightInMeters)).toFixed(1))
}

export const validateBMI = (bmi: number): { isValid: boolean; category: string; warning?: string } => {
  if (bmi < 16) {
    return { 
      isValid: false, 
      category: 'Severely underweight', 
      warning: 'BMI er ekstremt lavt - overvej medicinsk vurdering' 
    }
  } else if (bmi < 18.5) {
    return { 
      isValid: true, 
      category: 'Underweight', 
      warning: 'BMI er under normal - overvej næringsstatus' 
    }
  } else if (bmi < 25) {
    return { isValid: true, category: 'Normal weight' }
  } else if (bmi < 30) {
    return { 
      isValid: true, 
      category: 'Overweight', 
      warning: 'BMI er over normal - overvej livsstilsændringer' 
    }
  } else if (bmi < 35) {
    return { 
      isValid: true, 
      category: 'Obesity Class I', 
      warning: 'BMI indikerer fedme - overvej medicinsk rådgivning' 
    }
  } else if (bmi < 40) {
    return { 
      isValid: true, 
      category: 'Obesity Class II', 
      warning: 'BMI indikerer alvorlig fedme - anbefal medicinsk behandling' 
    }
  } else {
    return { 
      isValid: false, 
      category: 'Obesity Class III', 
      warning: 'BMI indikerer ekstrem fedme - kræver medicinsk behandling' 
    }
  }
}

// Danish CPR validation with checksum
export const validateDanishCPR = (cpr: string): { isValid: boolean; error?: string } => {
  // Remove any dashes or spaces
  const cleanCpr = cpr.replace(/[-\s]/g, '')
  
  // Check basic format
  if (!/^\d{10}$/.test(cleanCpr)) {
    return { isValid: false, error: 'CPR skal være 10 cifre (DDMMYYXXXX)' }
  }
  
  // Extract date parts
  const day = parseInt(cleanCpr.substring(0, 2))
  const month = parseInt(cleanCpr.substring(2, 4))
  const year = parseInt(cleanCpr.substring(4, 6))
  
  // Basic date validation
  if (day < 1 || day > 31) {
    return { isValid: false, error: 'Ugyldig dag i CPR nummer' }
  }
  
  if (month < 1 || month > 12) {
    return { isValid: false, error: 'Ugyldig måned i CPR nummer' }
  }
  
  // Determine century and full year
  const centuryDigit = parseInt(cleanCpr.substring(6, 7))
  let fullYear: number
  
  if (centuryDigit <= 3) {
    fullYear = 1900 + year
  } else if (centuryDigit === 4 || centuryDigit === 9) {
    if (year <= 36) {
      fullYear = 2000 + year
    } else {
      fullYear = 1900 + year
    }
  } else {
    if (year <= 57) {
      fullYear = 2000 + year
    } else {
      fullYear = 1800 + year
    }
  }
  
  // Check if date is valid
  const testDate = new Date(fullYear, month - 1, day)
  if (testDate.getFullYear() !== fullYear || 
      testDate.getMonth() !== month - 1 || 
      testDate.getDate() !== day) {
    return { isValid: false, error: 'Ugyldig dato i CPR nummer' }
  }
  
  // Check if future date
  if (testDate > new Date()) {
    return { isValid: false, error: 'CPR nummer kan ikke være en fremtidig dato' }
  }
  
  // Simple checksum validation (simplified version)
  // Note: Full CPR validation includes complex checksum rules that vary by period
  const weights = [4, 3, 2, 7, 6, 5, 4, 3, 2, 1]
  let sum = 0
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpr[i]) * weights[i]
  }
  
  if (sum % 11 !== 0) {
    return { isValid: false, error: 'Ugyldig CPR nummer checksum' }
  }
  
  return { isValid: true }
}

// Phone number validation for Danish numbers
export const validateDanishPhone = (phone: string): { isValid: boolean; formatted?: string; error?: string } => {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '')
  
  // Handle different formats
  if (cleaned.startsWith('+45')) {
    cleaned = cleaned.substring(3)
  } else if (cleaned.startsWith('0045')) {
    cleaned = cleaned.substring(4)
  } else if (cleaned.startsWith('45') && cleaned.length === 10) {
    cleaned = cleaned.substring(2)
  }
  
  // Check if 8 digits
  if (!/^\d{8}$/.test(cleaned)) {
    return { isValid: false, error: 'Telefonnummer skal være 8 cifre' }
  }
  
  // Basic validation of number ranges
  const firstTwo = cleaned.substring(0, 2)
  const validPrefixes = [
    '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', // Mobile
    '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', // Mobile
    '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', // Mobile
    '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', // Mobile
    '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', // Mobile
    '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', // Mobile/Service
    '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', // Landline/Service
    '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'  // Mobile/Premium
  ]
  
  if (!validPrefixes.includes(firstTwo)) {
    return { isValid: false, error: 'Ugyldigt telefonnummer prefix' }
  }
  
  // Format number nicely
  const formatted = `${cleaned.substring(0, 2)} ${cleaned.substring(2, 4)} ${cleaned.substring(4, 6)} ${cleaned.substring(6, 8)}`
  
  return { isValid: true, formatted }
}

// Export types
export type PatientBase = z.infer<typeof PatientBaseSchema>
export type PatientExtended = z.infer<typeof PatientExtendedSchema>
export type PatientPsychology = z.infer<typeof PatientPsychologySchema>
export type PatientInfection = z.infer<typeof PatientInfectionSchema>
export type PatientPregnancy = z.infer<typeof PatientPregnancySchema>

// Utility to get appropriate patient schema for calculator
export const getPatientSchemaForCalculator = (calculatorType: string) => {
  const psychologyCalculators = ['danpss', 'audit', 'who5', 'epds']
  const infectionCalculators = ['lrti', 'westleycroupscore']
  const pregnancyCalculators = ['epds', 'puqe']
  
  if (pregnancyCalculators.includes(calculatorType)) {
    return PatientPregnancySchema
  } else if (infectionCalculators.includes(calculatorType)) {
    return PatientInfectionSchema
  } else if (psychologyCalculators.includes(calculatorType)) {
    return PatientPsychologySchema
  } else {
    return PatientExtendedSchema
  }
}