import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import IpssCalculator from '@/components/calculators/IpssCalculator.vue'
import { mountCalculator } from './calculator-test-helper'

describe('IpssCalculator', () => {
  it('renders patient info and 7 questions', () => {
    const wrapper = mountCalculator(IpssCalculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="question"]')).toHaveLength(7)
  })

  it('shows results after submission', async () => {
    const wrapper = mountCalculator(IpssCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('IPSS Score')
  })

  it('renders print view', () => {
    const wrapper = mountCalculator(IpssCalculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
  })

  it('resets form', async () => {
    const wrapper = mountCalculator(IpssCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    ;(wrapper.vm as any).reset()
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(false)
  })
})
