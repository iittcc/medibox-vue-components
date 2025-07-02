// src/main.ts
import { createApp } from 'vue';               // Icons           // PrimeFlex
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import './assets/teal.css';
import App from './PasswordReset.vue';
import PrimeVue from 'primevue/config';

const app = createApp(App);

app.use(PrimeVue, {
    unstyled: true,
    locale: {
        monthNames : ['Januar','Februar','Marts','Arpil','Maj','Juni','Juli','August','September','Oktober','November','December'],
        monthNamesShort : ['Jan','Feb', 'Mar','Apr','Maj','Jun','Jul','Aug','Sep','Okt','Nov','Dev'],
        firstDayOfWeek : 1,
        dayNamesMin : ['Sø','Ma','Ti','On','To','Fr','Lø'],
        dayNames : ['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'],
        dateFormat : "dd/mm/yy" 
    }
});
app.mount('#app');