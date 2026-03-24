import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import GcsCalculator from '@/components/calculators/GcsCalculator.vue'
import { mountCalculator } from './calculator-test-helper'

describe('GcsCalculator', () => {
  it('renders patient info and 3 questions', () => {
    const wrapper = mountCalculator(GcsCalculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="question"]')).toHaveLength(3)
  })

  it('shows results after submission', async () => {
    const wrapper = mountCalculator(GcsCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('Glasgow Coma Scale')
  })

  it('renders print view', () => {
    const wrapper = mountCalculator(GcsCalculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
  })

  it('resets form', async () => {
    const wrapper = mountCalculator(GcsCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    ;(wrapper.vm as any).reset()
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(false)
  })
})
