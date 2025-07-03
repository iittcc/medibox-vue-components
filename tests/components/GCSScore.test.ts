import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import GCSScore from '@/components/GCSScore.vue'
import type { Option, Question, Result } from '@/components/GCSScore.vue'

// Mock child components
vi.mock('@/volt/Button.vue', () => ({
  default: {
    name: 'Button',
    props: ['label', 'icon', 'type'],
    template: `<button type="submit" data-testid="button"><slot /></button>`
  }
}))

vi.mock('@/volt/SecondaryButton.vue', () => ({
  default: {
    name: 'SecondaryButton',
    props: ['label', 'icon', 'severity'],
    emits: ['click'],
    template: `<button @click="$emit('click')" data-testid="secondary-button"><slot /></button>`
  }
}))

vi.mock('@/volt/Message.vue', () => ({
  default: {
    name: 'Message',
    props: ['severity'],
    template: `<div :class="['message', severity]" data-testid="message"><slot /></div>`
  }
}))

vi.mock('@/components/QuestionSingleComponent.vue', () => ({
  default: {
    name: 'QuestionSingleComponent',
    props: ['name', 'question', 'options', 'index', 'isUnanswered', 'scrollHeight'],
    template: `<div data-testid="question-single-component">{{ question.text }}</div>`
  }
}))

vi.mock('@/components/CopyDialog.vue', () => ({
  default: {
    name: 'CopyDialog',
    props: ['title', 'icon', 'severity', 'disabled'],
    template: `<div data-testid="copy-dialog" :disabled="disabled"><slot name="container" /></div>`
  }
}))

vi.mock('@/components/SurfaceCard.vue', () => ({
  default: {
    name: 'SurfaceCard',
    props: ['title'],
    template: `<div data-testid="surface-card"><h3>{{ title }}</h3><slot name="content" /></div>`
  }
}))

vi.mock('@/components/PersonInfo.vue', () => ({
  default: {
    name: 'PersonInfo',
    props: ['name', 'age', 'minAge', 'maxAge', 'gender', 'genderdisplay'],
    emits: ['update:name', 'update:age', 'update:gender'],
    template: `<div data-testid="person-info">PersonInfo Component</div>`
  }
}))

