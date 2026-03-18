// src/main.ts
import { createApp } from 'vue';               // Icons           // PrimeFlex
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import './assets/sky.css';
import App from './PasswordReset.vue';
import PrimeVue from 'primevue/config';

const app = createApp(App);

app.use(PrimeVue, {
    unstyled: true
});
app.mount('#password-reset-app');