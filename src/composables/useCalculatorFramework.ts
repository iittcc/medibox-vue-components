import { ref, computed, reactive, watch, onMounted, onUnmounted, type Ref } from 'vue'
import { useValidation, useFormValidation } from './useValidation'
import { useErrorHandler } from './useErrorHandler'
import { useLogging } from './useLogging'
import { getCalculatorSchema, getScoreRange, type CalculatorResult } from '@/schemas/calculators'
import { getPatientSchemaForCalculator } from '@/schemas/patient'
import sendDataToServer, { type SendDataOptions } from '@/assets/sendDataToServer'
import { nanoid } from 'nanoid'

export interface CalculatorConfig {
  type: string
  name: string
  version: string
  description?: string
  author?: string
  category: 'psychology' | 'infection' | 'pregnancy' | 'general'
  theme: 'sky' | 'teal' | 'orange'
  minAge?: number
  maxAge?: number
  allowedGenders?: string[]
  requiredFields?: string[]
  estimatedDuration?: number // in minutes
}

export interface CalculatorStep {
  id: string
  title: string
  description?: string
  component?: string
  validation?: boolean
  required?: boolean
  order: number
}

export interface CalculatorState {
  currentStep: number
  totalSteps: number
  isComplete: boolean
  isValid: boolean
  isSubmitting: boolean
  isCalculating: boolean
  startTime: Date
  completionTime?: Date
  sessionId: string
}

export interface CalculationResult {
  score: number
  interpretation: string
  recommendations: string[]
  riskLevel: string
  details?: Record<string, any>
  warnings?: string[]
  chartData?: any
}

