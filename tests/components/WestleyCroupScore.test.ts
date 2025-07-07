import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import WestleyCroupScore from '@/components/WestleyCroupScore.vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import type { CalculationResult } from '@/types/calculatorTypes'

// Create refs to match actual composable structure
const mockState = ref({ isSubmitting: false, isComplete: false });
const mockResult = ref<CalculationResult | null>(null);

// Mock the framework
const mockFramework = {
  patientData: ref({ name: 'Test Patient', age: 6, gender: 'male' }),
  calculatorData: ref({ 
    levelOfConsciousness: 0, cyanosis: 0, stridor: 0, airEntry: 0, retractions: 0
  }),
  result: mockResult,
  state: mockState,
  canProceed: ref(true),
  setFieldValue: vi.fn(),
  submitCalculation: vi.fn(),
  resetCalculator: vi.fn(),
  initializeSteps: vi.fn(),
};

vi.mock('@/composables/useCalculatorFramework', () => ({
  useCalculatorFramework: () => mockFramework,
}));

vi.mock('@/utils/genderUtils', () => ({
  getGenderLabelByAge: vi.fn((gender, _age) => gender === 'male' ? 'Dreng' : 'Pige')
}))

// Define simple stubs for child components
const SurfaceCardStub = { name: 'SurfaceCard', template: '<div data-testid="surface-card"><h3>{{ title }}</h3><slot name="content"></slot></div>', props: ['title'] };
const PersonInfoStub = { name: 'PersonInfo', template: '<div data-testid="person-info" />', emits: ['update:name', 'update:age', 'update:gender'] };
const QuestionSingleComponentStub = { name: 'QuestionSingleComponent', template: '<div data-testid="question-single-component">{{ question.text }}</div>', props: ['question', 'answer', 'name', 'options', 'index', 'frameworkAnswer', 'isUnanswered'], emits: ['update:answer'] };
const ButtonStub = { name: 'Button', template: '<button type="submit" data-testid="button" @click="$emit(\'click\')">Beregn</button>', emits: ['click'], props: ['type'] };
const SecondaryButtonStub = { name: 'SecondaryButton', template: '<button data-testid="secondary-button" @click="$emit(\'click\')">Reset</button>', emits: ['click'] };
const MessageStub = { name: 'Message', template: '<div data-testid="message"><slot /></div>' };
const CopyDialogStub = { name: 'CopyDialog', template: '<div data-testid="copy-dialog"><slot name="container" /></div>', props: ['disabled'] };

describe('WestleyCroupScore Component', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    mockState.value.isSubmitting = false;
    mockState.value.isComplete = false;
    mockResult.value = null;
    
    wrapper = mount(WestleyCroupScore, {
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
    });
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
      expect(wrapper.text()).toContain('Westley Croup Score')
    })

    it('displays all 5 clinical assessment questions', () => {
      const questions = wrapper.findAll('[data-testid="question-single-component"]')
      expect(questions.length).toBe(5)
    })

    it('displays patient info for pediatric patients', () => {
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
      questionComponent.vm.$emit('update:answer', 1)
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

    it('displays results when the framework state is complete', async () => {
      // Set up completed state with result
      mockState.value.isComplete = true
      mockResult.value = {
        score: 3,
        interpretation: 'Moderat croup',
        riskLevel: 'moderate'
      } as CalculationResult
      
      await wrapper.vm.$nextTick()
      
      expect(wrapper.find('[data-testid="results-section"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Westley Croup Score 3')
      expect(wrapper.text()).toContain('Moderat croup')
    })
  })
})