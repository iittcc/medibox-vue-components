import type { ChartData, ChartOptions, ChartDataset } from 'chart.js'

// Base types for calculator responses
export type QuestionValue = string | number | boolean
export type CalculatorResponseValue = QuestionValue | QuestionValue[]

// Risk levels used across all calculators
export type RiskLevel = 'minimal' | 'low' | 'mild' | 'medium' | 'moderate' | 'high' | 'severe' | 'very_high' | 'unknown'

// Chart data types
export type MedicalChartDataset = ChartDataset<'bar' | 'line' | 'doughnut' | 'pie'> & {
  label: string
  data: number[]
  backgroundColor?: string | string[]
  borderColor?: string | string[]
  borderWidth?: number
}

export type MedicalChartData = ChartData<'bar' | 'line' | 'doughnut' | 'pie'> & {
  labels: string[]
  datasets: MedicalChartDataset[]
}

export type MedicalChartOptions = ChartOptions<'bar' | 'line' | 'doughnut' | 'pie'> & {
  responsive?: boolean
  maintainAspectRatio?: boolean
  plugins?: {
    legend?: {
      position?: 'top' | 'bottom' | 'left' | 'right'
      display?: boolean
    }
    title?: {
      display?: boolean
      text?: string
    }
    datalabels?: {
      display?: boolean
      color?: string
      font?: {
        weight?: 'normal' | 'bold'
      }
    }
  }
}

// AUDIT Calculator Types
export interface AuditResponses {
  question1: number  // How often do you have a drink containing alcohol?
  question2: number  // How many drinks containing alcohol do you have on a typical day?
  question3: number  // How often do you have six or more drinks on one occasion?
  question4: number  // How often during the last year have you found that you were not able to stop drinking?
  question5: number  // How often during the last year have you failed to do what was normally expected?
  question6: number  // How often during the last year have you needed a first drink in the morning?
  question7: number  // How often during the last year have you had a feeling of guilt or remorse?
  question8: number  // How often during the last year have you been unable to remember what happened?
  question9: number  // Have you or someone else been injured because of your drinking?
  question10: number // Has a relative, friend, doctor, or other health care worker been concerned about your drinking?
}

export interface AuditDetails extends CalculatorDetails {
  consumptionScore: number
  dependenceScore: number
  harmScore: number
  riskCategory: 'low' | 'medium' | 'high' | 'very_high'
  recommendedAction: string
}

// DANPSS Calculator Types
export interface DanpssResponses {
  question1: number  // Depressed mood
  question2: number  // Loss of interest
  question3: number  // Sleep problems
  question4: number  // Fatigue
  question5: number  // Appetite changes
  question6: number  // Guilt/worthlessness
  question7: number  // Concentration problems
  question8: number  // Anxiety/worry
  question9: number  // Restlessness
  question10: number // Panic attacks
  question11: number // Avoidance behavior
  question12: number // Physical anxiety symptoms
}

export interface DanpssDetails extends CalculatorDetails {
  depressionScore: number
  anxietyScore: number
  depressionLevel: 'none' | 'mild' | 'moderate' | 'severe'
  anxietyLevel: 'none' | 'mild' | 'moderate' | 'severe'
  combinedRisk: RiskLevel
}

// EPDS Calculator Types
export interface EpdsResponses {
  question1: number  // Able to laugh and see funny side
  question2: number  // Look forward with enjoyment
  question3: number  // Blamed self unnecessarily
  question4: number  // Anxious or worried for no good reason
  question5: number  // Scared or panicky for no good reason
  question6: number  // Things have been getting on top of me
  question7: number  // Unhappy that I have had difficulty sleeping
  question8: number  // Sad or miserable
  question9: number  // Unhappy that I have been crying
  question10: number // Thought of harming myself
}

export interface EpdsDetails extends CalculatorDetails {
  depressionRisk: RiskLevel
  suicidalThoughts: boolean
  urgentReferralNeeded: boolean
  scoreCategory: 'minimal' | 'mild' | 'moderate' | 'severe'
}