export function useCalculatorFramework(config: CalculatorConfig) {
  const {
    logCalculation,
    logUserAction,
    logValidationError,
    logError,
    logInfo,
    newCorrelationId
  } = useLogging()

  const {
    handleError,
    showSuccess,
    showWarning,
    showInfo
  } = useErrorHandler({
    showToasts: true,
    autoRetry: true,
    calculatorType: config.type
  })

  // State management
  const state = reactive<CalculatorState>({
    currentStep: 0,
    totalSteps: 0,
    isComplete: false,
    isValid: false,
    isSubmitting: false,
    isCalculating: false,
    startTime: new Date(),
    sessionId: nanoid()
  })

  const patientData = ref<Record<string, any>>({})
  const calculatorData = ref<Record<string, any>>({})
  const result = ref<CalculationResult | null>(null)
  const steps = ref<CalculatorStep[]>([])

  // Validation setup
  const patientSchema = getPatientSchemaForCalculator(config.type)
  const calculatorSchema = getCalculatorSchema(config.type)
  
  const patientValidation = useFormValidation(patientSchema)
  const calculatorValidation = useFormValidation(calculatorSchema)

  // Computed properties
  const progress = computed(() => {
    if (state.totalSteps === 0) return 0
    return Math.round((state.currentStep / state.totalSteps) * 100)
  })

  const canProceed = computed(() => {
    const currentStepData = steps.value[state.currentStep]
    if (!currentStepData?.validation) return true
    
    if (currentStepData.id === 'patient') {
      return patientValidation.state.isValid
    } else if (currentStepData.id === 'calculator') {
      return calculatorValidation.state.isValid
    }
    
    return true
  })

  const isLastStep = computed(() => state.currentStep === state.totalSteps - 1)
  const isFirstStep = computed(() => state.currentStep === 0)

  const duration = computed(() => {
    const end = state.completionTime || new Date()
    return Math.round((end.getTime() - state.startTime.getTime()) / 1000)
  })

  // Step management
  const initializeSteps = (stepConfig: CalculatorStep[]) => {
    steps.value = stepConfig.sort((a, b) => a.order - b.order)
    state.totalSteps = steps.value.length
    state.currentStep = 0
    
    logInfo('Calculator initialized', {
      calculatorType: config.type,
      totalSteps: state.totalSteps,
      sessionId: state.sessionId
    })
  }

  const nextStep = async () => {
    if (!canProceed.value) {
      showWarning('Udfyld alle påkrævede felter', 'Du skal udfylde alle påkrævede felter før du kan fortsætte.')
      return false
    }

    if (isLastStep.value) {
      return await submitCalculation()
    }

    const currentStepData = steps.value[state.currentStep]
    
    logUserAction('step_completed', {
      stepId: currentStepData.id,
      stepTitle: currentStepData.title,
      stepNumber: state.currentStep + 1,
      sessionId: state.sessionId
    }, config.type)

    state.currentStep++
    return true
  }

  const previousStep = () => {
    if (isFirstStep.value) return false
    
    const currentStepData = steps.value[state.currentStep]
    
    logUserAction('step_back', {
      fromStepId: currentStepData.id,
      toStepNumber: state.currentStep,
      sessionId: state.sessionId
    }, config.type)

    state.currentStep--
    return true
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= state.totalSteps) return false
    
    logUserAction('step_jump', {
      fromStep: state.currentStep,
      toStep: stepIndex,
      sessionId: state.sessionId
    }, config.type)

    state.currentStep = stepIndex
    return true
  }

  // Data management
  const updatePatientData = (data: Partial<Record<string, any>>) => {
    Object.assign(patientData.value, data)
    patientValidation.data.value = { ...patientValidation.data.value, ...data }
    
    logUserAction('patient_data_updated', {
      updatedFields: Object.keys(data),
      sessionId: state.sessionId
    }, config.type)
  }

  const updateCalculatorData = (data: Partial<Record<string, any>>) => {
    Object.assign(calculatorData.value, data)
    calculatorValidation.data.value = { ...calculatorValidation.data.value, ...data }
    
    logUserAction('calculator_data_updated', {
      updatedFields: Object.keys(data),
      sessionId: state.sessionId
    }, config.type)
  }

  const setFieldValue = (section: 'patient' | 'calculator', field: string, value: any) => {
    if (section === 'patient') {
      patientValidation.setFieldValue(field, value)
      patientData.value[field] = value
    } else {
      calculatorValidation.setFieldValue(field, value)
      calculatorData.value[field] = value
    }
    
    logUserAction('field_updated', {
      section,
      field,
      hasValue: value !== null && value !== undefined && value !== '',
      sessionId: state.sessionId
    }, config.type)
  }

  // Calculation logic
  const calculateScore = (responses: Record<string, any>): CalculationResult => {
    const startTime = Date.now()
    
    try {
      // Get score range for validation
      const { min, max } = getScoreRange(config.type)
      
      let score = 0
      let interpretation = ''
      let recommendations: string[] = []
      let riskLevel = 'unknown'
      let details: Record<string, any> = {}

      // Calculator-specific logic
      switch (config.type) {
        case 'audit':
          score = calculateAuditScore(responses)
          ;({ interpretation, recommendations, riskLevel } = interpretAuditScore(score))
          break
          
        case 'danpss':
          ;({ score, interpretation, recommendations, riskLevel, details } = calculateDanpssScore(responses))
          break
          
        case 'epds':
          score = calculateEpdsScore(responses)
          ;({ interpretation, recommendations, riskLevel } = interpretEpdsScore(score, responses))
          break
          
        case 'gcs':
          score = calculateGcsScore(responses)
          ;({ interpretation, recommendations, riskLevel } = interpretGcsScore(score))
          break
          
        case 'ipss':
          ;({ score, interpretation, recommendations, riskLevel, details } = calculateIpssScore(responses))
          break
          
        case 'puqe':
          score = calculatePuqeScore(responses)
          ;({ interpretation, recommendations, riskLevel } = interpretPuqeScore(score))
          break
          
        case 'westleycroupscore':
          score = calculateWestleyCroupScore(responses)
          ;({ interpretation, recommendations, riskLevel } = interpretWestleyCroupScore(score))
          break
          
        case 'who5':
          ;({ score, interpretation, recommendations, riskLevel, details } = calculateWho5Score(responses))
          break
          
        case 'lrti':
          ;({ score, interpretation, recommendations, riskLevel, details } = calculateLrtiScore(responses))
          break
          
        case 'score2':
          ;({ score, interpretation, recommendations, riskLevel, details } = calculateScore2(responses))
          break
          
        default:
          throw new Error(`Unknown calculator type: ${config.type}`)
      }

      // Validate calculated score
      if (score < min || score > max) {
        throw new Error(`Calculated score ${score} is outside valid range ${min}-${max}`)
      }

      const duration = Date.now() - startTime
      
      logCalculation(config.type, responses, {
        score,
        interpretation,
        riskLevel,
        duration
      }, duration)

      return {
        score,
        interpretation,
        recommendations,
        riskLevel,
        details
      }
    } catch (error) {
      logError('Calculation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        responses,
        sessionId: state.sessionId
      }, config.type)
      
      throw error
    }
  }

  // Submission logic
  const submitCalculation = async () => {
    if (state.isSubmitting) return false
    
    state.isSubmitting = true
    state.isCalculating = true
    
    try {
      // Final validation
      const patientValid = await patientValidation.validateAll()
      const calculatorValid = await calculatorValidation.validateAll()
      
      if (!patientValid || !calculatorValid) {
        throw new Error('Validation failed before submission')
      }

      // Calculate result
      const calculationResult = calculateScore(calculatorData.value)
      result.value = calculationResult
      
      // Prepare submission data
      const submissionData = {
        config,
        patient: patientData.value,
        responses: calculatorData.value,
        result: calculationResult,
        metadata: {
          sessionId: state.sessionId,
          duration: duration.value,
          version: config.version,
          timestamp: new Date().toISOString()
        }
      }

      // Submit to server if configured
      const serverUrl = import.meta.env.VITE_API_URL
      const publicKeyUrl = import.meta.env.VITE_PUBLIC_KEY_URL
      
      if (serverUrl && publicKeyUrl) {
        const correlationId = newCorrelationId()
        
        const sendOptions: SendDataOptions = {
          calculatorType: config.type,
          correlationId,
          onProgress: (attempt, maxRetries) => {
            showInfo(`Sender data (forsøg ${attempt}/${maxRetries})`)
          },
          onError: (error, attempt) => {
            logError('Submission attempt failed', { 
              error: error.message, 
              attempt,
              correlationId 
            }, config.type)
          }
        }

        await sendDataToServer(serverUrl, publicKeyUrl, submissionData, sendOptions)
        
        showSuccess('Data sendt', 'Beregningen er gemt og sendt til serveren.')
      }

      // Mark as complete
      state.isComplete = true
      state.completionTime = new Date()
      
      logUserAction('calculation_completed', {
        score: calculationResult.score,
        riskLevel: calculationResult.riskLevel,
        duration: duration.value,
        sessionId: state.sessionId
      }, config.type)

      showSuccess('Beregning fuldført', `${config.name} er beregnet med resultat: ${calculationResult.score}`)
      
      return true
    } catch (error) {
      await handleError(error as Error, {
        component: 'CalculatorFramework',
        action: 'submitCalculation',
        calculator: config.type,
        data: { sessionId: state.sessionId }
      })
      return false
    } finally {
      state.isSubmitting = false
      state.isCalculating = false
    }
  }

  // Reset functionality
  const resetCalculator = () => {
    patientData.value = {}
    calculatorData.value = {}
    result.value = null
    
    state.currentStep = 0
    state.isComplete = false
    state.isValid = false
    state.isSubmitting = false
    state.isCalculating = false
    state.startTime = new Date()
    state.completionTime = undefined
    state.sessionId = nanoid()
    
    patientValidation.resetValidation()
    calculatorValidation.resetValidation()
    
    logUserAction('calculator_reset', {
      newSessionId: state.sessionId
    }, config.type)
  }

  // Export functionality
  const exportResults = (format: 'json' | 'pdf' | 'text' = 'json') => {
    if (!result.value) return null
    
    const exportData = {
      calculator: config,
      patient: patientData.value,
      responses: calculatorData.value,
      result: result.value,
      metadata: {
        sessionId: state.sessionId,
        duration: duration.value,
        exportTime: new Date().toISOString()
      }
    }
    
    logUserAction('results_exported', {
      format,
      sessionId: state.sessionId
    }, config.type)
    
    switch (format) {
      case 'json':
        return JSON.stringify(exportData, null, 2)
      case 'text':
        return formatResultsAsText(exportData)
      default:
        return exportData
    }
  }

  const formatResultsAsText = (data: any): string => {
    return `
${data.calculator.name} - Resultat

Patient Information:
${Object.entries(data.patient).map(([key, value]) => `  ${key}: ${value}`).join('\n')}

Resultat:
  Score: ${data.result.score}
  Risiko niveau: ${data.result.riskLevel}
  Fortolkning: ${data.result.interpretation}

Anbefalinger:
${data.result.recommendations.map((rec: string) => `  - ${rec}`).join('\n')}

Metadata:
  Session ID: ${data.metadata.sessionId}
  Varighed: ${data.metadata.duration} sekunder
  Eksporteret: ${data.metadata.exportTime}
    `.trim()
  }

  // Lifecycle hooks
  onMounted(() => {
    logUserAction('calculator_started', {
      calculatorType: config.type,
      sessionId: state.sessionId
    }, config.type)
  })

  onUnmounted(() => {
    if (!state.isComplete) {
      logUserAction('calculator_abandoned', {
        currentStep: state.currentStep,
        duration: duration.value,
        sessionId: state.sessionId
      }, config.type)
    }
  })

  return {
    // Configuration
    config: readonly(config),
    
    // State
    state: readonly(state),
    steps: readonly(steps),
    patientData: readonly(patientData),
    calculatorData: readonly(calculatorData),
    result: readonly(result),
    
    // Computed
    progress,
    canProceed,
    isLastStep,
    isFirstStep,
    duration,
    
    // Validation
    patientValidation,
    calculatorValidation,
    
    // Step management
    initializeSteps,
    nextStep,
    previousStep,
    goToStep,
    
    // Data management
    updatePatientData,
    updateCalculatorData,
    setFieldValue,
    
    // Calculation
    calculateScore,
    submitCalculation,
    
    // Utilities
    resetCalculator,
    exportResults
  }
}

