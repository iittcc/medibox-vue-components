import { describe, expect, test, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AuditScore from '@/components/AuditScore.vue';
import { ref } from 'vue';
import type { CalculationResult } from '@/types/calculatorTypes'; // adjust path as needed

// Mock the framework
const mockFramework = {
  patientData: ref({ name: 'Test Patient', age: 45, gender: 'Mand' }),
  calculatorData: ref({ question1: 1, question2: 2 }),
  result: ref<CalculationResult | null>(null),
  state: ref({ isSubmitting: false, isComplete: false }),
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
    expect(mockFramework.setFieldValue).toHaveBeenCalledWith('calculator', 'question1', 3);
  });

  test('should call framework.submitCalculation when the submit button is clicked', async () => {
    const submitButton = wrapper.findComponent(ButtonStub);
    await submitButton.trigger('click');
    expect(mockFramework.submitCalculation).toHaveBeenCalled();
  });

  test('should call framework.resetCalculator when the reset button is clicked', async () => {
    const resetButton = wrapper.findComponent(SecondaryButtonStub);
    await resetButton.trigger('click');
    expect(mockFramework.resetCalculator).toHaveBeenCalled();
  });

  test('should display results when the framework state is complete', async () => {
    expect(wrapper.find('[data-testid="results-section"]').exists()).toBe(false);

    mockFramework.state.value.isComplete = true;
    mockFramework.result.value = {
      score: 15,
      interpretation: 'Tegn på alkoholafhængighed',
      riskLevel: 'high',
      recommendations: [],
    };
    await wrapper.vm.$nextTick();

    const resultsSection = wrapper.find('[data-testid="results-section"]');
    expect(resultsSection.exists()).toBe(true);
    expect(wrapper.text()).toContain('AUDIT Score 15 : Tegn på alkoholafhængighed');
  });
});
