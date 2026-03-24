import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import DanpssCalculator from '@/components/calculators/DanpssCalculator.vue'
import { mountCalculator } from './calculator-test-helper'

describe('DanpssCalculator', () => {
  it('renders patient info and 15 questions', () => {
    const wrapper = mountCalculator(DanpssCalculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="question"]')).toHaveLength(15)
  })

  it('shows no results initially', () => {
    const wrapper = mountCalculator(DanpssCalculator)
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('shows validation error when submitting unanswered', async () => {
    const wrapper = mountCalculator(DanpssCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.text()).toContain('Alle spørgsmål')
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('shows results after answering all main questions', async () => {
    const wrapper = mountCalculator(DanpssCalculator)
    const vm = wrapper.vm as any
    // Answer all main questions (sections 1-3, indices 0-11)
    vm.questions.forEach((q: any, i: number) => {
      if (i < 12) { q.answerA = 0; q.answerB = 0 }
    })
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
  })

  it('shows section results table', async () => {
    const wrapper = mountCalculator(DanpssCalculator)
    const vm = wrapper.vm as any
    vm.questions.forEach((q: any, i: number) => {
      if (i < 12) { q.answerA = 1; q.answerB = 1 }
    })
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.text()).toContain('Tømning')
    expect(wrapper.text()).toContain('Fyldning')
    expect(wrapper.text()).toContain('Vandladning')
  })

  it('renders print view', () => {
    const wrapper = mountCalculator(DanpssCalculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
  })

  it('resets form', async () => {
    const wrapper = mountCalculator(DanpssCalculator)
    const vm = wrapper.vm as any
    vm.questions.forEach((q: any, i: number) => {
      if (i < 12) { q.answerA = 0; q.answerB = 0 }
    })
    await wrapper.find('form').trigger('submit')
    await nextTick()
    vm.reset()
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(false)
  })
})