// Calculator-specific scoring functions (simplified implementations)
// These would be imported from separate modules in a real implementation

function calculateAuditScore(responses: Record<string, any>): number {
  return Object.values(responses).reduce((sum: number, value: any) => sum + (Number(value) || 0), 0)
}

function interpretAuditScore(score: number) {
  if (score <= 7) {
    return {
      interpretation: 'Lavt risiko for alkoholmisbrug',
      recommendations: ['Fortsæt med moderat alkoholforbrug', 'Regelmæssig sundhedskontrol'],
      riskLevel: 'low'
    }
  } else if (score <= 15) {
    return {
      interpretation: 'Moderat risiko for alkoholmisbrug',
      recommendations: ['Overvej at reducere alkoholforbrug', 'Tal med din læge om alkoholvaner'],
      riskLevel: 'medium'
    }
  } else if (score <= 19) {
    return {
      interpretation: 'Høj risiko for alkoholmisbrug',
      recommendations: ['Anbefales at søge professionel hjælp', 'Overvej alkoholbehandling'],
      riskLevel: 'high'
    }
  } else {
    return {
      interpretation: 'Meget høj risiko for alkoholmisbrug',
      recommendations: ['Søg øjeblikkelig professionel hjælp', 'Kontakt alkoholbehandling'],
      riskLevel: 'very_high'
    }
  }
}

