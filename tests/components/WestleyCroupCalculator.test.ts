import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import WestleyCroupCalculator from '@/components/calculators/WestleyCroupCalculator.vue'
import { mountCalculator } from './calculator-test-helper'

describe('WestleyCroupCalculator', () => {
  it('renders patient info with child prop and 5 questions', () => {
    const wrapper = mountCalculator(WestleyCroupCalculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="question"]')).toHaveLength(5)
  })

  it('shows results after submission', async () => {
    const wrapper = mountCalculator(WestleyCroupCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('Westley Croup')
  })

  it('renders print view', () => {
    const wrapper = mountCalculator(WestleyCroupCalculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
  })

  it('resets form', async () => {
    const wrapper = mountCalculator(WestleyCroupCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    ;(wrapper.vm as any).reset()
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(false)
  })
})
