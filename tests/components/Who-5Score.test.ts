import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Who5Score from '@/components/Who-5Score.vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import type { CalculationResult } from '@/types/calculatorTypes'

// Create refs to match actual composable structure
const mockState = ref({ isSubmitting: false, isComplete: false })
const mockResult = ref<CalculationResult | null>(null)

// Mock the framework
const mockFramework = {
  patientData: ref({ name: 'Test Patient', age: 40, gender: 'male' }),
  calculatorData: ref({ 
    question1: 5, question2: 5, question3: 5, question4: 5, question5: 5
  }),
  result: mockResult,
  state: mockState,
  setFieldValue: vi.fn(),
  submitCalculation: vi.fn(),
  resetCalculator: vi.fn(),
  initializeSteps: vi.fn(),
}

vi.mock('@/composables/useCalculatorFramework', () => ({
  useCalculatorFramework: () => mockFramework,
}))

vi.mock('@/utils/genderUtils', () => ({
  getGenderLabel: vi.fn((gender) => gender === 'male' ? 'Mand' : 'Kvinde')
}))

// Define simple stubs for child components
const SurfaceCardStub = { name: 'SurfaceCard', template: '<div data-testid="surface-card"><h3>{{ title }}</h3><slot name="content"></slot></div>', props: ['title'] }
const PersonInfoStub = { name: 'PersonInfo', template: '<div data-testid="person-info" />', emits: ['update:name', 'update:age', 'update:gender'], props: ['name', 'age', 'minAge', 'maxAge', 'gender', 'genderdisplay'] }
const QuestionSingleComponentStub = { name: 'QuestionSingleComponent', template: '<div data-testid="question-single-component">{{ question.text }}</div>', props: ['question', 'frameworkAnswer', 'name', 'options', 'index', 'isUnanswered', 'scrollHeight'], emits: ['update:answer'] }
const ButtonStub = { name: 'Button', template: '<button type="submit" data-testid="button" :disabled="disabled" @click="$emit(\'click\')">Beregn</button>', emits: ['click'], props: ['type', 'disabled', 'label', 'icon'] }
const SecondaryButtonStub = { name: 'SecondaryButton', template: '<button data-testid="secondary-button" @click="$emit(\'click\')">Reset</button>', emits: ['click'] }
const MessageStub = { name: 'Message', template: '<div data-testid="message"><slot /></div>', props: ['severity'] }
const CopyDialogStub = { name: 'CopyDialog', template: '<div data-testid="copy-dialog"><slot name="container" /></div>', props: ['disabled'] }

