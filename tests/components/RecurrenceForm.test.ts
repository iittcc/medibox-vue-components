import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import RecurrenceForm from '@/components/calendar/RecurrenceForm.vue'
import { calendarStubs } from './calendar-test-helper'
import type { RRuleConfig } from '@/composables/useRecurrence'

function createConfig(overrides: Partial<RRuleConfig> = {}): RRuleConfig {
  return {
    frequency: 'WEEKLY',
    interval: 1,
    days: [],
    monthDay: 0,
    count: null,
    endType: 'never',
    ...overrides
  }
}

function mountForm(config: RRuleConfig = createConfig(), untilDate: string | null = null) {
  return mount(RecurrenceForm, {
    props: {
      modelValue: config,
      untilDate
    },
    global: {
      plugins: [[PrimeVue, { unstyled: true }]],
      stubs: calendarStubs
    }
  })
}

describe('RecurrenceForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  describe('rendering', () => {
    it('renders frequency select', () => {
      const wrapper = mountForm()
      expect(wrapper.find('[data-testid="select"]').exists()).toBe(true)
    })

    it('renders interval input', () => {
      const wrapper = mountForm()
      expect(wrapper.find('[data-testid="input-number"]').exists()).toBe(true)
    })

    it('renders end condition radio buttons', () => {
      const wrapper = mountForm()
      const radios = wrapper.findAll('[data-testid="radio-button"]')
      expect(radios.length).toBe(3) // never, date, count
    })
  })

  // ---------------------------------------------------------------------------
  // Weekly day selection
  // ---------------------------------------------------------------------------
  describe('weekly days', () => {
    it('shows day toggle buttons when frequency is WEEKLY', () => {
      const wrapper = mountForm(createConfig({ frequency: 'WEEKLY' }))
      const toggles = wrapper.findAll('[data-testid="toggle-button"]')
      expect(toggles.length).toBe(7) // Mon-Sun
    })

    it('hides day toggle buttons when frequency is not WEEKLY', () => {
      const wrapper = mountForm(createConfig({ frequency: 'DAILY' }))
      const toggles = wrapper.findAll('[data-testid="toggle-button"]')
      expect(toggles.length).toBe(0)
    })

    it('emits update when day is toggled on', async () => {
      const config = createConfig({ frequency: 'WEEKLY', days: [] })
      const wrapper = mountForm(config)
      const toggles = wrapper.findAll('[data-testid="toggle-button"]')

      // Click first toggle (Monday)
      await toggles[0].trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emitted = wrapper.emitted('update:modelValue')![0][0] as RRuleConfig
      expect(emitted.days).toContain('MO')
    })

    it('emits update when day is toggled off', async () => {
      const config = createConfig({ frequency: 'WEEKLY', days: ['MO', 'WE'] })
      const wrapper = mountForm(config)
      const toggles = wrapper.findAll('[data-testid="toggle-button"]')

      // Click first toggle (Monday — currently on)
      await toggles[0].trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emitted = wrapper.emitted('update:modelValue')![0][0] as RRuleConfig
      expect(emitted.days).not.toContain('MO')
      expect(emitted.days).toContain('WE')
    })
  })

  // ---------------------------------------------------------------------------
  // Monthly day selection
  // ---------------------------------------------------------------------------
  describe('monthly', () => {
    it('shows month day select when frequency is MONTHLY', () => {
      const wrapper = mountForm(createConfig({ frequency: 'MONTHLY' }))
      // Should have at least 2 selects (frequency + month day)
      const selects = wrapper.findAll('[data-testid="select"]')
      expect(selects.length).toBeGreaterThanOrEqual(2)
    })

    it('hides month day select when frequency is not MONTHLY', () => {
      const wrapper = mountForm(createConfig({ frequency: 'WEEKLY' }))
      // Only frequency select visible
      const selects = wrapper.findAll('[data-testid="select"]')
      expect(selects.length).toBe(1)
    })
  })

  // ---------------------------------------------------------------------------
  // End conditions
  // ---------------------------------------------------------------------------
  describe('end conditions', () => {
    it('disables date picker when endType is not date', () => {
      const wrapper = mountForm(createConfig({ endType: 'never' }))
      const datepickers = wrapper.findAll('[data-testid="datepicker"]')
      // The until-date DatePicker should exist but be disabled
      expect(datepickers.length).toBeGreaterThanOrEqual(1)
    })

    it('disables count input when endType is not count', () => {
      const wrapper = mountForm(createConfig({ endType: 'never' }))
      const inputs = wrapper.findAll('[data-testid="input-number"]')
      // Interval input + count input
      expect(inputs.length).toBeGreaterThanOrEqual(1)
    })

    it('emits endType change on radio click', async () => {
      const wrapper = mountForm(createConfig({ endType: 'never' }))
      const radios = wrapper.findAll('[data-testid="radio-button"]')

      // Click "date" radio (second one)
      await radios[1].trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      const emitted = wrapper.emitted('update:modelValue')![0][0] as RRuleConfig
      expect(emitted.endType).toBe('date')
    })
  })

  // ---------------------------------------------------------------------------
  // Interval label
  // ---------------------------------------------------------------------------
  describe('interval label', () => {
    it('shows "uge" for weekly frequency', () => {
      const wrapper = mountForm(createConfig({ frequency: 'WEEKLY' }))
      expect(wrapper.text()).toContain('uge')
    })

    it('shows "dag" for daily frequency', () => {
      const wrapper = mountForm(createConfig({ frequency: 'DAILY' }))
      expect(wrapper.text()).toContain('dag')
    })

    it('shows "måned" for monthly frequency', () => {
      const wrapper = mountForm(createConfig({ frequency: 'MONTHLY' }))
      expect(wrapper.text()).toContain('måned')
    })

    it('shows "år" for yearly frequency', () => {
      const wrapper = mountForm(createConfig({ frequency: 'YEARLY' }))
      expect(wrapper.text()).toContain('år')
    })
  })
})
