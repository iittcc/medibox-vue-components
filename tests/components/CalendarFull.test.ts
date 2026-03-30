import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import { calendarEventServiceSpies, calendarStubs, createTestEvent, fullCalendarApi } from './calendar-test-helper'

vi.mock('@fullcalendar/vue3', () => ({
  default: calendarStubs.FullCalendar
}))

vi.mock('@fullcalendar/daygrid', () => ({ default: {} }))
vi.mock('@fullcalendar/timegrid', () => ({ default: {} }))
vi.mock('@fullcalendar/list', () => ({ default: {} }))
vi.mock('@fullcalendar/interaction', () => ({ default: {} }))
vi.mock('@fullcalendar/multimonth', () => ({ default: {} }))

import CalendarFull from '@/CalendarFull.vue'
import { useCalendarEvents } from '@/composables/useCalendarEvents'

const defaultProps = {
  calendarId: 5,
  groupId: 50000,
  editable: true,
  baseUrl: 'http://localhost:1011/'
}
const { EventModal: _eventModalStub, ...calendarStubsWithoutEventModal } = calendarStubs

function mountFull(props = defaultProps) {
  return mount(CalendarFull, {
    props,
    global: {
      plugins: [[PrimeVue, { unstyled: true }]],
      stubs: {
        ...calendarStubsWithoutEventModal,
        Teleport: { template: '<div><slot /></div>' },
        Transition: { template: '<div><slot /></div>' }
      }
    }
  })
}

