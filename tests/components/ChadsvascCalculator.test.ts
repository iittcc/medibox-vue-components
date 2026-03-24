import { describe, it, expect, vi } from 'vitest'
import { nextTick } from 'vue'
import ChadsvascCalculator from '@/components/calculators/ChadsvascCalculator.vue'
import { mountCalculator } from './calculator-test-helper'

describe('ChadsvascCalculator', () => {
  it('renders patient info and 6 risk factor cards', () => {
    const wrapper = mountCalculator(ChadsvascCalculator)
    expect(wrapper.find('[data-testid="person-info"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Kronisk hjertesvigt')
    expect(wrapper.text()).toContain('Hypertension')
    expect(wrapper.text()).toContain('Alder')
    expect(wrapper.text()).toContain('Diabetes')
    expect(wrapper.text()).toContain('Apopleksi')
    expect(wrapper.text()).toContain('Vaskulær')
  })

  it('shows no results initially', () => {
    const wrapper = mountCalculator(ChadsvascCalculator)
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('shows results after form submission', async () => {
    const wrapper = mountCalculator(ChadsvascCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    expect(wrapper.text()).toContain('CHA₂DS₂-VA Score')
  })

  it('renders print view stub', () => {
    const wrapper = mountCalculator(ChadsvascCalculator)
    expect(wrapper.find('.calculator-print-view').exists()).toBe(true)
  })

  it('calls window.print when print handler invoked', async () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    const wrapper = mountCalculator(ChadsvascCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    const vm = wrapper.vm as any
    vm.handlePrint()
    expect(printSpy).toHaveBeenCalled()
    printSpy.mockRestore()
  })

  it('clears results after reset', async () => {
    const wrapper = mountCalculator(ChadsvascCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(true)
    const vm = wrapper.vm as any
    vm.reset()
    await nextTick()
    expect(wrapper.find('.results').exists()).toBe(false)
  })

  it('renders copy dialog', () => {
    const wrapper = mountCalculator(ChadsvascCalculator)
    expect(wrapper.find('[data-testid="copy-dialog"]').exists()).toBe(true)
  })

  it('shows risk rate reference table in results', async () => {
    const wrapper = mountCalculator(ChadsvascCalculator)
    await wrapper.find('form').trigger('submit')
    await nextTick()
    expect(wrapper.text()).toContain('Tromboembolirate')
    expect(wrapper.text()).toContain('Anbefaling')
  })

  it('displays point badges for risk factors', () => {
    const wrapper = mountCalculator(ChadsvascCalculator)
    expect(wrapper.text()).toContain('+1')
    expect(wrapper.text()).toContain('+2')
    expect(wrapper.text()).toContain('0–2')
  })
})
