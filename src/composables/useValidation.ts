import { ref, computed, reactive, watch, type Ref } from 'vue'
import { z, type ZodSchema, type ZodIssue } from 'zod'

export interface ValidationRule<T = any> {
  schema: ZodSchema<T>
  message?: string
  trigger?: 'change' | 'blur' | 'submit'
  debounce?: number
}

export interface ValidationError {
  field: string
  message: string
  code: string
  path: (string | number)[]
  received?: any
}

export interface ValidationState {
  isValid: boolean
  isValidating: boolean
  errors: ValidationError[]
  touched: Record<string, boolean>
  dirty: Record<string, boolean>
}

export interface ValidationOptions {
  immediate?: boolean
  abortEarly?: boolean
  stripUnknown?: boolean
  allowUnknown?: boolean
}

export function useValidation<T extends Record<string, any>>(
  schema: ZodSchema<T>,
  options: ValidationOptions = {}
) {
  const {
    immediate = false,
    abortEarly = false,
    stripUnknown = true,
    allowUnknown = false
  } = options

  // Validation state
  const state = reactive<ValidationState>({
    isValid: false,
    isValidating: false,
    errors: [],
    touched: {},
    dirty: {}
  })

  const data = ref<Partial<T>>({}) as Ref<Partial<T>>
  const validationTimeouts = new Map<string, NodeJS.Timeout>()

  // Computed properties
  const hasErrors = computed(() => state.errors.length > 0)
  const touchedFields = computed(() => Object.keys(state.touched))
  const dirtyFields = computed(() => Object.keys(state.dirty))
  const isFormTouched = computed(() => touchedFields.value.length > 0)
  const isFormDirty = computed(() => dirtyFields.value.length > 0)

  // Error helpers
  const getFieldErrors = (fieldName: string): ValidationError[] => {
    return state.errors.filter(error => 
      error.path.length > 0 && error.path[0] === fieldName
    )
  }

  const getFieldError = (fieldName: string): ValidationError | undefined => {
    return getFieldErrors(fieldName)[0]
  }

  const hasFieldError = (fieldName: string): boolean => {
    return getFieldErrors(fieldName).length > 0
  }

  const getErrorMessage = (fieldName: string): string | undefined => {
    return getFieldError(fieldName)?.message
  }

  // Validation methods
  const validateField = async (
    fieldName: string, 
    value: any,
    options: { debounce?: number; silent?: boolean } = {}
  ): Promise<boolean> => {
    const { debounce = 0, silent = false } = options

    // Clear existing timeout for this field
    if (validationTimeouts.has(fieldName)) {
      clearTimeout(validationTimeouts.get(fieldName)!)
      validationTimeouts.delete(fieldName)
    }

    // Debounce validation if specified
    if (debounce > 0) {
      return new Promise((resolve) => {
        const timeoutId = setTimeout(async () => {
          validationTimeouts.delete(fieldName)
          const isValid = await performFieldValidation(fieldName, value, silent)
          resolve(isValid)
        }, debounce)
        
        validationTimeouts.set(fieldName, timeoutId)
      })
    }

    return performFieldValidation(fieldName, value, silent)
  }

  const performFieldValidation = async (
    fieldName: string, 
    value: any, 
    silent: boolean = false
  ): Promise<boolean> => {
    if (!silent) {
      state.isValidating = true
    }

    try {
      // Clear existing errors for this field
      state.errors = state.errors.filter(error => 
        !(error.path.length > 0 && error.path[0] === fieldName)
      )

      // Create partial schema for single field validation
      const fieldSchema = (schema as any).shape?.[fieldName]
      if (!fieldSchema) {
        if (!silent) {
          state.isValidating = false
        }
        return true
      }

      // Validate the field
      fieldSchema.parse(value)
      
      if (!silent) {
        state.isValidating = false
      }
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.issues.map(issue => convertZodIssueToValidationError(issue, fieldName))
        state.errors.push(...fieldErrors)
      }
      
      if (!silent) {
        state.isValidating = false
      }
      return false
    }
  }

  const validateAll = async (values?: Partial<T>): Promise<boolean> => {
    state.isValidating = true
    state.errors = []

    const dataToValidate = values || data.value

    try {
      const result = await schema.parseAsync(dataToValidate)
      
      if (stripUnknown && result !== dataToValidate) {
        // Update data with stripped values
        Object.assign(data.value, result)
      }

      state.isValid = true
      state.isValidating = false
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        state.errors = error.issues.map(issue => convertZodIssueToValidationError(issue))
        
        if (abortEarly && state.errors.length > 0) {
          state.errors = [state.errors[0]]
        }
      }

      state.isValid = false
      state.isValidating = false
      return false
    }
  }

  const convertZodIssueToValidationError = (
    issue: ZodIssue, 
    fieldOverride?: string
  ): ValidationError => {
    const field = fieldOverride || (issue.path.length > 0 ? String(issue.path[0]) : 'unknown')
    
    return {
      field,
      message: issue.message,
      code: issue.code,
      path: issue.path,
      received: (issue as any).received
    }
  }

  // Field state management
  const setFieldTouched = (fieldName: string, touched: boolean = true) => {
    if (touched) {
      state.touched[fieldName] = true
    } else {
      delete state.touched[fieldName]
    }
  }

  const setFieldDirty = (fieldName: string, dirty: boolean = true) => {
    if (dirty) {
      state.dirty[fieldName] = true
    } else {
      delete state.dirty[fieldName]
    }
  }

  const setFieldValue = (fieldName: string, value: any, options: {
    validate?: boolean
    touch?: boolean
    markDirty?: boolean
  } = {}) => {
    const { validate = true, touch = true, markDirty = true } = options

    // Update data
    ;(data.value as any)[fieldName] = value

    // Update field state
    if (touch) {
      setFieldTouched(fieldName, true)
    }
    if (markDirty) {
      setFieldDirty(fieldName, true)
    }

    // Validate if requested
    if (validate) {
      validateField(fieldName, value, { debounce: 300 })
    }
  }

  const resetField = (fieldName: string) => {
    // Clear field value
    delete (data.value as any)[fieldName]
    
    // Clear field state
    delete state.touched[fieldName]
    delete state.dirty[fieldName]
    
    // Clear field errors
    state.errors = state.errors.filter(error => 
      !(error.path.length > 0 && error.path[0] === fieldName)
    )

    // Clear validation timeout
    if (validationTimeouts.has(fieldName)) {
      clearTimeout(validationTimeouts.get(fieldName)!)
      validationTimeouts.delete(fieldName)
    }
  }

  const resetValidation = () => {
    // Clear all data
    data.value = {}
    
    // Reset state
    state.isValid = false
    state.isValidating = false
    state.errors = []
    state.touched = {}
    state.dirty = {}

    // Clear all timeouts
    validationTimeouts.forEach(timeout => clearTimeout(timeout))
    validationTimeouts.clear()
  }

  // Error management
  const clearErrors = () => {
    state.errors = []
  }

  const clearFieldError = (fieldName: string) => {
    state.errors = state.errors.filter(error => 
      !(error.path.length > 0 && error.path[0] === fieldName)
    )
  }

  const addError = (fieldName: string, message: string, code: string = 'custom') => {
    const error: ValidationError = {
      field: fieldName,
      message,
      code,
      path: [fieldName]
    }
    state.errors.push(error)
  }

  // Medical-specific validation helpers
  const validateAge = (age: number, min: number = 0, max: number = 150): boolean => {
    return age >= min && age <= max
  }

  const validateDanishCPR = (cpr: string): boolean => {
    // Basic Danish CPR validation (DDMMYY-XXXX)
    const cprRegex = /^\d{6}-?\d{4}$/
    if (!cprRegex.test(cpr)) return false
    
    const digits = cpr.replace('-', '')
    if (digits.length !== 10) return false
    
    // Basic checksum validation could be added here
    return true
  }

  const validateScore = (score: number, min: number, max: number): boolean => {
    return Number.isInteger(score) && score >= min && score <= max
  }

  // Watch for changes if immediate validation is enabled
  if (immediate) {
    watch(data, (newData) => {
      validateAll(newData)
    }, { deep: true })
  }

  // Cleanup timeouts on unmount
  const cleanup = () => {
    validationTimeouts.forEach(timeout => clearTimeout(timeout))
    validationTimeouts.clear()
  }

  return {
    // State
    data,
    state: readonly(state),
    
    // Computed
    hasErrors,
    isFormTouched,
    isFormDirty,
    touchedFields,
    dirtyFields,
    
    // Validation methods
    validateField,
    validateAll,
    
    // Error helpers
    getFieldErrors,
    getFieldError,
    hasFieldError,
    getErrorMessage,
    
    // Field management
    setFieldValue,
    setFieldTouched,
    setFieldDirty,
    resetField,
    resetValidation,
    
    // Error management
    clearErrors,
    clearFieldError,
    addError,
    
    // Medical helpers
    validateAge,
    validateDanishCPR,
    validateScore,
    
    // Cleanup
    cleanup
  }
}

