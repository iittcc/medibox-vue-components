# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 IMPORTANT INSTRUCTIONS
- Get the console log from the browser whenever you perform any action in playwright
- Only commit working tested code.
- Do not assume anything about the code. Read the code.

## CRITICAL WORKFLOW - ALWAYS FOLLOW THIS!
Research → Plan → Implement
**NEVER JUMP STRAIGHT TO CODING!** Always follow this sequence:

1. **Research**: Explore the codebase, understand existing patterns
2. **Plan**: Create a detailed implementation plan and verify it with me
3. **Implement**: Execute the plan with validation checkpoints

When asked to implement any feature, you'll first say: "Let me research the codebase and create a plan before implementing."

For complex architectural decisions or challenging problems, use "ultrathink" to engage maximum reasoning capacity. Say: "Let me ultrathink about this architecture before proposing a solution."

## USE MULTIPLE AGENTS!
Leverage subagents aggressively for better results:

- Spawn agents to explore different parts of the codebase in parallel
- Use one agent to write tests while another implements features
- Delegate research tasks: "I'll have an agent investigate the database schema while I analyze the API structure"
- For complex refactors: One agent identifies changes, another implements them
- Say: "I'll spawn agents to tackle different aspects of this problem" whenever a task has multiple independent parts.

## Reality Checkpoints
Stop and validate at these moments:

- After implementing a complete feature
- Before starting a new major component
- When something feels wrong
- Before declaring "done"

## Problem-Solving Together
When you're stuck or confused:

- **Stop**: Don't spiral into complex solutions
- **Delegate**: Consider spawning agents for parallel investigation
- **Ultrathink**: For complex problems, say "I need to ultrathink through this challenge" to engage deeper reasoning
- **Step back**: Re-read the requirements
- **Simplify**: The simple solution is usually correct
- **Ask**: "I see two approaches: [A] vs [B]. Which do you prefer?"

My insights on better approaches are valued - please ask for them!

## Working Memory Management
When context gets long:

- Re-read this CLAUDE.md file
- Summarize progress in a PROGRESS.md file
- Document current state before major changes
### Maintain TODO.md:

```
## Current Task
- [ ] What we're doing RIGHT NOW

## Completed  
- [x] What's actually done and tested

## Next Steps
- [ ] What comes next
```

### Use SCRATCHPAD.md
To write down: 

- Important things to remember
- Learnings
- Ideas
- Complex workflows
- Anything else important for a succesful implemtation

## Commands

### Development
- `npm run dev` - Start development server with hot reload
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Lint and fix code issues with ESLint
- `npm run format` - Format code with Prettier

### Testing and Building
- `npm run test` - Run in testing mode (Vite testing environment)
- `npm run build` - Full production build with type checking
- `npm run staging` - Build for staging environment
- `npm run production` - Build for production environment
- `npm run build-only` - Build without type checking
- `npm run preview` - Preview built application

### Deployment
- `gulp vue` - Copy built components from dist folder to webapp assets

## Architecture

This is a Vue 3 medical scoring application built with Vite and TypeScript using PrimeVue Volt components. The project uses a **multi-entry point architecture** where each medical scoring tool is a separate application.
Utilized Vue 3 modern composite architecture with custom build UI components to speed up development process and reduce code. The scoring is configurable and maintainable (e.g. src/components/AuditScore.vue) and scoring have the same basic structure.
The application MUST be structured for easy testing.

### Entry Points
The application has multiple entry points defined in `vite.config.ts`, each corresponding to a different medical scoring tool:
- `score2` - Risk assessment calculation
- `danpss` - Depression/anxiety scoring
- `audit` - Alcohol use assessment
- `epds` - Edinburgh Postnatal Depression Scale
- `gcs` - Glasgow Coma Scale
- `ipss` - International Prostate Symptom Score
- `lrti` - Lower Respiratory Tract Infection
- `puqe` - Pregnancy-Unique Quantification of Emesis
- `westleycroupscore` - Croup scoring
- `who5` - WHO-5 Well-Being Index
Other components:
- `passwordReset` - Password reset functionality

Each entry point has:
- A TypeScript file in `src/` (e.g., `audit.ts`)
- A Vue file in `src/` (e.g., `Audit.vue`)
- A corresponding Vue components in `src/components` (e.g., `AuditScore.vue`)
- An HTML file for standalone use (e.g., `audit.html`)

