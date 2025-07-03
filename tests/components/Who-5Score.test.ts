import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Who5Score from '@/components/Who-5Score.vue'
import type { Option, Question, Result } from '@/components/Who-5Score.vue'

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

describe('Who-5Score.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(Who5Score)
  })

  describe('Component Rendering', () => {
    it('renders the component with title', () => {
      expect(wrapper.find('[data-testid="surface-card"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Patient')
      expect(wrapper.text()).toContain('WHO-5 Trivselindex')
    })

    it('displays all 5 well-being questions', () => {
      const questions = wrapper.findAll('[data-testid="question-single-component"]')
      expect(questions.length).toBe(5)
    })

    it('displays patient info with appropriate age range', () => {
      const personInfo = wrapper.findComponent({ name: 'PersonInfo' })
      expect(personInfo.exists()).toBe(true)
      expect(personInfo.props('minAge')).toBe(16)
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
      expect(component.conclusionSeverity).toBe('')
    })

    it('has correct WHO-5 question structure with default values', () => {
      const component = wrapper.vm

      expect(component.questionsSection1.length).toBe(5)
      
      // All questions should have same options and highest default value
      component.questionsSection1.forEach((question, index) => {
        expect(question.optionsType).toBe('options1')
        expect(question.answer).toBe(5) // Default: "Hele tiden"
      })

      // Verify question texts
      expect(component.questionsSection1[0].text).toContain("været glad og i godt humør")
      expect(component.questionsSection1[1].text).toContain("følt mig rolig of afslappet")
      expect(component.questionsSection1[2].text).toContain("følt mig aktiv og energisk")
      expect(component.questionsSection1[3].text).toContain("er vågnet frisk og udhvilet")
      expect(component.questionsSection1[4].text).toContain("daglig været fyldt med ting der interesserer mig")
    })

    it('has correct WHO-5 scoring options', () => {
      const component = wrapper.vm

      expect(component.options1).toEqual([
        { text: "Hele tiden", value: 5 },
        { text: "Det mest af tiden", value: 4 },
        { text: "Lidt mere end halvdelen af tiden", value: 3 },
        { text: "Lidt mindre end halvdelen af tiden", value: 2 },
        { text: "Lidt af tiden", value: 1 },
        { text: "På intet tidspunkt", value: 0 }
      ])
    })

    it('has maximum raw score of 25 by default', () => {
      const component = wrapper.vm
      
      // All questions default to 5
      const totalRawScore = component.questionsSection1.reduce((sum, q) => sum + (q.answer || 0), 0)
      expect(totalRawScore).toBe(25) // 5 * 5
    })
  })

  describe('Form Validation', () => {
    it('validates that all questions must be answered', () => {
      const component = wrapper.vm

      // Set one question to null
      component.questionsSection1[2].answer = null

      expect(component.validateQuestions()).toBe(false)
      expect(component.validationMessage).toBe('Alle spørgsmål skal udfyldes. ')
    })

    it('allows submission when all questions have values', () => {
      const component = wrapper.vm

      // All questions have default values
      expect(component.validateQuestions()).toBe(true)
      expect(component.validationMessage).toBe('')
    })
  })

  describe('Score Calculation', () => {
    it('calculates maximum well-being score (100) correctly', () => {
      const component = wrapper.vm

      // All max values (default)
      component.questionsSection1.forEach(q => q.answer = 5)
      
      component.calculateResults()

      expect(component.totalScore).toBe(100) // (5*5) * 4
      expect(component.conclusion).toBe("Der er ikke umiddelbart risiko for depression eller stressbelastning.")
      expect(component.conclusionSeverity).toBe("success")
    })

    it('calculates moderate risk score (36-50) correctly', () => {
      const component = wrapper.vm

      // Set scores for moderate risk
      component.questionsSection1[0].answer = 3
      component.questionsSection1[1].answer = 2
      component.questionsSection1[2].answer = 2
      component.questionsSection1[3].answer = 2
      component.questionsSection1[4].answer = 2
      
      component.calculateResults()

      const rawScore = 3 + 2 + 2 + 2 + 2 // = 11
      expect(component.totalScore).toBe(44) // 11 * 4
      expect(component.conclusion).toBe("Der kan være risiko for depression eller stressbelastning.")
      expect(component.conclusionSeverity).toBe("warn")
    })

    it('calculates high risk score (≤35) correctly', () => {
      const component = wrapper.vm

      // Set scores for high risk
      component.questionsSection1[0].answer = 1
      component.questionsSection1[1].answer = 2
      component.questionsSection1[2].answer = 1
      component.questionsSection1[3].answer = 1
      component.questionsSection1[4].answer = 1
      
      component.calculateResults()

      const rawScore = 1 + 2 + 1 + 1 + 1 // = 6
      expect(component.totalScore).toBe(24) // 6 * 4
      expect(component.conclusion).toBe("Der kan være stor risiko for depression eller stressbelastning.")
      expect(component.conclusionSeverity).toBe("error")
    })

    it('calculates minimum possible score (0) correctly', () => {
      const component = wrapper.vm

      // All minimum values
      component.questionsSection1.forEach(q => q.answer = 0)
      
      component.calculateResults()

      expect(component.totalScore).toBe(0) // 0 * 4
      expect(component.conclusion).toBe("Der kan være stor risiko for depression eller stressbelastning.")
      expect(component.conclusionSeverity).toBe("error")
    })

    it('correctly multiplies raw score by 4 for percentage', () => {
      const component = wrapper.vm

      // Test various raw scores
      const testCases = [
        { raw: [5, 5, 5, 5, 5], expected: 100 }, // 25 * 4
        { raw: [4, 4, 4, 4, 4], expected: 80 },  // 20 * 4
        { raw: [3, 3, 3, 3, 3], expected: 60 },  // 15 * 4
        { raw: [2, 2, 2, 2, 2], expected: 40 },  // 10 * 4
        { raw: [1, 1, 1, 1, 1], expected: 20 },  // 5 * 4
        { raw: [0, 0, 0, 0, 0], expected: 0 }    // 0 * 4
      ]

      testCases.forEach(testCase => {
        component.questionsSection1.forEach((q, i) => q.answer = testCase.raw[i])
        component.calculateResults()
        expect(component.totalScore).toBe(testCase.expected)
      })
    })

    it('correctly identifies boundary scores', () => {
      const component = wrapper.vm

      // Test score = 35 (boundary between high and moderate risk)
      component.questionsSection1[0].answer = 2
      component.questionsSection1[1].answer = 2
      component.questionsSection1[2].answer = 2
      component.questionsSection1[3].answer = 1
      component.questionsSection1[4].answer = 1
      // Raw score = 8, Total = 32
      
      component.calculateResults()
      expect(component.totalScore).toBe(32)
      expect(component.conclusion).toBe("Der kan være stor risiko for depression eller stressbelastning.")

      // Test score = 36 (start of moderate risk)
      component.questionsSection1[3].answer = 2
      // Raw score = 9, Total = 36
      
      component.calculateResults()
      expect(component.totalScore).toBe(36)
      expect(component.conclusion).toBe("Der kan være risiko for depression eller stressbelastning.")

      // Test score = 51 (start of no risk)
      component.questionsSection1.forEach(q => q.answer = 2)
      component.questionsSection1[0].answer = 3
      component.questionsSection1[1].answer = 3
      component.questionsSection1[2].answer = 3
      // Raw score = 13, Total = 52
      
      component.calculateResults()
      expect(component.totalScore).toBe(52)
      expect(component.conclusion).toBe("Der er ikke umiddelbart risiko for depression eller stressbelastning.")
    })

    it('creates correct results array with individual scores', () => {
      const component = wrapper.vm

      component.questionsSection1[0].answer = 5
      component.questionsSection1[1].answer = 4
      component.questionsSection1[2].answer = 3
      component.questionsSection1[3].answer = 2
      component.questionsSection1[4].answer = 1

      component.calculateResults()

      expect(component.resultsSection1.length).toBe(5)
      expect(component.resultsSection1[0]).toEqual({
        question: '1',
        text: '1. I de sidste 2 uger har jeg været glad og i godt humør',
        score: 5
      })
      expect(component.resultsSection1[4]).toEqual({
        question: '5',
        text: '5. I de sidste 2 uger har min daglig været fyldt med ting der interesserer mig',
        score: 1
      })
    })
  })

  describe('User Interactions', () => {
    it('resets questions to default values', () => {
      const component = wrapper.vm

      // Change answers from defaults
      component.questionsSection1[0].answer = 0
      component.questionsSection1[1].answer = 1
      component.questionsSection1[2].answer = 2
      component.totalScore = 12
      component.validationMessage = 'Test'
      component.formSubmitted = true

      // Reset
      component.resetQuestions()

      // Verify reset to defaults (all 5)
      component.questionsSection1.forEach(q => {
        expect(q.answer).toBe(5)
      })
      expect(component.totalScore).toBe(0)
      expect(component.validationMessage).toBe('')
      expect(component.formSubmitted).toBe(false)
    })

    it('generates correct payload for server', () => {
      const component = wrapper.vm

      // Set up patient info
      component.name = 'Test Patient'
      component.age = 35
      component.gender = 'female'

      // Set specific scores
      component.questionsSection1[0].answer = 3
      component.questionsSection1[1].answer = 3
      component.questionsSection1[2].answer = 3
      component.questionsSection1[3].answer = 3
      component.questionsSection1[4].answer = 3
      component.totalScore = 60

      const payload = component.generatePayload()

      expect(payload.name).toBe('Test Patient')
      expect(payload.age).toBe(35)
      expect(payload.gender).toBe('female')
      expect(payload.answers).toHaveLength(5)
      expect(payload.scores.totalScore).toBe(60)
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
      expect(component.resultsSection1.length).toBe(5)
      expect(component.totalScore).toBe(100)
      expect(component.conclusion).toBe("Der er ikke umiddelbart risiko for depression eller stressbelastning.")
    })

    it('shows validation error for invalid submission', async () => {
      const component = wrapper.vm

      // Set one answer to null
      component.questionsSection1[3].answer = null

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      expect(component.formSubmitted).toBe(true)
      expect(component.validationMessage).toBe('Alle spørgsmål skal udfyldes. ')
      expect(component.resultsSection1.length).toBe(0)
    })
  })

  describe('Clinical Accuracy', () => {
    it('follows WHO-5 Well-Being Index scoring algorithm', () => {
      const component = wrapper.vm

      // Test a realistic clinical scenario
      // Patient with mild depression symptoms
      component.questionsSection1[0].answer = 2  // Happy: Less than half the time
      component.questionsSection1[1].answer = 1  // Calm: A little of the time
      component.questionsSection1[2].answer = 1  // Active: A little of the time
      component.questionsSection1[3].answer = 2  // Fresh: Less than half the time
      component.questionsSection1[4].answer = 1  // Interested: A little of the time

      component.calculateResults()

      const rawScore = 2 + 1 + 1 + 2 + 1 // = 7
      expect(component.totalScore).toBe(28) // 7 * 4
      expect(component.conclusion).toBe("Der kan være stor risiko for depression eller stressbelastning.")
      expect(component.conclusionSeverity).toBe("error")
    })

    it('properly screens for depression risk', () => {
      const component = wrapper.vm

      // WHO-5 score ≤50 indicates need for further assessment
      // Score ≤35 (or ≤28 in some guidelines) indicates likely depression

      // Test borderline case
      component.questionsSection1[0].answer = 3
      component.questionsSection1[1].answer = 2
      component.questionsSection1[2].answer = 2
      component.questionsSection1[3].answer = 3
      component.questionsSection1[4].answer = 2

      component.calculateResults()

      const rawScore = 3 + 2 + 2 + 3 + 2 // = 12
      expect(component.totalScore).toBe(48) // 12 * 4
      expect(component.conclusion).toBe("Der kan være risiko for depression eller stressbelastning.")
      
      // This score would warrant further clinical assessment
    })
  })
})