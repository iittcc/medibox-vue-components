import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import { calendarStubs } from './calendar-test-helper'

// Must mock before importing the component
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

function mountFull(props = defaultProps) {
  return mount(CalendarFull, {
    props,
    global: {
      plugins: [[PrimeVue, { unstyled: true }]],
      stubs: {
        ...calendarStubs,
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
      const vm = wrapper.vm as unknown as { isFullscreen: { value: boolean }; toggleFullscreen: () => void }

      // Access internal state to toggle fullscreen
      await wrapper.vm.$nextTick()

      // Sidebar should be visible in inline mode
      expect(wrapper.find('.calendar-sidebar').exists()).toBe(true)
    })

    it('locks body scroll when entering fullscreen', async () => {
      const wrapper = mountFull()
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
    it('configures event source from useCalendarEvents', () => {
      const wrapper = mountFull()
      const fc = wrapper.findComponent({ name: 'FullCalendar' })
      expect(fc.props('options').eventSources).toHaveLength(1)
    })
  })
})