### Component Structure
- **Main Vue components** (`src/*.vue`) - Top-level components for each scoring tool
- **Shared components** (`src/components/`) - Reusable UI components
- **Volt components** (`src/volt/`) - Custom PrimeVue component wrappers with consistent styling
- **Assets** (`src/assets/`) - Styles, utilities, and data files including risk calculation logic

### Key Technologies
- **Vue 3** with Composition API and `<script setup lang="ts">` syntax
- **TypeScript** with strict mode
- **PrimeVue** UI library (unstyled) with auto-import resolver
- **Tailwind CSS** with PrimeUI plugin
- **Volt** UI components - Custom PrimeVue wrappers for Tailwind CSS
- **Chart.js** with data labels plugin for visualizations
- **Zod** for schema validation
- **Axios** for HTTP requests
- **node-forge** for cryptographic operations

### Styling System
- **Color-coded themes** by medical domain:
  - Psyk (Psychology): Sky blue
  - Symptom score: Teal
  - Infection: Orange
- **Tailwind configuration** with PrimeUI integration
- **CSS files** for each scoring tool in `src/assets/`

### Build Configuration
- **Multi-entry build** generates separate JS files for each scoring tool
- **Asset naming** follows `[name].[ext]` pattern
- **CSS code splitting** enabled for better performance
- **Auto-import** for PrimeVue components

### Development Notes
- The app uses Danish locale settings for PrimeVue components
- Risk calculation logic is centralized in `src/assets/riskCalculator.ts`
- Components follow a pattern of form input → calculation logic → result display
- TypeScript path aliasing configured with `@/` pointing to `src/`

## Core Files and Utilities

### Critical Utility Files
- `src/assets/sendDataToServer.ts` - Encrypted data transmission using hybrid AES + RSA encryption
- `src/volt/utils.ts` - Tailwind class merging utilities for PrimeVue integration

### Key Directories
- `src/components/` - Reusable Vue components for medical calculators
- `src/volt/` - Custom PrimeVue component wrappers with Tailwind styling
- `src/assets/` - Styles, utilities, data files, and calculation logic
- `dist/` - Built application files for deployment

## Code Style Guidelines

### Prettier Configuration
- **No semicolons** (`"semi": false`)
- **Single quotes** (`"singleQuote": true`)
- **2-space indentation** (`"tabWidth": 2`)
- **100 character line width** (`"printWidth": 100`)
- **No trailing commas** (`"trailingComma": "none"`)

### ESLint Configuration
- Vue 3 essential rules with TypeScript support
- Prettier integration (skips formatting conflicts)
- Modern ECMAScript standards

### Naming Conventions
- **PascalCase** for Vue components
- **camelCase** for variables and functions
- **kebab-case** for CSS classes and HTML attributes
- **Danish locale** for medical terms and UI labels

### Vue 3 Patterns
- All components use **`<script setup lang="ts">`** syntax
- **Composition API** with reactive variables
- **Exported interfaces** for better TypeScript support
- **Medical calculator container** wrapper pattern for Bootstrap isolation

## Testing Instructions

**Note**: This project uses manual testing rather than automated test suites.

- `npm run test` - Runs Vite in testing mode
- No dedicated testing frameworks (Jest, Vitest) are configured
- Testing is primarily manual or handled at the parent application level
- Type safety is enforced through `npm run type-check`

## Developer Environment Setup

### Prerequisites
- **Node.js** (no specific version pinned)
- **npm** for package management

### IDE Setup (Recommended)
- **VSCode** with extensions:
  - `Vue.volar` - Vue language support
  - `dbaeumer.vscode-eslint` - ESLint integration
  - `esbenp.prettier-vscode` - Prettier formatting

### Environment Variables
- `.env.testing` - Points to `https://test.medibox.dk`
- `.env.staging` - Points to `https://test.medibox.dk`
- `.env.production` - Points to `https://www.medibox.dk`

### TypeScript Configuration
- **Target**: `esnext`
- **Module resolution**: `Bundler`
- **Strict mode** enabled
- **Path aliasing**: `@/` points to `src/`

## Avaliable MCP Servers

### Context7
- Context7 MCP pulls up-to-date, version-specific documentation and code examples straight from the source — and places them directly into your prompt.
- Context7 MCP provides the following tools that LLMs can use:
  - **resolve-library-id**: Resolves a general library name into a Context7-compatible library ID.
    - **libraryName (required)**: The name of the library to search for
    - **get-library-docs**: Fetches documentation for a library using a Context7-compatible library ID.
  - **context7CompatibleLibraryID (required)**: Exact Context7-compatible library ID (e.g., /mongodb/docs, /vercel/next.js)
    - **topic (optional)**: Focus the docs on a specific topic (e.g., "routing", "hooks")
    - **tokens (optional, default 10000)**: Max number of tokens to return. Values less than the default value of 10000 are automatically increased to 10000.