// Predefined medical validation schemas
export const medicalValidationSchemas = {
  // Common patient information
  age: z.number()
    .min(0, 'Alder skal være mindst 0')
    .max(150, 'Alder skal være højst 150')
    .int('Alder skal være et helt tal'),
    
  weight: z.number()
    .min(0.1, 'Vægt skal være mindst 0.1 kg')
    .max(1000, 'Vægt skal være højst 1000 kg'),
    
  height: z.number()
    .min(10, 'Højde skal være mindst 10 cm')
    .max(300, 'Højde skal være højst 300 cm'),
    
  // Score ranges for different calculators
  auditScore: z.number()
    .min(0, 'AUDIT score skal være mindst 0')
    .max(4, 'AUDIT score skal være højst 4')
    .int('AUDIT score skal være et helt tal'),
    
  danpssScore: z.number()
    .min(0, 'DANPSS score skal være mindst 0')
    .max(3, 'DANPSS score skal være højst 3')
    .int('DANPSS score skal være et helt tal'),
    
  // Text fields
  name: z.string()
    .min(1, 'Navn er påkrævet')
    .max(100, 'Navn må højst være 100 tegn'),
    
  // CPR number
  cpr: z.string()
    .regex(/^\d{6}-?\d{4}$/, 'CPR nummer skal have formatet DDMMYY-XXXX'),
    
  // Gender
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Køn skal være mand, kvinde eller andet' })
  })
}

// Utility function to create form validation composable
export function useFormValidation<T extends Record<string, any>>(
  schema: ZodSchema<T>,
  initialData?: Partial<T>,
  options?: ValidationOptions
) {
  const validation = useValidation(schema, options)
  
  // Initialize with provided data
  if (initialData) {
    Object.assign(validation.data.value, initialData)
  }
  
  const handleSubmit = async (
    onValid: (data: T) => void | Promise<void>,
    onInvalid?: (errors: ValidationError[]) => void
  ) => {
    const isValid = await validation.validateAll()
    
    if (isValid) {
      await onValid(validation.data.value as T)
    } else if (onInvalid) {
      onInvalid(validation.state.errors)
    }
  }
  
  return {
    ...validation,
    handleSubmit
  }
}