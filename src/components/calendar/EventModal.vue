<template>
  <Dialog
    :visible="props.visible"
    @update:visible="emit('update:visible', $event)"
    modal
    header="Begivenhed"
    :style="{ width: '48rem' }"
    :closable="true"
    appendTo="self"
  >
    <div class="medical-calculator-container">
      <!-- View mode -->
      <template v-if="currentMode === 'view'">
        <div class="flex flex-col gap-4">
          <div>
            <div class="text-sm font-medium text-surface-500 dark:text-surface-400">Titel</div>
            <div class="text-surface-700 dark:text-surface-0 mt-1">{{ form.title || '—' }}</div>
          </div>

          <div>
            <div class="text-sm font-medium text-surface-500 dark:text-surface-400">Tidspunkt</div>
            <div class="text-surface-700 dark:text-surface-0 mt-1">
              {{ formatViewDateTime() }}
            </div>
          </div>

          <div v-if="form.location">
            <div class="text-sm font-medium text-surface-500 dark:text-surface-400">Sted</div>
            <div class="text-surface-700 dark:text-surface-0 mt-1">{{ form.location }}</div>
          </div>

          <div v-if="form.description">
            <div class="text-sm font-medium text-surface-500 dark:text-surface-400">
              Beskrivelse
            </div>
            <Editor v-model="form.description" editorStyle="height: 320px" />
          </div>

          <div v-if="recurrenceDescription" class="mt-2">
            <div class="text-sm font-medium text-surface-500 dark:text-surface-400">Gentagelse</div>
            <div class="text-surface-700 dark:text-surface-0 mt-1">
              {{ recurrenceDescription }}
            </div>
          </div>
        </div>
      </template>

      <!-- Edit / Create mode -->
      <template v-else>
        <div class="flex flex-col gap-4">
          <!-- Titel -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-200">
              Titel *
            </label>
            <InputText
              v-model="form.title"
              placeholder="Begivenhedens titel"
              fluid
              :invalid="submitted && !form.title"
            />
          </div>

          <!-- Tidspunkt -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-200">
              Tidspunkt
            </label>
            <div class="flex flex-wrap items-center gap-2">
              <DatePicker
                v-model="form.startDate"
                dateFormat="dd/mm/yy"
                :firstDayOfWeek="1"
                showIcon fluid iconDisplay="input"
                class="w-40"
              />
              <DatePicker
                v-if="!form.allDay"
                v-model="form.startTime"
                timeOnly
                :stepMinute="15"
                class="w-32"
                
              />
              <span class="text-sm text-surface-600 dark:text-surface-300">til</span>
              <DatePicker
                v-if="!form.allDay"
                v-model="form.endTime"
                timeOnly
                :stepMinute="15"
                class="w-32"
              />
              <DatePicker
                v-model="form.endDate"
                dateFormat="dd/mm/yy"
                :firstDayOfWeek="1"
                showIcon fluid iconDisplay="input"
                class="w-40"
              />
            </div>
          </div>

          <!-- Hele dagen -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-200">
              Hele dagen
            </label>
            <ToggleButton v-model="form.allDay" onLabel="Ja" offLabel="Nej" />
          </div>

          <!-- Sted -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-200"> Sted </label>
            <InputText v-model="form.location" placeholder="Tilføj sted" fluid />
          </div>

          <!-- Beskrivelse -->
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-200">
              Beskrivelse
            </label>
            <div class="flex flex-col gap-1">
              <TextArea  v-model="form.description" autoResize ></TextArea>
          </div>
          </div>

          <!-- Gentag begivenhed -->
          <div class="flex items-center gap-2">
            <label class="text-sm font-medium text-surface-700 dark:text-surface-200">
              Gentag begivenhed
            </label>
            <ToggleButton v-model="form.isRecurring" onLabel="Ja" offLabel="Nej" />
          </div>

          <!-- RecurrenceForm -->
          <RecurrenceForm
            v-if="form.isRecurring"
            v-model="rruleConfig"
            :untilDate="form.untilDate"
            @update:untilDate="form.untilDate = $event"
          />

          <!-- Recurrence description -->
          <div
            v-if="recurrenceDescription"
            class="text-sm text-surface-600 dark:text-surface-300 italic"
          >
            {{ recurrenceDescription }}
          </div>
        </div>
      </template>
    </div>

    <!-- Footer -->
    <template #footer>
      <!-- View mode footer -->
      <template v-if="currentMode === 'view'">
        <Button v-if="props.editable" label="Rediger" @click="currentMode = 'edit'" />
        <SecondaryButton label="Luk" @click="close()" />
      </template>

      <!-- Edit mode footer -->
      <template v-else-if="currentMode === 'edit'">
        <DangerButton label="Slet" @click="onDelete()" />
        <Button label="Gem" @click="onSave()" />
        <SecondaryButton label="Annuller" @click="close()" />
      </template>

      <!-- Create mode footer -->
      <template v-else>
        <SecondaryButton label="Annuller" @click="close()" />
        <Button label="Opret" @click="onSave()" />
        
      </template>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Dialog from '@/volt/Dialog.vue'
