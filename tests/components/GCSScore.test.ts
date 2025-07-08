import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import GCSScore from '@/components/GCSScore.vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import type { CalculationResult } from '@/types/calculatorTypes'

// Create refs to match actual composable structure
const mockState = ref({ isSubmitting: false, isComplete: false })
const mockResult = ref<CalculationResult | null>(null)

// Mock the framework
const mockFramework = {
  patientData: ref({ name: 'Test Patient', age: 50, gender: 'male' }),
  calculatorData: ref({ 
    eyeOpening: 4, verbalResponse: 5, motorResponse: 6
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
const QuestionSingleComponentStub = { name: 'QuestionSingleComponent', template: '<div data-testid="question-single-component">{{ question.text }}</div>', props: ['question', 'answer', 'name', 'options', 'index', 'frameworkAnswer', 'isUnanswered'], emits: ['update:answer'] }
const ButtonStub = { name: 'Button', template: '<button type="submit" data-testid="button" @click="$emit(\'click\')">Beregn</button>', emits: ['click'], props: ['type'] }
const SecondaryButtonStub = { name: 'SecondaryButton', template: '<button data-testid="secondary-button" @click="$emit(\'click\')">Reset</button>', emits: ['click'] }
const MessageStub = { name: 'Message', template: '<div data-testid="message"><slot /></div>' }
const CopyDialogStub = { name: 'CopyDialog', template: '<div data-testid="copy-dialog"><slot name="container" /></div>', props: ['disabled'] }

describe('GCSScore.vue', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock state
    mockState.value.isSubmitting = false
    mockState.value.isComplete = false
    mockResult.value = null
    
    wrapper = mount(GCSScore, {
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
    it('renders the component with title', () => {
      expect(wrapper.find('[data-testid="surface-card"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Patient')
      expect(wrapper.text()).toContain('Glasgow Coma Scale')
    })

    it('displays all 3 GCS assessment categories', () => {
      const questions = wrapper.findAll('[data-testid="question-single-component"]')
      expect(questions.length).toBe(3)
    })

    it('displays patient info with appropriate age range', () => {
      const personInfo = wrapper.findComponent({ name: 'PersonInfo' })
      expect(personInfo.exists()).toBe(true)
    })

    it('displays form controls', () => {
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
        score: 12,
        interpretation: 'GCS 12/15: Moderat bevidsthedspåvirkning',
        riskLevel: 'moderate',
        details: {
          clinicalSignificance: 'Moderat bevidsthedspåvirkning - kraftigt nedsat bevidsthed'
        },
        recommendations: ['Tæt neurologisk observation påkrævet', 'Neurolog vurdering inden for 4 timer']
      } as CalculationResult
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('[data-testid="message"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('GCS 12/15: Moderat bevidsthedspåvirkning')
    })
  })

  describe('GCS Options Configuration', () => {
    it('has correct eye opening options', () => {
      const component = wrapper.vm
      expect(component.eyeOpeningOptions).toEqual([
        { text: 'Ingen reaktion', value: 1 },
        { text: 'Åbner øjnene ved smertestimuli', value: 2 },
        { text: 'Åbner øjnene ved verbal stimuli', value: 3 },
        { text: 'Åbner øjnene spontant', value: 4 }
      ])
    })

    it('has correct verbal response options', () => {
      const component = wrapper.vm
      expect(component.verbalResponseOptions).toEqual([
        { text: 'Ingen verbal reaktion', value: 1 },
        { text: 'Uforståelige lyde', value: 2 },
        { text: 'Usammenhængende ord', value: 3 },
        { text: 'Forvirrede sætninger', value: 4 },
        { text: 'Orienteret og sammenhængende', value: 5 }
      ])
    })

    it('has correct motor response options', () => {
      const component = wrapper.vm
      expect(component.motorResponseOptions).toEqual([
        { text: 'Ingen motorisk reaktion', value: 1 },
        { text: 'Unormal ekstensorbevægelse', value: 2 },
        { text: 'Unormal fleksorbevægelse', value: 3 },
        { text: 'Trækker væk fra smerte', value: 4 },
        { text: 'Lokaliserer smerte', value: 5 },
        { text: 'Adlyder kommandoer', value: 6 }
      ])
    })
  })
})