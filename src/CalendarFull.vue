<template>
  <div class="medical-calculator-container" ref="containerRef">
    <!-- Toast notification -->
    <Transition name="toast">
      <div v-if="toastMessage" :class="['calendar-toast', toastIsError ? 'calendar-toast--error' : '']">
        <span>{{ toastMessage }}</span>
        <button v-if="toastUndoFn" class="calendar-toast-undo" @click="handleUndo">Fortryd</button>
      </div>
    </Transition>

    <!-- Fullscreen modal backdrop -->
    <Transition name="modal">
      <div v-if="isFullscreen" class="modal-backdrop" @click.self="toggleFullscreen"></div>
    </Transition>

    <!-- Single calendar container — switches between inline and modal via CSS -->
    <div :class="isFullscreen ? 'modal-panel' : 'calendar-layout'">
      <div v-if="!isFullscreen" class="calendar-sidebar">
        <DatePicker
          v-model="navigatorDate"
          inline
          showWeek
          :firstDayOfWeek="1"
          @update:modelValue="onNavigatorDateChange"
        />
      </div>
      <div :class="isFullscreen ? 'modal-body' : 'calendar-main'" ref="calendarMainRef">
        <div v-if="isFullscreen" class="modal-header">
          <button type="button" @click="toggleFullscreen" class="modal-close" aria-label="Luk fuldskærm">
            <svg class="modal-close-icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <FullCalendar :options="calendarOptions" ref="calendarRef" />
      </div>
    </div>

    <EventModal
      v-model:visible="modalVisible"
      :event="selectedEvent"
      :mode="modalMode"
      :editable="props.editable"
      :calendar-id="props.calendarId"
      :group-id="props.groupId"
      :fullscreen="isFullscreen"
      @save="handleSave"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * What: Full calendar view wrapping FullCalendar with event modal integration.
 * How: Configures FullCalendar with multiple views (month, week, day, list, year),
 *      Danish locale, and connects to the backend via useCalendarEvents composable.
 */

import { ref, reactive, nextTick, watch, onMounted, onUnmounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import multiMonthPlugin from '@fullcalendar/multimonth'
import type { CalendarOptions, DateSelectArg, EventClickArg, EventDropArg, EventInput } from '@fullcalendar/core'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'
import daLocale from '@fullcalendar/core/locales/da'
import EventModal from '@/components/calendar/EventModal.vue'
import DatePicker from '@/volt/DatePicker.vue'
import { useCalendarEvents } from '@/composables/useCalendarEvents'
import type { CalendarEventData } from '@/composables/useCalendarEvents'

const props = defineProps<{
  calendarId: number
  groupId: number
  editable: boolean
  baseUrl: string
}>()

const events = useCalendarEvents(props.baseUrl, props.calendarId, props.groupId)

const containerRef = ref<HTMLElement>()
const calendarRef = ref<InstanceType<typeof FullCalendar>>()
const calendarMainRef = ref<HTMLElement>()
const isFullscreen = ref(false)
const navigatorDate = ref<Date>(new Date())
const modalVisible = ref(false)
const modalMode = ref<'create' | 'edit' | 'view'>('create')
const selectedEvent = ref<CalendarEventData | null>(null)
const toastMessage = ref('')
const toastIsError = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null
let toastUndoFn: (() => void) | null = null

function showToast(message: string, options?: { error?: boolean; undo?: () => void }) {
  toastMessage.value = message
  toastIsError.value = options?.error ?? false
  toastUndoFn = options?.undo ?? null
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { dismissToast() }, 5000)
}

function dismissToast() {
  toastMessage.value = ''
  toastUndoFn = null
}

function handleUndo() {
  if (toastUndoFn) toastUndoFn()
  dismissToast()
}

/**
 * What: Retrieves the FullCalendar API instance.
 * How: Accesses the ref and calls getApi() on the FullCalendar component.
 */
function getApi() {
  return calendarRef.value?.getApi()
}

