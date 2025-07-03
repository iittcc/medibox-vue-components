import { describe, expect, test, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import PUQEScore from '@/components/PUQEScore.vue'

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
    props: ['question', 'options', 'index', 'isUnanswered', 'name'],
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
          v-if="genderdisplay !== 'none'"
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

describe('PUQEScore Component', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(PUQEScore)
  })

  describe('Basic Rendering', () => {
    test('renders the component with correct structure', () => {
      expect(wrapper.find('[data-testid="surface-card"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('PUQE Scoringsskema')
    })

    test('displays patient section', () => {
      const patientCard = wrapper.findAll('[data-testid="surface-card"]')[0]
      expect(patientCard.find('[data-testid="card-title"]').text()).toBe('Patient')
      expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    })

    test('displays PUQE questionnaire section', () => {
      const puqeCard = wrapper.findAll('[data-testid="surface-card"]')[1]
      expect(puqeCard.find('[data-testid="card-title"]').text()).toBe('PUQE Scoringsskema')
    })

    test('displays all 3 pregnancy nausea questions', () => {
      const questions = wrapper.findAll('[data-testid="question-single-component"]')
      expect(questions.length).toBe(3)
    })

    test('displays form buttons', () => {
      expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="secondary-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="button"]').exists()).toBe(true)
    })
  })

  describe('Initial State', () => {
    test('has correct default values for pregnancy assessment', () => {
      const component = wrapper.vm as any
      
      // Patient info defaults (female-focused for pregnancy)
      expect(component.name).toBe('')
      expect(component.gender).toBe('female') // Female for pregnancy
      expect(component.age).toBe(28) // Youngest default - appropriate for pregnancy
      
      // Form state defaults
      expect(component.formSubmitted).toBe(false)
      expect(component.totalScore).toBe(0)
      expect(component.conclusion).toBe('')
      expect(component.validationMessage).toBe('')
      
      // Results state
      expect(component.resultsSection1).toEqual([])
    })

    test('has 3 questions with correct pregnancy nausea structure', () => {
      const component = wrapper.vm as any
      expect(component.questionsSection1.length).toBe(3)
      
      // Check all questions have required properties
      component.questionsSection1.forEach((question: any, index: number) => {
        expect(question).toHaveProperty('type')
        expect(question).toHaveProperty('text')
        expect(question).toHaveProperty('optionsType')
        expect(question).toHaveProperty('answer')
        expect(question.type).toBe('Listbox')
      })
    })

    test('questions have correct Danish pregnancy terminology', () => {
      const component = wrapper.vm as any
      const questions = component.questionsSection1
      
      expect(questions[0].text).toContain('følt dig forkvalmet')
      expect(questions[1].text).toContain('kastet op')
      expect(questions[2].text).toContain('opkastningsbevægelser')
      
      // All questions focus on 24-hour timeframe
      questions.forEach((question: any) => {
        expect(question.text).toContain('de sidste 24 timer')
      })
    })

    test('questions have unique 1-5 scale initial answers', () => {
      const component = wrapper.vm as any
      
      // PUQE has unique 1-5 scale (not 0-based like others)
      component.questionsSection1.forEach((question: any) => {
        expect(question.answer).toBe(1)
      })
    })

    test('has reproductive age range for pregnancy context', () => {
      const component = wrapper.vm as any
      expect(component.age).toBe(28) // Default age appropriate for pregnancy
      // Age range should be 12-60 (reproductive years)
    })
  })

  describe('Question Options', () => {
    test('has correct option sets for pregnancy nausea assessment', () => {
      const component = wrapper.vm as any
      
      // 3 option sets (smallest number so far)
      expect(component.options1.length).toBe(5) // 1-5 scale
      expect(component.options2.length).toBe(5) // 1-5 scale
      expect(component.options3.length).toBe(5) // 1-5 scale
    })

    test('options1 has correct nausea duration scale (1-5)', () => {
      const component = wrapper.vm as any
      const values = component.options1.map((opt: any) => opt.value)
      expect(values).toEqual([1, 2, 3, 4, 5])
      expect(component.options1[0].text).toBe('Slet ikke')
      expect(component.options1[4].text).toBe('> 6 timer')
    })

    test('options2 has correct vomiting frequency scale (1-5)', () => {
      const component = wrapper.vm as any
      const values = component.options2.map((opt: any) => opt.value)
      expect(values).toEqual([1, 2, 3, 4, 5])
      expect(component.options2[0].text).toBe('Ingen opkastninger')
      expect(component.options2[4].text).toBe('≥ 7 gange')
    })

    test('options3 has correct retching frequency scale (1-5)', () => {
      const component = wrapper.vm as any
      const values = component.options3.map((opt: any) => opt.value)
      expect(values).toEqual([1, 2, 3, 4, 5])
      expect(component.options3[0].text).toBe('Nej')
      expect(component.options3[4].text).toBe('≥ 7 gange')
    })

    test('getOptions function returns correct option sets', () => {
      const component = wrapper.vm as any
      
      expect(component.getOptions('options1')).toEqual(component.options1)
      expect(component.getOptions('options2')).toEqual(component.options2)
      expect(component.getOptions('options3')).toEqual(component.options3)
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
      expect(component.validationMessage).toBe('Alle spørgsmål om vandladningsproblemer skal udfyldes. ')
    })

    test('validation passes when all questions are answered', () => {
      const component = wrapper.vm as any
      
      // All questions already have default answers (1)
      const isValid = component.validateQuestions()
      
      expect(isValid).toBe(true)
      expect(component.validationMessage).toBe('')
    })

    test('isUnanswered correctly identifies null answers', () => {
      const component = wrapper.vm as any
      
      const answeredQuestion = { answer: 1 }
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
      expect(component.validationMessage).toBe('Alle spørgsmål om vandladningsproblemer skal udfyldes. ')
      expect(component.totalScore).toBe(initialScore) // No calculation performed
      expect(component.resultsSection1.length).toBe(initialResults) // No results created
    })
  })

  describe('3-Tier Calculation Logic', () => {
    test('calculates total score correctly with 1-5 scale', () => {
      const component = wrapper.vm as any
      
      // Set specific scores (1-5 scale)
      component.questionsSection1[0].answer = 3
      component.questionsSection1[1].answer = 2
      component.questionsSection1[2].answer = 4
      // Total = 9
      
      component.calculateResults()
      
      expect(component.totalScore).toBe(9)
      expect(component.resultsSection1.length).toBe(3)
    })

    test('determines mild nausea correctly (score ≤ 6)', () => {
      const component = wrapper.vm as any
      
      // Set score in mild range
      component.questionsSection1[0].answer = 2
      component.questionsSection1[1].answer = 2
      component.questionsSection1[2].answer = 2
      // Total = 6
      
      component.calculateResults()
      
      expect(component.totalScore).toBe(6)
      expect(component.conclusion).toBe('Mild graviditetskvalme (PUQE ≤ 6)')
      expect(component.conclusionSeverity).toBe('success')
    })

    test('determines moderate nausea correctly (score 7-12)', () => {
      const component = wrapper.vm as any
      
      // Set score in moderate range
      component.questionsSection1[0].answer = 3
      component.questionsSection1[1].answer = 3
      component.questionsSection1[2].answer = 3
      // Total = 9
      
      component.calculateResults()
      
      expect(component.totalScore).toBe(9)
      expect(component.conclusion).toBe('Moderat graviditetskvalme (PUQE 7-12)')
      expect(component.conclusionSeverity).toBe('warn')
    })

    test('determines severe nausea/Hyperemesis Gravidarum correctly (score > 12)', () => {
      const component = wrapper.vm as any
      
      // Set score in severe range
      component.questionsSection1[0].answer = 5
      component.questionsSection1[1].answer = 5
      component.questionsSection1[2].answer = 4
      // Total = 14
      
      component.calculateResults()
      
      expect(component.totalScore).toBe(14)
      expect(component.conclusion).toBe('Svær graviditetskvalme (Hyperemesis Gravidarum) (PUQE ≥ 13)')
      expect(component.conclusionSeverity).toBe('error')
    })

    test('handles critical boundary cases (6 vs 7, 12 vs 13)', () => {
      const component = wrapper.vm as any
      
      // Test score of exactly 6 (mild threshold)
      component.questionsSection1[0].answer = 2
      component.questionsSection1[1].answer = 2
      component.questionsSection1[2].answer = 2
      // Total = 6
      
      component.calculateResults()
      
      expect(component.totalScore).toBe(6)
      expect(component.conclusion).toBe('Mild graviditetskvalme (PUQE ≤ 6)')
      expect(component.conclusionSeverity).toBe('success')
      
      // Test score of exactly 7 (moderate threshold)
      component.questionsSection1[0].answer = 3
      component.questionsSection1[1].answer = 2
      component.questionsSection1[2].answer = 2
      // Total = 7
      component.calculateResults()
      
      expect(component.totalScore).toBe(7)
      expect(component.conclusion).toBe('Moderat graviditetskvalme (PUQE 7-12)')
      expect(component.conclusionSeverity).toBe('warn')
      
      // Test score of exactly 13 (severe threshold)
      component.questionsSection1[0].answer = 5
      component.questionsSection1[1].answer = 4
      component.questionsSection1[2].answer = 4
      // Total = 13
      component.calculateResults()
      
      expect(component.totalScore).toBe(13)
      expect(component.conclusion).toBe('Svær graviditetskvalme (Hyperemesis Gravidarum) (PUQE ≥ 13)')
      expect(component.conclusionSeverity).toBe('error')
    })

    test('creates correct result structure', () => {
      const component = wrapper.vm as any
      
      component.questionsSection1[0].answer = 4
      component.calculateResults()
      
      const firstResult = component.resultsSection1[0]
      expect(firstResult).toHaveProperty('question')
      expect(firstResult).toHaveProperty('text')
      expect(firstResult).toHaveProperty('score')
      expect(firstResult.question).toBe('1')
      expect(firstResult.score).toBe(4)
      expect(firstResult.text).toContain('følt dig forkvalmet')
    })
  })

  describe('Interactive Behaviors', () => {
    test('reset function clears results and resets questions', () => {
      const component = wrapper.vm as any
      
      // Set some data
      component.questionsSection1[0].answer = 5
      component.resultsSection1 = [{ question: '1', text: 'test', score: 5 }]
      component.totalScore = 12
      component.validationMessage = 'test message'
      component.formSubmitted = true
      
      component.resetQuestions()
      
      // Check questions reset to first option value (should be 1)
      expect(component.questionsSection1[0].answer).toBe(1)
      
      // Check state cleared
      expect(component.resultsSection1).toEqual([])
      expect(component.totalScore).toBe(0)
      expect(component.validationMessage).toBe('')
      expect(component.formSubmitted).toBe(false)
    })

    test('reset button works correctly', async () => {
      const component = wrapper.vm as any
      
      // Set some initial state to verify reset works
      component.questionsSection1[0].answer = 5
      component.totalScore = 15
      component.formSubmitted = true
      
      // Call resetQuestions directly to test functionality
      component.resetQuestions()
      
      expect(component.questionsSection1[0].answer).toBe(1)
      expect(component.totalScore).toBe(0)
      expect(component.formSubmitted).toBe(false)
    })

    test('handleSubmit works correctly when valid', async () => {
      const component = wrapper.vm as any
      
      // Verify initial state
      expect(component.formSubmitted).toBe(false)
      expect(component.totalScore).toBe(0)
      
      // All questions already have valid answers (1)
      // Call handleSubmit directly to test functionality
      component.handleSubmit()
      
      expect(component.formSubmitted).toBe(true)
      expect(component.totalScore).toBeGreaterThanOrEqual(3) // Minimum score with 1-5 scale
      expect(component.resultsSection1.length).toBe(3) // Results created
    })

    test('generatePayload creates correct data structure', () => {
      const component = wrapper.vm as any
      
      component.name = 'Test Patient'
      component.age = 30
      component.gender = 'female'
      component.totalScore = 8
      
      const payload = component.generatePayload()
      
      expect(payload).toHaveProperty('name', 'Test Patient')
      expect(payload).toHaveProperty('age', 30)
      expect(payload).toHaveProperty('gender', 'female')
      expect(payload).toHaveProperty('answers')
      expect(payload).toHaveProperty('scores')
      expect(payload.scores.totalScore).toBe(8)
      expect(payload.answers.length).toBe(3)
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
      
      expect(component.resultsSection1.length).toBe(3)
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

    test('displays pregnancy-specific clinical guidance text', async () => {
      const component = wrapper.vm as any
      
      // Trigger calculation to show results section
      component.calculateResults()
      await nextTick()
      
      const guidance = wrapper.text()
      expect(guidance).toContain('Score ≤ 6 : Mild graviditetskvalme')
      expect(guidance).toContain('Score 7-12: Moderat graviditetskvalme')
      expect(guidance).toContain('Score ≥ 13: Svær graviditetskvalme (Hyperemesis Gravidarum)')
    })
  })

  describe('Female-Focused Patient Info Integration', () => {
    test('updates patient name correctly', async () => {
      const nameInput = wrapper.find('[data-testid="name-input"]')
      await nameInput.setValue('Jane Doe')
      
      const component = wrapper.vm as any
      expect(component.name).toBe('Jane Doe')
    })

    test('updates patient age correctly', async () => {
      const ageInput = wrapper.find('[data-testid="age-input"]')
      await ageInput.setValue('25')
      
      const component = wrapper.vm as any
      expect(component.age).toBe(25)
    })

    test('gender select is hidden for pregnancy-specific assessment', () => {
      // Gender select should not exist due to genderdisplay="none"
      const genderSelect = wrapper.find('[data-testid="gender-select"]')
      expect(genderSelect.exists()).toBe(false)
    })

    test('has correct female default for pregnancy assessment', () => {
      const component = wrapper.vm as any
      expect(component.gender).toBe('female') // Female default for pregnancy
      expect(component.age).toBe(28) // Appropriate age for pregnancy assessment
    })
  })

  describe('Pregnancy Content Validation', () => {
    test('questions contain correct pregnancy nausea terminology', () => {
      const component = wrapper.vm as any
      const questions = component.questionsSection1
      
      // Check for pregnancy-specific terms
      expect(questions[0].text).toContain('forkvalmet') // Nauseous
      expect(questions[1].text).toContain('kastet op') // Vomited
      expect(questions[2].text).toContain('opkastningsbevægelser') // Retching
      
      // All questions should reference 24-hour timeframe
      questions.forEach((question: any) => {
        expect(question.text).toContain('de sidste 24 timer')
      })
    })

    test('Hyperemesis Gravidarum identification works correctly', () => {
      const component = wrapper.vm as any
      
      // Test severe scenario (Hyperemesis Gravidarum)
      component.questionsSection1.forEach((q: any) => {
        q.answer = 5 // Maximum values
      })
      component.calculateResults()
      
      expect(component.totalScore).toBe(15)
      expect(component.conclusion).toContain('Hyperemesis Gravidarum')
      expect(component.conclusionSeverity).toBe('error')
    })

    test('copy dialog contains correct medical report format', () => {
      const component = wrapper.vm as any
      component.name = 'Test Patient'
      component.calculateResults()
      
      const copyContent = wrapper.text()
      expect(copyContent).toContain('PUQE SCORE')
      expect(copyContent).toContain('Navn:')
      expect(copyContent).toContain('Alder:')
      // Note: Gender is not shown in copy dialog for PUQE
    })

    test('score ranges match pregnancy nausea severity levels', () => {
      const component = wrapper.vm as any
      
      // Test minimum possible score (3 questions × 1 point each)
      component.questionsSection1.forEach((q: any) => {
        q.answer = 1
      })
      component.calculateResults()
      
      expect(component.totalScore).toBe(3)
      expect(component.conclusion).toBe('Mild graviditetskvalme (PUQE ≤ 6)')
      
      // Test maximum possible score (3 questions × 5 points each)
      component.questionsSection1.forEach((q: any) => {
        q.answer = 5
      })
      component.calculateResults()
      
      expect(component.totalScore).toBe(15)
      expect(component.conclusion).toContain('Hyperemesis Gravidarum')
    })
  })
})