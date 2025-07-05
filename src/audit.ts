// src/audit.ts - AUDIT Calculator Entry Point
import { createApp } from 'vue';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import './assets/sky.css';
import App from './Audit.vue';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';

// Enhanced error handling
import { withErrorBoundary } from '@/utils/errorBoundary';

const app = createApp(App);

// Configure PrimeVue with Danish locale
app.use(PrimeVue, {
    unstyled: true,
    locale: {
        monthNames : ['Januar','Februar','Marts','April','Maj','Juni','Juli','August','September','Oktober','November','December'],
        monthNamesShort : ['Jan','Feb', 'Mar','Apr','Maj','Jun','Jul','Aug','Sep','Okt','Nov','Dev'],
        firstDayOfWeek : 1,
        dayNamesMin : ['Sø','Ma','Ti','On','To','Fr','Lø'],
        dayNames : ['Søndag','Mandag','Tirsdag','Onsdag','Torsdag','Fredag','Lørdag'],
        dateFormat : "dd/mm/yy" 
    }
});

// Add Toast service for notifications
app.use(ToastService);

// Wrap with error boundary for enhanced error handling
withErrorBoundary(app, {
    enableAutoRecovery: true,
    maxRetries: 3,
    showToast: true,
    onError: (error, errorInfo) => {
         
        console.error('AUDIT Calculator Error:', {
            error: error.message,
            errorInfo,
            timestamp: new Date().toISOString()
        });
    }
});

app.mount('#app');
