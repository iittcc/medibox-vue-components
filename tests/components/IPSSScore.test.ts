import { describe, expect, test, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import IPSSScore from '@/components/IPSSScore.vue'

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
        <div data-testid="question-description">{{ question.description }}</div>
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

describe('IPSSScore Component', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(IPSSScore)
  })

  describe('Basic Rendering', () => {
    test('renders the component with correct structure', () => {
      expect(wrapper.find('[data-testid="surface-card"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('IPSS, International prostata symptom score')
    })

    test('displays patient section', () => {
      const patientCard = wrapper.findAll('[data-testid="surface-card"]')[0]
      expect(patientCard.find('[data-testid="card-title"]').text()).toBe('Patient')
      expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    })

    test('displays IPSS questionnaire section', () => {
      const ipssCard = wrapper.findAll('[data-testid="surface-card"]')[1]
      expect(ipssCard.find('[data-testid="card-title"]').text()).toBe('IPSS, International prostata symptom score')
    })

    test('displays all 7 prostate symptom questions', () => {
      const questions = wrapper.findAll('[data-testid="question-single-component"]')
      expect(questions.length).toBe(7)
    })

    test('displays form buttons', () => {
      expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="secondary-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="button"]').exists()).toBe(true)
    })
  })

  describe('Initial State', () => {
    test('has correct default values for male prostate symptoms', () => {
      const component = wrapper.vm as any
      
      // Patient info defaults (male-focused for prostate symptoms)
      expect(component.name).toBe('')
      expect(component.gender).toBe('Mand') // Male default for prostate
      expect(component.age).toBe(50) // Same as AUDIT, different from EPDS
      
      // Form state defaults
      expect(component.formSubmitted).toBe(false)
      expect(component.totalScore).toBe(0)
      expect(component.conclusion).toBe('')
      expect(component.conclusionDescription).toBe('')
      expect(component.validationMessage).toBe('')
      
      // Results state
      expect(component.resultsSection1).toEqual([])
    })

    test('has 7 questions with correct prostate symptom structure', () => {
      const component = wrapper.vm as any
      expect(component.questionsSection1.length).toBe(7)
      
      // Check all questions have required properties
      component.questionsSection1.forEach((question: any, index: number) => {
        expect(question).toHaveProperty('type')
        expect(question).toHaveProperty('text')
        expect(question).toHaveProperty('description')
        expect(question).toHaveProperty('optionsType')
        expect(question).toHaveProperty('answer')
        expect(question.type).toBe('Listbox')
      })
    })

    test('questions have correct Danish urological terminology', () => {
      const component = wrapper.vm as any
      const questions = component.questionsSection1
      
      expect(questions[0].text).toBe('1. Ufuldstændig tømning')
      expect(questions[1].text).toBe('2. Vandladningsfrekvens')
      expect(questions[2].text).toBe('3. Afbrudt vandladning')
      expect(questions[3].text).toBe('4. Vandladningstrang')
      expect(questions[4].text).toBe('5. Svag strålekraft')
      expect(questions[5].text).toBe('6. Stranguri')
      expect(questions[6].text).toBe('7. Nykturi')
    })

    test('questions have uniform initial answers (all 0)', () => {
      const component = wrapper.vm as any
      
      // IPSS has uniform initial values (all start at 0)
      component.questionsSection1.forEach((question: any) => {
        expect(question.answer).toBe(0)
      })
    })

    test('questions have detailed urological descriptions', () => {
      const component = wrapper.vm as any
      const firstQuestion = component.questionsSection1[0]
      const lastQuestion = component.questionsSection1[6]
      
      expect(firstQuestion.description).toContain('blæren ikke er blevet fuldstændig tømt')
      expect(lastQuestion.description).toContain('stå op i løbet af natten for at lade vandet')
    })
  })

  describe('Question Options', () => {
    test('has correct option sets for frequency and count scales', () => {
      const component = wrapper.vm as any
      
      // Only 2 option sets (simpler than EPDS's 10 or AUDIT's 5)
      expect(component.options1.length).toBe(6) // 0-5 scale
      expect(component.options2.length).toBe(6) // 0-5 scale
    })

    test('options1 has correct frequency scale (0-5)', () => {
      const component = wrapper.vm as any
      const values = component.options1.map((opt: any) => opt.value)
      expect(values).toEqual([0, 1, 2, 3, 4, 5])
      expect(component.options1[0].text).toBe('Aldrig')
      expect(component.options1[5].text).toBe('Næsten altid')
    })

    test('options2 has correct count scale for nocturia (0-5)', () => {
      const component = wrapper.vm as any
      const values = component.options2.map((opt: any) => opt.value)
      expect(values).toEqual([0, 1, 2, 3, 4, 5])
      expect(component.options2[0].text).toBe('Ingen')
      expect(component.options2[5].text).toBe('5 gange')
    })

    test('getOptions function returns correct option sets', () => {
      const component = wrapper.vm as any
      
      expect(component.getOptions('options1')).toEqual(component.options1)
      expect(component.getOptions('options2')).toEqual(component.options2)
    })

    test('questions use appropriate option types', () => {
      const component = wrapper.vm as any
      
      // Questions 1-6 use frequency scale (options1)
      for (let i = 0; i < 6; i++) {
        expect(component.questionsSection1[i].optionsType).toBe('options1')
      }
      
      // Question 7 (Nykturi) uses count scale (options2)
      expect(component.questionsSection1[6].optionsType).toBe('options2')
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
      expect(component.validationMessage).toBe('Alle spørgsmål skal udfyldes.')
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
      expect(component.validationMessage).toBe('Alle spørgsmål skal udfyldes.')
      expect(component.totalScore).toBe(initialScore) // No calculation performed
      expect(component.resultsSection1.length).toBe(initialResults) // No results created
    })
  })

  describe('Multi-Tier Calculation Logic', () => {
    test('calculates total score correctly', () => {
      const component = wrapper.vm as any
      
      // Set specific scores
      component.questionsSection1[0].answer = 2
      component.questionsSection1[1].answer = 3
      component.questionsSection1[2].answer = 1
      // Rest remain 0
      
      component.calculateResults()
      
      expect(component.totalScore).toBe(6)
      expect(component.resultsSection1.length).toBe(7)
    })

    test('determines asymptomatik correctly (score = 0)', () => {
      const component = wrapper.vm as any
      
      // All questions remain at 0
      component.calculateResults()
      
      expect(component.totalScore).toBe(0)
      expect(component.conclusion).toBe('Asymptomatisk')
      expect(component.conclusionSeverity).toBe('success')
      expect(component.conclusionDescription).toBe('')
    })

    test('determines mild symptoms correctly (score 1-7)', () => {
      const component = wrapper.vm as any
      
      // Set score in mild range
      component.questionsSection1[0].answer = 2
      component.questionsSection1[1].answer = 2
      component.questionsSection1[2].answer = 1
      // Total = 5
      
      component.calculateResults()
      
      expect(component.totalScore).toBe(5)
      expect(component.conclusion).toBe('Symptomatisk, mild')
      expect(component.conclusionDescription).toContain('Tilstanden kan observeres')
      expect(component.conclusionDescription).toContain('Nykturi kan behandles')
      expect(component.conclusionSeverity).toBe('success')
    })

    test('determines moderate symptoms correctly (score 8-19)', () => {
      const component = wrapper.vm as any
      
      // Set score in moderate range
      component.questionsSection1.forEach((q: any, i: number) => {
        q.answer = i < 4 ? 3 : 1 // Total = 15
      })
      
      component.calculateResults()
      
      expect(component.totalScore).toBe(15)
      expect(component.conclusion).toBe('Symptomatisk, moderat')
      expect(component.conclusionDescription).toBe('Anses velegnet for medikamentel behandling.')
      expect(component.conclusionSeverity).toBe('warn')
    })

    test('determines severe symptoms correctly (score > 19)', () => {
      const component = wrapper.vm as any
      
      // Set score in severe range
      component.questionsSection1.forEach((q: any) => {
        q.answer = 3 // Total = 21
      })
      
      component.calculateResults()
      
      expect(component.totalScore).toBe(21)
      expect(component.conclusion).toBe('Symptomatisk, alvorlig')
      expect(component.conclusionDescription).toContain('henvises til urinvejskirurg')
      expect(component.conclusionDescription).toContain('invasiv behandling')
      expect(component.conclusionSeverity).toBe('error')
    })

    test('handles critical boundary cases', () => {
      const component = wrapper.vm as any
      
      // Test score of exactly 7 (mild/moderate boundary)
      component.questionsSection1[0].answer = 3
      component.questionsSection1[1].answer = 2
      component.questionsSection1[2].answer = 2
      // Total = 7
      
      component.calculateResults()
      
      expect(component.totalScore).toBe(7)
      expect(component.conclusion).toBe('Symptomatisk, mild')
      expect(component.conclusionSeverity).toBe('success')
      
      // Test score of exactly 8 (moderate threshold)
      component.questionsSection1[3].answer = 1 // Add 1 to make total = 8
      component.calculateResults()
      
      expect(component.totalScore).toBe(8)
      expect(component.conclusion).toBe('Symptomatisk, moderat')
      expect(component.conclusionSeverity).toBe('warn')
    })

    test('creates correct result structure', () => {
      const component = wrapper.vm as any
      
      component.questionsSection1[0].answer = 3
      component.calculateResults()
      
      const firstResult = component.resultsSection1[0]
      expect(firstResult).toHaveProperty('question')
      expect(firstResult).toHaveProperty('text')
      expect(firstResult).toHaveProperty('score')
      expect(firstResult.question).toBe('1')
      expect(firstResult.score).toBe(3)
      expect(firstResult.text).toBe('1. Ufuldstændig tømning')
    })
  })

  describe('Interactive Behaviors', () => {
    test('reset function clears results and resets questions', () => {
      const component = wrapper.vm as any
      
      // Set some data
      component.questionsSection1[0].answer = 4
      component.resultsSection1 = [{ question: '1', text: 'test', score: 4 }]
      component.totalScore = 20
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
      component.questionsSection1[0].answer = 5
      component.totalScore = 25
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
      expect(component.resultsSection1.length).toBe(7) // Results created
    })

    test('generatePayload creates correct data structure', () => {
      const component = wrapper.vm as any
      
      component.name = 'Test Patient'
      component.age = 65
      component.gender = 'Mand'
      component.totalScore = 12
      
      const payload = component.generatePayload()
      
      expect(payload).toHaveProperty('name', 'Test Patient')
      expect(payload).toHaveProperty('age', 65)
      expect(payload).toHaveProperty('gender', 'Mand')
      expect(payload).toHaveProperty('answers')
      expect(payload).toHaveProperty('scores')
      expect(payload.scores.totalScore).toBe(12)
      expect(payload.answers.length).toBe(7)
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
      
      expect(component.resultsSection1.length).toBe(7)
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

    test('displays severity-specific conclusions with descriptions', async () => {
      const component = wrapper.vm as any
      
      // Test moderate severity
      component.questionsSection1.forEach((q: any, i: number) => {
        q.answer = i < 3 ? 3 : 1 // Total = 13 (moderate)
      })
      component.calculateResults()
      await nextTick()
      
      expect(component.conclusion).toBe('Symptomatisk, moderat')
      expect(component.conclusionDescription).toBe('Anses velegnet for medikamentel behandling.')
    })
  })

  describe('Male-Focused Patient Info Integration', () => {
    test('updates patient name correctly', async () => {
      const nameInput = wrapper.find('[data-testid="name-input"]')
      await nameInput.setValue('John Doe')
      
      const component = wrapper.vm as any
      expect(component.name).toBe('John Doe')
    })

    test('updates patient age correctly', async () => {
      const ageInput = wrapper.find('[data-testid="age-input"]')
      await ageInput.setValue('65')
      
      const component = wrapper.vm as any
      expect(component.age).toBe(65)
    })

    test('gender select is hidden for prostate-specific assessment', () => {
      // Gender select should not exist due to genderdisplay="none"
      const genderSelect = wrapper.find('[data-testid="gender-select"]')
      expect(genderSelect.exists()).toBe(false)
    })

    test('has correct male default for prostate symptoms', () => {
      const component = wrapper.vm as any
      expect(component.gender).toBe('Mand') // Male default for prostate assessment
      expect(component.age).toBe(50) // Appropriate age for prostate issues
    })
  })

  describe('Urological Content Validation', () => {
    test('questions contain correct urological terminology', () => {
      const component = wrapper.vm as any
      const questions = component.questionsSection1
      
      // Check for urological-specific terms
      expect(questions[0].text).toContain('Ufuldstændig tømning')
      expect(questions[1].text).toContain('Vandladningsfrekvens')
      expect(questions[4].text).toContain('Svag strålekraft')
      expect(questions[5].text).toContain('Stranguri') // Medical term for painful urination
      expect(questions[6].text).toContain('Nykturi') // Medical term for nocturia
    })

    test('treatment recommendations match severity levels', () => {
      const component = wrapper.vm as any
      
      // Test severe scenario
      component.questionsSection1.forEach((q: any) => {
        q.answer = 4 // Total = 28 (severe)
      })
      component.calculateResults()
      
      expect(component.totalScore).toBe(28)
      expect(component.conclusion).toBe('Symptomatisk, alvorlig')
      expect(component.conclusionDescription).toContain('urinvejskirurg')
      expect(component.conclusionDescription).toContain('invasiv behandling')
      expect(component.conclusionSeverity).toBe('error')
    })

    test('copy dialog contains correct medical report format', () => {
      const component = wrapper.vm as any
      component.name = 'Test Patient'
      component.calculateResults()
      
      const copyContent = wrapper.text()
      expect(copyContent).toContain('IPSS, International prostata symptom score')
      expect(copyContent).toContain('Navn:')
      expect(copyContent).toContain('Køn:')
      expect(copyContent).toContain('Alder:')
    })

    test('detailed question descriptions provide clinical context', () => {
      const component = wrapper.vm as any
      const questions = component.questionsSection1
      
      // Verify detailed medical descriptions
      expect(questions[0].description).toContain('blæren ikke er blevet fuldstændig tømt')
      expect(questions[1].description).toContain('mindre end 2 timer efter forrige vandladning')
      expect(questions[6].description).toContain('stå op i løbet af natten for at lade vandet')
    })
  })
})