import InputText from '@/volt/InputText.vue'
import Button from '@/volt/Button.vue'
import DangerButton from '@/volt/DangerButton.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue';
import ToggleButton from '@/volt/ToggleButton.vue'
import RecurrenceForm from '@/components/calendar/RecurrenceForm.vue'
import TextArea from '@/volt/Textarea.vue'
import DatePicker from '@/volt/DatePicker.vue'
import { parseRRule, describeRRule, buildRRule } from '@/composables/useRecurrence'
import type { RRuleConfig } from '@/composables/useRecurrence'
import type { CalendarEventData } from '@/composables/useCalendarEvents'

const props = defineProps<{
  visible: boolean
  event: CalendarEventData | null
  mode: 'create' | 'edit' | 'view'
  editable: boolean
  calendarId: number
  groupId: number
  fullscreen?: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  save: [data: CalendarEventData]
  delete: [id: string | number]
}>()

// Why: currentMode is separate from props.mode so the user can switch from
// view to edit without the parent needing to track that transition
const currentMode = ref<'create' | 'edit' | 'view'>(props.mode)
const submitted = ref(false)

interface FormState {
  title: string
  startDate: Date | null
  startTime: Date | null
  endDate: Date | null
  endTime: Date | null
  allDay: boolean
  location: string
  description: string
  isRecurring: boolean
  untilDate: string | null
  eventId: string | number | undefined
  parentEventId: number | null
}

const form = ref<FormState>(createEmptyForm())

const rruleConfig = ref<RRuleConfig>({
  frequency: 'WEEKLY',
  interval: 1,
  days: [],
  monthDay: 0,
  count: null,
  endType: 'never'
})

/**
 * What: Creates an empty form state with sensible defaults.
 * How: Returns a FormState object with null dates and empty strings.
 */
function createEmptyForm(): FormState {
  return {
    title: '',
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    allDay: false,
    location: '',
    description: '',
    isRecurring: false,
    untilDate: null,
    eventId: undefined,
    parentEventId: null
  }
}

/**
 * What: Parses an ISO 8601 string into separate Date objects for date and time.
 * How: Creates a Date from the ISO string, then builds a time-only Date using
 *      hours and minutes from the parsed value.
 *
 * @param iso - ISO 8601 date string
 * @returns Tuple of [dateValue, timeValue]
 */
function parseIsoToDateAndTime(iso: string): [Date, Date] {
  // Why: Date-only strings ("YYYY-MM-DD") are parsed as UTC midnight by the
  // Date constructor, which shifts to the previous day in positive UTC offsets
  // (e.g. CET). Parse as local date to keep the intended calendar date.
  let d: Date
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [year, month, day] = iso.split('-').map(Number)
    d = new Date(year, month - 1, day)
  } else {
    d = new Date(iso)
  }
  const timeDate = new Date()
  timeDate.setHours(d.getHours(), d.getMinutes(), 0, 0)
  return [d, timeDate]
}

/**
 * What: Formats a Date into a dd/mm/yyyy string for display.
 * How: Pads day and month to 2 digits with leading zeros.
 *
 * @param d - Date to format
 * @returns Formatted date string
 */
