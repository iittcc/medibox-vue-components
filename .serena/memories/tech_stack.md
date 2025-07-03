# Tech Stack

## Core Technologies
- **Vue 3** with Composition API and `<script setup lang="ts">` syntax
- **TypeScript** with strict mode enabled
- **Vite** for build tooling and development server
- **PrimeVue** UI library (unstyled) with auto-import resolver
- **Tailwind CSS** with PrimeUI plugin for styling
- **Chart.js** with data labels plugin for visualizations

## Additional Libraries
- **Zod** for schema validation
- **Axios** for HTTP requests
- **node-forge** for cryptographic operations
- **tailwind-merge** for utility class merging
- **material-design-icons-iconfont** for icons

## Build & Development Tools
- **Vite** with multi-entry point configuration
- **TypeScript** compiler with `vue-tsc`
- **ESLint** with Vue 3 and TypeScript support
- **Prettier** for code formatting
- **Vitest** for testing (manual testing primarily)
- **unplugin-vue-components** for auto-import of PrimeVue components

## Custom Components
- **Volt components**: Custom PrimeVue component wrappers with Tailwind styling
- **Medical calculator components**: Reusable UI components for medical calculators

## Security
- **Hybrid encryption** (AES + RSA) for server communication
- **node-forge** library for cryptographic operations
- All patient data encrypted before transmission