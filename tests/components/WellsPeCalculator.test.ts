import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import WellsPeCalculator from '@/components/calculators/WellsPeCalculator.vue'
import { mountCalculator } from './calculator-test-helper'

describe('WellsPeCalculator', () => {
  it('renders patient info and 7 risk factor cards', () => {
    const wrapper = mountCalculator(WellsPeCalculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Tidligere DVT eller LE')
    expect(wrapper.text()).toContain('Sengeleje')
    expect(wrapper.text()).toContain('Aktiv malignitet')
    expect(wrapper.text()).toContain('Hæmoptyse')
    expect(wrapper.text()).toContain('Hjertefrekvens')
    expect(wrapper.text()).toContain('Kliniske tegn på DVT')
    expect(wrapper.text()).toContain('LE mere sandsynlig')
  })

  it('shows no results initially', () => {
    const wrapper = mountCalculator(WellsPeCalculator)
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('shows results after form submission', async () => {
    const wrapper = mountCalculator(WellsPeCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('Wells LE Score')
  })

  it('renders print view stub', () => {
    const wrapper = mountCalculator(WellsPeCalculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
  })

  it('calls window.print when print handler invoked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    const wrapper = mountCalculator(WellsPeCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    const vm = wrapper.vm as any
    vm.handlePrint()
    expect(printSpy).toHaveBeenCalled()
    printSpy.mockRestore()
  })

  it('clears results after reset', async () => {
    const wrapper = mountCalculator(WellsPeCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    const vm = wrapper.vm as any
    vm.reset()
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('renders copy dialog', () => {
    const wrapper = mountCalculator(WellsPeCalculator)
    expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
  })

  it('shows risk rate reference table in results', async () => {
    const wrapper = mountCalculator(WellsPeCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.text()).toContain('Sandsynlighed')
    expect(wrapper.text()).toContain('Anbefaling')
  })

  it('displays point badges for risk factors', () => {
    const wrapper = mountCalculator(WellsPeCalculator)
    expect(wrapper.text()).toContain('+1.5')
    expect(wrapper.text()).toContain('+3')
    expect(wrapper.text()).toContain('+1')
  })

  it('shows section headers', () => {
    const wrapper = mountCalculator(WellsPeCalculator)
    expect(wrapper.text()).toContain('Prædisponerende faktorer')
    expect(wrapper.text()).toContain('Symptomer')
    expect(wrapper.text()).toContain('Kliniske tegn')
    expect(wrapper.text()).toContain('Klinisk vurdering')
  })
})