function formatDate(d: Date): string {
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * What: Formats a Date into HH:mm string for display.
 * How: Pads hours and minutes to 2 digits.
 *
 * @param d - Date to format
 * @returns Formatted time string
 */
function formatTime(d: Date): string {
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * What: Builds a human-readable date/time string for view mode.
 * How: Combines start and end dates/times, handling the all-day case
 *      by omitting time portions.
 *
 * @returns Danish-formatted date/time string
 */
function formatViewDateTime(): string {
  if (!form.value.startDate) return '—'

  const start = formatDate(form.value.startDate)
  const end = form.value.endDate ? formatDate(form.value.endDate) : ''

  if (form.value.allDay) {
    return start === end ? start : `${start} — ${end}`
  }

  const startTime = form.value.startTime ? formatTime(form.value.startTime) : ''
  const endTime = form.value.endTime ? formatTime(form.value.endTime) : ''

  if (start === end || !end) {
    return `${start} ${startTime} — ${endTime}`
  }
  return `${start} ${startTime} — ${end} ${endTime}`
}

// Why: Computed recurrence description updates reactively whenever the
// rruleConfig or untilDate changes, providing live feedback
const recurrenceDescription = computed(() => {
  if (!form.value.isRecurring) return ''
  const rrule = buildRRule(rruleConfig.value)
  return describeRRule(rrule, form.value.untilDate ?? undefined)
})

// Why: Watch visibility to populate form state when the modal opens,
// ensuring fresh data each time
watch(
  () => props.visible,
  (isVisible) => {
    if (!isVisible) return

    currentMode.value = props.mode
    submitted.value = false

    if (props.event) {
      const [startDate, startTime] = parseIsoToDateAndTime(props.event.start)
      const [endDate, endTime] = parseIsoToDateAndTime(props.event.end)

      form.value = {
        title: props.event.title,
        startDate,
        startTime,
        endDate,
        endTime,
        allDay: props.event.allDay,
        location: props.event.location,
        description: props.event.description,
        isRecurring: !!props.event.rrule,
        untilDate: props.event.untilDate ?? null,
        eventId: props.event.id,
        parentEventId: props.event.parentEventId ?? null
      }

      // Why: When the event is a recurring occurrence, the id contains '_'
      // and we need to store the parentEventId for delete operations
      if (props.event.parentEventId && String(props.event.id).includes('_')) {
        form.value.parentEventId = props.event.parentEventId
      }

      if (props.event.rrule) {
        rruleConfig.value = parseRRule(props.event.rrule)
      } else {
        rruleConfig.value = {
          frequency: 'WEEKLY',
          interval: 1,
          days: [],
          monthDay: 0,
          count: null,
          endType: 'never'
        }
      }
    } else {
      form.value = createEmptyForm()
      rruleConfig.value = {
        frequency: 'WEEKLY',
        interval: 1,
        days: [],
        monthDay: 0,
        count: null,
        endType: 'never'
      }
    }
  }
)

/**
 * What: Combines separate date and time Date objects into an ISO 8601 string.
 * How: Copies hours/minutes from the time Date onto the date Date, then
 *      converts to ISO string.
 *
 * @param date - The date portion
 * @param time - The time portion (may be null for all-day events)
 * @param zeroed - Whether to zero out the time (for all-day events)
 * @returns ISO 8601 string
 */
function combineDateTimeToIso(date: Date, time: Date | null, zeroed: boolean): string {
  const result = new Date(date)
  if (zeroed) {
    // Why: For all-day events, return a date-only string ("YYYY-MM-DD") to avoid
    // toISOString() converting local midnight to UTC and shifting the date backward
    const y = result.getFullYear()
    const m = String(result.getMonth() + 1).padStart(2, '0')
    const d = String(result.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  if (time) {
    result.setHours(time.getHours(), time.getMinutes(), 0, 0)
  }
  return result.toISOString()
}

/**
 * What: Handles the save action for create and edit modes.
 * How: Validates required fields, builds CalendarEventData from form state,
 *      handles all-day logic (zero time, end = next day), and emits save.
 */
function onSave() {
  submitted.value = true
  if (!form.value.title || !form.value.startDate || !form.value.endDate) return

  const isAllDay = form.value.allDay

  let startIso = combineDateTimeToIso(form.value.startDate, form.value.startTime, isAllDay)

  let endDate = new Date(form.value.endDate)
  if (isAllDay) {
    // Why: FullCalendar all-day events use exclusive end date, so we add one day
    endDate.setDate(endDate.getDate() + 1)
  }
  let endIso = combineDateTimeToIso(endDate, form.value.endTime, isAllDay)

  const rrule = form.value.isRecurring ? buildRRule(rruleConfig.value) : null

  // Why: When saving a recurring event (rrule is non-null), sending parentEventId
  // causes the backend to set recurrence_exception=1, converting the series to a
  // single event. Set parentEventId to null to update the series instead (MED-1205).
  // Same pattern as handleEventDrop / handleEventResize (MED-1201).
  const data: CalendarEventData = {
    calendarId: props.calendarId,
    groupId: props.groupId,
    start: startIso,
    end: endIso,
    allDay: isAllDay,
    title: form.value.title,
    location: form.value.location,
    description: form.value.description,
    rrule,
    untilDate: form.value.untilDate,
    parentEventId: rrule ? null : form.value.parentEventId
  }

  if (form.value.eventId !== undefined) {
    data.id = form.value.eventId
  }

  emit('save', data)
  close()
}

/**
 * What: Handles the delete action.
 * How: Emits delete with the event id, using parentEventId for recurring
 *      occurrences identified by underscore in the id.
 */
function onDelete() {
  // Why: For recurring occurrences, delete the parent event series
  const id =
    form.value.parentEventId && String(form.value.eventId).includes('_')
      ? form.value.parentEventId
      : form.value.eventId

  if (id !== undefined && id !== null) {
    emit('delete', id)
    close()
  }
}

/**
 * What: Closes the modal by emitting a visibility update.
 * How: Emits update:visible with false to let the parent control visibility.
 */
function close() {
  emit('update:visible', false)
}
</script>
