import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import WestleyCroupScore from '@/components/WestleyCroupScore.vue'
import type { Option, Question, Result } from '@/components/WestleyCroupScore.vue'

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
    props: ['name', 'question', 'options', 'index', 'isUnanswered'],
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
    props: ['name', 'age', 'minAge', 'maxAge', 'gender', 'genderdisplay', 'child'],
    emits: ['update:name', 'update:age', 'update:gender'],
    template: `<div data-testid="person-info">PersonInfo Component</div>`
  }
}))

describe('WestleyCroupScore.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(WestleyCroupScore)
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
      expect(personInfo.props('minAge')).toBe(0)
      expect(personInfo.props('maxAge')).toBe(12)
      expect(personInfo.props('child')).toBe("true")
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

      // Patient info defaults for pediatric patient
      expect(component.name).toBe("")
      expect(component.gender).toBe("male")
      expect(component.age).toBe(6)

      // Form state
      expect(component.formSubmitted).toBe(false)
      expect(component.validationMessage).toBe('')
      expect(component.totalScore).toBe(0)
      expect(component.conclusion).toBe('')
      expect(component.conclusionSeverity).toBe('')
    })

    it('has correct question structure with default values', () => {
      const component = wrapper.vm

      expect(component.questionsSection1.length).toBe(5)
      
      // Question 1: Bevidsthedsniveau
      expect(component.questionsSection1[0].text).toBe("Bevidsthedsniveau")
      expect(component.questionsSection1[0].answer).toBe(0) // Default: "Vågen (eller sovende)"
      expect(component.questionsSection1[0].optionsType).toBe('options1')

      // Question 2: Cyanose
      expect(component.questionsSection1[1].text).toBe("Cyanose")
      expect(component.questionsSection1[1].answer).toBe(0) // Default: "Ingen"
      expect(component.questionsSection1[1].optionsType).toBe('options2')

      // Question 3: Stridor
      expect(component.questionsSection1[2].text).toBe("Stridor")
      expect(component.questionsSection1[2].answer).toBe(0) // Default: "Ingen"
      expect(component.questionsSection1[2].optionsType).toBe('options2')

      // Question 4: Luftskifte
      expect(component.questionsSection1[3].text).toBe("Luftskifte (st.p.)")
      expect(component.questionsSection1[3].answer).toBe(0) // Default: "Normal"
      expect(component.questionsSection1[3].optionsType).toBe('options3')

      // Question 5: Indtrækninger
      expect(component.questionsSection1[4].text).toBe("Indtrækninger")
      expect(component.questionsSection1[4].answer).toBe(0) // Default: "Ingen"
      expect(component.questionsSection1[4].optionsType).toBe('options4')
    })

    it('has correct option sets with proper scoring values', () => {
      const component = wrapper.vm

      // Options 1 - Consciousness level (0 or 5 points)
      expect(component.options1).toEqual([
        { text: "Vågen (eller sovende)", value: 0 },
        { text: "Desorienteret/forvirret", value: 5 }
      ])

      // Options 2 - Cyanosis/Stridor (0, 4, or 5 points)
      expect(component.options2).toEqual([
        { text: "Ingen", value: 0 },
        { text: "Ved ophidselse", value: 4 },
        { text: "I hvile", value: 5 }
      ])

      // Options 3 - Air entry (0, 1, or 2 points)
      expect(component.options3).toEqual([
        { text: "Normal", value: 0 },
        { text: "Nedsat", value: 1 },
        { text: "Udtalt nedsat", value: 2 }
      ])

      // Options 4 - Retractions (0, 1, 2, or 3 points)
      expect(component.options4).toEqual([
        { text: "Ingen", value: 0 },
        { text: "Milde", value: 1 },
        { text: "Moderate", value: 2 },
        { text: "Svære", value: 3 }
      ])
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

    it('allows submission when all questions have default values', () => {
      const component = wrapper.vm

      // All questions have default values (0)
      expect(component.validateQuestions()).toBe(true)
      expect(component.validationMessage).toBe('')
    })
  })

  describe('Score Calculation', () => {
    it('calculates minimal score correctly', () => {
      const component = wrapper.vm

      // All answers are 0 (normal/none)
      component.questionsSection1.forEach(q => q.answer = 0)
      
      component.calculateResults()

      expect(component.totalScore).toBe(0)
      expect(component.conclusion).toBe("Mild pseudocroup ≤ 2")
      expect(component.conclusionSeverity).toBe("success")
    })

    it('calculates moderate croup score correctly', () => {
      const component = wrapper.vm

      // Set specific answers for moderate score
      component.questionsSection1[0].answer = 0  // Consciousness: Normal (0)
      component.questionsSection1[1].answer = 0  // Cyanosis: None (0)
      component.questionsSection1[2].answer = 4  // Stridor: With agitation (4)
      component.questionsSection1[3].answer = 1  // Air entry: Decreased (1)
      component.questionsSection1[4].answer = 1  // Retractions: Mild (1)
      
      component.calculateResults()

      expect(component.totalScore).toBe(6) // 0+0+4+1+1
      expect(component.conclusion).toBe("Moderat pseudocroup 3-7")
      expect(component.conclusionSeverity).toBe("warn")
    })

    it('calculates severe croup score correctly', () => {
      const component = wrapper.vm

      // Set answers for severe score
      component.questionsSection1[0].answer = 5  // Consciousness: Confused (5)
      component.questionsSection1[1].answer = 5  // Cyanosis: At rest (5)
      component.questionsSection1[2].answer = 5  // Stridor: At rest (5)
      component.questionsSection1[3].answer = 2  // Air entry: Markedly decreased (2)
      component.questionsSection1[4].answer = 3  // Retractions: Severe (3)
      
      component.calculateResults()

      expect(component.totalScore).toBe(20) // 5+5+5+2+3
      expect(component.conclusion).toBe("Svær  pseudocroup ≥ 8")
      expect(component.conclusionSeverity).toBe("error")
    })

    it('correctly identifies boundary scores', () => {
      const component = wrapper.vm

      // Test score = 2 (boundary between mild and moderate)
      component.questionsSection1[0].answer = 0
      component.questionsSection1[1].answer = 0
      component.questionsSection1[2].answer = 0
      component.questionsSection1[3].answer = 2
      component.questionsSection1[4].answer = 0
      
      component.calculateResults()
      expect(component.totalScore).toBe(2)
      expect(component.conclusion).toBe("Mild pseudocroup ≤ 2")

      // Test score = 3 (start of moderate)
      component.questionsSection1[4].answer = 1
      component.calculateResults()
      expect(component.totalScore).toBe(3)
      expect(component.conclusion).toBe("Moderat pseudocroup 3-7")

      // Test score = 8 (start of severe)
      component.questionsSection1[0].answer = 5
      component.questionsSection1[3].answer = 2
      component.questionsSection1[4].answer = 1
      component.calculateResults()
      expect(component.totalScore).toBe(8) // 5+0+0+2+1
      expect(component.conclusion).toBe("Svær  pseudocroup ≥ 8")
    })

    it('creates correct results array', () => {
      const component = wrapper.vm

      component.questionsSection1[0].answer = 0
      component.questionsSection1[1].answer = 4
      component.questionsSection1[2].answer = 0
      component.questionsSection1[3].answer = 1
      component.questionsSection1[4].answer = 2

      component.calculateResults()

      expect(component.resultsSection1.length).toBe(5)
      expect(component.resultsSection1[0]).toEqual({
        question: '1',
        text: 'Bevidsthedsniveau',
        score: 0
      })
      expect(component.resultsSection1[1]).toEqual({
        question: '2',
        text: 'Cyanose',
        score: 4
      })
    })
  })

  describe('User Interactions', () => {
    it('resets questions to default values', () => {
      const component = wrapper.vm

      // Change some answers
      component.questionsSection1[0].answer = 5
      component.questionsSection1[1].answer = 4
      component.totalScore = 10
      component.validationMessage = 'Test'
      component.formSubmitted = true

      // Reset
      component.resetQuestions()

      // Verify reset to defaults
      expect(component.questionsSection1[0].answer).toBe(0)
      expect(component.questionsSection1[1].answer).toBe(0)
      expect(component.totalScore).toBe(0)
      expect(component.validationMessage).toBe('')
      expect(component.formSubmitted).toBe(false)
    })

    it('generates correct payload for server', () => {
      const component = wrapper.vm

      // Set up patient info
      component.name = 'Test Child'
      component.age = 4
      component.gender = 'female'

      // Set some scores
      component.questionsSection1[0].answer = 0
      component.questionsSection1[1].answer = 4
      component.totalScore = 4

      const payload = component.generatePayload()

      expect(payload.name).toBe('Test Child')
      expect(payload.age).toBe(4)
      expect(payload.gender).toBe('female')
      expect(payload.answers).toHaveLength(5)
      expect(payload.scores.totalScore).toBe(4)
    })
  })

  describe('Form Submission', () => {
    it('calculates and shows results on valid submission', async () => {
      const component = wrapper.vm

      // All questions have default values
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      expect(component.formSubmitted).toBe(true)
      expect(component.validationMessage).toBe('')
      expect(component.resultsSection1.length).toBe(5)
      expect(component.totalScore).toBe(0)
      expect(component.conclusion).toBe("Mild pseudocroup ≤ 2")
    })

    it('shows validation error for invalid submission', async () => {
      const component = wrapper.vm

      // Set one answer to null
      component.questionsSection1[2].answer = null

      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      expect(component.formSubmitted).toBe(true)
      expect(component.validationMessage).toBe('Alle spørgsmål skal udfyldes.')
      expect(component.resultsSection1.length).toBe(0)
    })
  })

  describe('Clinical Accuracy', () => {
    it('follows correct Westley Croup Score algorithm', () => {
      const component = wrapper.vm

      // Test a realistic clinical scenario
      // Child with moderate croup: stridor with agitation, mild retractions
      component.questionsSection1[0].answer = 0  // Normal consciousness
      component.questionsSection1[1].answer = 0  // No cyanosis
      component.questionsSection1[2].answer = 4  // Stridor with agitation
      component.questionsSection1[3].answer = 0  // Normal air entry
      component.questionsSection1[4].answer = 1  // Mild retractions

      component.calculateResults()

      expect(component.totalScore).toBe(5)
      expect(component.conclusion).toBe("Moderat pseudocroup 3-7")
      expect(component.conclusionSeverity).toBe("warn")
    })
  })
})