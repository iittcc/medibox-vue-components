import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import YbocsCalculator from '@/components/calculators/YbocsCalculator.vue'
import { mountCalculator } from './calculator-test-helper'

async function fillAllAnswers(wrapper: ReturnType<typeof mountCalculator>) {
  const vm = wrapper.vm as any
  vm.questions.forEach((q: any) => { q.answer = 0 })
  await nextTick()
}

describe('YbocsCalculator', () => {
  it('renders patient info and 10 question stubs', () => {
    const wrapper = mountCalculator(YbocsCalculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="question"]')).toHaveLength(10)
  })

  it('renders tabbed question sections', () => {
    const wrapper = mountCalculator(YbocsCalculator)
    expect(wrapper.find('[data-testid="question-tabs"]').exists()).toBe(true)
  })

  it('shows no results initially', () => {
    const wrapper = mountCalculator(YbocsCalculator)
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('shows results after form submission', async () => {
    const wrapper = mountCalculator(YbocsCalculator)
    await fillAllAnswers(wrapper)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('Y-BOCS Score')
  })

  it('renders print view stub', () => {
    const wrapper = mountCalculator(YbocsCalculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
  })

  it('calls window.print when print handler invoked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    const wrapper = mountCalculator(YbocsCalculator)
    await fillAllAnswers(wrapper)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    const vm = wrapper.vm as any
    vm.handlePrint()
    expect(printSpy).toHaveBeenCalled()
    printSpy.mockRestore()
  })

  it('clears results after reset', async () => {
    const wrapper = mountCalculator(YbocsCalculator)
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
    const wrapper = mountCalculator(YbocsCalculator)
    expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
  })

  it('shows score interpretation table in results', async () => {
    const wrapper = mountCalculator(YbocsCalculator)
    await fillAllAnswers(wrapper)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.text()).toContain('Fortolkning')
    expect(wrapper.text()).toContain('Ubetydelig til mild OCD')
  })
})
