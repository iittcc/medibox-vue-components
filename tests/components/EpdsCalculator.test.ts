import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import EpdsCalculator from '@/components/calculators/EpdsCalculator.vue'
import { mountCalculator } from './calculator-test-helper'

describe('EpdsCalculator', () => {
  it('renders patient info and 10 questions', () => {
    const wrapper = mountCalculator(EpdsCalculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="question"]')).toHaveLength(10)
  })

  it('shows results after submission', async () => {
    const wrapper = mountCalculator(EpdsCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('Edinburgh Postnatal Depression Scale')
  })

  it('renders print view', () => {
    const wrapper = mountCalculator(EpdsCalculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
  })

  it('resets form', async () => {
    const wrapper = mountCalculator(EpdsCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    ;(wrapper.vm as any).reset()
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('calls window.print', () => {
    const spy = vi.spyOn(window, 'print').mockImplementation(() => {})
    const wrapper = mountCalculator(EpdsCalculator)
    ;(wrapper.vm as any).handlePrint()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
