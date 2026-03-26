<template>
  <div class="medical-calculator-container" style="font-size: 12px; margin: 0">
    <FullCalendar :options="calendarOptions" ref="calendarRef" />
    <EventModal
      v-model:visible="modalVisible"
      :event="selectedEvent"
      :mode="modalMode"
      :editable="props.editable"
      :calendar-id="props.calendarId"
      :group-id="props.groupId"
      @save="handleSave"
      @delete="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * What: Compact sidebar calendar widget showing upcoming events in a list view.
 * How: Configures FullCalendar with a 180-day list view, Danish locale, and
 *      connects to the backend via useCalendarEvents composable.
 */

import { ref, reactive } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import listPlugin from '@fullcalendar/list'
import type { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core'
import daLocale from '@fullcalendar/core/locales/da'
import EventModal from '@/components/calendar/EventModal.vue'
import { useCalendarEvents } from '@/composables/useCalendarEvents'
import type { CalendarEventData } from '@/composables/useCalendarEvents'

const props = defineProps<{
  calendarId: number
  groupId: number
  editable: boolean
  baseUrl: string
}>()

const events = useCalendarEvents(props.baseUrl, props.calendarId, props.groupId)

const calendarRef = ref<InstanceType<typeof FullCalendar>>()
const modalVisible = ref(false)
const modalMode = ref<'create' | 'edit' | 'view'>('create')
const selectedEvent = ref<CalendarEventData | null>(null)
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

/**
 * What: Forces FullCalendar to refresh its event source.
 * How: Explicitly fetches the current visible range and replaces the mounted
 *      events through the Calendar API.
 */
function refetchCalendar() {
  const api = getApi()
  if (!api) return

  events.fetchEvents(
    {
      start: api.view.activeStart,
      end: api.view.activeEnd,
      startStr: api.view.activeStart.toISOString(),
      endStr: api.view.activeEnd.toISOString(),
      timeZone: 'local'
    },
    applyCalendarEvents,
    (error) => { console.error('Failed to fetch calendar events:', error) }
  )
}

/**
 * What: Handles clicking on an existing event to view it.
 * How: Extracts CalendarEventData from the clicked event's properties
 *      and extended props, then opens the modal in view mode.
 */
function handleEventClick(info: EventClickArg) {
  const event = info.event
  const ext = event.extendedProps

  selectedEvent.value = {
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
  modalMode.value = 'view'
  modalVisible.value = true
}

/**
 * What: Adds visual indicators to rendered events.
 * How: Applies 'past-event' CSS class to events that have already ended,
 *      and sets a tooltip with the event title and time.
 */
function handleEventDidMount(info: { event: { end: Date | null; title: string }; el: HTMLElement }) {
  const now = new Date()
  if (info.event.end && info.event.end < now) {
    info.el.classList.add('past-event')
  }

  // Why: Native title attribute provides a simple tooltip without
  // requiring a tooltip library
  const timeStr = info.event.end
    ? ` (${info.event.end.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit' })})`
    : ''
  info.el.title = `${info.event.title}${timeStr}`
}

// Why: Reactive options object ensures FullCalendar re-renders when
// configuration values change (e.g. editable toggled)
const calendarOptions = reactive<CalendarOptions>({
  plugins: [listPlugin],
  locale: daLocale,
  firstDay: 1,
  height: 275,
  headerToolbar: false,
  initialView: 'listNext180',
  views: {
    listNext180: {
      type: 'list',
      duration: { days: 180 }
    }
  },
  weekNumbers: true,
  editable: props.editable,
  eventSources: [
    {
      events: (
        fetchInfo: { start: Date; end: Date; startStr: string; endStr: string; timeZone: string },
        successCb: (events: unknown[]) => void,
        failureCb: (error: unknown) => void
      ) => {
        events.fetchEvents(fetchInfo, successCb, failureCb)
      }
    }
  ],
  eventClick: handleEventClick,
  eventDidMount: handleEventDidMount
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
    refetchCalendar()
  } catch (error) {
    console.error('Failed to save event:', error)
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
    refetchCalendar()
  } catch (error) {
    console.error('Failed to delete event:', error)
  }
}
</script>

<style scoped>
.medical-calculator-container :deep(.fc-list) {
  border-style: none !important;
}
</style>
