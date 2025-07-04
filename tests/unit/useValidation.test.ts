import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick as _nextTick } from 'vue'
import { z } from 'zod'
import { 
  useValidation, 
  useFormValidation,
  medicalValidationSchemas,
  type ValidationOptions 
} from '@/composables/useValidation'

describe('useValidation', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with default options', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0)
      })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      expect(validation.data.value).toEqual({})
      expect(validation.state.isValid).toBe(false)
      expect(validation.state.isValidating).toBe(false)
      expect(validation.state.errors).toEqual([])
      expect(validation.state.touched).toEqual({})
      expect(validation.state.dirty).toEqual({})
      expect(validation.hasErrors.value).toBe(false)
      expect(validation.isFormTouched.value).toBe(false)
      expect(validation.isFormDirty.value).toBe(false)
    })

    it('should initialize with custom options', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0)
      })

      const options: ValidationOptions = {
        immediate: true,
        abortEarly: true,
        stripUnknown: false,
        allowUnknown: true
      }

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema, options)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      expect(wrapper.vm.validation).toBeDefined()
    })
  })

  describe('complete validation', () => {
    it('should validate all fields successfully', async () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0).max(150),
        email: z.string().email()
      })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      const validData = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com'
      }

      const isValid = await validation.validateAll(validData)
      
      expect(isValid).toBe(true)
      expect(validation.state.isValid).toBe(true)
      expect(validation.state.errors).toEqual([])
    })

    it('should validate all fields with errors', async () => {
      const schema = z.object({
        name: z.string().min(2, 'Name too short'),
        age: z.number().min(18, 'Must be 18 or older')
      })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      const invalidData = {
        name: 'J',
        age: 16
      }

      const isValid = await validation.validateAll(invalidData)
      
      expect(isValid).toBe(false)
      expect(validation.state.isValid).toBe(false)
      expect(validation.state.errors.length).toBe(2)
      expect(validation.hasErrors.value).toBe(true)
    })

    it('should abort early when configured', async () => {
      const schema = z.object({
        name: z.string().min(2, 'Name too short'),
        age: z.number().min(18, 'Must be 18 or older')
      })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema, { abortEarly: true })
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      const invalidData = {
        name: 'J',
        age: 16
      }

      const isValid = await validation.validateAll(invalidData)
      
      expect(isValid).toBe(false)
      expect(validation.state.errors.length).toBe(1) // Only first error
    })

    it('should validate with custom data', async () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0)
      })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      const customData = { name: 'Alice', age: 25 }
      const isValid = await validation.validateAll(customData)
      
      expect(isValid).toBe(true)
    })
  })

  describe('field state management', () => {
    it('should set field values with options', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0)
      })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      validation.setFieldValue('name', 'John', {
        validate: false,
        touch: true,
        markDirty: true
      })

      expect(validation.data.value.name).toBe('John')
      expect(validation.state.touched.name).toBe(true)
      expect(validation.state.dirty.name).toBe(true)
      expect(validation.isFormTouched.value).toBe(true)
      expect(validation.isFormDirty.value).toBe(true)
    })

    it('should set field touched state', () => {
      const schema = z.object({ name: z.string() })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      validation.setFieldTouched('name', true)
      expect(validation.state.touched.name).toBe(true)
      expect(validation.touchedFields.value).toEqual(['name'])

      validation.setFieldTouched('name', false)
      expect(validation.state.touched.name).toBeUndefined()
      expect(validation.touchedFields.value).toEqual([])
    })

    it('should set field dirty state', () => {
      const schema = z.object({ name: z.string() })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      validation.setFieldDirty('name', true)
      expect(validation.state.dirty.name).toBe(true)
      expect(validation.dirtyFields.value).toEqual(['name'])

      validation.setFieldDirty('name', false)
      expect(validation.state.dirty.name).toBeUndefined()
      expect(validation.dirtyFields.value).toEqual([])
    })
  })

  describe('field and form reset', () => {
    it('should reset individual fields', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0)
      })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      // Set field data and state
      validation.setFieldValue('name', 'John')
      validation.setFieldTouched('name', true)
      validation.setFieldDirty('name', true)

      expect(validation.data.value.name).toBe('John')
      expect(validation.state.touched.name).toBe(true)
      expect(validation.state.dirty.name).toBe(true)

      // Reset field
      validation.resetField('name')

      expect(validation.data.value.name).toBeUndefined()
      expect(validation.state.touched.name).toBeUndefined()
      expect(validation.state.dirty.name).toBeUndefined()
    })

    it('should reset entire validation state', () => {
      const schema = z.object({
        name: z.string().min(1),
        age: z.number().min(0)
      })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      // Set some data
      validation.setFieldValue('name', 'John')
      validation.setFieldValue('age', 25)

      expect(validation.data.value.name).toBe('John')

      // Reset everything
      validation.resetValidation()

      expect(validation.data.value).toEqual({})
      expect(validation.state.isValid).toBe(false)
      expect(validation.state.isValidating).toBe(false)
      expect(validation.state.errors).toEqual([])
      expect(validation.state.touched).toEqual({})
      expect(validation.state.dirty).toEqual({})
      expect(validation.hasErrors.value).toBe(false)
    })
  })

  describe('error management', () => {
    it('should clear all errors', async () => {
      const schema = z.object({
        name: z.string().min(2),
        age: z.number().min(18)
      })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      // Create errors via validateAll
      await validation.validateAll({ name: 'J', age: 16 })
      expect(validation.state.errors.length).toBe(2)

      validation.clearErrors()
      expect(validation.state.errors).toEqual([])
      expect(validation.hasErrors.value).toBe(false)
    })

    it('should add custom errors', () => {
      const schema = z.object({ name: z.string() })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      validation.addError('name', 'Custom error message', 'custom_code')

      expect(validation.hasFieldError('name')).toBe(true)
      expect(validation.getErrorMessage('name')).toBe('Custom error message')
      
      const error = validation.getFieldError('name')
      expect(error?.code).toBe('custom_code')
      expect(error?.field).toBe('name')
    })

    it('should clear field-specific errors', async () => {
      const schema = z.object({
        name: z.string().min(2),
        age: z.number().min(18)
      })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      // Create errors
      await validation.validateAll({ name: 'J', age: 16 })
      expect(validation.state.errors.length).toBe(2)

      validation.clearFieldError('name')
      expect(validation.state.errors.length).toBe(1)
      expect(validation.hasFieldError('name')).toBe(false)
      expect(validation.hasFieldError('age')).toBe(true)
    })
  })

  describe('medical validation helpers', () => {
    it('should validate age ranges', () => {
      const schema = z.object({ age: z.number() })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      expect(validation.validateAge(25)).toBe(true)
      expect(validation.validateAge(25, 18, 65)).toBe(true)
      expect(validation.validateAge(16, 18, 65)).toBe(false)
      expect(validation.validateAge(70, 18, 65)).toBe(false)
      expect(validation.validateAge(-5)).toBe(false)
      expect(validation.validateAge(200)).toBe(false)
    })

    it('should validate Danish CPR numbers', () => {
      const schema = z.object({ cpr: z.string() })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      expect(validation.validateDanishCPR('123456-1234')).toBe(true)
      expect(validation.validateDanishCPR('1234561234')).toBe(true)
      expect(validation.validateDanishCPR('123456-123')).toBe(false) // Too short
      expect(validation.validateDanishCPR('12345a-1234')).toBe(false) // Invalid characters
      expect(validation.validateDanishCPR('123')).toBe(false) // Too short
    })

    it('should validate score ranges', () => {
      const schema = z.object({ score: z.number() })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      expect(validation.validateScore(5, 0, 10)).toBe(true)
      expect(validation.validateScore(0, 0, 10)).toBe(true)
      expect(validation.validateScore(10, 0, 10)).toBe(true)
      expect(validation.validateScore(-1, 0, 10)).toBe(false)
      expect(validation.validateScore(11, 0, 10)).toBe(false)
      expect(validation.validateScore(5.5, 0, 10)).toBe(false) // Not integer
    })
  })

  describe('debouncing and timeouts', () => {
    it('should handle timeout cleanup', () => {
      const schema = z.object({ name: z.string() })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      // Start some debounced validations (this will create timeouts internally)
      validation.validateField('name', 'test', { debounce: 100 })
      
      // Manual cleanup should work
      validation.cleanup()
      
      // This should not throw and timeouts should be cleared
      expect(() => validation.cleanup()).not.toThrow()
    })

    it('should clean up timeouts on unmount', () => {
      const schema = z.object({ name: z.string() })

      const TestComponent = defineComponent({
        setup() {
          const validation = useValidation(schema)
          return { validation }
        },
        template: '<div></div>'
      })

      wrapper = mount(TestComponent)
      const { validation } = wrapper.vm

      // Start some debounced validations
      validation.validateField('name', 'test', { debounce: 100 })

      // Unmount should clean up timers
      wrapper.unmount()
      
      // This should not cause issues
      vi.advanceTimersByTime(200)
    })
  })

  describe('predefined schemas', () => {
    it('should provide medical validation schemas', () => {
      expect(medicalValidationSchemas.age).toBeDefined()
      expect(medicalValidationSchemas.weight).toBeDefined()
      expect(medicalValidationSchemas.height).toBeDefined()
      expect(medicalValidationSchemas.auditScore).toBeDefined()
      expect(medicalValidationSchemas.danpssScore).toBeDefined()
      expect(medicalValidationSchemas.name).toBeDefined()
      expect(medicalValidationSchemas.cpr).toBeDefined()
      expect(medicalValidationSchemas.gender).toBeDefined()
    })

    it('should validate using predefined schemas', async () => {
      // Test age schema
      expect(() => medicalValidationSchemas.age.parse(25)).not.toThrow()
      expect(() => medicalValidationSchemas.age.parse(-5)).toThrow()
      expect(() => medicalValidationSchemas.age.parse(200)).toThrow()
      expect(() => medicalValidationSchemas.age.parse(25.5)).toThrow()

      // Test weight schema
      expect(() => medicalValidationSchemas.weight.parse(70.5)).not.toThrow()
      expect(() => medicalValidationSchemas.weight.parse(0)).toThrow()
      expect(() => medicalValidationSchemas.weight.parse(1500)).toThrow()

      // Test CPR schema
      expect(() => medicalValidationSchemas.cpr.parse('123456-1234')).not.toThrow()
      expect(() => medicalValidationSchemas.cpr.parse('invalid')).toThrow()

      // Test gender schema
      expect(() => medicalValidationSchemas.gender.parse('male')).not.toThrow()
      expect(() => medicalValidationSchemas.gender.parse('female')).not.toThrow()
      expect(() => medicalValidationSchemas.gender.parse('invalid')).toThrow()
    })
  })
})