function applyCalendarEvents(fetchedEvents: EventInput[]) {
  const api = getApi()
  if (!api) return

  api.removeAllEvents()
  for (const calendarEvent of fetchedEvents) {
    api.addEvent(calendarEvent)
  }
}

function loadEvents(start: Date, end: Date) {
  events.fetchEvents(
    {
      start,
      end,
      startStr: start.toISOString(),
      endStr: end.toISOString(),
      timeZone: 'local'
    },
    applyCalendarEvents,
    (error) => { console.error('Failed to fetch calendar events:', error) }
  )
}

/**
 * What: Forces FullCalendar to re-fetch events from the backend.
 * How: Loads the active date range explicitly and replaces the mounted events
 *      through the Calendar API so the UI updates immediately.
 */

function refetchCalendar() {
  const api = getApi()
  if (!api) return

  loadEvents(api.view.activeStart, api.view.activeEnd)
}

/**
 * What: Navigates FullCalendar to the date selected in the inline DatePicker.
 * How: Determines slide direction by comparing old and new dates, applies a
 *      CSS slide animation, then calls gotoDate on the FullCalendar API.
 */
function onNavigatorDateChange(value: Date | null) {
  if (!value) return
  const api = getApi()
  if (!api) return

  // Why: Compare against current FullCalendar date to determine slide direction
  const currentDate = api.getDate()
  const goingForward = value.getTime() > currentDate.getTime()

  nudgeCalendar(goingForward)
  api.gotoDate(value)
}

/**
 * What: Plays a subtle slide animation on the calendar to signal a date change.
 * How: Applies a CSS class that translates the element, then removes it after
 *      the transition completes.
 */
function nudgeCalendar(forward: boolean) {
  const el = calendarMainRef.value
  if (!el) return

  const cls = forward ? 'nudge-left' : 'nudge-right'
  el.classList.remove('nudge-left', 'nudge-right')
  // Why: Force reflow so the animation restarts even if the same direction
  void el.offsetWidth
  el.classList.add(cls)
  el.addEventListener('animationend', () => el.classList.remove(cls), { once: true })
}

/**
 * What: Syncs the inline DatePicker when FullCalendar navigates.
 * How: Updates navigatorDate from the datesSet callback so the
 *      DatePicker highlights the current month/date.
 */
function syncNavigatorDate(info: { view: { currentStart: Date } }) {
  navigatorDate.value = new Date(info.view.currentStart)
}

/**
 * What: Toggles the calendar into a full-window modal overlay.
 * How: Toggles the isFullscreen ref which adds a fixed-position CSS class,
 *      then triggers a FullCalendar resize so it fills the new space.
 */
function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  document.body.style.overflow = isFullscreen.value ? 'hidden' : ''
  // Why: FullCalendar is conditionally rendered (v-if) so after toggling,
  // we need to wait for the new instance to mount before updating size
  nextTick(() => {
    updateFullscreenButtonText()
    getApi()?.updateSize()
  })
}

function onEscapeKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

watch(isFullscreen, (val) => {
  if (val) {
    document.addEventListener('keydown', onEscapeKey)
  } else {
    document.removeEventListener('keydown', onEscapeKey)
  }
})

function updateFullscreenButtonText() {
  const container = calendarRef.value?.$el as HTMLElement | undefined
  if (!container) return
  const btn = container.querySelector('.fc-fullscreen-button') as HTMLElement | null
  if (btn) {
    btn.textContent = isFullscreen.value ? 'Luk fuldskærm' : 'Fuldskærm'
  }
}

/**
 * What: Formats a Date to YYYY-MM-DD string.
 * How: Pads month and day to 2 digits from the local date parts.
 *
 * @param d - Date to format
 * @returns Date string in YYYY-MM-DD format
 */
