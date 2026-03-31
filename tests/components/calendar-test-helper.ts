/**
 * What: Shared test helper for calendar component tests.
 * How: Provides mount utility with FullCalendar and Volt components stubbed.
 */
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { type Component } from 'vue'
import PrimeVue from 'primevue/config'
import type { CalendarEventData } from '@/composables/useCalendarEvents'

export const calendarEventServiceSpies = {
  fetchEvents: vi.fn(),
  saveEvent: vi.fn().mockResolvedValue(1),
  deleteEvent: vi.fn().mockResolvedValue(true)
}

// Mock useCalendarEvents composable
vi.mock('@/composables/useCalendarEvents', () => ({
  useCalendarEvents: vi.fn(() => ({
    fetchEvents: calendarEventServiceSpies.fetchEvents,
    saveEvent: calendarEventServiceSpies.saveEvent,
    deleteEvent: calendarEventServiceSpies.deleteEvent
  }))
}))

const fullCalendarStub = {
  name: 'FullCalendar',
  props: ['options'],
  template: `
    <div data-testid="fullcalendar" class="fc">
      <table>
        <thead>
          <tr>
            <th class="fc-col-header-cell" data-date="2026-03-15">
              <div class="fc-scrollgrid-sync-inner">
                <a class="fc-col-header-cell-cushion">15. mar.</a>
              </div>
            </th>
            <th class="fc-col-header-cell" data-date="2026-03-16">
              <div class="fc-scrollgrid-sync-inner">
                <a class="fc-col-header-cell-cushion">16. mar.</a>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="fc-daygrid-day" data-date="2026-03-15">
              <div class="fc-daygrid-day-top">
                <a class="fc-daygrid-day-number">15</a>
              </div>
            </td>
            <td class="fc-daygrid-day" data-date="2026-03-16">
              <div class="fc-daygrid-day-top">
                <a class="fc-daygrid-day-number">16</a>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  methods: {
    getApi() {
      return fullCalendarApi
    }
  }
}

export const fullCalendarApi = {
  getDate: vi.fn(() => new Date()),
  view: {
    activeStart: new Date('2026-03-01T00:00:00'),
    activeEnd: new Date('2026-03-31T23:59:59')
  },
  gotoDate: vi.fn(),
  updateSize: vi.fn(),
  refetchEvents: vi.fn(),
  unselect: vi.fn(),
  changeView: vi.fn(),
  setOption: vi.fn(),
  removeAllEvents: vi.fn(),
  addEvent: vi.fn(),
  removeAllEventSources: vi.fn(),
  addEventSource: vi.fn()
}

const dialogStub = {
  name: 'Dialog',
  props: ['visible', 'modal', 'header', 'closable', 'appendTo', 'style', 'pt'],
  emits: ['update:visible'],
  template: '<div v-if="visible" data-testid="dialog"><slot /><slot name="footer" /></div>'
}

const datePickerStub = {
  name: 'DatePicker',
  props: ['modelValue', 'inline', 'showWeek', 'firstDayOfWeek', 'dateFormat', 'disabled', 'timeOnly', 'stepMinute', 'showIcon', 'fluid', 'iconDisplay'],
  emits: ['update:modelValue', 'date-select', 'month-change'],
  template: '<div data-testid="datepicker"></div>'
}

const inputTextStub = {
  name: 'InputText',
  props: ['modelValue', 'placeholder', 'fluid', 'invalid'],
  emits: ['update:modelValue'],
  template: '<input data-testid="input-text" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
}

const textAreaStub = {
  name: 'TextArea',
  props: ['modelValue', 'autoResize'],
  emits: ['update:modelValue'],
  template: '<textarea data-testid="textarea"></textarea>'
}

const toggleButtonStub = {
  name: 'ToggleButton',
  props: ['modelValue', 'onLabel', 'offLabel'],
  emits: ['update:modelValue'],
  template: '<button data-testid="toggle-button" @click="$emit(\'update:modelValue\', !modelValue)">{{ modelValue ? onLabel : offLabel }}</button>'
}

const buttonStub = {
  name: 'Button',
  props: ['label', 'icon', 'type', 'disabled'],
  template: '<button data-testid="button" :data-label="label">{{ label }}</button>'
}

const secondaryButtonStub = {
  name: 'SecondaryButton',
  props: ['label', 'icon', 'severity', 'disabled'],
  template: '<button data-testid="secondary-button" :data-label="label">{{ label }}</button>'
}

const dangerButtonStub = {
  name: 'DangerButton',
  props: ['label'],
  template: '<button data-testid="danger-button" :data-label="label">{{ label }}</button>'
}

const recurrenceFormStub = {
  name: 'RecurrenceForm',
  props: ['modelValue', 'untilDate'],
  emits: ['update:modelValue', 'update:untilDate'],
  template: '<div data-testid="recurrence-form"></div>'
}

const editorStub = {
  name: 'Editor',
  props: ['modelValue', 'editorStyle'],
  emits: ['update:modelValue'],
  template: '<div data-testid="editor">{{ modelValue }}</div>'
}

const selectStub = {
  name: 'Select',
  props: ['modelValue', 'options', 'optionLabel', 'optionValue'],
  emits: ['update:modelValue'],
  template: '<select data-testid="select"></select>'
}

const inputNumberStub = {
  name: 'InputNumber',
  props: ['modelValue', 'min', 'max', 'showButtons', 'disabled'],
  emits: ['update:modelValue'],
  template: '<input data-testid="input-number" type="number" />'
}

const radioButtonStub = {
  name: 'RadioButton',
  props: ['modelValue', 'inputId', 'value'],
  emits: ['update:modelValue'],
  template: '<input data-testid="radio-button" type="radio" @click="$emit(\'update:modelValue\', value)" />'
}

export const calendarStubs = {
  FullCalendar: fullCalendarStub,
  Dialog: dialogStub,
  DatePicker: datePickerStub,
  InputText: inputTextStub,
  TextArea: textAreaStub,
  ToggleButton: toggleButtonStub,
  Button: buttonStub,
  SecondaryButton: secondaryButtonStub,
  DangerButton: dangerButtonStub,
  RecurrenceForm: recurrenceFormStub,
  Editor: editorStub,
  Select: selectStub,
  InputNumber: inputNumberStub,
  RadioButton: radioButtonStub,
  EventModal: {
    name: 'EventModal',
    props: ['visible', 'event', 'mode', 'editable', 'calendarId', 'groupId', 'fullscreen'],
    emits: ['update:visible', 'save', 'delete'],
    template: '<div v-if="visible" data-testid="event-modal"></div>'
  },
  Teleport: { template: '<div><slot /></div>' },
  Transition: { template: '<div><slot /></div>' }
}

export function mountCalendar(component: Component, props?: Record<string, unknown>) {
  return mount(component, {
    props,
    global: {
      plugins: [[PrimeVue, { unstyled: true }]],
      stubs: calendarStubs
    }
  })
}

export function createTestEvent(overrides: Partial<CalendarEventData> = {}): CalendarEventData {
  return {
    calendarId: 5,
    groupId: 50000,
    start: '2026-03-26T09:00:00',
    end: '2026-03-26T10:00:00',
    allDay: false,
    title: 'Test Event',
    location: 'Room 101',
    description: 'Test description',
    rrule: null,
    untilDate: null,
    parentEventId: null,
    ...overrides
  }
}

export function createTestEventWithId(overrides: Partial<CalendarEventData> = {}): CalendarEventData {
  return createTestEvent({ id: '42', ...overrides })
}
