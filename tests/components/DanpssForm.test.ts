import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import DanpssForm from '@/components/DanpssForm.vue'

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

vi.mock('@/components/QuestionComponent.vue', () => ({
  default: {
    name: 'QuestionComponent',
    props: ['name', 'question', 'optionsA', 'optionsB', 'index', 'isUnanswered'],
    template: `<div data-testid="question-component">{{ question.textA }}</div>`
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

vi.mock('primevue/chart', () => ({
  default: {
    name: 'Chart',
    props: ['type', 'data', 'options'],
    template: `<div data-testid="chart" :type="type">Chart</div>`
  }
}))

describe('DanpssForm.vue', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(DanpssForm, {
      global: {
        stubs: {
          Chart: true
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
    // Clear any remaining timers
    vi.clearAllTimers()
    // Force DOM cleanup
    document.body.innerHTML = ''
  })

  describe('Component Rendering', () => {
    it('renders the component with all sections', () => {
      expect(wrapper.find('[data-testid="surface-card"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Patient')
      expect(wrapper.text()).toContain('Scoringsskema')
      expect(wrapper.text()).toContain('Tømning')
      expect(wrapper.text()).toContain('Fyldning')
      expect(wrapper.text()).toContain('Andre symptomer')
      expect(wrapper.text()).toContain('Seksualfunktion')
    })

    it('displays all question components', () => {
      const questions = wrapper.findAll('[data-testid="question-component"]')
      expect(questions.length).toBe(15) // 4 + 4 + 4 + 3 questions
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
      expect(component.age).toBe(55)

      // Form state
      expect(component.formSubmitted).toBe(false)
      expect(component.validationMessage).toBe('')
      expect(component.validationMessageSexual).toBe('')
      expect(component.allSexualQuestionsAnswered).toBe(false)

      // All scores should be 0
      expect(component.totalScoreA).toBe(0)
      expect(component.totalScoreB).toBe(0)
      expect(component.totalScoreAB).toBe(0)
    })

    it('has correct question structure', () => {
      const component = wrapper.vm

      // Section 1 (Tømning) - 4 questions
      expect(component.questionsSection1.length).toBe(4)
      expect(component.questionsSection1[0].textA).toContain('Skal du vente på, at vandladningen kommer i gang?')
      expect(component.questionsSection1[0].answerA).toBe(null)
      expect(component.questionsSection1[0].answerB).toBe(null)

      // Section 2 (Fyldning) - 4 questions
      expect(component.questionsSection2.length).toBe(4)
      expect(component.questionsSection2[0].textA).toContain('Hvor lang tid går der højst mellem hver vandladning')

      // Section 3 (Andre symptomer) - 4 questions
      expect(component.questionsSection3.length).toBe(4)
      expect(component.questionsSection3[0].textA).toContain('Gør det ondt eller svier det')

      // Section 4 (Seksualfunktion) - 3 questions
      expect(component.questionsSection4.length).toBe(3)
      expect(component.questionsSection4[0].textA).toContain('Kan du få rejsning?')
    })

    it('has correct option sets', () => {
      const component = wrapper.vm

      // Check a few option sets
      expect(component.options1.length).toBe(4)
      expect(component.options1[0].text).toBe("Nej")
      expect(component.options1[0].value).toBe(0)

      expect(component.optionsB.length).toBe(4)
      expect(component.optionsB[0].text).toBe("Ikke generende")
      expect(component.optionsB[3].text).toBe("Meget generende")
    })
  })

  describe('Form Validation', () => {
    it('validates required questions correctly', () => {
      const component = wrapper.vm

      // Try to submit without answering questions
      expect(component.validateQuestions()).toBe(false)
      expect(component.validationMessage).toBe('Alle spørgsmål om vandladningsproblemer skal udfyldes. ')
    })

    it('validates sexual function questions separately', () => {
      const component = wrapper.vm

      // Check when no sexual questions are answered
      expect(component.validateSexualQuestions()).toBe(false)
      expect(component.validationMessageSexual).toBe('Seksual funktion ikke udfyldt.')

      // Answer one sexual question
      component.questionsSection4[0].answerA = 0
      component.questionsSection4[0].answerB = 0
      expect(component.validateSexualQuestions()).toBe(false)
      expect(component.validationMessageSexual).toBe('Seksual funktion ikke komplet.')

      // Answer all sexual questions
      component.questionsSection4.forEach(q => {
        q.answerA = 0
        q.answerB = 0
      })
      expect(component.validateSexualQuestions()).toBe(true)
      expect(component.validationMessageSexual).toBe('')
    })

    it('allows submission when all required questions are answered', () => {
      const component = wrapper.vm

      // Answer all required questions (sections 1-3)
      component.questionsSection1.forEach(q => {
        q.answerA = 1
        q.answerB = 1
      })
      component.questionsSection2.forEach(q => {
        q.answerA = 1
        q.answerB = 1
      })
      component.questionsSection3.forEach(q => {
        q.answerA = 1
        q.answerB = 1
      })

      expect(component.validateQuestions()).toBe(true)
      expect(component.validationMessage).toBe('')
    })
  })

  describe('Score Calculation', () => {
    it('calculates section scores correctly', () => {
      const component = wrapper.vm

      // Set up test data - each question with different scores
      component.questionsSection1[0].answerA = 2
      component.questionsSection1[0].answerB = 3
      component.questionsSection1[1].answerA = 1
      component.questionsSection1[1].answerB = 2
      component.questionsSection1[2].answerA = 3
      component.questionsSection1[2].answerB = 1
      component.questionsSection1[3].answerA = 0
      component.questionsSection1[3].answerB = 0

      component.questionsSection2.forEach(q => {
        q.answerA = 1
        q.answerB = 1
      })

      component.questionsSection3.forEach(q => {
        q.answerA = 0
        q.answerB = 0
      })

      component.calculateResults()

      // Section 1 scores
      expect(component.totalScoreASection1).toBe(6) // 2+1+3+0
      expect(component.totalScoreBSection1).toBe(6) // 3+2+1+0
      expect(component.totalScoreABSection1).toBe(11) // (2*3)+(1*2)+(3*1)+(0*0)

      // Section 2 scores
      expect(component.totalScoreASection2).toBe(4) // 1+1+1+1
      expect(component.totalScoreBSection2).toBe(4) // 1+1+1+1
      expect(component.totalScoreABSection2).toBe(4) // (1*1)*4

      // Total scores
      expect(component.totalScoreA).toBe(10) // 6+4+0
      expect(component.totalScoreB).toBe(10) // 6+4+0
      expect(component.totalScoreAB).toBe(15) // 11+4+0
    })

    it('determines clinical severity correctly', () => {
      const component = wrapper.vm

      // Set all answers to 0 for low score
      component.questionsSection1.forEach(q => { q.answerA = 0; q.answerB = 0 })
      component.questionsSection2.forEach(q => { q.answerA = 0; q.answerB = 0 })
      component.questionsSection3.forEach(q => { q.answerA = 0; q.answerB = 0 })
      
      component.calculateResults()
      expect(component.totalScoreAB).toBe(0)
      expect(component.conclusion).toBe("Lette symptomer (Vandladningsproblem total score < 8)")
      expect(component.conclusionSeverity).toBe("success")

      // Set scores for moderate severity (8-19)
      component.questionsSection1.forEach(q => { q.answerA = 1; q.answerB = 2 })
      component.questionsSection2.forEach(q => { q.answerA = 1; q.answerB = 1 })
      component.questionsSection3.forEach(q => { q.answerA = 0; q.answerB = 0 })

      component.calculateResults()
      expect(component.totalScoreAB).toBe(12) // (1*2)*4 + (1*1)*4 + 0
      expect(component.conclusion).toBe("Moderate symptomer (Vandladningsproblem total score 8-19)")
      expect(component.conclusionSeverity).toBe("warn")

      // Set scores for severe severity (>19)
      component.questionsSection1.forEach(q => { q.answerA = 2; q.answerB = 3 })
      component.questionsSection2.forEach(q => { q.answerA = 2; q.answerB = 2 })
      component.questionsSection3.forEach(q => { q.answerA = 1; q.answerB = 1 })

      component.calculateResults()
      expect(component.totalScoreAB).toBe(44) // (2*3)*4 + (2*2)*4 + (1*1)*4 = 24+16+4
      expect(component.conclusion).toBe("Svære symptomer (Vandladningsproblem total score > 19)")
      expect(component.conclusionSeverity).toBe("error")
    })

    it('handles sexual function scoring when answered', () => {
      const component = wrapper.vm

      // Answer main sections
      component.questionsSection1.forEach(q => { q.answerA = 0; q.answerB = 0 })
      component.questionsSection2.forEach(q => { q.answerA = 0; q.answerB = 0 })
      component.questionsSection3.forEach(q => { q.answerA = 0; q.answerB = 0 })

      // Answer sexual function questions
      component.questionsSection4[0].answerA = 2
      component.questionsSection4[0].answerB = 3
      component.questionsSection4[1].answerA = 1
      component.questionsSection4[1].answerB = 2
      component.questionsSection4[2].answerA = 0
      component.questionsSection4[2].answerB = 0

      component.allSexualQuestionsAnswered = true
      component.calculateResults()

      expect(component.totalScoreASection4).toBe(3) // 2+1+0
      expect(component.totalScoreBSection4).toBe(5) // 3+2+0
      expect(component.totalScoreABSection4).toBe(8) // (2*3)+(1*2)+(0*0)
    })

    it('updates chart data correctly', () => {
      const component = wrapper.vm

      // Set specific scores for chart data
      component.questionsSection1.forEach(q => { q.answerA = 2; q.answerB = 2 })
      component.questionsSection2.forEach(q => { q.answerA = 1; q.answerB = 1 })
      component.questionsSection3.forEach(q => { q.answerA = 3; q.answerB = 3 })

      component.calculateResults()

      // Check pie chart data (percentages)
      const pieData = component.chartPieData.datasets[0].data
      expect(pieData[0]).toBeGreaterThan(0) // Tømning percentage
      expect(pieData[1]).toBeGreaterThan(0) // Fyldning percentage
      expect(pieData[2]).toBeGreaterThan(0) // Andre percentage
      expect(pieData[0] + pieData[1] + pieData[2]).toBeLessThanOrEqual(100)

      // Check radar chart data
      const radarDataSymptom = component.chartRadarData.datasets[0].data
      const radarDataGene = component.chartRadarData.datasets[1].data
      
      expect(radarDataSymptom[0]).toBe(8) // Section 1 A score
      expect(radarDataSymptom[1]).toBe(4) // Section 2 A score
      expect(radarDataSymptom[2]).toBe(12) // Section 3 A score

      expect(radarDataGene[0]).toBe(8) // Section 1 B score
      expect(radarDataGene[1]).toBe(4) // Section 2 B score
      expect(radarDataGene[2]).toBe(12) // Section 3 B score
    })
  })

  describe('User Interactions', () => {
    it('clears all questions and results', () => {
      const component = wrapper.vm

      // Set some data
      component.questionsSection1[0].answerA = 2
      component.questionsSection1[0].answerB = 3
      component.totalScoreA = 10
      component.totalScoreB = 15
      component.totalScoreAB = 25
      component.validationMessage = 'Test message'
      component.formSubmitted = true

      // Clear all
      component.clearAllQuestionsAndResults()

      // Verify all cleared
      expect(component.questionsSection1[0].answerA).toBe(null)
      expect(component.questionsSection1[0].answerB).toBe(null)
      expect(component.totalScoreA).toBe(0)
      expect(component.totalScoreB).toBe(0)
      expect(component.totalScoreAB).toBe(0)
      expect(component.validationMessage).toBe('')
      expect(component.formSubmitted).toBe(false)
    })

    it('generates correct payload for server', () => {
      const component = wrapper.vm

      // Set up patient info
      component.name = 'Test Patient'
      component.age = 65
      component.gender = 'male'

      // Set some answers
      component.questionsSection1[0].answerA = 2
      component.questionsSection1[0].answerB = 3
      component.totalScoreA = 10
      component.totalScoreB = 15
      component.totalScoreAB = 25

      const payload = component.generatePayload()

      expect(payload.name).toBe('Test Patient')
      expect(payload.age).toBe(65)
      expect(payload.gender).toBe('male')
      expect(payload.answers).toHaveLength(15) // All questions
      expect(payload.scores.totalScoreA).toBe(10)
      expect(payload.scores.totalScoreB).toBe(15)
      expect(payload.scores.totalScoreAB).toBe(25)
      expect(payload.scores.sectionScores).toBeDefined()
    })
  })

  describe('Form Submission', () => {
    it('shows validation error when submitting incomplete form', async () => {
      const component = wrapper.vm

      // Submit without answering questions
      const form = wrapper.find('form')
      await form.trigger('submit.prevent')

      expect(component.formSubmitted).toBe(true)
      expect(component.validationMessage).toBe('Alle spørgsmål om vandladningsproblemer skal udfyldes. ')
    })

    it('calculates results when form is valid', async () => {
      const component = wrapper.vm

      // Answer all required questions
      component.questionsSection1.forEach(q => { q.answerA = 1; q.answerB = 1 })
      component.questionsSection2.forEach(q => { q.answerA = 1; q.answerB = 1 })
      component.questionsSection3.forEach(q => { q.answerA = 1; q.answerB = 1 })

      // Submit form
      await wrapper.find('form').trigger('submit.prevent')

      expect(component.formSubmitted).toBe(true)
      expect(component.validationMessage).toBe('')
      expect(component.resultsSection1.length).toBe(4)
      expect(component.resultsSection2.length).toBe(4)
      expect(component.resultsSection3.length).toBe(4)
    })
  })
})