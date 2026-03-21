import { describe, it, expect } from 'vitest'
import { buildRRule, parseRRule, describeRRule } from '@/composables/useRecurrence'
import type { RRuleConfig } from '@/composables/useRecurrence'

describe('useRecurrence', () => {
  // ---------------------------------------------------------------------------
  // buildRRule
  // ---------------------------------------------------------------------------
  describe('buildRRule', () => {
    it('builds a daily RRULE', () => {
      const config: RRuleConfig = {
        frequency: 'DAILY',
        interval: 1,
        days: [],
        monthDay: 0,
        count: null,
        endType: 'never'
      }
      expect(buildRRule(config)).toBe('FREQ=DAILY')
    })

    it('builds a weekly RRULE with days and interval', () => {
      const config: RRuleConfig = {
        frequency: 'WEEKLY',
        interval: 2,
        days: ['MO', 'WE', 'FR'],
        monthDay: 0,
        count: null,
        endType: 'never'
      }
      expect(buildRRule(config)).toBe('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR')
    })

    it('builds a monthly RRULE with monthDay', () => {
      const config: RRuleConfig = {
        frequency: 'MONTHLY',
        interval: 1,
        days: [],
        monthDay: 15,
        count: null,
        endType: 'never'
      }
      expect(buildRRule(config)).toBe('FREQ=MONTHLY;BYMONTHDAY=15')
    })

    it('builds an RRULE with COUNT when endType is count', () => {
      const config: RRuleConfig = {
        frequency: 'WEEKLY',
        interval: 1,
        days: ['TU', 'TH'],
        monthDay: 0,
        count: 10,
        endType: 'count'
      }
      expect(buildRRule(config)).toBe('FREQ=WEEKLY;BYDAY=TU,TH;COUNT=10')
    })

    it('builds an RRULE with UNTIL when endType is date', () => {
      const config: RRuleConfig = {
        frequency: 'DAILY',
        interval: 3,
        days: [],
        monthDay: 0,
        count: null,
        endType: 'date',
        untilDate: '2026-12-31'
      }
      expect(buildRRule(config)).toBe('FREQ=DAILY;INTERVAL=3;UNTIL=20261231T235959Z')
    })

    it('omits INTERVAL when interval is 1', () => {
      const config: RRuleConfig = {
        frequency: 'YEARLY',
        interval: 1,
        days: [],
        monthDay: 0,
        count: null,
        endType: 'never'
      }
      const result = buildRRule(config)
      expect(result).toBe('FREQ=YEARLY')
      expect(result).not.toContain('INTERVAL')
    })
  })

  // ---------------------------------------------------------------------------
  // parseRRule
  // ---------------------------------------------------------------------------
  describe('parseRRule', () => {
    it('parses a daily RRULE', () => {
      const result = parseRRule('FREQ=DAILY')
      expect(result.frequency).toBe('DAILY')
      expect(result.interval).toBe(1)
      expect(result.days).toEqual([])
      expect(result.endType).toBe('never')
    })

    it('parses a weekly RRULE with days', () => {
      const result = parseRRule('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR')
      expect(result.frequency).toBe('WEEKLY')
      expect(result.interval).toBe(2)
      expect(result.days).toEqual(['MO', 'WE', 'FR'])
    })

    it('parses an RRULE with COUNT and sets endType to count', () => {
      const result = parseRRule('FREQ=WEEKLY;BYDAY=TU,TH;COUNT=10')
      expect(result.count).toBe(10)
      expect(result.endType).toBe('count')
    })

    it('parses an RRULE with UNTIL and sets endType to date', () => {
      const result = parseRRule('FREQ=DAILY;INTERVAL=3;UNTIL=20261231T235959Z')
      expect(result.endType).toBe('date')
      expect(result.untilDate).toBe('2026-12-31')
    })

    it('returns defaults for an empty string', () => {
      const result = parseRRule('')
      expect(result).toEqual({
        frequency: 'WEEKLY',
        interval: 1,
        days: [],
        monthDay: 0,
        count: null,
        endType: 'never'
      })
    })
  })

  // ---------------------------------------------------------------------------
  // describeRRule
  // ---------------------------------------------------------------------------
  describe('describeRRule', () => {
    it('describes a daily RRULE', () => {
      expect(describeRRule('FREQ=DAILY')).toBe('Gentages hver dag')
    })

    it('describes a weekly RRULE with days', () => {
      const result = describeRRule('FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR')
      expect(result).toBe('Gentages hver 2. uge på mandag, onsdag, fredag')
    })

    it('describes an RRULE with COUNT', () => {
      const result = describeRRule('FREQ=WEEKLY;BYDAY=TU,TH;COUNT=10')
      expect(result).toBe('Gentages hver uge på tirsdag, torsdag — 10 gentagelser')
    })

    it('describes an RRULE with untilDate parameter', () => {
      const result = describeRRule('FREQ=DAILY;INTERVAL=3', '2026-12-31')
      expect(result).toBe('Gentages hver 3. dag — indtil 31/12/2026')
    })

    it('returns empty string for empty rrule', () => {
      expect(describeRRule('')).toBe('')
    })
  })
})
