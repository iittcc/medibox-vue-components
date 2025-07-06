import { describe, expect, test, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import EPDSScore from '@/components/EPDSScore.vue'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import type { CalculationResult } from '@/types/calculatorTypes'

// Create refs to match actual composable structure
const mockState = ref({ isSubmitting: false, isComplete: false });
const mockResult = ref<CalculationResult | null>(null);

// Mock the framework
const mockFramework = {
  patientData: ref({ name: 'Test Patient', age: 35, gender: 'female' }),
  calculatorData: ref({ 
    question1: 0, question2: 0, question3: 0, question4: 0, question5: 0,
    question6: 0, question7: 0, question8: 0, question9: 0, question10: 0
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
  getGenderLabel: vi.fn((gender) => gender === 'male' ? 'Mand' : 'Kvinde')
}))

// Define simple stubs for child components
const SurfaceCardStub = { name: 'SurfaceCard', template: '<div><h3>{{ title }}</h3><slot name="content"></slot></div>', props: ['title'] };
const PersonInfoStub = { name: 'PersonInfo', template: '<div />', emits: ['update:name', 'update:age', 'update:gender'] };
const QuestionSingleComponentStub = { name: 'QuestionSingleComponent', template: '<div />', props: ['question', 'answer', 'scrollHeight', 'name', 'options', 'index', 'frameworkAnswer', 'isUnanswered'], emits: ['update:answer'] };
const ButtonStub = { name: 'Button', template: '<button @click="$emit(\'click\')">Beregn</button>', emits: ['click'] };
const SecondaryButtonStub = { name: 'SecondaryButton', template: '<button @click="$emit(\'click\')">Reset</button>', emits: ['click'] };
const MessageStub = { name: 'Message', template: '<div><slot /></div>' };

describe('EPDSScore Component', () => {
  let wrapper: any

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    mockState.value.isSubmitting = false;
    mockState.value.isComplete = false;
    mockResult.value = null;
    
    wrapper = mount(EPDSScore, {
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
          CopyDialog: true,
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

  describe('Framework Integration', () => {
    test('should initialize the calculator framework on mount', () => {
      expect(mockFramework.initializeSteps).toHaveBeenCalled();
    });

    test('should call framework.setFieldValue when patient info changes', async () => {
      const personInfo = wrapper.findComponent(PersonInfoStub);
      personInfo.vm.$emit('update:name', 'New Name');
      expect(mockFramework.setFieldValue).toHaveBeenCalledWith('patient', 'name', 'New Name');
    });

    test('should call framework.setFieldValue when a question answer changes', async () => {
      const questionComponents = wrapper.findAllComponents(QuestionSingleComponentStub);
      const firstQuestion = questionComponents[0];
      
      firstQuestion.vm.$emit('update:answer', 3);
      
      // Check that the last call was for the question
      const calls = mockFramework.setFieldValue.mock.calls;
      const lastCall = calls[calls.length - 1];
      expect(lastCall).toEqual(['calculator', 'question1', 3]);
    });

    test('should call framework.submitCalculation when form is submitted', async () => {
      const form = wrapper.find('form');
      await form.trigger('submit');
      expect(mockFramework.submitCalculation).toHaveBeenCalled();
    });

    test('should call framework.resetCalculator when reset button is clicked', async () => {
      const resetButton = wrapper.findComponent(SecondaryButtonStub);
      await resetButton.trigger('click');
      expect(mockFramework.resetCalculator).toHaveBeenCalled();
    });
  })

  describe('Results Display', () => {
    test('should display results when framework state is complete', async () => {
      expect(wrapper.find('[data-testid="results-section"]').exists()).toBe(false);

      // Update the ref state objects (.value needed for ref)
      mockState.value.isComplete = true;
      mockState.value.isSubmitting = false;
      mockResult.value = {
        score: 15,
        interpretation: 'Behandlingskrævende depression kan foreligge',
        riskLevel: 'moderate',
        recommendations: [],
      };
      
      // Trigger reactivity
      await wrapper.vm.$nextTick();

      const resultsSection = wrapper.find('[data-testid="results-section"]');
      expect(resultsSection.exists()).toBe(true);
      expect(wrapper.text()).toContain('Edinburgh postnatale depressionsscore 15');
    });

    test('should not display results initially', () => {
      expect(wrapper.find('[data-testid="results-section"]').exists()).toBe(false);
    });
  })

  describe('Basic Rendering', () => {
    test('renders the component with patient and questionnaire sections', () => {
      const surfaceCards = wrapper.findAllComponents(SurfaceCardStub);
      expect(surfaceCards.length).toBeGreaterThanOrEqual(2);
    })

    test('displays patient info component', () => {
      const personInfo = wrapper.findComponent(PersonInfoStub);
      expect(personInfo.exists()).toBe(true);
    })

    test('displays all 10 EPDS questions', () => {
      const questionComponents = wrapper.findAllComponents(QuestionSingleComponentStub);
      expect(questionComponents.length).toBe(10);
    })

    test('displays form control buttons', () => {
      expect(wrapper.findComponent(ButtonStub).exists()).toBe(true);
      expect(wrapper.findComponent(SecondaryButtonStub).exists()).toBe(true);
    })
  })

  describe('Component State', () => {
    test('uses framework data for patient information', () => {
      expect(mockFramework.patientData.value.age).toBe(35);
      expect(mockFramework.patientData.value.gender).toBe('female');
    });

    test('has framework calculator data for all questions', () => {
      const calculatorData = mockFramework.calculatorData.value;
      expect(typeof calculatorData.question1).toBe('number');
      expect(typeof calculatorData.question10).toBe('number');
    });
  })

  describe('EPDS Specific Features', () => {
    test('contains postnatal depression specific content', () => {
      expect(wrapper.text()).toContain('Edinburgh postnatale depressionsscore');
    });

    test('handles framework loading states', () => {
      mockState.value.isSubmitting = true;
      // Component should handle loading state gracefully
      expect(wrapper.findComponent(ButtonStub).exists()).toBe(true);
    });
  })
})