/**
 * What: Entry point for the full calendar Vue application.
 * How: Mounts the CalendarFull component onto #calendar-app, reading
 *      configuration from data attributes and setting up PrimeVue
 *      with Danish locale.
 */

import { createApp } from 'vue'
import './assets/calendar.css'
import App from './CalendarFull.vue'
import PrimeVue from 'primevue/config'

const mountEl = document.getElementById('calendar-app')
if (mountEl) {
  const app = createApp(App, {
    calendarId: Number(mountEl.dataset.calendarId),
    groupId: Number(mountEl.dataset.groupId),
    editable: mountEl.dataset.editable === 'true',
    baseUrl: mountEl.dataset.baseUrl || '/'
  })

  app.use(PrimeVue, {
    unstyled: true,
    locale: {
      monthNames: [
        'Januar', 'Februar', 'Marts', 'April', 'Maj', 'Juni',
        'Juli', 'August', 'September', 'Oktober', 'November', 'December'
      ],
      monthNamesShort: [
        'Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun',
        'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'
      ],
      firstDayOfWeek: 1,
      dayNamesMin: ['Sø', 'Ma', 'Ti', 'On', 'To', 'Fr', 'Lø'],
      dayNames: ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag'],
      dateFormat: 'dd/mm/yy'
    }
  })

  app.mount(mountEl)
}