// GCS Calculator Types
export interface GcsResponses {
  eyeOpening: number    // 1-4: None, To pain, To speech, Spontaneous
  verbalResponse: number // 1-5: None, Incomprehensible, Inappropriate, Confused, Oriented
  motorResponse: number  // 1-6: None, Extension, Flexion, Withdrawal, Localizes, Obeys
}

export interface GcsDetails extends CalculatorDetails {
  eyeScore: number
  verbalScore: number
  motorScore: number
  consciousness: 'severe' | 'moderate' | 'mild' | 'normal'
  clinicalSignificance: string
}

// IPSS Calculator Types
export interface IpssResponses {
  incompleteEmptying: number  // 0-5: Never to almost always
  frequency: number           // 0-5: Never to almost always
  intermittency: number       // 0-5: Never to almost always
  urgency: number            // 0-5: Never to almost always
  weakStream: number         // 0-5: Never to almost always
  straining: number          // 0-5: Never to almost always
  nocturia: number           // 0-5: Never to 5 or more times
  qualityOfLife: number      // 0-6: Delighted to terrible
}

export interface IpssDetails extends CalculatorDetails {
  symptomScore: number
  qualityOfLifeScore: number
  symptomSeverity: 'mild' | 'moderate' | 'severe'
  qualityImpact: 'minimal' | 'moderate' | 'significant' | 'severe'
}

// PUQE Calculator Types
export interface PuqeResponses {
  nausea: number    // 1-5: Length of nausea in hours
  vomiting: number  // 1-5: Number of vomiting episodes
  retching: number  // 1-5: Number of retching episodes
}

export interface PuqeDetails extends CalculatorDetails {
  nauseaHours: number
  vomitingEpisodes: number
  retchingEpisodes: number
  severity: 'mild' | 'moderate' | 'severe'
  hyperemesisRisk: boolean
}

// Westley Croup Score Types
export interface WestleyCroupResponses {
  levelOfConsciousness: number // 0-5: Normal to lethargy/confusion
  cyanosis: number            // 0-5: None to cyanosis at rest
  stridor: number             // 0-2: None to at rest
  airEntry: number            // 0-2: Normal to markedly decreased
  retractions: number         // 0-3: None to severe
}

export interface WestleyCroupDetails extends CalculatorDetails {
  consciousnessScore: number
  respiratoryDistress: RiskLevel
  urgency: 'observe' | 'treat' | 'urgent' | 'critical'
}

// WHO-5 Calculator Types
export interface Who5Responses {
  question1: number  // I have felt cheerful and in good spirits
  question2: number  // I have felt calm and relaxed
  question3: number  // I have felt active and vigorous
  question4: number  // I woke up feeling fresh and rested
  question5: number  // My daily life has been filled with things that interest me
}

export interface Who5Details extends CalculatorDetails {
  rawScore: number
  percentageScore: number
  wellBeingLevel: 'poor' | 'below_average' | 'average' | 'good' | 'excellent'
  depressionRisk: boolean
  screeningRecommended: boolean
}

// LRTI Calculator Types
export interface LrtiResponses {
  temperature: number           // Body temperature in Celsius
  respiratoryRate: number       // Breaths per minute
  heartRate: number            // Beats per minute
  bloodPressureSystolic: number // Systolic BP in mmHg
  oxygenSaturation?: number    // SpO2 percentage (optional)
  consciousnessLevel?: number  // 0-4: Alert to unresponsive (optional)
}

export interface LrtiDetails extends CalculatorDetails {
  riskFactors: number
  validatedInputs: {
    temperature: number
    respiratoryRate: number
    heartRate: number
    bloodPressureSystolic: number
  }
  vitalSignsCategory: 'normal' | 'concerning' | 'critical'
  antibioticRecommended: boolean
}

// SCORE2 Calculator Types
export interface Score2Responses {
  age: number
  gender: 'male' | 'female'
  smoking: boolean
  systolicBP: number      // Systolic blood pressure
  totalCholesterol: number // Total cholesterol mmol/L
  hdlCholesterol: number  // HDL cholesterol mmol/L
  region: 'low_risk' | 'moderate_risk' | 'high_risk' // CVD risk region
}

