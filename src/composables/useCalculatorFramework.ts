import { ref, computed, reactive, watch, onMounted, onUnmounted, readonly, type Ref } from 'vue'
import { useValidation, useFormValidation } from './useValidation'
import { useErrorHandler } from './useErrorHandler'
import { useLogging } from './useLogging'
import { getCalculatorQuestionSchema, getScoreRange } from '@/schemas/calculators'
import { getPatientSchemaForCalculator } from '@/schemas/patient'
import sendDataToServer, { type SendDataOptions } from '@/assets/sendDataToServer'
import { nanoid } from 'nanoid'
import type { 
  CalculatorResponses, 
  CalculationResult, 
  CalculatorDetails, 
  PatientData, 
  QuestionValue,
  RiskLevel,
  MedicalChartData,
  SpecificCalculatorDetails
} from '@/types/calculatorTypes'
import { calculateMedicalScore, isCalculatorImplemented } from '@/calculators'
import { useSubmissionService, useExportService } from '@/services'
import type { SubmissionDependencies, ExportDependencies } from '@/services'

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
  allowedGenders?: readonly string[]
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
  sessionId: string
  startTime: Date
  completionTime: Date | null
}

export interface CalculatorFrameworkReturn {
  // State
  state: Readonly<Ref<CalculatorState>>
  
  // Data
  patientData: Ref<Partial<PatientData>>
  calculatorData: Ref<Partial<CalculatorResponses>>
  result: Ref<CalculationResult | null>
  
  // Computed
  duration: Readonly<Ref<number>>
  progress: Readonly<Ref<number>>
  canSubmit: Readonly<Ref<boolean>>
  
  // Validation
  patientValidation: ReturnType<typeof useFormValidation>
  calculatorValidation: ReturnType<typeof useFormValidation>
  
  // Actions
  calculateScore: (responses: CalculatorResponses) => CalculationResult
  submitCalculation: () => Promise<boolean>
  exportResults: (format?: 'json' | 'text' | 'pdf' | 'csv') => Promise<string | null>
  resetCalculator: () => void
  setFieldValue: (section: 'patient' | 'calculator', field: string, value: any) => void
  initializeSteps: (steps: CalculatorStep[]) => void
  
  // Navigation
  nextStep: () => void
  previousStep: () => void
  goToStep: (step: number) => void
  
  // Chart data
  getChartData: () => MedicalChartData | null
}

/**
 * Enhanced Calculator Framework with separated concerns and dependency injection
 * Provides comprehensive state management, validation, calculation, submission, and export functionality
 */
