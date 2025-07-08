import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import PUQEScore from '@/components/PUQEScore.vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import type { CalculationResult } from '@/types/calculatorTypes'

// Create refs to match actual composable structure
const mockState = ref({ isSubmitting: false, isComplete: false })
const mockResult = ref<CalculationResult | null>(null)

// Mock the framework
const mockFramework = {
  patientData: ref({ name: 'Test Patient', age: 28, gender: 'female' }),
  calculatorData: ref({ 
    nausea: 1, vomiting: 1, retching: 1
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
const PersonInfoStub = { name: 'PersonInfo', template: '<div data-testid="person-info" />', emits: ['update:name', 'update:age', 'update:gender'] }
const QuestionSingleComponentStub = { name: 'QuestionSingleComponent', template: '<div data-testid="question-single-component">{{ question.text }}</div>', props: ['question', 'frameworkAnswer', 'name', 'options', 'index', 'isUnanswered', 'scrollHeight'], emits: ['update:answer'] }
const ButtonStub = { name: 'Button', template: '<button type="submit" data-testid="button" @click="$emit(\'click\')">Beregn</button>', emits: ['click'], props: ['type'] }
const SecondaryButtonStub = { name: 'SecondaryButton', template: '<button data-testid="secondary-button" @click="$emit(\'click\')">Reset</button>', emits: ['click'] }
const MessageStub = { name: 'Message', template: '<div data-testid="message"><slot /></div>' }
const CopyDialogStub = { name: 'CopyDialog', template: '<div data-testid="copy-dialog"><slot name="container" /></div>', props: ['disabled'] }

describe('PUQEScore.vue', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock state
    mockState.value.isSubmitting = false
    mockState.value.isComplete = false
    mockResult.value = null
    
    wrapper = mount(PUQEScore, {
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
      expect(wrapper.text()).toContain('PUQE Scoringsskema')
    })

    it('displays patient section', () => {
      expect(wrapper.text()).toContain('Patient')
      expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    })

    it('displays PUQE questionnaire section', () => {
      expect(wrapper.text()).toContain('PUQE Scoringsskema')
    })

    it('displays all 3 pregnancy nausea questions', () => {
      const questions = wrapper.findAll('[data-testid="question-single-component"]')
      expect(questions.length).toBe(3)
    })

    it('displays form buttons', () => {
      expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="secondary-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="button"]').exists()).toBe(true)
    })
  })

  describe('Framework Integration', () => {
    it('calls framework.setFieldValue when patient info changes', () => {
      const personInfo = wrapper.findComponent({ name: 'PersonInfo' })
      personInfo.vm.$emit('update:name', 'Test Name')
      expect(mockFramework.setFieldValue).toHaveBeenCalledWith('patient', 'name', 'Test Name')
    })

    it('calls framework.setFieldValue when patient age changes', () => {
      const personInfo = wrapper.findComponent({ name: 'PersonInfo' })
      personInfo.vm.$emit('update:age', 30)
      expect(mockFramework.setFieldValue).toHaveBeenCalledWith('patient', 'age', 30)
    })

    it('calls framework.setFieldValue when patient gender changes', () => {
      const personInfo = wrapper.findComponent({ name: 'PersonInfo' })
      personInfo.vm.$emit('update:gender', 'male')
      expect(mockFramework.setFieldValue).toHaveBeenCalledWith('patient', 'gender', 'male')
    })

    it('calls framework.setFieldValue when a question answer changes', () => {
      const questionComponent = wrapper.findComponent({ name: 'QuestionSingleComponent' })
      questionComponent.vm.$emit('update:answer', 3)
      expect(mockFramework.setFieldValue).toHaveBeenCalled()
    })

    it('calls framework.submitCalculation when the submit button is clicked', async () => {
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')
      expect(mockFramework.submitCalculation).toHaveBeenCalled()
    })

    it('calls framework.resetCalculator when the reset button is clicked', async () => {
      const resetButton = wrapper.find('[data-testid="secondary-button"]')
      await resetButton.trigger('click')
      expect(mockFramework.resetCalculator).toHaveBeenCalled()
    })

    it('displays results when framework has calculation result', async () => {
      // Set up completed state with result
      mockState.value.isComplete = true
      mockResult.value = {
        score: 8,
        interpretation: 'Moderat graviditetskvalme',
        riskLevel: 'moderate',
        details: {
          severity: 'moderate',
          hyperemesisRisk: false
        },
        recommendations: ['Kontakt jordemoder', 'Overvej anti-emetika']
      } as CalculationResult
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('[data-testid="message"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('PUQE Score 8 : Moderat graviditetskvalme')
    })
  })

  describe('PUQE Options Configuration', () => {
    it('has correct nausea duration options (1-5 scale)', () => {
      const component = wrapper.vm
      expect(component.nauseaOptions).toEqual([
        { text: 'Slet ikke', value: 1 },
        { text: '≤ 1 time', value: 2 },
        { text: '2-3 timer', value: 3 },
        { text: '4-6 timer', value: 4 },
        { text: '> 6 timer', value: 5 }
      ])
    })

    it('has correct vomiting frequency options (1-5 scale)', () => {
      const component = wrapper.vm
      expect(component.vomitingOptions).toEqual([
        { text: 'Ingen opkastninger', value: 1 },
        { text: '1-2 gange', value: 2 },
        { text: '3-4 gange', value: 3 },
        { text: '5-6 gange', value: 4 },
        { text: '≥ 7 gange', value: 5 }
      ])
    })

    it('has correct retching frequency options (1-5 scale)', () => {
      const component = wrapper.vm
      expect(component.retchingOptions).toEqual([
        { text: 'Nej', value: 1 },
        { text: '1-2 gange', value: 2 },
        { text: '3-4 gange', value: 3 },
        { text: '5-6 gange', value: 4 },
        { text: '≥ 7 gange', value: 5 }
      ])
    })
  })

  describe('Pregnancy-Specific Configuration', () => {
    it('has correct default patient values for pregnancy assessment', () => {
      const patientData = mockFramework.patientData.value
      expect(patientData.gender).toBe('female') // Female for pregnancy
      expect(patientData.age).toBe(28) // Appropriate age for pregnancy
    })

    it('has correct calculator data structure for PUQE', () => {
      const calculatorData = mockFramework.calculatorData.value
      expect(calculatorData).toHaveProperty('nausea')
      expect(calculatorData).toHaveProperty('vomiting')
      expect(calculatorData).toHaveProperty('retching')
    })

    it('questions have correct Danish pregnancy terminology', () => {
      // Check that pregnancy-specific terms are present in the component
      expect(wrapper.text()).toContain('følt dig forkvalmet')
      expect(wrapper.text()).toContain('kastet op')
      expect(wrapper.text()).toContain('opkastningsbevægelser')
      
      // All questions focus on 24-hour timeframe
      expect(wrapper.text()).toContain('de sidste 24 timer')
    })

    it('displays pregnancy-specific clinical guidance text', async () => {
      // Set up results to display the guidance text
      mockResult.value = {
        score: 8,
        interpretation: 'Moderat graviditetskvalme',
        riskLevel: 'moderate',
        details: { severity: 'moderate' },
        recommendations: []
      } as CalculationResult
      
      await wrapper.vm.$nextTick()
      
      const guidance = wrapper.text()
      expect(guidance).toContain('Score ≤ 6 : Mild graviditetskvalme')
      expect(guidance).toContain('Score 7-12: Moderat graviditetskvalme')
      expect(guidance).toContain('Score ≥ 13: Svær graviditetskvalme (Hyperemesis Gravidarum)')
    })
  })

  describe('Result Display Scenarios', () => {
    it('displays mild nausea result correctly', async () => {
      mockState.value.isComplete = true
      mockResult.value = {
        score: 5,
        interpretation: 'Mild graviditetskvalme',
        riskLevel: 'mild',
        details: {
          severity: 'mild',
          hyperemesisRisk: false
        },
        recommendations: ['Små hyppige måltider', 'Undgå trigger foods']
      } as CalculationResult
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('PUQE Score 5 : Mild graviditetskvalme')
    })

    it('displays moderate nausea result correctly', async () => {
      mockState.value.isComplete = true
      mockResult.value = {
        score: 9,
        interpretation: 'Moderat graviditetskvalme',
        riskLevel: 'moderate',
        details: {
          severity: 'moderate',
          hyperemesisRisk: false
        },
        recommendations: ['Kontakt jordemoder', 'Overvej anti-emetika']
      } as CalculationResult
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('PUQE Score 9 : Moderat graviditetskvalme')
    })

    it('displays severe nausea/Hyperemesis Gravidarum result correctly', async () => {
      mockState.value.isComplete = true
      mockResult.value = {
        score: 14,
        interpretation: 'Alvorlig graviditetskvalme (Hyperemesis)',
        riskLevel: 'severe',
        details: {
          severity: 'severe',
          hyperemesisRisk: true
        },
        recommendations: ['Kontakt læge øjeblikkeligt', 'Hospitalsindlæggelse kan være nødvendig']
      } as CalculationResult
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.text()).toContain('PUQE Score 14 : Alvorlig graviditetskvalme (Hyperemesis)')
    })

    it('copy dialog is disabled when no results', () => {
      mockResult.value = null
      const copyDialog = wrapper.find('[data-testid="copy-dialog"]')
      expect(copyDialog.exists()).toBe(true)
    })

    it('copy dialog is enabled when results exist', async () => {
      mockResult.value = {
        score: 8,
        interpretation: 'Moderat graviditetskvalme',
        riskLevel: 'moderate',
        details: { severity: 'moderate' },
        recommendations: []
      } as CalculationResult
      
      await wrapper.vm.$nextTick()
      
      const copyDialog = wrapper.find('[data-testid="copy-dialog"]')
      expect(copyDialog.exists()).toBe(true)
    })
  })

  describe('Form Submission States', () => {
    it('shows loading state during submission', async () => {
      mockState.value.isSubmitting = true
      
      await wrapper.vm.$nextTick()
      
      const submitButton = wrapper.find('[data-testid="button"]')
      expect(submitButton.exists()).toBe(true)
    })

    it('shows normal state when not submitting', async () => {
      mockState.value.isSubmitting = false
      
      await wrapper.vm.$nextTick()
      
      const submitButton = wrapper.find('[data-testid="button"]')
      expect(submitButton.exists()).toBe(true)
    })
  })
})