export interface Score2Details extends CalculatorDetails {
  riskFactors: {
    smoking: boolean
    hypertension: boolean
    dyslipidemia: boolean
    age: boolean
  }
  cvdRiskPercentage: number
  riskCategory: RiskLevel
  interventionRecommended: boolean
}

// Union types for all calculator responses
export type CalculatorResponses = 
  | AuditResponses
  | DanpssResponses
  | EpdsResponses
  | GcsResponses
  | IpssResponses
  | PuqeResponses
  | WestleyCroupResponses
  | Who5Responses
  | LrtiResponses
  | Score2Responses

// Base interface that all calculator details must extend
export interface CalculatorDetails {
  // Base properties that all calculators might have
  [key: string]: any
}

// Union type for specific calculator details
export type SpecificCalculatorDetails = 
  | AuditDetails
  | DanpssDetails
  | EpdsDetails
  | GcsDetails
  | IpssDetails
  | PuqeDetails
  | WestleyCroupDetails
  | Who5Details
  | LrtiDetails
  | Score2Details

// Patient data types for different medical domains
export interface PatientData {
  // Basic information
  name?: string
  age: number
  gender: 'male' | 'female'
  cpr?: string
  
  // Contact information (optional)
  phone?: string
  email?: string
  
  // Medical context
  height?: number  // cm
  weight?: number  // kg
  bmi?: number
  
  // Domain-specific fields will be added based on calculator type
  [key: string]: QuestionValue | undefined
}

// Calculation result with proper typing
export interface CalculationResult {
  score: number
  interpretation: string
  recommendations: string[]
  riskLevel: RiskLevel
  details?: SpecificCalculatorDetails
  warnings?: string[]
  chartData?: MedicalChartData
}

// Error types for calculation failures
export interface CalculationError {
  code: string
  message: string
  field?: string
  validationErrors?: string[]
}

// Type guards to help with type narrowing
export const isAuditResponses = (responses: CalculatorResponses): responses is AuditResponses => {
  return 'question1' in responses && 'question10' in responses
}

export const isDanpssResponses = (responses: CalculatorResponses): responses is DanpssResponses => {
  return 'question1' in responses && 'question12' in responses
}

export const isEpdsResponses = (responses: CalculatorResponses): responses is EpdsResponses => {
  return 'question1' in responses
    && 'question10' in responses
    && Object.keys(responses).length === 10
    && !('question11' in responses)
}

export const isGcsResponses = (responses: CalculatorResponses): responses is GcsResponses => {
  return 'eyeOpening' in responses && 'verbalResponse' in responses && 'motorResponse' in responses
}

export const isLrtiResponses = (responses: CalculatorResponses): responses is LrtiResponses => {
  return 'temperature' in responses && 'respiratoryRate' in responses
}

export const isPuqeResponses = (responses: CalculatorResponses): responses is PuqeResponses => {
  return 'nausea' in responses && 'vomiting' in responses && 'retching' in responses
}

export const isIpssResponses = (responses: CalculatorResponses): responses is IpssResponses => {
  return 'incompleteEmptying' in responses && 'qualityOfLife' in responses
}

export const isWho5Responses = (responses: CalculatorResponses): responses is Who5Responses => {
  return 'question1' in responses && 'question5' in responses && Object.keys(responses).length === 5
}

export const isWestleyCroupResponses = (responses: CalculatorResponses): responses is WestleyCroupResponses => {
  return 'levelOfConsciousness' in responses && 'cyanosis' in responses
}

export const isScore2Responses = (responses: CalculatorResponses): responses is Score2Responses => {
  return 'age' in responses && 'gender' in responses && 'region' in responses
}

// Export specific calculator types by name for easier imports
export type {
  AuditResponses as AuditCalculatorResponses,
  DanpssResponses as DanpssCalculatorResponses,
  EpdsResponses as EpdsCalculatorResponses,
  GcsResponses as GcsCalculatorResponses,
  IpssResponses as IpssCalculatorResponses,
  PuqeResponses as PuqeCalculatorResponses,
  WestleyCroupResponses as WestleyCroupCalculatorResponses,
  Who5Responses as Who5CalculatorResponses,
  LrtiResponses as LrtiCalculatorResponses,
  Score2Responses as Score2CalculatorResponses
}