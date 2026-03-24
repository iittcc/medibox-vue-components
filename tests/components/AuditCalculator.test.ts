import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import AuditCalculator from '@/components/calculators/AuditCalculator.vue'
import { mountCalculator } from './calculator-test-helper'

describe('AuditCalculator', () => {
  it('renders patient info and 10 questions', () => {
    const wrapper = mountCalculator(AuditCalculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.findAll('[data-testid="question"]')).toHaveLength(10)
  })

  it('shows no results initially', () => {
    const wrapper = mountCalculator(AuditCalculator)
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('shows results after form submission', async () => {
    const wrapper = mountCalculator(AuditCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('AUDIT Score')
  })

  it('renders print view stub', () => {
    const wrapper = mountCalculator(AuditCalculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
  })

  it('calls window.print when print handler invoked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    const wrapper = mountCalculator(AuditCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    // Access component's handlePrint directly
    const vm = wrapper.vm as any
    vm.handlePrint()
    expect(printSpy).toHaveBeenCalled()
    printSpy.mockRestore()
  })

  it('clears results after reset', async () => {
    const wrapper = mountCalculator(AuditCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    const vm = wrapper.vm as any
    vm.reset()
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('renders copy dialog', () => {
    const wrapper = mountCalculator(AuditCalculator)
    expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
  })
})
