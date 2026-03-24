import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import WellsDvtCalculator from '@/components/calculators/WellsDvtCalculator.vue'
import { mountCalculator } from './calculator-test-helper'

describe('WellsDvtCalculator', () => {
  it('renders patient info and 10 risk factor cards', () => {
    const wrapper = mountCalculator(WellsDvtCalculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Paralyse')
    expect(wrapper.text()).toContain('sengeleje')
    expect(wrapper.text()).toContain('cancersygdom')
    expect(wrapper.text()).toContain('Tidligere dokumenteret DVT')
    expect(wrapper.text()).toContain('Smerter langs dybe vener')
    expect(wrapper.text()).toContain('Alternativ diagnose')
  })

  it('shows no results initially', () => {
    const wrapper = mountCalculator(WellsDvtCalculator)
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('shows results after form submission', async () => {
    const wrapper = mountCalculator(WellsDvtCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('Wells DVT Score')
  })

  it('renders print view stub', () => {
    const wrapper = mountCalculator(WellsDvtCalculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
  })

  it('calls window.print when print handler invoked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    const wrapper = mountCalculator(WellsDvtCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    const vm = wrapper.vm as any
    vm.handlePrint()
    expect(printSpy).toHaveBeenCalled()
    printSpy.mockRestore()
  })

  it('clears results after reset', async () => {
    const wrapper = mountCalculator(WellsDvtCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    const vm = wrapper.vm as any
    vm.reset()
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('renders copy dialog', () => {
    const wrapper = mountCalculator(WellsDvtCalculator)
    expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
  })

  it('shows risk rate reference table in results', async () => {
    const wrapper = mountCalculator(WellsDvtCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.text()).toContain('Sandsynlighed')
    expect(wrapper.text()).toContain('Anbefaling')
  })

  it('displays point badges for risk factors', () => {
    const wrapper = mountCalculator(WellsDvtCalculator)
    expect(wrapper.text()).toContain('+1')
    expect(wrapper.text()).toContain('-2')
  })

  it('shows section headers', () => {
    const wrapper = mountCalculator(WellsDvtCalculator)
    expect(wrapper.text()).toContain('Disponerende faktorer')
    expect(wrapper.text()).toContain('Symptomer')
    expect(wrapper.text()).toContain('Kliniske tegn')
    expect(wrapper.text()).toContain('Klinisk vurdering')
  })

  it('shows clinical disclaimers in results', async () => {
    const wrapper = mountCalculator(WellsDvtCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.text()).toContain('kræftsygdom')
  })
})
