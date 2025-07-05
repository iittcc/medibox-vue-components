import { ref, readonly, type Ref } from 'vue'
import type { CalculationResult, CalculatorResponses, PatientData } from '@/types/calculatorTypes'
import type { CalculatorConfig } from '@/composables/useCalculatorFramework'
import type { SendDataOptions } from '@/assets/sendDataToServer'

// Dependency injection interface
export interface SubmissionDependencies {
  sendDataToServer: (
    serverUrl: string,
    publicKeyUrl: string,
    data: any,
    options: SendDataOptions
  ) => Promise<void>
  useErrorHandler: () => {
    handleError: (error: Error, context?: any) => Promise<void>
  }
  useLogging: () => {
    logError: (message: string, details: any, calculatorType?: string) => void
    logUserAction: (action: string, details: any, calculatorType?: string) => void
  }
  showInfo: (message: string) => void
  showSuccess: (title: string, message: string) => void
  newCorrelationId: () => string
}

export interface SubmissionData {
  config: CalculatorConfig
  patient: Partial<PatientData>
  responses: Partial<CalculatorResponses>
  result: CalculationResult
  metadata: {
    sessionId: string
    duration: number
    version: string
    timestamp: string
  }
}

export interface SubmissionState {
  isSubmitting: boolean
  isComplete: boolean
  completionTime: Date | null
}

export const useSubmissionService = (dependencies: SubmissionDependencies) => {
  const {
    sendDataToServer,
    useErrorHandler,
    useLogging,
    showInfo,
    showSuccess,
    newCorrelationId
  } = dependencies

  const { handleError } = useErrorHandler()
  const { logError, logUserAction } = useLogging()

  const submissionState: Ref<SubmissionState> = ref({
    isSubmitting: false,
    isComplete: false,
    completionTime: null
  })

  const prepareSubmissionData = (
    config: CalculatorConfig,
    patient: Partial<PatientData>,
    responses: Partial<CalculatorResponses>,
    result: CalculationResult,
    sessionId: string,
    duration: number
  ): SubmissionData => {
    return {
      config,
      patient,
      responses,
      result,
      metadata: {
        sessionId,
        duration,
        version: config.version,
        timestamp: new Date().toISOString()
      }
    }
  }

  const submitToServer = async (
    submissionData: SubmissionData,
    serverUrl: string,
    publicKeyUrl: string
  ): Promise<boolean> => {
    if (submissionState.value.isSubmitting) return false
    
    submissionState.value.isSubmitting = true
    
    try {
      const correlationId = newCorrelationId()
      
      const sendOptions: SendDataOptions = {
        calculatorType: submissionData.config.type,
        correlationId,
        onProgress: (attempt, maxRetries) => {
          showInfo(`Sender data (forsøg ${attempt}/${maxRetries})`)
        },
        onError: (error, attempt) => {
          logError('Submission attempt failed', { 
            error: error.message, 
            attempt,
            correlationId 
          }, submissionData.config.type)
        }
      }

      await sendDataToServer(serverUrl, publicKeyUrl, submissionData, sendOptions)
      
      showSuccess('Data sendt', 'Beregningen er gemt og sendt til serveren.')
      
      // Mark as complete
      submissionState.value.isComplete = true
      submissionState.value.completionTime = new Date()
      
      logUserAction('calculation_completed', {
        score: submissionData.result.score,
        riskLevel: submissionData.result.riskLevel,
        duration: submissionData.metadata.duration,
        sessionId: submissionData.metadata.sessionId
      }, submissionData.config.type)

      return true
    } catch (error) {
      await handleError(error as Error, {
        component: 'SubmissionService',
        action: 'submitToServer',
        calculator: submissionData.config.type,
        data: { sessionId: submissionData.metadata.sessionId }
      })
      return false
    } finally {
      submissionState.value.isSubmitting = false
    }
  }

  const submitCalculation = async (
    config: CalculatorConfig,
    patient: Partial<PatientData>,
    responses: Partial<CalculatorResponses>,
    result: CalculationResult,
    sessionId: string,
    duration: number
  ): Promise<boolean> => {
    try {
      // Prepare submission data
      const submissionData = prepareSubmissionData(
        config,
        patient,
        responses,
        result,
        sessionId,
        duration
      )

      // Submit to server if configured
      const serverUrl = import.meta.env.VITE_API_URL
      const publicKeyUrl = import.meta.env.VITE_PUBLIC_KEY_URL
      
      if (serverUrl && publicKeyUrl) {
        const success = await submitToServer(submissionData, serverUrl, publicKeyUrl)
        if (!success) return false
      }

      showSuccess('Beregning fuldført', `${config.name} er beregnet med resultat: ${result.score}`)
      
      return true
    } catch (error) {
      await handleError(error as Error, {
        component: 'SubmissionService',
        action: 'submitCalculation',
        calculator: config.type,
        data: { sessionId }
      })
      return false
    }
  }

  const resetSubmissionState = () => {
    submissionState.value = {
      isSubmitting: false,
      isComplete: false,
      completionTime: null
    }
  }

  return {
    submissionState: readonly(submissionState),
    prepareSubmissionData,
    submitToServer,
    submitCalculation,
    resetSubmissionState
  }
}