function calculateDanpssScore(responses: Record<string, any>) {
  const depressionQuestions = [1, 2, 3, 4, 5, 6, 7]
  const anxietyQuestions = [8, 9, 10, 11, 12]
  
  const depressionScore = depressionQuestions.reduce((sum, q) => sum + (Number(responses[`question${q}`]) || 0), 0)
  const anxietyScore = anxietyQuestions.reduce((sum, q) => sum + (Number(responses[`question${q}`]) || 0), 0)
  const totalScore = depressionScore + anxietyScore
  
  const depressionLevel = depressionScore <= 5 ? 'none' : depressionScore <= 10 ? 'mild' : depressionScore <= 15 ? 'moderate' : 'severe'
  const anxietyLevel = anxietyScore <= 3 ? 'none' : anxietyScore <= 6 ? 'mild' : anxietyScore <= 9 ? 'moderate' : 'severe'
  
  return {
    score: totalScore,
    interpretation: `Depression: ${depressionLevel}, Angst: ${anxietyLevel}`,
    recommendations: ['Konsulter din læge', 'Overvej psykologisk støtte'],
    riskLevel: totalScore <= 8 ? 'low' : totalScore <= 16 ? 'medium' : 'high',
    details: { depressionScore, anxietyScore, depressionLevel, anxietyLevel }
  }
}

