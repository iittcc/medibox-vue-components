# CLAUDE.md

## Core Instructions
- Get browser console logs for all playwright actions
- Only commit working tested code
- Read code, never assume
- No co-authored/Claude signatures in commits
- Commit messages: capital letter, blank line after summary

## Workflow
**Research → Plan → Implement**
1. Research codebase, understand patterns
2. Create detailed implementation plan, verify with user
3. Execute with validation checkpoints

For features: "Let me research the codebase and create a plan before implementing."
For complex problems: "Let me ultrathink about this architecture before proposing a solution."

## Agent Usage
Spawn agents for:
- Parallel codebase exploration
- Simultaneous test writing and feature implementation
- Research delegation
- Complex refactoring (one identifies, one implements)

Say: "I'll spawn agents to tackle different aspects of this problem" for multi-part tasks.

## Validation Checkpoints
- After complete feature implementation
- Before new major components
- When something feels wrong
- Before declaring "done"

## Problem Solving
When stuck:
- Stop (don't spiral)
- Delegate to agents
- Ultrathink complex challenges
- Re-read requirements
- Simplify
- Ask: "I see approaches [A] vs [B]. Which do you prefer?"

## Memory Management
Long context:
- Re-read this file
- Create PROGRESS.md
- Document state before changes
- Maintain TODO.md: Current Task, Completed, Next Steps
- Use SCRATCHPAD.md for learnings/ideas

## Commands
**Development**: `npm run dev` `npm run type-check` `npm run lint` `npm run format`
**Testing**: `npm run test` `npm run test:ui` `npm run test:browser` `npm run test:unit` `npm run test:components` `npm run test:integration` `npm run test:e2e` `npm run test:coverage`
**Build**: `npm run build` `npm run staging` `npm run production`
**Deploy**: `gulp vue`

## Architecture
Vue 3 medical scoring app, multi-entry point, TypeScript, PrimeVue Volt components.

**Entry Points**: score2, danpss, audit, epds, gcs, ipss, lrti, puqe, westleycroupscore, who5, medicinBoern, passwordReset

**Structure**:
- `src/` - Main Vue components and TypeScript files
- `src/components/` - Reusable Vue components
- `src/volt/` - Custom PrimeVue wrappers
- `src/calculators/` - Medical scoring logic
- `src/composables/` - Vue 3 composables
- `src/services/` - Business logic
- `src/schemas/` - Zod validation
- `src/types/` - TypeScript definitions
- `src/assets/` - Styles and utilities
- `tests/` - Test files by type

**Key Tech**: Vue 3.5.13, TypeScript 5.8.3, PrimeVue 4.3.5, Tailwind CSS 4.1.10, Vitest 3.2.4, Playwright 1.53.2

## Critical Files
- `src/assets/sendDataToServer.ts` - Encrypted data transmission
- `src/volt/utils.ts` - Tailwind class merging

## Code Style
- No semicolons, single quotes, 2-space tabs, 100 char width
- PascalCase: Vue components
- camelCase: variables/functions
- kebab-case: CSS/HTML
- `<script setup lang="ts">` syntax
- Composition API with reactive variables

## Testing
**Vitest** framework, multiple environments:
- Unit: `tests/unit/`
- Components: `tests/components/`
- Integration: `tests/integration/`
- Browser: `tests/browser/`
**Playwright** framework
- e2e: `tests/playwright/`
Config: `vitest.config.ts`, `vitest.browser.config.ts`

## Critical Behaviors
**Tailwind Scoping**: All components wrapped in `<div class="medical-calculator-container">`
**PrimeVue**: Unstyled components with custom Volt wrappers, Danish locale
**Security**: Hybrid AES+RSA encryption via `sendDataToServer.ts`
**Build**: Multi-entry generates separate JS files, `[name].[ext]` naming

## Medical Themes
- Psychology: Sky blue
- Symptom scores: Teal
- Infection: Orange

## Development Notes
- Danish locale settings
- Pattern: form input → calculation → result display
- `@/` alias points to `src/`

## Testing Environment
- Environment variables: graceful undefined handling
- Vitest v3 instances array pattern
- PrimeVue plugin in tests: `global: { plugins: [[PrimeVue, { unstyled: true }]] }`
- Test reactive behavior, not hardcoded values

## MCP Servers
- **Context7**: Library docs (`resolve-library-id`, `get-library-docs`)
- **Playwright**: Browser automation (see .dev/.docs/mcp.playwright.md)
- **Clear Thought**: Reasoning tools (see .dev/.docs/mcp.clearthought.md)

## Git Workflow
- Main branch: `main`
- Conventional commits preferred