# Code Style and Conventions

## Prettier Configuration
- **No semicolons** (`"semi": false`)
- **Single quotes** (`"singleQuote": true`)
- **2-space indentation** (`"tabWidth": 2`)
- **100 character line width** (`"printWidth": 100`)
- **No trailing commas** (`"trailingComma": "none"`)

## ESLint Configuration
- Vue 3 essential rules with TypeScript support
- Prettier integration (skips formatting conflicts)
- Modern ECMAScript standards
- Root configuration with `@vue/eslint-config-typescript`

## Naming Conventions
- **PascalCase** for Vue components (e.g., `AuditScore.vue`)
- **camelCase** for variables and functions
- **kebab-case** for CSS classes and HTML attributes
- **Danish locale** for medical terms and UI labels

## Vue 3 Patterns
- All components use **`<script setup lang="ts">`** syntax
- **Composition API** with reactive variables via `ref()`
- **Exported interfaces** for better TypeScript support
- **Medical calculator container** wrapper pattern for Bootstrap isolation

## TypeScript Configuration
- **Target**: `esnext`
- **Module resolution**: `Bundler`
- **Strict mode** enabled
- **Path aliasing**: `@/` points to `src/`
- **skipLibCheck**: false for strict library checking

## Critical Styling Rule
⚠️ **IMPORTANT**: All Vue components must be wrapped in `<div class="medical-calculator-container">` to prevent Bootstrap conflicts from the parent application.

## File Structure Patterns
- Entry points: `src/{name}.ts` and `src/{Name}.vue`
- Components: `src/components/{Name}.vue`
- Calculators: `src/calculators/{name}/`
- Utilities: `src/assets/` and `src/utils/`