function calculateEpdsScore(responses: Record<string, any>): number {
  return Object.values(responses).reduce((sum: number, value: any) => sum + (Number(value) || 0), 0)
}

function interpretEpdsScore(score: number, responses: Record<string, any>) {
  const suicidalThoughts = (Number(responses.question10) || 0) > 0
  
  if (score <= 9) {
    return {
      interpretation: 'Minimal risiko for postnatal depression',
      recommendations: ['Fortsat observation', 'Støt fra familie og venner'],
      riskLevel: 'minimal'
    }
  } else if (score <= 12) {
    return {
      interpretation: 'Mild risiko for postnatal depression',
      recommendations: ['Tal med sundhedsplejerske', 'Overvej støttegrupper'],
      riskLevel: 'mild'
    }
  } else {
    return {
      interpretation: 'Moderat til høj risiko for postnatal depression',
      recommendations: suicidalThoughts 
        ? ['Søg øjeblikkelig hjælp', 'Kontakt læge eller akutmodtagelse'] 
        : ['Kontakt læge', 'Psykologisk vurdering anbefales'],
      riskLevel: suicidalThoughts ? 'severe' : 'moderate'
    }
  }
}

function calculateGcsScore(responses: Record<string, any>): number {
  return (responses.eyeOpening || 0) + (responses.verbalResponse || 0) + (responses.motorResponse || 0)
}

function interpretGcsScore(score: number) {
  if (score <= 8) {
    return {
      interpretation: 'Alvorlig bevidsthedspåvirkning',
      recommendations: ['Øjeblikkelig intensiv behandling', 'Neurolog konsultation'],
      riskLevel: 'severe'
    }
  } else if (score <= 12) {
    return {
      interpretation: 'Moderat bevidsthedspåvirkning',
      recommendations: ['Tæt observation', 'Neurolog vurdering'],
      riskLevel: 'moderate'
    }
  } else {
    return {
      interpretation: 'Let bevidsthedspåvirkning',
      recommendations: ['Observation', 'Follow-up efter behov'],
      riskLevel: 'mild'
    }
  }
}

function calculateIpssScore(responses: Record<string, any>) {
  const symptomQuestions = ['incompleteEmptying', 'frequency', 'intermittency', 'urgency', 'weakStream', 'straining', 'nocturia']
  const symptomScore = symptomQuestions.reduce((sum, q) => sum + (Number(responses[q]) || 0), 0)
  const qualityOfLife = Number(responses.qualityOfLife) || 0
  
  const severity = symptomScore <= 7 ? 'mild' : symptomScore <= 19 ? 'moderate' : 'severe'
  
  return {
    score: symptomScore,
    interpretation: `${severity} prostata symptomer`,
    recommendations: ['Diskuter med læge', 'Overvej behandlingsmuligheder'],
    riskLevel: severity,
    details: { symptomScore, qualityOfLife }
  }
}

function calculatePuqeScore(responses: Record<string, any>): number {
  return (responses.nausea || 0) + (responses.vomiting || 0) + (responses.retching || 0)
}

