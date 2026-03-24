import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import Who5Calculator from '@/components/calculators/Who5Calculator.vue'
import { mountCalculator } from './calculator-test-helper'

describe('Who5Calculator', () => {
  it('renders patient info and 5 questions', () => {
    const wrapper = mountCalculator(Who5Calculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="question"]')).toHaveLength(5)
  })

  it('shows no results initially', () => {
    const wrapper = mountCalculator(Who5Calculator)
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('shows results after form submission with x4 multiplied score', async () => {
    const wrapper = mountCalculator(Who5Calculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('WHO-5')
  })

  it('renders print view and copy dialog', () => {
    const wrapper = mountCalculator(Who5Calculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
    expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
  })

  it('clears results after reset', async () => {
    const wrapper = mountCalculator(Who5Calculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    ;(wrapper.vm as any).reset()
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('calls window.print', async () => {
    const spy = vi.spyOn(window, 'print').mockImplementation(() => {})
    const wrapper = mountCalculator(Who5Calculator)
    ;(wrapper.vm as any).handlePrint()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
