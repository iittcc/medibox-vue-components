import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AuditScore from '@/components/AuditScore.vue';
import { ref } from 'vue';
import type { CalculationResult } from '@/types/calculatorTypes'; // adjust path as needed

// Create refs to match actual composable structure
const mockState = ref({ isSubmitting: false, isComplete: false });
const mockResult = ref<CalculationResult | null>(null);

// Mock the framework
const mockFramework = {
  patientData: ref({ name: 'Test Patient', age: 45, gender: 'male' }),
  calculatorData: ref({ question1: 1, question2: 2 }),
  result: mockResult,
  state: mockState, // This should be a ref, not reactive
  canProceed: ref(true),
  setFieldValue: vi.fn(),
  submitCalculation: vi.fn(),
  resetCalculator: vi.fn(),
  initializeSteps: vi.fn(),
};

vi.mock('@/composables/useCalculatorFramework', () => ({
  useCalculatorFramework: () => mockFramework,
}));

// Define simple stubs for child components
const SurfaceCardStub = { name: 'SurfaceCard', template: '<div><slot name="content"></slot></div>' };
const PersonInfoStub = { name: 'PersonInfo', template: '<div />', emits: ['update:name', 'update:age', 'update:gender'] };
const QuestionSingleComponentStub = { name: 'QuestionSingleComponent', template: '<div />', props: ['question', 'answer'], emits: ['update:answer'] };
const ButtonStub = { name: 'Button', template: '<button @click="$emit(\'click\')">Beregn</button>', emits: ['click'] };
const SecondaryButtonStub = { name: 'SecondaryButton', template: '<button @click="$emit(\'click\')">Reset</button>', emits: ['click'] };
const MessageStub = { name: 'Message', template: '<div><slot /></div>' };

describe('Refactored AuditScore Component', () => {
  let wrapper: any;

  beforeEach(() => {
    vi.clearAllMocks();
    wrapper = mount(AuditScore, {
      global: {
        stubs: {
          SurfaceCard: SurfaceCardStub,
          PersonInfo: PersonInfoStub,
          QuestionSingleComponent: QuestionSingleComponentStub,
          Button: ButtonStub,
          SecondaryButton: SecondaryButtonStub,
          Message: MessageStub,
          CopyDialog: true,
        },
      },
    });
  });

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount();
      wrapper = null;
    }
  });

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

  test('should call framework.submitCalculation when the submit button is clicked', async () => {
    // Set up all questions with answers to pass validation
    const form = wrapper.find('form');
    
    // Mock all questions as answered by directly setting the reactive data
    // This simulates what happens when users answer all questions
    wrapper.vm.questionsSection1.forEach((question: any, index: number) => {
      question.answer = index; // Set a valid answer for each question
    });
    
    await form.trigger('submit');
    expect(mockFramework.submitCalculation).toHaveBeenCalled();
  });

  test('should call framework.resetCalculator when the reset button is clicked', async () => {
    const resetButton = wrapper.findComponent(SecondaryButtonStub);
    await resetButton.trigger('click');
    expect(mockFramework.resetCalculator).toHaveBeenCalled();
  });

  test('should display results when the framework state is complete', async () => {
    expect(wrapper.find('[data-testid="results-section"]').exists()).toBe(false);

    // Update the ref state objects (.value needed for ref)
    mockState.value.isComplete = true;
    mockState.value.isSubmitting = false;
    mockResult.value = {
      score: 15,
      interpretation: 'Tegn på alkoholafhængighed',
      riskLevel: 'high',
      recommendations: [],
    };
    
    // Trigger reactivity
    await wrapper.vm.$nextTick();

    const resultsSection = wrapper.find('[data-testid="results-section"]');
    expect(resultsSection.exists()).toBe(true);
    expect(wrapper.text()).toContain('AUDIT Score 15 : Tegn på alkoholafhængighed');
  });
});