describe('GCSScore.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(GCSScore)
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
      expect(personInfo.props('minAge')).toBe(5)
      expect(personInfo.props('maxAge')).toBe(110)
    })

    it('displays form controls', () => {
      expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="secondary-button"]').exists()).toBe(true)
      expect(wrapper.find('[data-testid="button"]').exists()).toBe(true)
    })
  })

  describe('Initial State', () => {
    it('has correct default values', () => {
      const component = wrapper.vm

      // Patient info defaults
      expect(component.name).toBe("")
      expect(component.gender).toBe("male")
      expect(component.age).toBe(50)

      // Form state
      expect(component.formSubmitted).toBe(false)
      expect(component.validationMessage).toBe('')
      expect(component.totalScore).toBe(0)
      expect(component.conclusion).toBe('')
      expect(component.conclusionDescription).toBe('')
      expect(component.conclusionSeverity).toBe('')
    })

    it('has correct GCS question structure with default values', () => {
      const component = wrapper.vm

      expect(component.questionsSection1.length).toBe(3)
      
      // Eye opening response (E)
      expect(component.questionsSection1[0].text).toBe("Øjenåbning")
      expect(component.questionsSection1[0].answer).toBe(4) // Default: "Spontant"
      expect(component.questionsSection1[0].optionsType).toBe('options1')

      // Verbal response (V)
      expect(component.questionsSection1[1].text).toBe("Verbalt responds")
      expect(component.questionsSection1[1].answer).toBe(5) // Default: "Orienteret"
      expect(component.questionsSection1[1].optionsType).toBe('options3')

      // Motor response (M)
      expect(component.questionsSection1[2].text).toBe("Bedste motoriske responds")
      expect(component.questionsSection1[2].answer).toBe(6) // Default: "Følger opfordringer"
      expect(component.questionsSection1[2].optionsType).toBe('options2')
    })

    it('has correct GCS scoring options', () => {
      const component = wrapper.vm

      // Eye opening (E) - max 4 points
      expect(component.options1).toEqual([
        { text: "Spontant", value: 4 },
        { text: "På tiltale", value: 3 },
        { text: "På smertestimulation", value: 2 },
        { text: "Ingen", value: 1 }
      ])

      // Motor response (M) - max 6 points
      expect(component.options2).toEqual([
        { text: "Følger opfordringer", value: 6 },
        { text: "Målrettet reaktion", value: 5 },
        { text: "Afværger", value: 4 },
        { text: "Normal fleksion", value: 3 },
        { text: "Abnorm fleksion", value: 2 },
        { text: "Ekstension", value: 1 }
      ])

      // Verbal response (V) - max 5 points
      expect(component.options3).toEqual([
        { text: "Orienteret", value: 5 },
        { text: "Forvirret", value: 4 },
        { text: "Usammenhængede ord", value: 3 },
        { text: "Uforståelige lyde", value: 2 },
        { text: "Ingen", value: 1 }
      ])
    })

    it('has maximum GCS score of 15 by default', () => {
      const component = wrapper.vm
      
      // Default values should give max score
      const eyeScore = component.questionsSection1[0].answer
      const verbalScore = component.questionsSection1[1].answer
      const motorScore = component.questionsSection1[2].answer
      
      expect(eyeScore).toBe(4)
      expect(verbalScore).toBe(5)
      expect(motorScore).toBe(6)
      expect(eyeScore + verbalScore + motorScore).toBe(15)
    })
  })

  describe('Form Validation', () => {
    it('validates that all questions must be answered', () => {
      const component = wrapper.vm

      // Set one question to null
      component.questionsSection1[0].answer = null

      expect(component.validateQuestions()).toBe(false)
      expect(component.validationMessage).toBe('Alle spørgsmål skal udfyldes.')
    })

    it('allows submission when all questions have values', () => {
      const component = wrapper.vm

      // All questions have default values
      expect(component.validateQuestions()).toBe(true)
      expect(component.validationMessage).toBe('')
    })
  })

  describe('Score Calculation', () => {
    it('calculates full consciousness (GCS 15) correctly', () => {
      const component = wrapper.vm

      // All max values (default)
      component.questionsSection1[0].answer = 4  // Eye: Spontaneous
      component.questionsSection1[1].answer = 5  // Verbal: Oriented
      component.questionsSection1[2].answer = 6  // Motor: Obeys commands
      
      component.calculateResults()

      expect(component.totalScore).toBe(15)
      expect(component.conclusion).toBe("Fuld bevidsthed")
      expect(component.conclusionSeverity).toBe("success")
    })

    it('calculates mild impairment (GCS 13-14) correctly', () => {
      const component = wrapper.vm

      // Slightly reduced consciousness
      component.questionsSection1[0].answer = 3  // Eye: To voice
      component.questionsSection1[1].answer = 5  // Verbal: Oriented
      component.questionsSection1[2].answer = 6  // Motor: Obeys commands
      
      component.calculateResults()

      expect(component.totalScore).toBe(14)
      expect(component.conclusion).toBe("Lettere bevidsthedssvækkelse")
      expect(component.conclusionSeverity).toBe("warn")
    })

    it('calculates moderate impairment (GCS 9-12) correctly', () => {
      const component = wrapper.vm

      // Moderate impairment
      component.questionsSection1[0].answer = 2  // Eye: To pain
      component.questionsSection1[1].answer = 3  // Verbal: Inappropriate words
      component.questionsSection1[2].answer = 5  // Motor: Localizes pain
      
      component.calculateResults()

      expect(component.totalScore).toBe(10)
      expect(component.conclusion).toBe("Middelsvær bevidsthedssvækkelse")
      expect(component.conclusionSeverity).toBe("error")
    })

    it('calculates severe impairment/coma (GCS ≤8) correctly', () => {
      const component = wrapper.vm

      // Severe impairment - typical coma score
      component.questionsSection1[0].answer = 1  // Eye: None
      component.questionsSection1[1].answer = 1  // Verbal: None
      component.questionsSection1[2].answer = 2  // Motor: Extension
      
      component.calculateResults()

      expect(component.totalScore).toBe(4)
      expect(component.conclusion).toBe("Svær bevidsthedssvækkelse (Coma) ")
      expect(component.conclusionSeverity).toBe("error")
    })

    it('calculates minimum possible GCS score (3) correctly', () => {
      const component = wrapper.vm

      // Minimum possible scores
      component.questionsSection1[0].answer = 1  // Eye: None
      component.questionsSection1[1].answer = 1  // Verbal: None
      component.questionsSection1[2].answer = 1  // Motor: None
      
      component.calculateResults()

      expect(component.totalScore).toBe(3)
      expect(component.conclusion).toBe("Svær bevidsthedssvækkelse (Coma) ")
      expect(component.conclusionSeverity).toBe("error")
    })

    it('correctly identifies GCS 8 as severe (coma threshold)', () => {
      const component = wrapper.vm

      // GCS 8 - critical threshold for intubation consideration
      component.questionsSection1[0].answer = 2  // Eye: To pain
      component.questionsSection1[1].answer = 2  // Verbal: Incomprehensible sounds
      component.questionsSection1[2].answer = 4  // Motor: Withdraws
      
      component.calculateResults()

      expect(component.totalScore).toBe(8)
      expect(component.conclusion).toBe("Svær bevidsthedssvækkelse (Coma) ")
      expect(component.conclusionSeverity).toBe("error")
    })

    it('creates correct results array with individual scores', () => {
      const component = wrapper.vm

      component.questionsSection1[0].answer = 3
      component.questionsSection1[1].answer = 4
      component.questionsSection1[2].answer = 5

      component.calculateResults()

      expect(component.resultsSection1.length).toBe(3)
      expect(component.resultsSection1[0]).toEqual({
        question: '1',
        text: 'Øjenåbning',
        score: 3
      })
      expect(component.resultsSection1[1]).toEqual({
        question: '2',
        text: 'Verbalt responds',
        score: 4
      })
      expect(component.resultsSection1[2]).toEqual({
        question: '3',
        text: 'Bedste motoriske responds',
        score: 5
      })
    })
  })

  describe('User Interactions', () => {
    it('resets questions to default values', () => {
      const component = wrapper.vm

      // Change answers from defaults
      component.questionsSection1[0].answer = 1
      component.questionsSection1[1].answer = 2
      component.questionsSection1[2].answer = 3
      component.totalScore = 6
      component.validationMessage = 'Test'
      component.formSubmitted = true

      // Reset
      component.resetQuestions()

      // Verify reset to defaults (max values)
      expect(component.questionsSection1[0].answer).toBe(4)
      expect(component.questionsSection1[1].answer).toBe(5)
      expect(component.questionsSection1[2].answer).toBe(6)
      expect(component.totalScore).toBe(0)
      expect(component.validationMessage).toBe('')
      expect(component.formSubmitted).toBe(false)
    })

    it('generates correct payload for server', () => {
      const component = wrapper.vm

      // Set up patient info
      component.name = 'Test Patient'
      component.age = 65
      component.gender = 'female'

      // Set specific GCS scores
      component.questionsSection1[0].answer = 3
      component.questionsSection1[1].answer = 4
      component.questionsSection1[2].answer = 5
      component.totalScore = 12

      const payload = component.generatePayload()

      expect(payload.name).toBe('Test Patient')
      expect(payload.age).toBe(65)
      expect(payload.gender).toBe('female')
      expect(payload.answers).toHaveLength(3)
      expect(payload.scores.totalScore).toBe(12)
    })
  })

  describe('Form Submission', () => {
    it('calculates and shows results on valid submission', async () => {
      const component = wrapper.vm

      // Submit with default values
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      expect(component.formSubmitted).toBe(true)
      expect(component.validationMessage).toBe('')
      expect(component.resultsSection1.length).toBe(3)
      expect(component.totalScore).toBe(15)
      expect(component.conclusion).toBe("Fuld bevidsthed")
    })

    it('shows validation error for invalid submission', async () => {
      const component = wrapper.vm

      // Set one answer to null
      component.questionsSection1[1].answer = null

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      expect(component.formSubmitted).toBe(true)
      expect(component.validationMessage).toBe('Alle spørgsmål skal udfyldes.')
      expect(component.resultsSection1.length).toBe(0)
    })
  })

  describe('Clinical Accuracy', () => {
    it('follows standard GCS scoring algorithm', () => {
      const component = wrapper.vm

      // Test a realistic clinical scenario
      // Patient with moderate head injury
      component.questionsSection1[0].answer = 3  // Eye: Opens to voice
      component.questionsSection1[1].answer = 4  // Verbal: Confused
      component.questionsSection1[2].answer = 5  // Motor: Localizes pain

      component.calculateResults()

      expect(component.totalScore).toBe(12)
      expect(component.conclusion).toBe("Middelsvær bevidsthedssvækkelse")
      expect(component.conclusionSeverity).toBe("error")
    })

    it('correctly assesses pediatric GCS considerations', () => {
      const component = wrapper.vm

      // Component restricts age to 5+ years (appropriate for standard GCS)
      const personInfo = wrapper.findComponent({ name: 'PersonInfo' })
      expect(personInfo.props('minAge')).toBe(5)
      
      // For children under 5, a pediatric GCS would be needed
    })
  })
})