/**
 * What: Entry point for the calendar widget Vue application.
 * How: Mounts the CalendarWidget component onto #calendar-widget-app, reading
 *      configuration from data attributes and setting up PrimeVue
 *      with Danish locale.
 */

import { createApp } from 'vue'
import './assets/calendar.css'
import App from './CalendarWidget.vue'
import PrimeVue from 'primevue/config'

const mountEl = document.getElementById('calendar-widget-app')
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
      dayNamesMin: ['S\u00f8', 'Ma', 'Ti', 'On', 'To', 'Fr', 'L\u00f8'],
      dayNames: ['S\u00f8ndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'L\u00f8rdag'],
      dateFormat: 'dd/mm/yy'
    }
  })

  app.mount(mountEl)
}
