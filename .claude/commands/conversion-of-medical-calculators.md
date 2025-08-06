# Conversion of medical calculators

You are tasked with converting medical calculators from html, css and javascript to a modern Vue 3 application build with TypeScript and Vite located in source/vue.

The modern application is using Tailwind css and PrimeVue Volt wrapper components.

You must only change the UI to make it modern and following the design and style of the other calculators in Vue.

The functionallity of the medical calculator most be unchanged but most be converted to TypeScript for testing and maintainability purposes.

# Follow these steps:
1. Analyse the original html, css, js medical calculator in $ARGUMENTS. Screenshot of the calculator are provided.
2. Analyse and understand the medical calculator in $ARGUMENTS.
3. Read source/vue/CLAUDE.md
4. Analyse and understand the structure, design and style of some of other Vue medical calculators in source/vue for alignment of design, style and layout of the new component. 
5. Create a conversion plan and save it to source/vue/docs/tasks
6. Convert the business logic of the medical calculator unrelated to the UI to Typescript and put it in source/vue/src/assets.
7. Create the following files to scaffold the medical calculator.
    - source/vue/src/{nameOfCalculator}.ts
    ```
    import { createApp } from 'vue'; 
    import 'material-design-icons-iconfont/dist/material-design-icons.css';
    import './assets/teal.css';
    import App from './{NameOfCalculator}.vue';
    import PrimeVue from 'primevue/config';

    const app = createApp(App);

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
    app.mount('#app');
    ```

    - source/vue/src/{NameOfCalculator}.vue
   ```
    <template>
    <div id="app">
        <{NameOfCalculator}Score />
    </div>
    </template>

    <script lang="ts">
    import { defineComponent } from "vue";
    import {NameOfCalculator}Score from "./components/{NameOfCalculator}Score.vue";

    export default defineComponent({
    components: {
        {NameOfCalculator}Score,
    },
    });
    </script>
    ```

    - source/vue/src/components/{NameOfCalculator}Score.vue
    File for actual Vue and PrimeVue medical calculator that imports business logic.

    Exchange {NameOfCalculator} with the name of the calculator. Notice Case Types.
8. Convert the medical calculator to the new design and style. Consult context7 and https://volt.primevue.org/ if needed.




