/**
 * What: Composable providing pure functions for iCal RRULE string operations.
 * How: Exports buildRRule, parseRRule, and describeRRule for building, parsing,
 *      and describing recurrence rules in Danish.
 */

export interface RRuleConfig {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  interval: number
  days: string[]        // e.g. ['MO', 'WE', 'FR']
  monthDay: number      // 1-31, 0 = not set
  count: number | null
  endType: 'never' | 'date' | 'count'
  untilDate?: string    // YYYY-MM-DD
}

// Why: Danish day names mapping used by describeRRule for localised output
const DAY_NAMES: Record<string, string> = {
  MO: 'mandag',
  TU: 'tirsdag',
  WE: 'onsdag',
  TH: 'torsdag',
  FR: 'fredag',
  SA: 'lørdag',
  SU: 'søndag'
}

// Why: Danish frequency labels for human-readable descriptions
const FREQ_LABELS: Record<string, string> = {
  DAILY: 'dag',
  WEEKLY: 'uge',
  MONTHLY: 'måned',
  YEARLY: 'år'
}

/**
 * What: Builds an iCal RRULE string from a structured config object.
 * How: Assembles FREQ, INTERVAL, BYDAY, BYMONTHDAY, COUNT, and UNTIL parts.
 *      Omits INTERVAL when it equals 1. UNTIL uses YYYYMMDDT235959Z format.
 *
 * @param config - The recurrence configuration
 * @returns The RRULE string (without "RRULE:" prefix)
 */
export function buildRRule(config: RRuleConfig): string {
  const parts: string[] = [`FREQ=${config.frequency}`]

  // Why: INTERVAL=1 is the default in the iCal spec, so we omit it for brevity
  if (config.interval > 1) {
    parts.push(`INTERVAL=${config.interval}`)
  }

  if (config.days.length > 0) {
    parts.push(`BYDAY=${config.days.join(',')}`)
  }

  if (config.monthDay > 0) {
    parts.push(`BYMONTHDAY=${config.monthDay}`)
  }

  if (config.endType === 'count' && config.count !== null) {
    parts.push(`COUNT=${config.count}`)
  }

  if (config.endType === 'date' && config.untilDate) {
    // Why: iCal UNTIL requires UTC timestamp format YYYYMMDDTHHMMSSZ
    const dateStr = config.untilDate.replace(/-/g, '')
    parts.push(`UNTIL=${dateStr}T235959Z`)
  }

  return parts.join(';')
}

/**
 * What: Parses an RRULE string back into a structured RRuleConfig object.
 * How: Splits the string on semicolons and maps each key=value pair to the
 *      corresponding config field. Returns sensible defaults for empty input.
 *
 * @param rrule - The RRULE string to parse (without "RRULE:" prefix)
 * @returns A fully populated RRuleConfig
 */
export function parseRRule(rrule: string): RRuleConfig {
  const defaults: RRuleConfig = {
    frequency: 'WEEKLY',
    interval: 1,
    days: [],
    monthDay: 0,
    count: null,
    endType: 'never'
  }

  if (!rrule || rrule.trim() === '') {
    return defaults
  }

  const config: RRuleConfig = { ...defaults }
  const parts = rrule.split(';')

  for (const part of parts) {
    const [key, value] = part.split('=')

    switch (key) {
      case 'FREQ':
        config.frequency = value as RRuleConfig['frequency']
        break
      case 'INTERVAL':
        config.interval = parseInt(value, 10)
        break
      case 'BYDAY':
        config.days = value.split(',')
        break
      case 'BYMONTHDAY':
        config.monthDay = parseInt(value, 10)
        break
      case 'COUNT':
        config.count = parseInt(value, 10)
        config.endType = 'count'
        break
      case 'UNTIL':
        config.endType = 'date'
        // Why: Convert YYYYMMDDTHHMMSSZ back to YYYY-MM-DD for form usage
        config.untilDate = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
        break
    }
  }

  return config
}

/**
 * What: Generates a human-readable Danish description of an RRULE string.
 * How: Parses the RRULE, then constructs a sentence using Danish day names,
 *      frequency labels, and optional ending conditions.
 *
 * @param rrule - The RRULE string to describe
 * @param untilDate - Optional end date override in YYYY-MM-DD format
 * @returns A Danish description string, or '' for empty input
 */
export function describeRRule(rrule: string, untilDate?: string): string {
  if (!rrule || rrule.trim() === '') {
    return ''
  }

  const config = parseRRule(rrule)
  const freq = FREQ_LABELS[config.frequency] || config.frequency

  // Why: Danish ordinal formatting uses "2." for "every 2nd", but plain word
  // for interval=1 (e.g. "hver dag" not "hver 1. dag")
  const intervalPart = config.interval > 1 ? `${config.interval}. ` : ''
  let description = `Gentages hver ${intervalPart}${freq}`

  if (config.days.length > 0) {
    const dayNames = config.days.map((d) => DAY_NAMES[d] || d).join(', ')
    description += ` på ${dayNames}`
  }

  // Why: The untilDate parameter takes precedence over UNTIL in the RRULE
  // string so callers can provide a display-friendly date separately
  if (untilDate) {
    const [year, month, day] = untilDate.split('-')
    description += ` — indtil ${day}/${month}/${year}`
  } else if (config.endType === 'count' && config.count !== null) {
    description += ` — ${config.count} gentagelser`
  } else if (config.endType === 'date' && config.untilDate) {
    const [year, month, day] = config.untilDate.split('-')
    description += ` — indtil ${day}/${month}/${year}`
  }

  return description
}
