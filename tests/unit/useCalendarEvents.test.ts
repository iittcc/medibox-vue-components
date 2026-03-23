/* eslint-disable no-undef */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import axios from 'axios'
import { useCalendarEvents } from '@/composables/useCalendarEvents'
import type { CalendarEventData, FetchInfo } from '@/composables/useCalendarEvents'

vi.mock('axios')

const mockedAxios = axios as unknown as { post: Mock }

describe('useCalendarEvents', () => {
  const baseUrl = 'http://localhost:1010/'
  const calendarId = 5
  const groupId = 12

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---------------------------------------------------------------------------
  // fetchEvents
  // ---------------------------------------------------------------------------
  describe('fetchEvents', () => {
    const fetchInfo: FetchInfo = {
      start: new Date('2026-03-01T00:00:00Z'),
      end: new Date('2026-03-31T23:59:59Z'),
      startStr: '2026-03-01',
      endStr: '2026-03-31',
      timeZone: 'Europe/Copenhagen'
    }

    it('calls correct URL with FormData containing c_id, g_id, start, end', async () => {
      const events = [{ id: 1, title: 'Test Event' }]
      mockedAxios.post.mockResolvedValue({ data: { events } })

      const { fetchEvents } = useCalendarEvents(baseUrl, calendarId, groupId)
      const successCb = vi.fn()
      const failureCb = vi.fn()

      await fetchEvents(fetchInfo, successCb, failureCb)

      expect(mockedAxios.post).toHaveBeenCalledTimes(1)

      const [url, formData] = mockedAxios.post.mock.calls[0]
      expect(url).toBe(
        'http://localhost:1010/index.php/callback/Calendar_callback'
      )
      expect(formData).toBeInstanceOf(FormData)
      expect(formData.get('c_id')).toBe(String(calendarId))
      expect(formData.get('g_id')).toBe(String(groupId))

      const startUnix = Math.floor(fetchInfo.start.getTime() / 1000)
      const endUnix = Math.floor(fetchInfo.end.getTime() / 1000)
      expect(formData.get('start')).toBe(String(startUnix))
      expect(formData.get('end')).toBe(String(endUnix))
    })

    it('calls successCb with events array on success', async () => {
      const events = [
        { id: 1, title: 'Morning Meeting' },
        { id: 2, title: 'Lunch' }
      ]
      mockedAxios.post.mockResolvedValue({ data: { events } })

      const { fetchEvents } = useCalendarEvents(baseUrl, calendarId, groupId)
      const successCb = vi.fn()
      const failureCb = vi.fn()

      await fetchEvents(fetchInfo, successCb, failureCb)

      expect(successCb).toHaveBeenCalledWith(events)
      expect(failureCb).not.toHaveBeenCalled()
    })

    it('calls failureCb on error', async () => {
      const error = new Error('Network error')
      mockedAxios.post.mockRejectedValue(error)

      const { fetchEvents } = useCalendarEvents(baseUrl, calendarId, groupId)
      const successCb = vi.fn()
      const failureCb = vi.fn()

      await fetchEvents(fetchInfo, successCb, failureCb)

      expect(failureCb).toHaveBeenCalledWith(error)
      expect(successCb).not.toHaveBeenCalled()
    })
  })

  // ---------------------------------------------------------------------------
  // saveEvent
  // ---------------------------------------------------------------------------
  describe('saveEvent', () => {
    const eventData: CalendarEventData = {
      calendarId: 5,
      groupId: 12,
      start: '2026-03-15T09:00:00',
      end: '2026-03-15T10:00:00',
      allDay: false,
      title: 'Team Standup',
      location: 'Room 101',
      description: 'Daily standup meeting',
      rrule: null,
      untilDate: null,
      parentEventId: null
    }

    it('posts to add_event with correct FormData', async () => {
      mockedAxios.post.mockResolvedValue({ data: 42 })

      const { saveEvent } = useCalendarEvents(baseUrl, calendarId, groupId)
      await saveEvent(eventData)

      expect(mockedAxios.post).toHaveBeenCalledTimes(1)

      const [url, formData, config] = mockedAxios.post.mock.calls[0]
      expect(url).toBe(
        'http://localhost:1010/index.php/callback/Calendar_callback/add_event'
      )
      expect(formData).toBeInstanceOf(FormData)
      expect(formData.get('calendar_id')).toBe(String(eventData.calendarId))
      expect(formData.get('g_id')).toBe(String(eventData.groupId))
      expect(formData.get('start')).toBe(eventData.start)
      expect(formData.get('end')).toBe(eventData.end)
      expect(formData.get('title')).toBe(eventData.title)
      expect(formData.get('location')).toBe(eventData.location)
      expect(formData.get('description')).toBe(eventData.description)
      expect(config.timeout).toBe(30000)
    })

    it('sends allDay as "1" for true and "0" for false', async () => {
      mockedAxios.post.mockResolvedValue({ data: 42 })

      const { saveEvent } = useCalendarEvents(baseUrl, calendarId, groupId)

      // Test allDay false
      await saveEvent({ ...eventData, allDay: false })
      const formDataFalse = mockedAxios.post.mock.calls[0][1] as FormData
      expect(formDataFalse.get('allDay')).toBe('0')

      mockedAxios.post.mockClear()

      // Test allDay true
      await saveEvent({ ...eventData, allDay: true })
      const formDataTrue = mockedAxios.post.mock.calls[0][1] as FormData
      expect(formDataTrue.get('allDay')).toBe('1')
    })

    it('returns response data', async () => {
      mockedAxios.post.mockResolvedValue({ data: 99 })

      const { saveEvent } = useCalendarEvents(baseUrl, calendarId, groupId)
      const result = await saveEvent(eventData)

      expect(result).toBe(99)
    })
  })

  // ---------------------------------------------------------------------------
  // deleteEvent
  // ---------------------------------------------------------------------------
  describe('deleteEvent', () => {
    it('posts to delete_event with g_id and id', async () => {
      mockedAxios.post.mockResolvedValue({ data: true })

      const { deleteEvent } = useCalendarEvents(baseUrl, calendarId, groupId)
      await deleteEvent(7)

      expect(mockedAxios.post).toHaveBeenCalledTimes(1)

      const [url, formData, config] = mockedAxios.post.mock.calls[0]
      expect(url).toBe(
        'http://localhost:1010/index.php/callback/Calendar_callback/delete_event'
      )
      expect(formData).toBeInstanceOf(FormData)
      expect(formData.get('g_id')).toBe(String(groupId))
      expect(formData.get('id')).toBe('7')
      expect(config.timeout).toBe(30000)
    })

    it('returns response data as boolean', async () => {
      mockedAxios.post.mockResolvedValue({ data: true })

      const { deleteEvent } = useCalendarEvents(baseUrl, calendarId, groupId)
      const result = await deleteEvent(42)

      expect(result).toBe(true)
    })
  })
})