function toDateString(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * What: Handles date range selection to create a new event.
 * How: Builds a CalendarEventData from the selectInfo and opens the modal
 *      in create mode. For all-day events, adjusts the end date by subtracting
 *      one day since FullCalendar uses exclusive end dates.
 */
function handleSelect(selectInfo: DateSelectArg) {
  let endDate: string
  if (selectInfo.allDay) {
    // Why: FullCalendar uses exclusive end dates for all-day selections,
    // so we subtract one day to get the inclusive end date for display
    const end = new Date(selectInfo.end)
    end.setDate(end.getDate() - 1)
    endDate = toDateString(end)
  } else {
    endDate = selectInfo.endStr
  }

  selectedEvent.value = {
    calendarId: props.calendarId,
    groupId: props.groupId,
    start: selectInfo.allDay ? toDateString(selectInfo.start) : selectInfo.startStr,
    end: endDate,
    allDay: selectInfo.allDay,
    title: '',
    location: '',
    description: '',
    rrule: null,
    untilDate: null,
    parentEventId: null
  }
  modalMode.value = 'create'
  modalVisible.value = true

  // Why: Unselect the date range so the highlight disappears
  const api = getApi()
  if (api) api.unselect()
}

/**
 * What: Handles clicking on an existing event to view it.
 * How: Extracts CalendarEventData from the clicked event's properties
 *      and extended props, then opens the modal in view mode.
 */
function handleEventClick(info: EventClickArg) {
  const event = info.event
  const ext = event.extendedProps

  // Why: FullCalendar uses exclusive end dates for all-day events, so we
  // subtract one day to get the inclusive end date for the edit form.
  // Without this, each edit adds an extra day (MED-1200).
  let endStr = event.endStr || event.startStr
  if (event.allDay && event.end) {
    const end = new Date(event.end)
    end.setDate(end.getDate() - 1)
    endStr = toDateString(end)
  }

  selectedEvent.value = {
    id: event.id,
    calendarId: props.calendarId,
    groupId: props.groupId,
    start: event.startStr,
    end: endStr,
    allDay: event.allDay,
    title: event.title,
    location: ext.location || '',
    description: ext.description || '',
    rrule: ext.rrule || null,
    untilDate: ext.until_date || null,
    parentEventId: ext.parent_event_id || null
  }
  modalMode.value = 'view'
  modalVisible.value = true
}

/**
 * What: Handles drag-and-drop event repositioning.
 * How: Prompts the user for confirmation in Danish. On confirm, saves the
 *      updated event times. On cancel, reverts the drag.
 */
async function handleEventDrop(info: EventDropArg) {
  const event = info.event
  const ext = event.extendedProps
  // Why: Capture old position before save so undo can restore it
  const oldStart = info.oldEvent.startStr
  const oldEnd = info.oldEvent.endStr || info.oldEvent.startStr

  const data: CalendarEventData = {
    id: event.id,
    calendarId: props.calendarId,
    groupId: props.groupId,
    start: event.startStr,
    end: event.endStr || event.startStr,
    allDay: event.allDay,
    title: event.title,
    location: ext.location || '',
    description: ext.description || '',
    rrule: ext.rrule || null,
    untilDate: ext.until_date || null,
    parentEventId: ext.parent_event_id || null
  }

  try {
    await events.saveEvent(data)
    refetchCalendar()
    showToast('Begivenheden er flyttet', {
      undo: async () => {
        await events.saveEvent({ ...data, start: oldStart, end: oldEnd })
        refetchCalendar()
      }
    })
  } catch {
    info.revert()
    showToast('Kunne ikke flytte begivenheden', { error: true })
  }
}

/**
 * What: Handles event resize (duration change).
 * How: Saves the updated event times. On failure, reverts the resize.
 */
async function handleEventResize(info: EventResizeDoneArg) {
  const event = info.event
  const ext = event.extendedProps
  const oldEnd = info.oldEvent.endStr || info.oldEvent.startStr

  const data: CalendarEventData = {
    id: event.id,
    calendarId: props.calendarId,
    groupId: props.groupId,
    start: event.startStr,
    end: event.endStr || event.startStr,
    allDay: event.allDay,
    title: event.title,
    location: ext.location || '',
    description: ext.description || '',
    rrule: ext.rrule || null,
    untilDate: ext.until_date || null,
    parentEventId: ext.parent_event_id || null
  }

  try {
    await events.saveEvent(data)
    refetchCalendar()
    showToast('Begivenheden er opdateret', {
      undo: async () => {
        await events.saveEvent({ ...data, end: oldEnd })
        refetchCalendar()
      }
    })
  } catch {
    info.revert()
    showToast('Kunne ikke opdatere begivenheden', { error: true })
  }
}

/**
 * What: Adds visual indicators to rendered events.
 * How: Applies 'past-event' CSS class to events that have already ended,
 *      and sets a tooltip with the event title and time.
 */
function handleEventDidMount(info: { event: { start: Date | null; end: Date | null; allDay: boolean; title: string; extendedProps: Record<string, unknown> }; el: HTMLElement }) {
  const now = new Date()
  if (info.event.end && info.event.end < now) {
    info.el.classList.add('past-event')
  }

  const ev = info.event
  const ext = ev.extendedProps
  const timeOpts: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' }
  const dateOpts: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' }

  // Build tooltip lines
  const lines: string[] = [ev.title]

  // Date/time
  if (ev.start) {
    const startDate = ev.start.toLocaleDateString('da-DK', dateOpts)
    const endDate = ev.end ? ev.end.toLocaleDateString('da-DK', dateOpts) : startDate
    if (ev.allDay) {
      lines.push(startDate === endDate ? startDate : `${startDate} — ${endDate}`)
    } else {
      const startTime = ev.start.toLocaleTimeString('da-DK', timeOpts)
      const endTime = ev.end ? ev.end.toLocaleTimeString('da-DK', timeOpts) : ''
      if (startDate === endDate) {
        lines.push(`${startDate}  ${startTime} — ${endTime}`)
      } else {
        lines.push(`${startDate} ${startTime} — ${endDate} ${endTime}`)
      }
    }
  }

  if (ext.location) lines.push(`Sted: ${ext.location}`)
  if (ext.description) {
    const plain = String(ext.description).replace(/<[^>]*>/g, '').trim()
    if (plain) lines.push(plain.length > 120 ? plain.substring(0, 120) + '...' : plain)
  }
  if (ext.rrule) lines.push('Gentages')

  // Why: PrimeVue Tooltip directive bound programmatically because FullCalendar
  // renders event elements outside Vue's template system.
   
  //const dir = Tooltip as any
  //if (dir.mounted) {
  //  dir.mounted(info.el, { value: { value: lines.join('<br>'), escape: false }, modifiers: { top: true } })
  //}
}

/**
 * What: Shows or hides the custom year view buttons based on current view.
 * How: Queries the DOM for yearGrid and yearStack buttons and toggles
 *      their display style based on whether the current view is multiMonthYear.
 */
function handleDatesSet(info: { view: { type: string; currentStart: Date; activeStart: Date; activeEnd: Date } }) {
  const container = calendarRef.value?.$el as HTMLElement | undefined
  if (!container) return

  const yearGridBtn = container.querySelector('.fc-yearGrid-button') as HTMLElement | null
  const yearStackBtn = container.querySelector('.fc-yearStack-button') as HTMLElement | null
  const isYearView = info.view.type === 'multiMonthYear'

  if (yearGridBtn) {
    yearGridBtn.style.display = isYearView ? 'inline-block' : 'none'
  }
  if (yearStackBtn) {
    yearStackBtn.style.display = isYearView ? 'inline-block' : 'none'
  }

  // Why: Keep the inline DatePicker in sync when the user navigates
  // FullCalendar via prev/next buttons or view changes
  syncNavigatorDate(info)

  // Why: FullCalendar re-renders toolbar buttons on navigation, resetting
  // the fullscreen button text to the default. Re-apply the correct label.
  updateFullscreenButtonText()

  loadEvents(info.view.activeStart, info.view.activeEnd)

}

const isMobile = ref(window.innerWidth <= 992)

function onResize() {
  const wasMobile = isMobile.value
  isMobile.value = window.innerWidth <= 992
  if (wasMobile !== isMobile.value) {
    calendarOptions.height = isMobile.value ? 700 : 800;
  }
}

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

// Why: Reactive options object ensures FullCalendar re-renders when
// configuration values change (e.g. editable toggled)
const calendarOptions = reactive<CalendarOptions>({
  height: isMobile.value ? 700 : 800,
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin, multiMonthPlugin],
  locale: daLocale,
  firstDay: 1,
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today fullscreen',
    center: 'title',
    right: 'yearGrid,yearStack multiMonthYear,dayGridMonth,timeGridWeek,timeGridDay,listMonth'
  },
  buttonText: {
    today: 'I dag',
    year: 'År',
    month: 'Måned',
    week: 'Uge',
    day: 'Dag',
    list: 'Liste'
  },
  customButtons: {
    yearGrid: {
      text: 'Grid',
      click: () => {
        const api = getApi()
        if (!api) return
        // Why: Setting multiMonthMaxColumns before changing view ensures
        // the 3-column grid layout is applied when the view renders
        api.setOption('multiMonthMaxColumns' as keyof CalendarOptions, 3)
        api.changeView('multiMonthYear')
      }
    },
    yearStack: {
      text: 'Stak',
      click: () => {
        const api = getApi()
        if (!api) return
        // Why: Single column gives a stacked vertical layout for the year
        api.setOption('multiMonthMaxColumns' as keyof CalendarOptions, 1)
        api.changeView('multiMonthYear')
      }
    },
    fullscreen: {
      text: 'Fuldskærm',
      click: toggleFullscreen
    }
  },
  weekNumbers: true,
  weekNumberFormat: { week: 'numeric' },
  editable: props.editable,
  selectable: props.editable,
  selectMirror: props.editable,
  dayMaxEventRows: true,
  nowIndicator: true,
  navLinks: true,
  views: {
    multiMonthYear: {
      multiMonthMaxColumns: 3
    }
  },
  events: [] as EventInput[],
  select: handleSelect,
  eventClick: handleEventClick,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  eventDidMount: handleEventDidMount,
  datesSet: handleDatesSet
})