function interpretPuqeScore(score: number) {
  if (score <= 6) {
    return {
      interpretation: 'Mild graviditetskvalme',
      recommendations: ['Små hyppige måltider', 'Undgå trigger foods'],
      riskLevel: 'mild'
    }
  } else if (score <= 12) {
    return {
      interpretation: 'Moderat graviditetskvalme',
      recommendations: ['Kontakt jordemoder', 'Overvej anti-emetika'],
      riskLevel: 'moderate'
    }
  } else {
    return {
      interpretation: 'Alvorlig graviditetskvalme (Hyperemesis)',
      recommendations: ['Kontakt læge øjeblikkeligt', 'Hospitalsindlæggelse kan være nødvendig'],
      riskLevel: 'severe'
    }
  }
}

function calculateWestleyCroupScore(responses: Record<string, any>): number {
  return Object.values(responses).reduce((sum: number, value: any) => sum + (Number(value) || 0), 0)
}

function interpretWestleyCroupScore(score: number) {
  if (score <= 2) {
    return {
      interpretation: 'Let croup',
      recommendations: ['Observation hjemme', 'Kølig fugtig luft'],
      riskLevel: 'mild'
    }
  } else if (score <= 5) {
    return {
      interpretation: 'Moderat croup',
      recommendations: ['Nebuliseret epinephrin', 'Steroid behandling'],
      riskLevel: 'moderate'
    }
  } else {
    return {
      interpretation: 'Alvorlig croup',
      recommendations: ['Hospitalsindlæggelse', 'Intensiv behandling'],
      riskLevel: 'severe'
    }
  }
}

function calculateWho5Score(responses: Record<string, any>) {
  const rawScore = Object.values(responses).reduce((sum: number, value: any) => sum + (Number(value) || 0), 0)
  const percentageScore = (rawScore / 25) * 100
  
  let wellBeingLevel: string
  let depressionRisk = false
  
  if (percentageScore < 28) {
    wellBeingLevel = 'poor'
    depressionRisk = true
  } else if (percentageScore < 50) {
    wellBeingLevel = 'below_average'
  } else if (percentageScore < 68) {
    wellBeingLevel = 'average'
  } else if (percentageScore < 85) {
    wellBeingLevel = 'good'
  } else {
    wellBeingLevel = 'excellent'
  }
  
  return {
    score: percentageScore,
    interpretation: `Velbefindende niveau: ${wellBeingLevel}`,
    recommendations: depressionRisk 
      ? ['Kontakt læge for depression screening', 'Overvej psykologisk støtte']
      : ['Fortsæt gode vaner', 'Regelmæssig motion og social kontakt'],
    riskLevel: depressionRisk ? 'high' : 'low',
    details: { rawScore, percentageScore, wellBeingLevel, depressionRisk }
  }
}

function calculateLrtiScore(responses: Record<string, any>) {
  // Simplified LRTI risk calculation
  let score = 0
  
  if (responses.temperature > 38.5) score += 2
  if (responses.respiratoryRate > 25) score += 1
  if (responses.heartRate > 100) score += 1
  if (responses.bloodPressureSystolic < 100) score += 2
  
  const riskLevel = score <= 1 ? 'low' : score <= 3 ? 'moderate' : score <= 5 ? 'high' : 'very_high'
  
  return {
    score,
    interpretation: `LRTI risiko: ${riskLevel}`,
    recommendations: ['Antibiotika behandling', 'Symptomatisk behandling'],
    riskLevel,
    details: { riskFactors: score }
  }
}

function calculateScore2(responses: Record<string, any>) {
  // Simplified SCORE2 calculation
  let risk = 5 // Base risk
  
  if (responses.smoking) risk *= 2
  if (responses.systolicBP > 140) risk += 2
  if (responses.totalCholesterol > 6) risk += 1
  if (responses.hdlCholesterol < 1.2) risk += 1
  
  const riskLevel = risk <= 5 ? 'low' : risk <= 10 ? 'moderate' : risk <= 20 ? 'high' : 'very_high'
  
  return {
    score: risk,
    interpretation: `10-års kardiovaskulær risiko: ${risk}%`,
    recommendations: ['Livsstilsændringer', 'Regelmæssig kontrol'],
    riskLevel,
    details: { riskFactors: { smoking: responses.smoking, hypertension: responses.systolicBP > 140 } }
  }
}