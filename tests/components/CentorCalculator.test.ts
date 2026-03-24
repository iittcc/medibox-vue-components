import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import CentorCalculator from '@/components/calculators/CentorCalculator.vue'
import { mountCalculator } from './calculator-test-helper'

describe('CentorCalculator', () => {
  it('renders patient info and 5 criteria cards', () => {
    const wrapper = mountCalculator(CentorCalculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Feber')
    expect(wrapper.text()).toContain('Tonsilhypertropi')
    expect(wrapper.text()).toContain('cervikale lymfeknuder')
    expect(wrapper.text()).toContain('Fravær af hoste')
    expect(wrapper.text()).toContain('Alder')
  })

  it('shows no results initially', () => {
    const wrapper = mountCalculator(CentorCalculator)
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('shows results after form submission', async () => {
    const wrapper = mountCalculator(CentorCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('Centor Score')
  })

  it('renders print view stub', () => {
    const wrapper = mountCalculator(CentorCalculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
  })

  it('calls window.print when print handler invoked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    const wrapper = mountCalculator(CentorCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    const vm = wrapper.vm as any
    vm.handlePrint()
    expect(printSpy).toHaveBeenCalled()
    printSpy.mockRestore()
  })

  it('clears results after reset', async () => {
    const wrapper = mountCalculator(CentorCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    const vm = wrapper.vm as any
    vm.reset()
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('renders copy dialog', () => {
    const wrapper = mountCalculator(CentorCalculator)
    expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
  })

  it('shows clinical guidance table in results', async () => {
    const wrapper = mountCalculator(CentorCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.text()).toContain('Gruppe')
    expect(wrapper.text()).toContain('Anbefaling')
  })

  it('displays point badges for criteria', () => {
    const wrapper = mountCalculator(CentorCalculator)
    expect(wrapper.text()).toContain('+1')
    expect(wrapper.text()).toContain('-1 – +1')
  })
})