/**
 * What: Handles saving an event from the modal.
 * How: Calls the backend saveEvent, then refetches all events to ensure
 *      the calendar reflects the latest state (handles both regular and
 *      recurring events correctly).
 */
async function handleSave(data: CalendarEventData) {
  try {
    await events.saveEvent(data)
    // Why: Wait for Vue to process the modal close (visible=false) before
    // refetching, ensuring the FullCalendar ref is stable
    await nextTick()
    refetchCalendar()
    showToast('Begivenheden er gemt')
  } catch (error) {
    console.error('Failed to save event:', error)
    showToast(error instanceof Error ? error.message : 'Kunne ikke gemme begivenheden', { error: true })
  }
}

/**
 * What: Handles deleting an event from the modal.
 * How: Calls the backend deleteEvent, then refetches all events.
 *      Refetch is used instead of local removal to correctly handle
 *      recurring event series deletion.
 */
async function handleDelete(id: string | number) {
  try {
    await events.deleteEvent(id)
    await nextTick()
    refetchCalendar()
    showToast('Begivenheden er slettet')
  } catch (error) {
    console.error('Failed to delete event:', error)
    showToast('Kunne ikke slette begivenheden', { error: true })
  }
}
</script>

<style scoped>
.calendar-layout {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.calendar-sidebar {
  flex-shrink: 0;
  transform: scale(0.8);
  transform-origin: top left;
  margin-right: -40px !important;
}

@media (max-width: 992px) {
  .calendar-sidebar {
    display: none;
  }
}

.calendar-main {
  flex: 1;
  min-width: 0;
}

@keyframes slide-from-right {
  0% { transform: translateX(12px); opacity: 0.1; }
  100% { transform: translateX(0); opacity: 1; }
}

@keyframes slide-from-left {
  0% { transform: translateX(-12px); opacity: 0.1; }
  100% { transform: translateX(0); opacity: 1; }
}

.nudge-left {
  animation: slide-from-right 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.nudge-right {
  animation: slide-from-left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Fullscreen modal styles are in calendar.css (unscoped) */
</style>
