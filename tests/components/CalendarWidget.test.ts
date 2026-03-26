import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import { calendarStubs } from './calendar-test-helper'

const mockFetchEvents = vi.fn()
const mockSaveEvent = vi.fn().mockResolvedValue(1)
const mockDeleteEvent = vi.fn().mockResolvedValue(true)

vi.mock('@/composables/useCalendarEvents', () => ({
  useCalendarEvents: vi.fn(() => ({
    fetchEvents: mockFetchEvents,
    saveEvent: mockSaveEvent,
    deleteEvent: mockDeleteEvent
  }))
}))

vi.mock('@fullcalendar/vue3', () => ({
  default: calendarStubs.FullCalendar
}))

import CalendarWidget from '@/CalendarWidget.vue'
import { useCalendarEvents } from '@/composables/useCalendarEvents'

const defaultProps = {
  calendarId: 5,
  groupId: 50000,
  editable: true,
  baseUrl: 'http://localhost:1011/'
}

function mountWidget(props = defaultProps) {
  return mount(CalendarWidget, {
    props,
    global: {
      plugins: [[PrimeVue, { unstyled: true }]],
      stubs: calendarStubs
    }
  })
}

describe('CalendarWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  describe('rendering', () => {
    it('renders FullCalendar component', () => {
      const wrapper = mountWidget()
      expect(wrapper.find('[data-testid="fullcalendar"]').exists()).toBe(true)
    })

    it('does not render sidebar DatePicker (widget has no sidebar)', () => {
      const wrapper = mountWidget()
      expect(wrapper.find('.calendar-sidebar').exists()).toBe(false)
    })

    it('renders EventModal (hidden by default)', () => {
      const wrapper = mountWidget()
      expect(wrapper.find('[data-testid="event-modal"]').exists()).toBe(false)
    })

    it('initializes useCalendarEvents with props', () => {
      mountWidget()
      expect(useCalendarEvents).toHaveBeenCalledWith(
        defaultProps.baseUrl,
        defaultProps.calendarId,
        defaultProps.groupId
      )
    })
  })

  // ---------------------------------------------------------------------------
  // Calendar configuration
  // ---------------------------------------------------------------------------
  describe('configuration', () => {
    it('uses listMonth as initial view', () => {
      const wrapper = mountWidget()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      expect(fc.props('options').initialView).toBe('listNext180')
    })

    it('configures Danish locale', () => {
      const wrapper = mountWidget()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      expect(fc.props('options').locale.code).toBe('da')
    })

    it('passes editable prop to options', () => {
      const wrapper = mountWidget({ ...defaultProps, editable: false })
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      expect(fc.props('options').editable).toBe(false)
    })
  })
})
