import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import LrtiCalculator from '@/components/calculators/LrtiCalculator.vue'
import { mountCalculator } from './calculator-test-helper'

describe('LrtiCalculator', () => {
  it('renders patient info and 8 toggle symptoms', () => {
    const wrapper = mountCalculator(LrtiCalculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="surface-card-item"]')).toHaveLength(8)
  })

  it('shows no results initially', () => {
    const wrapper = mountCalculator(LrtiCalculator)
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('shows results after calculate', async () => {
    const wrapper = mountCalculator(LrtiCalculator)
    const vm = wrapper.vm as any
    vm.handleSubmit()
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('LRTI')
  })

  it('renders print view', () => {
    const wrapper = mountCalculator(LrtiCalculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
  })

  it('resets form', async () => {
    const wrapper = mountCalculator(LrtiCalculator)
    const vm = wrapper.vm as any
    vm.handleSubmit()
    await nextTick()
    vm.reset()
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(false)
  })
})