export function useCalculatorFramework(config: CalculatorConfig): CalculatorFrameworkReturn {
  // Core dependencies
  const { handleError } = useErrorHandler()
  const { logError, logCalculation, logUserAction } = useLogging()

  // State management
  const state = ref<CalculatorState>({
    currentStep: 0,
    totalSteps: 3, // Patient -> Calculator -> Results
    isComplete: false,
    isValid: false,
    isSubmitting: false,
    isCalculating: false,
    sessionId: nanoid(),
    startTime: new Date(),
    completionTime: null
  })

  // Data storage
  const patientData = ref<Partial<PatientData>>({})
  const calculatorData = ref<Partial<CalculatorResponses>>({})
  const result = ref<CalculationResult | null>(null)

  // Computed properties
  const duration = computed(() => {
    if (state.value.completionTime) {
      return Math.floor((state.value.completionTime.getTime() - state.value.startTime.getTime()) / 1000)
    }
    return Math.floor((Date.now() - state.value.startTime.getTime()) / 1000)
  })

  const progress = computed(() => {
    return Math.round((state.value.currentStep / Math.max(state.value.totalSteps - 1, 1)) * 100)
  })

  const canSubmit = computed(() => {
    return !state.value.isSubmitting && 
           !state.value.isCalculating && 
           result.value !== null &&
           state.value.isValid
  })

  // Validation setup
  const patientSchema = getPatientSchemaForCalculator(config.type)
  const calculatorSchema = getCalculatorQuestionSchema(config.type)
  
  const patientValidation = useFormValidation(patientSchema, patientData.value)
  const calculatorValidation = useFormValidation(calculatorSchema, calculatorData.value)

  // Watch for validation state changes
  watch([patientValidation.state.isValid, calculatorValidation.state.isValid], ([patientValid, calculatorValid]) => {
    state.value.isValid = patientValid && calculatorValid
  })

  // Helper functions
  const newCorrelationId = () => nanoid()
  const showInfo = (message: string) => {
    // Implementation depends on UI framework - could be toast, notification, etc.
    console.info(message)
  }
  const showSuccess = (title: string, message: string) => {
    // Implementation depends on UI framework - could be toast, notification, etc.
    console.log(`${title}: ${message}`)
  }

  // Calculation logic - now simplified and type-safe
  const calculateScore = (responses: CalculatorResponses): CalculationResult => {
    const startTime = Date.now()
    
    try {
      // All calculators are now implemented in the new modular system
      const result = calculateMedicalScore(config.type, responses)

      const duration = Date.now() - startTime
      
      logCalculation(config.type, responses, {
        score: result.score,
        interpretation: result.interpretation,
        riskLevel: result.riskLevel,
        duration
      }, duration)

      return result
    } catch (error) {
      logError('Calculation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        responses,
        sessionId: state.value.sessionId
      }, config.type)
      
      throw error
    }
  }

  // Setup dependency injection for services
  const submissionDeps: SubmissionDependencies = {
    sendDataToServer,
    useErrorHandler,
    useLogging,
    showInfo,
    showSuccess,
    newCorrelationId
  }
  
  const exportDeps: ExportDependencies = {
    useLogging
  }
  
  // Initialize services
  const submissionService = useSubmissionService(submissionDeps)
  const exportService = useExportService(exportDeps)

  // Submission logic using the new service
  const submitCalculation = async (): Promise<boolean> => {
    if (state.value.isSubmitting) return false
    
    state.value.isSubmitting = true
    state.value.isCalculating = true
    
    try {
      // Final validation
      const patientValid = await patientValidation.validateAll()
      const calculatorValid = await calculatorValidation.validateAll()
      
      if (!patientValid || !calculatorValid) {
        throw new Error('Validation failed before submission')
      }

      // Calculate result
      const calculationResult = calculateScore(calculatorData.value as CalculatorResponses)
      result.value = calculationResult
      
      // Submit using the service
      const success = await submissionService.submitCalculation(
        config,
        patientData.value,
        calculatorData.value,
        calculationResult,
        state.value.sessionId,
        duration.value
      )

      if (success) {
        state.value.isComplete = true
        state.value.completionTime = new Date()
      }
      
      return success
    } catch (error) {
      await handleError(error as Error, {
        component: 'CalculatorFramework',
        action: 'submitCalculation',
        calculator: config.type,
        data: { sessionId: state.value.sessionId }
      })
      return false
    } finally {
      state.value.isSubmitting = false
      state.value.isCalculating = false
    }
  }

  // Export functionality using the new service
  const exportResults = async (format: 'json' | 'text' | 'pdf' | 'csv' = 'json'): Promise<string | null> => {
    if (!result.value) return null
    
    const exportData = exportService.prepareExportData(
      config,
      patientData.value,
      calculatorData.value,
      result.value,
      state.value.sessionId,
      duration.value
    )
    
    return exportService.exportResults(exportData, format)
  }

  // Reset functionality
  const resetCalculator = () => {
    patientData.value = {}
    calculatorData.value = {}
    result.value = null
    
    state.value.currentStep = 0
    state.value.isComplete = false
    state.value.isValid = false
    state.value.isSubmitting = false
    state.value.isCalculating = false
    state.value.startTime = new Date()
    state.value.completionTime = null
    state.value.sessionId = nanoid()
    
    logUserAction('calculator_reset', {
      sessionId: state.value.sessionId
    }, config.type)
  }

  // Navigation functions
  const nextStep = () => {
    if (state.value.currentStep < state.value.totalSteps - 1) {
      state.value.currentStep++
    }
  }

  const previousStep = () => {
    if (state.value.currentStep > 0) {
      state.value.currentStep--
    }
  }

  const goToStep = (step: number) => {
    if (step >= 0 && step < state.value.totalSteps) {
      state.value.currentStep = step
    }
  }

  // Chart data generation
  const getChartData = (): MedicalChartData | null => {
    if (!result.value) return null

    // Basic chart structure - can be extended for specific calculator types
    return {
      labels: ['Score', 'Risk Level'],
      datasets: [{
        label: config.name,
        data: [result.value.score, getRiskLevelNumeric(result.value.riskLevel)],
        backgroundColor: getThemeColor(config.theme),
        borderColor: getThemeColor(config.theme),
        borderWidth: 1
      }]
    }
  }

  // Helper functions for chart data
  const getRiskLevelNumeric = (riskLevel: RiskLevel): number => {
    const levels = { minimal: 1, low: 2, mild: 3, medium: 4, moderate: 5, high: 6, severe: 7, very_high: 8, unknown: 0 }
    return levels[riskLevel] || 0
  }

  const getThemeColor = (theme: string): string => {
    const colors = { sky: '#0ea5e9', teal: '#14b8a6', orange: '#f97316' }
    return colors[theme as keyof typeof colors] || '#6b7280'
  }

  // Lifecycle hooks
  onMounted(() => {
    logUserAction('calculator_started', {
      calculatorType: config.type,
      sessionId: state.value.sessionId
    }, config.type)
  })

  onUnmounted(() => {
    if (!state.value.isComplete) {
      logUserAction('calculator_abandoned', {
        currentStep: state.value.currentStep,
        duration: duration.value,
        sessionId: state.value.sessionId
      }, config.type)
    }
  })

  // Field value setter
  const setFieldValue = (section: 'patient' | 'calculator', field: string, value: any) => {
    if (section === 'patient') {
      patientData.value = { ...patientData.value, [field]: value }
    } else if (section === 'calculator') {
      calculatorData.value = { ...calculatorData.value, [field]: value }
    }
  }

  // Steps initialization
  const initializeSteps = (steps: CalculatorStep[]) => {
    state.value.totalSteps = steps.length
    // Additional step initialization logic can be added here
  }

  // Return the framework API
  return {
    // State
    state: readonly(state),
    
    // Data
    patientData,
    calculatorData,
    result,
    
    // Computed
    duration,
    progress,
    canSubmit,
    
    // Validation
    patientValidation,
    calculatorValidation,
    
    // Actions
    calculateScore,
    submitCalculation,
    exportResults,
    resetCalculator,
    setFieldValue,
    initializeSteps,
    
    // Navigation
    nextStep,
    previousStep,
    goToStep,
    
    // Chart data
    getChartData
  }
}