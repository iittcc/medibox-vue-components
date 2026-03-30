import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import PrimeVue from 'primevue/config'
import EventModal from '@/components/calendar/EventModal.vue'
import { calendarStubs, createTestEvent, createTestEventWithId } from './calendar-test-helper'

function mountModal(props: Record<string, unknown> = {}) {
  return mount(EventModal, {
    props: {
      visible: true,
      event: null,
      mode: 'create' as const,
      editable: true,
      calendarId: 5,
      groupId: 50000,
      ...props
    },
    global: {
      plugins: [[PrimeVue, { unstyled: true }]],
      stubs: calendarStubs
    }
  })
}

describe('EventModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ---------------------------------------------------------------------------
  // Visibility
  // ---------------------------------------------------------------------------
  describe('visibility', () => {
    it('renders when visible is true', () => {
      const wrapper = mountModal({ visible: true })
      expect(wrapper.find('[data-testid="dialog"]').exists()).toBe(true)
    })

    it('does not render when visible is false', () => {
      const wrapper = mountModal({ visible: false })
      expect(wrapper.find('[data-testid="dialog"]').exists()).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // Create mode
  // ---------------------------------------------------------------------------
  describe('create mode', () => {
    it('shows title input field', () => {
      const wrapper = mountModal({ mode: 'create', event: createTestEvent({ title: '' }) })
      expect(wrapper.find('[data-testid="input-text"]').exists()).toBe(true)
    })

    it('shows Opret button in footer', () => {
      const wrapper = mountModal({ mode: 'create', event: createTestEvent({ title: '' }) })
      const buttons = wrapper.findAll('[data-testid="button"]')
      const createBtn = buttons.find(b => b.attributes('data-label') === 'Opret')
      expect(createBtn).toBeDefined()
    })

    it('shows Annuller button in footer', () => {
      const wrapper = mountModal({ mode: 'create', event: createTestEvent({ title: '' }) })
      const buttons = wrapper.findAll('[data-testid="secondary-button"]')
      const cancelBtn = buttons.find(b => b.attributes('data-label') === 'Annuller')
      expect(cancelBtn).toBeDefined()
    })

    it('shows all-day toggle', () => {
      const wrapper = mountModal({ mode: 'create', event: createTestEvent() })
      const toggles = wrapper.findAll('[data-testid="toggle-button"]')
      expect(toggles.length).toBeGreaterThanOrEqual(1)
    })

    it('shows recurrence toggle', () => {
      const wrapper = mountModal({ mode: 'create', event: createTestEvent() })
      const toggles = wrapper.findAll('[data-testid="toggle-button"]')
      // Second toggle is the recurrence toggle
      expect(toggles.length).toBeGreaterThanOrEqual(2)
    })

    it('emits save with CalendarEventData on Opret click', async () => {
      const event = createTestEvent({ title: 'New Meeting' })
      const wrapper = mountModal({ visible: false, mode: 'create', event })
      await wrapper.setProps({ visible: true })
      await nextTick()

      const buttons = wrapper.findAll('[data-testid="button"]')
      const createBtn = buttons.find(b => b.attributes('data-label') === 'Opret')
      await createBtn!.trigger('click')

      expect(wrapper.emitted('save')).toBeTruthy()
      const emitted = wrapper.emitted('save')![0][0] as Record<string, unknown>
      expect(emitted.title).toBe('New Meeting')
    })

    it('does not emit save if title is empty', async () => {
      const event = createTestEvent({ title: '' })
      const wrapper = mountModal({ mode: 'create', event })

      const buttons = wrapper.findAll('[data-testid="button"]')
      const createBtn = buttons.find(b => b.attributes('data-label') === 'Opret')
      await createBtn!.trigger('click')

      expect(wrapper.emitted('save')).toBeFalsy()
    })
  })

  // ---------------------------------------------------------------------------
  // View mode
  // ---------------------------------------------------------------------------
  describe('view mode', () => {
    it('displays event title', async () => {
      const wrapper = mountModal({
        visible: false,
        mode: 'view',
        event: createTestEventWithId({ title: 'Team Standup' })
      })
      await wrapper.setProps({ visible: true })
      await nextTick()
      expect(wrapper.text()).toContain('Team Standup')
    })

    it('displays event location when present', async () => {
      const wrapper = mountModal({
        visible: false,
        mode: 'view',
        event: createTestEventWithId({ location: 'Room 101' })
      })
      await wrapper.setProps({ visible: true })
      await nextTick()
      expect(wrapper.text()).toContain('Room 101')
    })

    it('hides location when empty', () => {
      const wrapper = mountModal({
        mode: 'view',
        event: createTestEventWithId({ location: '' })
      })
      expect(wrapper.text()).not.toContain('Sted')
    })

    it('shows Rediger button when editable', () => {
      const wrapper = mountModal({
        mode: 'view',
        editable: true,
        event: createTestEventWithId()
      })
      const buttons = wrapper.findAll('[data-testid="button"]')
      const editBtn = buttons.find(b => b.attributes('data-label') === 'Rediger')
      expect(editBtn).toBeDefined()
    })

    it('hides Rediger button when not editable', () => {
      const wrapper = mountModal({
        mode: 'view',
        editable: false,
        event: createTestEventWithId()
      })
      const buttons = wrapper.findAll('[data-testid="button"]')
      const editBtn = buttons.find(b => b.attributes('data-label') === 'Rediger')
      expect(editBtn).toBeUndefined()
    })

    it('shows Luk button', () => {
      const wrapper = mountModal({
        mode: 'view',
        event: createTestEventWithId()
      })
      const buttons = wrapper.findAll('[data-testid="secondary-button"]')
      const closeBtn = buttons.find(b => b.attributes('data-label') === 'Luk')
      expect(closeBtn).toBeDefined()
    })

    it('shows recurrence description for recurring events', async () => {
      const wrapper = mountModal({
        visible: false,
        mode: 'view',
        event: createTestEventWithId({ rrule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR' })
      })
      await wrapper.setProps({ visible: true })
      await nextTick()
      expect(wrapper.text()).toContain('Gentagelse')
    })
  })

  // ---------------------------------------------------------------------------
  // Edit mode
  // ---------------------------------------------------------------------------
  describe('edit mode', () => {
    it('shows Gem button', () => {
      const wrapper = mountModal({
        mode: 'edit',
        event: createTestEventWithId()
      })
      const buttons = wrapper.findAll('[data-testid="button"]')
      const saveBtn = buttons.find(b => b.attributes('data-label') === 'Gem')
      expect(saveBtn).toBeDefined()
    })

    it('shows Slet button', () => {
      const wrapper = mountModal({
        mode: 'edit',
        event: createTestEventWithId()
      })
      const dangerBtn = wrapper.find('[data-testid="danger-button"]')
      expect(dangerBtn.exists()).toBe(true)
      expect(dangerBtn.attributes('data-label')).toBe('Slet')
    })

    it('emits delete with event id on Slet click', async () => {
      const wrapper = mountModal({
        visible: false,
        mode: 'edit',
        event: createTestEventWithId({ id: '99' })
      })
      await wrapper.setProps({ visible: true })
      await nextTick()
      const dangerBtn = wrapper.find('[data-testid="danger-button"]')
      await dangerBtn.trigger('click')

      expect(wrapper.emitted('delete')).toBeTruthy()
      expect(wrapper.emitted('delete')![0][0]).toBe('99')
    })
  })

  // ---------------------------------------------------------------------------
  // Mode transitions
  // ---------------------------------------------------------------------------
  describe('mode transitions', () => {
    it('switches from view to edit when Rediger is clicked', async () => {
      const wrapper = mountModal({
        mode: 'view',
        editable: true,
        event: createTestEventWithId()
      })

      // In view mode — find Rediger button
      const editBtn = wrapper.findAll('[data-testid="button"]').find(
        b => b.attributes('data-label') === 'Rediger'
      )
      await editBtn!.trigger('click')
      await nextTick()

      // Should now show edit mode footer (Gem, Slet, Annuller)
      const saveBtn = wrapper.findAll('[data-testid="button"]').find(
        b => b.attributes('data-label') === 'Gem'
      )
      expect(saveBtn).toBeDefined()
    })
  })

  // ---------------------------------------------------------------------------
  // All-day events
  // ---------------------------------------------------------------------------
  describe('all-day events', () => {
    it('populates form for all-day event', async () => {
      const wrapper = mountModal({
        visible: false,
        mode: 'view',
        event: createTestEventWithId({
          allDay: true,
          start: '2026-03-26',
          end: '2026-03-26'
        })
      })
      await wrapper.setProps({ visible: true })
      await nextTick()
      expect(wrapper.text()).toContain('26/03/2026')
    })

    it('emits save with exclusive end date (+1 day) for all-day event (MED-1200)', async () => {
      // Simulate: CalendarFull passes inclusive end date (March 30) after the MED-1200 fix
      const wrapper = mountModal({
        visible: false,
        mode: 'edit',
        event: createTestEventWithId({
          allDay: true,
          start: '2026-03-30',
          end: '2026-03-30',
          title: 'Single Day Event'
        })
      })
      await wrapper.setProps({ visible: true })
      await nextTick()

      // Click Gem (save)
      const buttons = wrapper.findAll('[data-testid="button"]')
      const saveBtn = buttons.find(b => b.attributes('data-label') === 'Gem')
      await saveBtn!.trigger('click')

      expect(wrapper.emitted('save')).toBeTruthy()
      const emitted = wrapper.emitted('save')![0][0] as Record<string, unknown>
      // onSave adds +1 day for exclusive end → March 31
      expect(emitted.end).toBe('2026-03-31')
      expect(emitted.start).toBe('2026-03-30')
      expect(emitted.allDay).toBe(true)
    })

    it('preserves multi-day all-day event dates on round-trip (MED-1200)', async () => {
      // 3-day event: March 28-30 inclusive → CalendarFull passes end=March 30
      const wrapper = mountModal({
        visible: false,
        mode: 'edit',
        event: createTestEventWithId({
          allDay: true,
          start: '2026-03-28',
          end: '2026-03-30',
          title: 'Multi Day Event'
        })
      })
      await wrapper.setProps({ visible: true })
      await nextTick()

      const buttons = wrapper.findAll('[data-testid="button"]')
      const saveBtn = buttons.find(b => b.attributes('data-label') === 'Gem')
      await saveBtn!.trigger('click')

      const emitted = wrapper.emitted('save')![0][0] as Record<string, unknown>
      // onSave adds +1 day: March 30 → March 31 (exclusive end for FC)
      expect(emitted.start).toBe('2026-03-28')
      expect(emitted.end).toBe('2026-03-31')
    })
  })

  // ---------------------------------------------------------------------------
  // MED-1205: Editing recurring event must not convert to single event
  // ---------------------------------------------------------------------------
  describe('recurring event edit (MED-1205)', () => {
    it('emits save with null parentEventId when event is recurring', async () => {
      // Simulate editing a recurring occurrence (ID contains '_', parentEventId set)
      const wrapper = mountModal({
        visible: false,
        mode: 'edit',
        event: createTestEventWithId({
          id: '42_20260401',
          rrule: 'FREQ=WEEKLY;BYDAY=WE',
          parentEventId: 42,
          title: 'Weekly Wednesday'
        })
      })
      await wrapper.setProps({ visible: true })
      await nextTick()

      const buttons = wrapper.findAll('[data-testid="button"]')
      const saveBtn = buttons.find(b => b.attributes('data-label') === 'Gem')
      await saveBtn!.trigger('click')

      expect(wrapper.emitted('save')).toBeTruthy()
      const emitted = wrapper.emitted('save')![0][0] as Record<string, unknown>
      // parentEventId must be null to prevent backend setting recurrence_exception=1
      expect(emitted.parentEventId).toBeNull()
      expect(emitted.rrule).toBeTruthy()
    })

    it('preserves parentEventId when recurrence is turned off', async () => {
      // Edge case: user edits a recurring occurrence and disables recurrence
      const wrapper = mountModal({
        visible: false,
        mode: 'edit',
        event: createTestEventWithId({
          id: '42_20260401',
          rrule: 'FREQ=WEEKLY;BYDAY=WE',
          parentEventId: 42,
          title: 'Weekly Wednesday'
        })
      })
      await wrapper.setProps({ visible: true })
      await nextTick()

      // Toggle off recurrence (find the second ToggleButton and click)
      const vm = wrapper.vm as unknown as { form: { isRecurring: boolean } }
      vm.form.isRecurring = false
      await nextTick()

      const buttons = wrapper.findAll('[data-testid="button"]')
      const saveBtn = buttons.find(b => b.attributes('data-label') === 'Gem')
      await saveBtn!.trigger('click')

      expect(wrapper.emitted('save')).toBeTruthy()
      const emitted = wrapper.emitted('save')![0][0] as Record<string, unknown>
      // When recurrence is off, parentEventId should be preserved for exception handling
      expect(emitted.parentEventId).toBe(42)
      expect(emitted.rrule).toBeNull()
    })
  })

  // ---------------------------------------------------------------------------
  // Recurrence form
  // ---------------------------------------------------------------------------
  describe('recurrence', () => {
    it('does not show RecurrenceForm by default', () => {
      const wrapper = mountModal({
        mode: 'create',
        event: createTestEvent({ rrule: null })
      })
      expect(wrapper.find('[data-testid="recurrence-form"]').exists()).toBe(false)
    })

    it('shows RecurrenceForm for event with rrule', async () => {
      const wrapper = mountModal({
        visible: false,
        mode: 'edit',
        event: createTestEventWithId({ rrule: 'FREQ=DAILY' })
      })
      await wrapper.setProps({ visible: true })
      await nextTick()
      expect(wrapper.find('[data-testid="recurrence-form"]').exists()).toBe(true)
    })
  })
})
