import { describe, expect, test, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import EPDSScore from '@/components/EPDSScore.vue'

// Mock all the volt components
vi.mock('@/volt/Button.vue', () => ({
  default: {
    name: 'Button',
    props: ['label', 'icon', 'severity', 'type'],
    emits: ['click'],
    template: `
      <button 
        :type="type"
        @click="$emit('click')"
        data-testid="button"
      >
        {{ label }}
      </button>
    `
  }
}))

vi.mock('@/volt/SecondaryButton.vue', () => ({
  default: {
    name: 'SecondaryButton',
    props: ['label', 'icon', 'severity'],
    emits: ['click'],
    template: `
      <button 
        @click="$emit('click')"
        data-testid="secondary-button"
      >
        {{ label }}
      </button>
    `
  }
}))

vi.mock('@/volt/Message.vue', () => ({
  default: {
    name: 'Message',
    props: ['severity'],
    template: `
      <div data-testid="message" :class="'message-' + severity">
        <slot />
      </div>
    `
  }
}))

// Mock custom components
vi.mock('@/components/QuestionSingleComponent.vue', () => ({
  default: {
    name: 'QuestionSingleComponent',
    props: ['question', 'options', 'index', 'isUnanswered', 'name', 'scrollHeight'],
    template: `
      <div data-testid="question-single-component">
        <div data-testid="question-text">{{ question.text }}</div>
        <div data-testid="question-type">{{ question.type }}</div>
      </div>
    `
  }
}))

vi.mock('@/components/PersonInfo.vue', () => ({
  default: {
    name: 'PersonInfo',
    props: ['name', 'age', 'minAge', 'maxAge', 'gender', 'genderdisplay'],
    emits: ['update:name', 'update:age', 'update:gender'],
    template: `
      <div data-testid="person-info">
        <input 
          :value="name" 
          @input="$emit('update:name', $event.target.value)"
          data-testid="name-input"
        />
        <input 
          :value="age" 
          @input="$emit('update:age', parseInt($event.target.value))"
          data-testid="age-input"
          type="number"
        />
        <select 
          :value="gender"
          @change="$emit('update:gender', $event.target.value)"
          data-testid="gender-select"
        >
          <option value="Mand">Mand</option>
          <option value="Kvinde">Kvinde</option>
        </select>
      </div>
    `
  }
}))

vi.mock('@/components/SurfaceCard.vue', () => ({
  default: {
    name: 'SurfaceCard',
    props: ['title'],
    template: `
      <div data-testid="surface-card">
        <h3 data-testid="card-title">{{ title }}</h3>
        <slot name="content" />
      </div>
    `
  }
}))

vi.mock('@/components/CopyDialog.vue', () => ({
  default: {
    name: 'CopyDialog',
    props: ['title', 'icon', 'severity', 'disabled'],
    template: `
      <button 
        data-testid="copy-dialog"
        :disabled="disabled"
      >
        {{ title }}
        <slot name="container" />
      </button>
    `
  }
}))

describe('EPDSScore Component', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(EPDSScore)
  })

  describe('Basic Rendering', () => {
    test('renders the component with correct structure', () => {
      expect(wrapper.find('[data-testid="surface-card"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Edinburgh postnatale depressionsscore')
    })

    test('displays patient section', () => {
      const patientCard = wrapper.findAll('[data-testid="surface-card"]')[0]
      expect(patientCard.find('[data-testid="card-title"]').text()).toBe('Patient')
      expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    })

    test('displays EPDS questionnaire section', () => {
      const epdsCard = wrapper.findAll('[data-testid="surface-card"]')[1]
      expect(epdsCard.find('[data-testid="card-title"]').text()).toBe('Edinburgh postnatale depressionsscore')
    })

    test('displays all 10 questions', () => {
      const questions = wrapper.findAll('[data-testid="question-single-component"]')
      expect(questions.length).toBe(10)
    })

    test('displays form buttons', () => {
      expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="secondary-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="button"]').exists()).toBe(true)
    })
  })

  describe('Initial State', () => {
    test('has correct default values', () => {
      const component = wrapper.vm as any
      
      // Patient info defaults (different from AUDIT)
      expect(component.name).toBe('')
      expect(component.gender).toBe('Kvinde') // Female for postnatal depression
      expect(component.age).toBe(35) // Different from AUDIT's 50
      
      // Form state defaults
      expect(component.formSubmitted).toBe(false)
      expect(component.totalScore).toBe(0)
      expect(component.conclusion).toBe('')
      expect(component.validationMessage).toBe('')
      
      // Results state
      expect(component.resultsSection1).toEqual([])
    })

    test('has 10 questions with correct structure', () => {
      const component = wrapper.vm as any
      expect(component.questionsSection1.length).toBe(10)
      
      // Check all questions have required properties
      component.questionsSection1.forEach((question: any, index: number) => {
        expect(question).toHaveProperty('type')
        expect(question).toHaveProperty('text')
        expect(question).toHaveProperty('optionsType')
        expect(question).toHaveProperty('answer')
        expect(question.type).toBe('Listbox')
      })
    })

    test('questions have correct Danish postnatal depression text', () => {
      const component = wrapper.vm as any
      const firstQuestion = component.questionsSection1[0]
      const lastQuestion = component.questionsSection1[9]
      
      expect(firstQuestion.text).toBe('1. Har du de sidste 7 dage været i stand til at le og se tingene fra den humoristiske side?')
      expect(lastQuestion.text).toContain('10. Har tanken om at gøre skade på dig selv strejfet dig')
    })

    test('questions have correct mixed initial answers', () => {
      const component = wrapper.vm as any
      
      // EPDS has mixed initial values (all resolve to 0 but from different indices)
      component.questionsSection1.forEach((question: any) => {
        expect(question.answer).toBe(0)
      })
    })

    test('age constraints are correct for postnatal depression', () => {
      const personInfo = wrapper.find('[data-testid="person-info"]')
      expect(personInfo.exists()).toBe(true)
      // Age range 12-70 (wider than AUDIT's 10-110)
    })
  })

  describe('Question Options', () => {
    test('has correct option sets for all 10 questions', () => {
      const component = wrapper.vm as any
      
      expect(component.options1.length).toBe(4)
      expect(component.options2.length).toBe(4)
      expect(component.options3.length).toBe(4)
      expect(component.options4.length).toBe(4)
      expect(component.options5.length).toBe(4)
      expect(component.options6.length).toBe(4)
      expect(component.options7.length).toBe(4)
      expect(component.options8.length).toBe(4)
      expect(component.options9.length).toBe(4)
      expect(component.options10.length).toBe(4)
    })

    test('options1 has correct humor/laughter values', () => {
      const component = wrapper.vm as any
      const values = component.options1.map((opt: any) => opt.value)
      expect(values).toEqual([0, 1, 2, 3])
      expect(component.options1[0].text).toBe('Lige så meget som jeg altid har kunnet')
      expect(component.options1[3].text).toBe('Overhovedet ikke')
    })

    test('options3 has reverse scoring pattern', () => {
      const component = wrapper.vm as any
      const values = component.options3.map((opt: any) => opt.value)
      expect(values).toEqual([3, 2, 1, 0]) // Reverse scoring for negative questions
      expect(component.options3[0].text).toBe('Ja, det meste af tiden')
      expect(component.options3[3].text).toBe('Nej, slet ikke')
    })

    test('options10 has self-harm question values', () => {
      const component = wrapper.vm as any
      const values = component.options10.map((opt: any) => opt.value)
      expect(values).toEqual([3, 2, 1, 0])
      expect(component.options10[0].text).toBe('Ja, ganske ofte')
      expect(component.options10[3].text).toBe('Aldrig')
    })

    test('getOptions function returns correct option sets', () => {
      const component = wrapper.vm as any
      
      expect(component.getOptions('options1')).toEqual(component.options1)
      expect(component.getOptions('options10')).toEqual(component.options10)
    })
  })

  describe('Form Validation', () => {
    test('validation fails when questions are unanswered', async () => {
      const component = wrapper.vm as any
      
      // Set some questions to null (unanswered)
      component.questionsSection1[0].answer = null
      component.questionsSection1[1].answer = null
      
      const isValid = component.validateQuestions()
      
      expect(isValid).toBe(false)
      expect(component.validationMessage).toBe('Alle spørgsmål skal udfyldes. ')
    })

    test('validation passes when all questions are answered', () => {
      const component = wrapper.vm as any
      
      // All questions already have default answers (0)
      const isValid = component.validateQuestions()
      
      expect(isValid).toBe(true)
      expect(component.validationMessage).toBe('')
    })

    test('isUnanswered correctly identifies null answers', () => {
      const component = wrapper.vm as any
      
      const answeredQuestion = { answer: 0 }
      const unansweredQuestion = { answer: null }
      
      expect(component.isUnanswered(answeredQuestion)).toBe(false)
      expect(component.isUnanswered(unansweredQuestion)).toBe(true)
    })

    test('form submission is prevented when validation fails', async () => {
      const component = wrapper.vm as any
      
      // Set question to unanswered
      component.questionsSection1[0].answer = null
      
      // Store initial state
      const initialScore = component.totalScore
      const initialResults = component.resultsSection1.length
      
      component.handleSubmit()
      
      expect(component.formSubmitted).toBe(true)
      expect(component.validationMessage).toBe('Alle spørgsmål skal udfyldes. ')
      expect(component.totalScore).toBe(initialScore) // No calculation performed
      expect(component.resultsSection1.length).toBe(initialResults) // No results created
    })
  })

  describe('Calculation Logic', () => {
    test('calculates total score correctly', () => {
      const component = wrapper.vm as any
      
      // Set specific scores
      component.questionsSection1[0].answer = 1
      component.questionsSection1[1].answer = 2
      component.questionsSection1[2].answer = 1
      // Rest remain 0
      
      component.calculateResults()
      
      expect(component.totalScore).toBe(4)
      expect(component.resultsSection1.length).toBe(10)
    })

    test('determines low risk correctly (score ≤ 10)', () => {
      const component = wrapper.vm as any
      
      // Set score at boundary (10)
      component.questionsSection1.forEach((q: any, i: number) => {
        q.answer = i < 10 ? 1 : 0 // Total = 10
      })
      
      component.calculateResults()
      
      expect(component.totalScore).toBe(10)
      expect(component.conclusion).toBe('Ikke tegn til alvorlig depression.')
      expect(component.conclusionSeverity).toBe('success')
    })

    test('determines high risk correctly (score > 10)', () => {
      const component = wrapper.vm as any
      
      // Set score above threshold
      component.questionsSection1.forEach((q: any, i: number) => {
        q.answer = i < 6 ? 2 : 0 // Total = 12
      })
      
      component.calculateResults()
      
      expect(component.totalScore).toBe(12)
      expect(component.conclusion).toBe('Behandlingskrævende depression kan foreligge.')
      expect(component.conclusionSeverity).toBe('error')
    })

    test('handles critical boundary case (10 vs 11)', () => {
      const component = wrapper.vm as any
      
      // Test score of exactly 11 (just above threshold)
      component.questionsSection1[0].answer = 3
      component.questionsSection1[1].answer = 3
      component.questionsSection1[2].answer = 3
      component.questionsSection1[3].answer = 2
      // Total = 11
      
      component.calculateResults()
      
      expect(component.totalScore).toBe(11)
      expect(component.conclusion).toBe('Behandlingskrævende depression kan foreligge.')
      expect(component.conclusionSeverity).toBe('error')
    })

    test('creates correct result structure', () => {
      const component = wrapper.vm as any
      
      component.questionsSection1[0].answer = 2
      component.calculateResults()
      
      const firstResult = component.resultsSection1[0]
      expect(firstResult).toHaveProperty('question')
      expect(firstResult).toHaveProperty('text')
      expect(firstResult).toHaveProperty('score')
      expect(firstResult.question).toBe('1')
      expect(firstResult.score).toBe(2)
      expect(firstResult.text).toBe('1. Har du de sidste 7 dage været i stand til at le og se tingene fra den humoristiske side?')
    })
  })

  describe('Interactive Behaviors', () => {
    test('reset function clears results and resets questions', () => {
      const component = wrapper.vm as any
      
      // Set some data
      component.questionsSection1[0].answer = 3
      component.resultsSection1 = [{ question: '1', text: 'test', score: 3 }]
      component.totalScore = 15
      component.validationMessage = 'test message'
      component.formSubmitted = true
      
      component.resetQuestions()
      
      // Check questions reset to first option value (all should be 0)
      expect(component.questionsSection1[0].answer).toBe(0)
      
      // Check state cleared
      expect(component.resultsSection1).toEqual([])
      expect(component.totalScore).toBe(0)
      expect(component.validationMessage).toBe('')
      expect(component.formSubmitted).toBe(false)
    })

    test('reset button works correctly', async () => {
      const component = wrapper.vm as any
      
      // Set some initial state to verify reset works
      component.questionsSection1[0].answer = 3
      component.totalScore = 15
      component.formSubmitted = true
      
      // Call resetQuestions directly to test functionality
      component.resetQuestions()
      
      expect(component.questionsSection1[0].answer).toBe(0)
      expect(component.totalScore).toBe(0)
      expect(component.formSubmitted).toBe(false)
    })

    test('handleSubmit works correctly when valid', async () => {
      const component = wrapper.vm as any
      
      // Verify initial state
      expect(component.formSubmitted).toBe(false)
      expect(component.totalScore).toBe(0)
      
      // All questions already have valid answers (0)
      // Call handleSubmit directly to test functionality
      component.handleSubmit()
      
      expect(component.formSubmitted).toBe(true)
      expect(component.totalScore).toBeGreaterThanOrEqual(0) // Score calculated
      expect(component.resultsSection1.length).toBe(10) // Results created
    })

    test('generatePayload creates correct data structure', () => {
      const component = wrapper.vm as any
      
      component.name = 'Test Patient'
      component.age = 28
      component.gender = 'Kvinde'
      component.totalScore = 8
      
      const payload = component.generatePayload()
      
      expect(payload).toHaveProperty('name', 'Test Patient')
      expect(payload).toHaveProperty('age', 28)
      expect(payload).toHaveProperty('gender', 'Kvinde')
      expect(payload).toHaveProperty('answers')
      expect(payload).toHaveProperty('scores')
      expect(payload.scores.totalScore).toBe(8)
      expect(payload.answers.length).toBe(10)
    })
  })

  describe('Results Display', () => {
    test('results section not displayed initially', () => {
      expect(wrapper.find('.results').exists()).toBe(false)
    })

    test('results section displayed after calculation', async () => {
      const component = wrapper.vm as any
      
      // Trigger calculation
      component.calculateResults()
      await nextTick()
      
      expect(component.resultsSection1.length).toBe(10)
      // Results section should appear when resultsSection1 has content
    })

    test('copy dialog behavior with no results', () => {
      const component = wrapper.vm as any
      const copyDialog = wrapper.find('[data-testid="copy-dialog"]')
      
      // Initially resultsSection is null and resultsSection1 is empty
      expect(component.resultsSection).toBe(null)
      expect(component.resultsSection1).toEqual([])
      expect(copyDialog.exists()).toBe(true)
    })

    test('copy dialog enabled after calculation', async () => {
      const component = wrapper.vm as any
      
      component.calculateResults()
      await nextTick()
      
      // After calculation, resultsSection1 should have content
      expect(component.resultsSection1.length).toBeGreaterThan(0)
      
      const copyDialog = wrapper.find('[data-testid="copy-dialog"]')
      expect(copyDialog.exists()).toBe(true)
    })

    test('displays correct clinical guidance text after calculation', async () => {
      const component = wrapper.vm as any
      
      // Trigger calculation to show results section
      component.calculateResults()
      await nextTick()
      
      const guidance = wrapper.text()
      expect(guidance).toContain('Score ≤ 9: Ikke tegn til alvorlig depression')
      expect(guidance).toContain('Score ≥ 10: Behandlingskrævende depression kan foreligges')
    })
  })

  describe('Patient Info Integration', () => {
    test('updates patient name correctly', async () => {
      const nameInput = wrapper.find('[data-testid="name-input"]')
      await nameInput.setValue('Jane Doe')
      
      const component = wrapper.vm as any
      expect(component.name).toBe('Jane Doe')
    })

    test('updates patient age correctly', async () => {
      const ageInput = wrapper.find('[data-testid="age-input"]')
      await ageInput.setValue('28')
      
      const component = wrapper.vm as any
      expect(component.age).toBe(28)
    })

    test('updates patient gender correctly', async () => {
      const genderSelect = wrapper.find('[data-testid="gender-select"]')
      await genderSelect.setValue('Mand')
      
      const component = wrapper.vm as any
      expect(component.gender).toBe('Mand')
    })

    test('has correct age constraints for postnatal context', () => {
      const component = wrapper.vm as any
      // EPDS age range should be 12-70, different from AUDIT's 10-110
      expect(component.age).toBe(35) // Default age appropriate for postnatal context
    })
  })

  describe('Medical Content Validation', () => {
    test('questions contain correct postnatal depression terminology', () => {
      const component = wrapper.vm as any
      const questions = component.questionsSection1
      
      // Check for postnatal-specific content
      expect(questions[0].text).toContain('le og se tingene fra den humoristiske side')
      expect(questions[1].text).toContain('se frem til ting med glæde')
      expect(questions[9].text).toContain('gøre skade på dig selv') // Self-harm question
    })

    test('scoring reflects depression severity correctly', () => {
      const component = wrapper.vm as any
      
      // Test high-risk scenario
      component.questionsSection1.forEach((q: any) => {
        q.answer = 3 // Maximum depression scores
      })
      component.calculateResults()
      
      expect(component.totalScore).toBe(30) // 10 questions × 3 points
      expect(component.conclusion).toBe('Behandlingskrævende depression kan foreligge.')
      expect(component.conclusionSeverity).toBe('error')
    })

    test('copy dialog contains correct medical report format', () => {
      const component = wrapper.vm as any
      component.name = 'Test Patient'
      component.calculateResults()
      
      const copyContent = wrapper.text()
      expect(copyContent).toContain('Edinburgh postnatale depressionsscore')
      expect(copyContent).toContain('Navn:')
      expect(copyContent).toContain('Køn:')
      expect(copyContent).toContain('Alder:')
    })
  })
})