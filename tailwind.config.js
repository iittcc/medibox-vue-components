/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';

export default {
    important: '.medical-calculator-container', // Scope all utilities to our container
    content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
    darkMode: ['selector', '[class="p-dark"]'],
    plugins: [PrimeUI],
    corePlugins: {
        preflight: false, // disable global resets
    },
};

