/**
 * What: Composable providing calendar event CRUD operations via axios.
 * How: Returns fetchEvents, saveEvent, and deleteEvent functions that
 *      communicate with the Calendar_callback controller using FormData.
 */

import axios from 'axios'
import type { EventInput } from '@fullcalendar/core'

// Why: CodeIgniter 3 CSRF protection rejects POST requests without a valid token.
// jQuery's ajaxPrefilter handles this for $.ajax, but axios needs manual injection.
const CSRF_TOKEN_NAME = 'csrf_test_name'

function getCsrfToken(): string {
  const meta = document.querySelector('meta[name="csrf-token"]')
  return meta ? meta.getAttribute('content') || '' : ''
}

function appendCsrf(formData: FormData): void {
  const token = getCsrfToken()
  if (token) {
    formData.append(CSRF_TOKEN_NAME, token)
  }
}

export interface CalendarEventData {
  id?: string | number
  calendarId: number
  groupId: number
  start: string          // ISO 8601
  end: string            // ISO 8601
  allDay: boolean
  title: string
  location: string
  description: string
  rrule: string | null
  untilDate: string | null
  parentEventId: number | null
}

export interface FetchInfo {
  start: Date
  end: Date
  startStr: string
  endStr: string
  timeZone: string
}

/**
 * What: Creates calendar event operations bound to a specific calendar and group.
 * How: Closes over baseUrl, calendarId, and groupId to provide fetchEvents,
 *      saveEvent, and deleteEvent functions that POST FormData to the backend.
 *
 * @param baseUrl - The application base URL (with trailing slash)
 * @param calendarId - The calendar identifier
 * @param groupId - The group identifier
 * @returns Object with fetchEvents, saveEvent, and deleteEvent methods
 */
export function useCalendarEvents(
  baseUrl: string,
  calendarId: number,
  groupId: number
) {
  // Why: Base path for all calendar callback endpoints, constructed once
  const callbackBase = `${baseUrl}index.php/callback/Calendar_callback`

  /**
   * What: Fetches calendar events for a given date range.
   * How: POSTs FormData with c_id, g_id, start, and end (as Unix seconds)
   *      to the Calendar_callback endpoint. Calls successCb with the events
   *      array on success, or failureCb with the error on failure.
   *
   * @param fetchInfo - FullCalendar fetch info with start/end dates
   * @param successCb - Callback receiving the events array
   * @param failureCb - Callback receiving the error
   */
  async function fetchEvents(
    fetchInfo: FetchInfo,
    successCb: (events: EventInput[]) => void,
    failureCb: (error: Error) => void
  ): Promise<void> {
    const formData = new FormData()
    formData.append('c_id', String(calendarId))
    formData.append('g_id', String(groupId))

    // Why: Backend expects Unix timestamps in seconds, not milliseconds
    formData.append('start', String(Math.floor(fetchInfo.start.getTime() / 1000)))
    formData.append('end', String(Math.floor(fetchInfo.end.getTime() / 1000)))

    try {
      appendCsrf(formData)
      const response = await axios.post(callbackBase, formData)
      successCb(response.data.events)
    } catch (error) {
      failureCb(error instanceof Error ? error : new Error(String(error)))
    }
  }

  /**
   * What: Saves a calendar event (create or update).
   * How: POSTs FormData with all event fields to the add_event endpoint.
   *      The allDay boolean is sent as '1' or '0' for PHP compatibility.
   *
   * @param data - The calendar event data to save
   * @returns The response data (typically the new event ID or boolean)
   */
  async function saveEvent(data: CalendarEventData): Promise<number | boolean> {
    const formData = new FormData()
    formData.append('calendar_id', String(data.calendarId))
    formData.append('g_id', String(data.groupId))
    formData.append('start', data.start)
    formData.append('end', data.end)

    // Why: PHP backend expects '1'/'0' strings rather than boolean values
    formData.append('allDay', data.allDay ? '1' : '0')
    formData.append('title', data.title)
    formData.append('location', data.location)
    formData.append('description', data.description)

    if (data.id !== undefined) {
      formData.append('id', String(data.id))
    }

    if (data.rrule !== null) {
      formData.append('rrule', data.rrule)
    }

    if (data.untilDate !== null) {
      formData.append('until_date', data.untilDate)
    }

    if (data.parentEventId !== null) {
      formData.append('parent_event_id', String(data.parentEventId))
    }

    appendCsrf(formData)
    const response = await axios.post(
      `${callbackBase}/add_event`,
      formData,
      { timeout: 30000 }
    )

    return response.data
  }

  /**
   * What: Deletes a calendar event by ID.
   * How: POSTs FormData with g_id and id to the delete_event endpoint.
   *
   * @param id - The event identifier to delete
   * @returns Boolean indicating success
   */
  async function deleteEvent(id: string | number): Promise<boolean> {
    const formData = new FormData()
    formData.append('g_id', String(groupId))
    formData.append('id', String(id))

    appendCsrf(formData)
    const response = await axios.post(
      `${callbackBase}/delete_event`,
      formData,
      { timeout: 30000 }
    )

    return response.data
  }

  return {
    fetchEvents,
    saveEvent,
    deleteEvent
  }
}