### Playwright
- Interact with web pages, take screenshots, generate test code, web scraps the page and execute JavaScript in a real browser environment.
- Documentation: @.dev/.docs/mcp.playwright.md

### Clear Thought 
- Provides systematic thinking, mental models, and debugging approaches for enhanced problem-solving capabilities
- Documentation: @.dev/.docs/mcp.clearthought.md


## Repository Etiquette

### Ignore
- `.serena/`
- `dist/`
- `node_modules/`
- `.gitignore`
- `.gitmodules`
- `.gitattributes`



### Git Workflow
- **Main branch**: `master`
- **Feature branches**: Use descriptive names refers to jira project name and issue number (e.g., `MED-829-gdpr-compliance`)
- **Commit messages**: Use conventional commit format when possible

### File Management
- `.gitignore` excludes `dist/`, `node_modules/`, logs, and IDE files
- VSCode workspace includes recommended extensions
- Follow existing directory structure for new components

## Important Behaviors and Warnings

### Tailwind CSS Scoping
⚠️ **Critical**: All Vue components must be wrapped in `<div class="medical-calculator-container">` to prevent Bootstrap conflicts from the parent application.

- Uses `important: '.medical-calculator-container'` to scope utilities
- Tailwind preflight is disabled to avoid CSS conflicts
- Custom Volt components provide consistent PrimeVue + Tailwind integration

### PrimeVue Integration
- Uses **unstyled PrimeVue components** with custom Volt wrappers
- **Danish locale** configuration in each entry point
- **Auto-import resolver** for PrimeVue components
- Components are themed per medical domain (sky, teal, orange)

### Security Implementation
- **Hybrid encryption** (AES + RSA) for server communication via `sendDataToServer.ts`
- Uses `node-forge` library for cryptographic operations
- All patient data is encrypted before transmission

### Multi-Entry Build System
- Each calculator builds as **separate JS file**
- **No CSS code splitting** between calculators
- **Custom asset naming**: `[name].[ext]` pattern
- Each entry point includes its own HTML file for standalone use

## Medical Domain Specifics

### Color-Coded Themes
- **Psychology (Psyk)**: Sky blue (`sky.css`)
- **Symptom scores**: Teal (`teal.css`)
- **Infection**: Orange (`orange.css`)

### Component Patterns
- **Form input** → **calculation logic** → **result display**
- Shared components for patient info, scoring, and results
- Consistent use of Vue slots for flexible layouts
- Event-driven updates using Vue's reactivity system

### Calculation Logic
- Medical scoring algorithms implemented in TypeScript
- Risk assessment logic centralized in utility files
- Danish medical terminology and scoring standards
- Results include severity levels and clinical recommendations

## Development Research Notes

- **Configuration State Initialization**:
  1. Check if configuration is being used to initialize reactive state
  2. Add explicit initialization loop after variable declarations
## Workflow Memory
- 3. Test visually to confirm defaults appear

### Memories
- Environment Variable Graceful Handling. Vue components were throwing runtime errors when VITE_API_URL was undefined, causing complete component failure. Fixed by creating .env files and using fallback values instead of throwing errors.
- Vitest Browser API Version Compatibility. Browser tests failed because they used deprecated Vitest v2 API (browser.name, browser.headless) instead of the new v3 instances array pattern. Fixed by migrating to browser: { instances: [{ browser: 'chromium' }] } and adding proper dependency optimization.
- PrimeVue Test Environment Configuration. PrimeVue components failed with "Cannot read properties of undefined (reading 'config')" because the plugin wasn't configured in tests. Fixed by adding global: { plugins: [[PrimeVue, { unstyled: true }]] } to component mounting in all test environments.
- Browser vs Non-Browser Test Environment Selection. Integration tests were incorrectly using browser-specific APIs (vitest-browser-vue, @vitest/browser/context) in a happy-dom environment. Fixed by converting to Vue Test Utils (mount()) and focusing on component state testing instead of DOM interactions.
- Vue Component State and Reactivity Testing Expectations. Tests failed because they assumed static default values, but the medical calculator used computed/reactive dosage values based on selected medicine. Fixed by testing value types and reactive behavior instead of hardcoded expectations (expect(typeof wrapper.vm.dosering).toBe('number')).