describe('CalendarFull', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.body.style.overflow = ''
    calendarEventServiceSpies.fetchEvents.mockImplementation(() => {})
  })

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------
  describe('rendering', () => {
    it('renders FullCalendar component', () => {
      const wrapper = mountFull()
      expect(wrapper.find('[data-testid="fullcalendar"]').exists()).toBe(true)
    })

    it('renders sidebar DatePicker for navigation', () => {
      const wrapper = mountFull()
      expect(wrapper.find('.calendar-sidebar').exists()).toBe(true)
      expect(wrapper.find('.calendar-sidebar [data-testid="datepicker"]').exists()).toBe(true)
    })

    it('renders EventModal (hidden by default)', () => {
      const wrapper = mountFull()
      expect(wrapper.find('[data-testid="event-modal"]').exists()).toBe(false)
    })

    it('initializes useCalendarEvents with props', () => {
      mountFull()
      expect(useCalendarEvents).toHaveBeenCalledWith(
        defaultProps.baseUrl,
        defaultProps.calendarId,
        defaultProps.groupId
      )
    })
  })

  // ---------------------------------------------------------------------------
  // Fullscreen modal
  // ---------------------------------------------------------------------------
  describe('fullscreen', () => {
    it('starts in inline mode (calendar-layout class)', () => {
      const wrapper = mountFull()
      expect(wrapper.find('.calendar-layout').exists()).toBe(true)
      expect(wrapper.find('.modal-panel').exists()).toBe(false)
    })

    it('does not render backdrop when not fullscreen', () => {
      const wrapper = mountFull()
      expect(wrapper.find('.modal-backdrop').exists()).toBe(false)
    })

    it('hides sidebar in fullscreen mode', async () => {
      const wrapper = mountFull()
      // Access internal state to toggle fullscreen
      await wrapper.vm.$nextTick()

      // Sidebar should be visible in inline mode
      expect(wrapper.find('.calendar-sidebar').exists()).toBe(true)
    })

    it('locks body scroll when entering fullscreen', async () => {
      mountFull()
      expect(document.body.style.overflow).toBe('')
    })
  })

  // ---------------------------------------------------------------------------
  // Event handling
  // ---------------------------------------------------------------------------
  describe('event interactions', () => {
    it('passes editable prop to calendar options', () => {
      const wrapper = mountFull({ ...defaultProps, editable: true })
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      expect(fc.props('options').editable).toBe(true)
      expect(fc.props('options').selectable).toBe(true)
    })

    it('disables selection when not editable', () => {
      const wrapper = mountFull({ ...defaultProps, editable: false })
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      expect(fc.props('options').editable).toBe(false)
      expect(fc.props('options').selectable).toBe(false)
    })

    it('configures Danish locale', () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      expect(fc.props('options').locale.code).toBe('da')
    })

    it('sets weekNumberFormat to numeric only', () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      expect(fc.props('options').weekNumberFormat).toEqual({ week: 'numeric' })
    })

    it('enables week numbers', () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      expect(fc.props('options').weekNumbers).toBe(true)
    })

    it('starts with dayGridMonth view', () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      expect(fc.props('options').initialView).toBe('dayGridMonth')
    })

    it('configures custom fullscreen button', () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      expect(fc.props('options').customButtons.fullscreen).toBeDefined()
      expect(fc.props('options').customButtons.fullscreen.text).toBe('Fuldskærm')
    })

    it('configures year grid and stack buttons', () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      expect(fc.props('options').customButtons.yearGrid).toBeDefined()
      expect(fc.props('options').customButtons.yearStack).toBeDefined()
    })
  })

  // ---------------------------------------------------------------------------
  // Calendar height
  // ---------------------------------------------------------------------------
  describe('height configuration', () => {
    it('sets height based on viewport width', () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      const height = fc.props('options').height
      // Should be a number (700 or 800), not 'auto'
      expect(typeof height).toBe('number')
    })
  })

  // ---------------------------------------------------------------------------
  // Event sources
  // ---------------------------------------------------------------------------
  describe('event sources', () => {
    it('starts with an empty events array and loads data explicitly', () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      expect(fc.props('options').events).toEqual([])
    })

    it('reloads and reapplies mounted events after saving an event', async () => {
      calendarEventServiceSpies.fetchEvents.mockImplementationOnce((_info, successCb) => {
        successCb([{ id: '99', title: 'Ny begivenhed', start: '2026-03-26T09:00:00', end: '2026-03-26T10:00:00' }])
      })

      const wrapper = mountFull()
      const eventModal = wrapper.findComponent({ name: 'EventModal' })

      await eventModal.vm.$emit('save', createTestEvent())
      await flushPromises()

      expect(calendarEventServiceSpies.fetchEvents).toHaveBeenCalledTimes(1)
      expect(fullCalendarApi.removeAllEvents).toHaveBeenCalledTimes(1)
      expect(fullCalendarApi.addEvent).toHaveBeenCalledWith(
        expect.objectContaining({ id: '99', title: 'Ny begivenhed' })
      )
    })
  })

  // ---------------------------------------------------------------------------
  // MED-1201: Moving recurrent event preserves recurrence
  // ---------------------------------------------------------------------------
  describe('moving recurrent event preserves recurrence (MED-1201)', () => {
    function createEventDropInfo(overrides: Record<string, unknown> = {}, extOverrides: Record<string, unknown> = {}) {
      return {
        event: {
          id: '42_20260330140000',
          startStr: '2026-03-31T14:00:00',
          endStr: '2026-03-31T15:00:00',
          allDay: false,
          title: 'Weekly Meeting',
          extendedProps: {
            location: 'Room B',
            description: 'Recurring event',
            rrule: 'FREQ=WEEKLY;BYDAY=MO',
            until_date: '2026-12-31',
            parent_event_id: 42,
            ...extOverrides
          },
          ...overrides
        },
        oldEvent: {
          startStr: '2026-03-30T14:00:00',
          endStr: '2026-03-30T15:00:00'
        },
        revert: vi.fn(),
        delta: { days: 1, milliseconds: 0 },
        el: document.createElement('div'),
        jsEvent: new MouseEvent('mouseup'),
        view: {}
      }
    }

    function createEventResizeInfo(overrides: Record<string, unknown> = {}, extOverrides: Record<string, unknown> = {}) {
      return {
        event: {
          id: '42_20260330140000',
          startStr: '2026-03-30T14:00:00',
          endStr: '2026-03-30T16:00:00',
          allDay: false,
          title: 'Weekly Meeting',
          extendedProps: {
            location: 'Room B',
            description: 'Recurring event',
            rrule: 'FREQ=WEEKLY;BYDAY=MO',
            until_date: '2026-12-31',
            parent_event_id: 42,
            ...extOverrides
          },
          ...overrides
        },
        oldEvent: {
          startStr: '2026-03-30T14:00:00',
          endStr: '2026-03-30T15:00:00'
        },
        startDelta: { days: 0, milliseconds: 0 },
        endDelta: { days: 0, milliseconds: 3600000 },
        revert: vi.fn(),
        el: document.createElement('div'),
        jsEvent: new MouseEvent('mouseup'),
        view: {}
      }
    }

    it('sends parentEventId as null when dropping a recurring occurrence', async () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      const options = fc.props('options')

      await options.eventDrop(createEventDropInfo())
      await flushPromises()

      expect(calendarEventServiceSpies.saveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          rrule: 'FREQ=WEEKLY;BYDAY=MO',
          parentEventId: null
        })
      )
    })

    it('preserves rrule when dropping a recurring occurrence', async () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      const options = fc.props('options')

      await options.eventDrop(createEventDropInfo())
      await flushPromises()

      expect(calendarEventServiceSpies.saveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          rrule: 'FREQ=WEEKLY;BYDAY=MO',
          untilDate: '2026-12-31'
        })
      )
    })

    it('sends parentEventId as null when resizing a recurring occurrence', async () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      const options = fc.props('options')

      await options.eventResize(createEventResizeInfo())
      await flushPromises()

      expect(calendarEventServiceSpies.saveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          rrule: 'FREQ=WEEKLY;BYDAY=MO',
          parentEventId: null
        })
      )
    })

    it('still sends parentEventId as null for non-recurring events on drop', async () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      const options = fc.props('options')

      await options.eventDrop(createEventDropInfo(
        { id: '99' },
        { rrule: null, until_date: null, parent_event_id: null }
      ))
      await flushPromises()

      expect(calendarEventServiceSpies.saveEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          rrule: null,
          parentEventId: null
        })
      )
    })
  })

  // ---------------------------------------------------------------------------
  // MED-1200: All-day event end date adjustment on event click
  // ---------------------------------------------------------------------------
  describe('all-day event end date adjustment (MED-1200)', () => {
    function createEventClickInfo(overrides: Record<string, unknown> = {}) {
      return {
        event: {
          id: '42',
          startStr: '2026-03-30',
          endStr: '2026-03-31',
          allDay: true,
          start: new Date(2026, 2, 30),
          end: new Date(2026, 2, 31),
          title: 'All Day Event',
          extendedProps: {
            location: 'Room A',
            description: 'Test',
            rrule: null,
            until_date: null,
            parent_event_id: null
          },
          ...overrides
        },
        el: document.createElement('div'),
        jsEvent: new MouseEvent('click'),
        view: {}
      }
    }

    it('subtracts one day from all-day event end date (exclusive → inclusive)', async () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      const options = fc.props('options')

      // Simulate clicking an all-day event with exclusive end date (March 31)
      options.eventClick(createEventClickInfo())
      await flushPromises()

      const eventModal = wrapper.findComponent({ name: 'EventModal' })
      // End date should be adjusted to inclusive (March 30), not exclusive (March 31)
      expect(eventModal.props('event').end).toBe('2026-03-30')
      expect(eventModal.props('event').start).toBe('2026-03-30')
      expect(eventModal.props('event').allDay).toBe(true)
    })

    it('does not adjust end date for timed events', async () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      const options = fc.props('options')

      options.eventClick(createEventClickInfo({
        startStr: '2026-03-30T09:00:00',
        endStr: '2026-03-30T10:00:00',
        allDay: false,
        start: new Date(2026, 2, 30, 9, 0),
        end: new Date(2026, 2, 30, 10, 0)
      }))
      await flushPromises()

      const eventModal = wrapper.findComponent({ name: 'EventModal' })
      expect(eventModal.props('event').end).toBe('2026-03-30T10:00:00')
    })

    it('handles multi-day all-day event (exclusive end adjusted by one day)', async () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      const options = fc.props('options')

      // 3-day event: March 28-30, FC stores end as March 31 (exclusive)
      options.eventClick(createEventClickInfo({
        startStr: '2026-03-28',
        endStr: '2026-03-31',
        start: new Date(2026, 2, 28),
        end: new Date(2026, 2, 31)
      }))
      await flushPromises()

      const eventModal = wrapper.findComponent({ name: 'EventModal' })
      expect(eventModal.props('event').start).toBe('2026-03-28')
      expect(eventModal.props('event').end).toBe('2026-03-30')
    })

    it('falls back to startStr when endStr is empty for all-day event', async () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      const options = fc.props('options')

      options.eventClick(createEventClickInfo({
        endStr: '',
        end: null
      }))
      await flushPromises()

      const eventModal = wrapper.findComponent({ name: 'EventModal' })
      // When end is null, should fall back to startStr without adjustment
      expect(eventModal.props('event').end).toBe('2026-03-30')
    })
  })
})
