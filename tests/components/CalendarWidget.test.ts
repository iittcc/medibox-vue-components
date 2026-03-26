import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import { calendarEventServiceSpies, calendarStubs, createTestEvent, fullCalendarApi } from './calendar-test-helper'

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
const { EventModal: _eventModalStub, ...calendarStubsWithoutEventModal } = calendarStubs

function mountWidget(props = defaultProps) {
  return mount(CalendarWidget, {
    props,
    global: {
      plugins: [[PrimeVue, { unstyled: true }]],
      stubs: calendarStubsWithoutEventModal
    }
  })
}

describe('CalendarWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    calendarEventServiceSpies.fetchEvents.mockImplementation(() => {})
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

    it('refreshes the mounted event source after saving an event', async () => {
      calendarEventServiceSpies.fetchEvents.mockImplementationOnce((_info, successCb) => {
        successCb([{ id: '42', title: 'Widget event', start: '2026-03-26T09:00:00', end: '2026-03-26T10:00:00' }])
      })

      const wrapper = mountWidget()
      const eventModal = wrapper.findComponent({ name: 'EventModal' })

      await eventModal.vm.$emit('save', createTestEvent())
      await flushPromises()

      expect(calendarEventServiceSpies.fetchEvents).toHaveBeenCalledTimes(1)
      expect(fullCalendarApi.removeAllEvents).toHaveBeenCalledTimes(1)
      expect(fullCalendarApi.addEvent).toHaveBeenCalledWith(
        expect.objectContaining({ id: '42', title: 'Widget event' })
      )
    })
  })
})