describe('Who-5Score.vue', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock state
    mockState.value.isSubmitting = false
    mockState.value.isComplete = false
    mockResult.value = null
    
    wrapper = mount(Who5Score, {
      global: {
        plugins: [
          [PrimeVue, { unstyled: true }],
          ToastService
        ],
        stubs: {
          SurfaceCard: SurfaceCardStub,
          PersonInfo: PersonInfoStub,
          QuestionSingleComponent: QuestionSingleComponentStub,
          Button: ButtonStub,
          SecondaryButton: SecondaryButtonStub,
          Message: MessageStub,
          CopyDialog: CopyDialogStub,
          Toast: true,
        },
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Component Rendering', () => {
    it('renders the component with correct structure', () => {
      expect(wrapper.find('[data-testid="surface-card"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('WHO-5 Trivselindex')
    })

    it('displays patient section', () => {
      expect(wrapper.text()).toContain('Patient')
      expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    })

    it('displays WHO-5 questionnaire section', () => {
      expect(wrapper.text()).toContain('WHO-5 Trivselindex')
    })

    it('displays all 5 well-being questions', () => {
      const questions = wrapper.findAll('[data-testid="question-single-component"]')
      expect(questions.length).toBe(5)
    })

    it('displays patient info with appropriate age range', () => {
      const personInfo = wrapper.findComponent({ name: 'PersonInfo' })
      expect(personInfo.exists()).toBe(true)
      expect(personInfo.props('minAge')).toBe(16)
      expect(personInfo.props('maxAge')).toBe(110)
    })

    it('displays form controls', () => {
      expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="secondary-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="button"]').exists()).toBe(true)
    })
  })

  describe('Framework Integration', () => {
    it('initializes framework with WHO-5 configuration', () => {
      expect(mockFramework.initializeSteps).toHaveBeenCalled()
      expect(wrapper.vm.config.type).toBe('who5')
      expect(wrapper.vm.config.name).toBe('WHO-5 Trivselindex')
    })

    it('uses framework data for WHO-5 responses', () => {
      expect(wrapper.vm.who5Data.question1).toBe(5)
      expect(wrapper.vm.who5Data.question2).toBe(5)
      expect(wrapper.vm.who5Data.question3).toBe(5)
      expect(wrapper.vm.who5Data.question4).toBe(5)
      expect(wrapper.vm.who5Data.question5).toBe(5)
    })

    it('binds patient data from framework', () => {
      expect(wrapper.vm.framework.patientData.value.name).toBe('Test Patient')
      expect(wrapper.vm.framework.patientData.value.age).toBe(40)
      expect(wrapper.vm.framework.patientData.value.gender).toBe('male')
    })

    it('exposes wellbeing options for testing', () => {
      expect(wrapper.vm.wellbeingOptions).toHaveLength(6)
      expect(wrapper.vm.wellbeingOptions[0].value).toBe(5)
      expect(wrapper.vm.wellbeingOptions[5].value).toBe(0)
    })
  })

  describe('Initial State', () => {
    it('has correct WHO-5 scoring options', () => {
      const options = wrapper.vm.wellbeingOptions
      expect(options).toHaveLength(6)
      expect(options[0].text).toBe('Hele tiden')
      expect(options[0].value).toBe(5)
      expect(options[5].text).toBe('På intet tidspunkt')
      expect(options[5].value).toBe(0)
    })
  })

  describe('Form Submission', () => {
    it('calls framework submit on form submission', async () => {
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      expect(mockFramework.submitCalculation).toHaveBeenCalled()
    })

    it('calls framework reset on reset button click', async () => {
      const resetButton = wrapper.find('[data-testid="secondary-button"]')
      await resetButton.trigger('click')
      expect(mockFramework.resetCalculator).toHaveBeenCalled()
    })

    it('shows submit button with loading state', async () => {
      mockState.value.isSubmitting = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('[data-testid="button"]').attributes('disabled')).toBeDefined()
    })
  })

  describe('Results Display', () => {
    it('shows results when framework has result', async () => {
      mockResult.value = {
        score: 84,
        interpretation: 'Godt velbefindende',
        recommendations: ['Fortsæt gode vaner'],
        riskLevel: 'low'
      }
      
      await wrapper.vm.$nextTick()
      expect(wrapper.find('.results').exists()).toBe(true)
      expect(wrapper.text()).toContain('WHO-5 Score 84')
      expect(wrapper.text()).toContain('Godt velbefindende')
      expect(wrapper.text()).toContain('Fortsæt gode vaner')
    })

    it('hides results when framework has no result', () => {
      mockResult.value = null
      expect(wrapper.find('.results').exists()).toBe(false)
    })

    it('shows clinical guidance when results are present', async () => {
      mockResult.value = {
        score: 20,
        interpretation: 'Dårligt velbefindende',
        recommendations: ['Kontakt læge for depression screening'],
        riskLevel: 'high'
      }
      
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Kontakt læge for depression screening')
    })
  })

  describe('Event Handling', () => {
    it('calls framework setFieldValue on question answer update', () => {
      const question = wrapper.findComponent({ name: 'QuestionSingleComponent' })
      question.vm.$emit('update:answer', 3)
      expect(mockFramework.setFieldValue).toHaveBeenCalledWith('calculator', 'question1', 3)
    })

    it('calls framework setFieldValue on patient data update', () => {
      const personInfo = wrapper.findComponent({ name: 'PersonInfo' })
      personInfo.vm.$emit('update:name', 'New Name')
      expect(mockFramework.setFieldValue).toHaveBeenCalledWith('patient', 'name', 'New Name')
    })
  })

  describe('Clinical Accuracy', () => {
    it('follows WHO-5 Well-Being Index configuration', () => {
      expect(wrapper.vm.config.category).toBe('psychology')
      expect(wrapper.vm.config.theme).toBe('sky')
      expect(wrapper.vm.config.minAge).toBe(16)
      expect(wrapper.vm.config.maxAge).toBe(110)
    })

    it('uses correct scoring range (0-5 per question)', () => {
      const options = wrapper.vm.wellbeingOptions
      expect(options[0].value).toBe(5) // Maximum value
      expect(options[5].value).toBe(0) // Minimum value
    })

    it('properly screens for depression risk', async () => {
      mockResult.value = {
        score: 20,
        interpretation: 'Dårligt velbefindende',
        recommendations: ['Kontakt læge for depression screening'],
        riskLevel: 'high'
      }
      
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Kontakt læge for depression screening')
    })
  })

  describe('Component Configuration', () => {
    it('has correct psychology theme configuration', () => {
      expect(wrapper.vm.config.theme).toBe('sky')
    })

    it('has appropriate age range for adult psychology assessment', () => {
      expect(wrapper.vm.config.minAge).toBe(16)
      expect(wrapper.vm.config.maxAge).toBe(110)
    })

    it('has correct default gender for WHO-5', () => {
      expect(wrapper.vm.config.defaultGender).toBe('male')
    })
  })
})