import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import AdhdrsCalculator from '@/components/calculators/AdhdrsCalculator.vue'
import { mountCalculator } from './calculator-test-helper'

async function fillAllAnswers(wrapper: ReturnType<typeof mountCalculator>) {
  const vm = wrapper.vm as any
  vm.questions.forEach((q: any) => { q.answer = 0 })
  await nextTick()
}

describe('AdhdrsCalculator', () => {
  it('renders patient info and 26 question stubs', () => {
    const wrapper = mountCalculator(AdhdrsCalculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="question"]')).toHaveLength(26)
  })

  it('renders tabbed question sections', () => {
    const wrapper = mountCalculator(AdhdrsCalculator)
    expect(wrapper.find('[data-testid="question-tabs"]').exists()).toBe(true)
  })

  it('shows no results initially', () => {
    const wrapper = mountCalculator(AdhdrsCalculator)
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('shows results after form submission', async () => {
    const wrapper = mountCalculator(AdhdrsCalculator)
    await fillAllAnswers(wrapper)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('ADHD-RS Score')
  })

  it('renders print view stub', () => {
    const wrapper = mountCalculator(AdhdrsCalculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
  })

  it('clears results after reset', async () => {
    const wrapper = mountCalculator(AdhdrsCalculator)
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
    const wrapper = mountCalculator(AdhdrsCalculator)
    expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
  })

  it('shows domain subscore table in results', async () => {
    const wrapper = mountCalculator(AdhdrsCalculator)
    await fillAllAnswers(wrapper)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.text()).toContain('Domæne')
    expect(wrapper.text()).toContain('Uopmærksomhed')
  })

  it('has filled-by and relation input fields', () => {
    const wrapper = mountCalculator(AdhdrsCalculator)
    expect(wrapper.text()).toContain('Skema udfyldt af')
    expect(wrapper.text()).toContain('Relation til barnet')
  })
})