describe('useFormValidation', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  it('should initialize with initial data', () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().min(0)
    })

    const initialData = { name: 'John', age: 30 }

    const TestComponent = defineComponent({
      setup() {
        const formValidation = useFormValidation(schema, initialData)
        return { formValidation }
      },
      template: '<div></div>'
    })

    wrapper = mount(TestComponent)
    const { formValidation } = wrapper.vm

    expect(formValidation.data.value.name).toBe('John')
    expect(formValidation.data.value.age).toBe(30)
  })

  it('should handle form submission with valid data', async () => {
    const schema = z.object({
      name: z.string().min(1),
      age: z.number().min(18)
    })

    const onValid = vi.fn()
    const onInvalid = vi.fn()

    const TestComponent = defineComponent({
      setup() {
        const formValidation = useFormValidation(schema)
        return { formValidation, onValid, onInvalid }
      },
      template: '<div></div>'
    })

    wrapper = mount(TestComponent)
    const { formValidation, onValid: onValidMock, onInvalid: onInvalidMock } = wrapper.vm

    formValidation.data.value.name = 'John'
    formValidation.data.value.age = 25

    await formValidation.handleSubmit(onValidMock, onInvalidMock)

    expect(onValidMock).toHaveBeenCalledWith({ name: 'John', age: 25 })
    expect(onInvalidMock).not.toHaveBeenCalled()
  })

  it('should handle form submission with invalid data', async () => {
    const schema = z.object({
      name: z.string().min(2, 'Name too short'),
      age: z.number().min(18, 'Must be 18 or older')
    })

    const onValid = vi.fn()
    const onInvalid = vi.fn()

    const TestComponent = defineComponent({
      setup() {
        const formValidation = useFormValidation(schema)
        return { formValidation, onValid, onInvalid }
      },
      template: '<div></div>'
    })

    wrapper = mount(TestComponent)
    const { formValidation, onValid: onValidMock, onInvalid: onInvalidMock } = wrapper.vm

    formValidation.data.value.name = 'J'
    formValidation.data.value.age = 16

    await formValidation.handleSubmit(onValidMock, onInvalidMock)

    expect(onValidMock).not.toHaveBeenCalled()
    expect(onInvalidMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ message: 'Name too short' }),
        expect.objectContaining({ message: 'Must be 18 or older' })
      ])
    )
  })

  it('should handle async onValid callback', async () => {
    const schema = z.object({
      name: z.string().min(1)
    })

    const onValid = vi.fn().mockResolvedValue(undefined)

    const TestComponent = defineComponent({
      setup() {
        const formValidation = useFormValidation(schema)
        return { formValidation, onValid }
      },
      template: '<div></div>'
    })

    wrapper = mount(TestComponent)
    const { formValidation, onValid: onValidMock } = wrapper.vm

    formValidation.data.value.name = 'John'

    await formValidation.handleSubmit(onValidMock)

    expect(onValidMock).toHaveBeenCalledWith({ name: 'John' })
  })
})