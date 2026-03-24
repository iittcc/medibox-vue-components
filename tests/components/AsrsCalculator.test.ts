import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import AsrsCalculator from '@/components/calculators/AsrsCalculator.vue'
import { mountCalculator } from './calculator-test-helper'

async function fillAllAnswers(wrapper: ReturnType<typeof mountCalculator>) {
  const vm = wrapper.vm as any
  vm.questions.forEach((q: any) => { q.answer = 0 })
  await nextTick()
}

describe('AsrsCalculator', () => {
  it('renders patient info and 18 question stubs', () => {
    const wrapper = mountCalculator(AsrsCalculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="question"]')).toHaveLength(18)
  })

  it('renders tabbed question sections', () => {
    const wrapper = mountCalculator(AsrsCalculator)
    expect(wrapper.find('[data-testid="question-tabs"]').exists()).toBe(true)
  })

  it('shows no results initially', () => {
    const wrapper = mountCalculator(AsrsCalculator)
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('shows results after form submission', async () => {
    const wrapper = mountCalculator(AsrsCalculator)
    await fillAllAnswers(wrapper)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('Positive A-spørgsmål')
  })

  it('renders print view stub', () => {
    const wrapper = mountCalculator(AsrsCalculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
  })

  it('clears results after reset', async () => {
    const wrapper = mountCalculator(AsrsCalculator)
    await fillAllAnswers(wrapper)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    const vm = wrapper.vm as any
    vm.reset()
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('renders copy dialog', () => {
    const wrapper = mountCalculator(AsrsCalculator)
    expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
  })
})
