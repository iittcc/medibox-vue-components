import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import PuqeCalculator from '@/components/calculators/PuqeCalculator.vue'
import { mountCalculator } from './calculator-test-helper'

describe('PuqeCalculator', () => {
  it('renders patient info and 3 questions', () => {
    const wrapper = mountCalculator(PuqeCalculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="question"]')).toHaveLength(3)
  })

  it('shows results after submission', async () => {
    const wrapper = mountCalculator(PuqeCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('PUQE Score')
  })

  it('renders print view', () => {
    const wrapper = mountCalculator(PuqeCalculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
  })

  it('resets form', async () => {
    const wrapper = mountCalculator(PuqeCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    ;(wrapper.vm as any).reset()
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(false)
  })
})
