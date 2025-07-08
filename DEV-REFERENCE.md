# Development Reference

## Setup
- Node.js + npm
- VSCode: Vue.volar, ESLint, Prettier extensions
- Environment: `.env.testing`, `.env.staging`, `.env.production`

## TypeScript Config
- Target: esnext, Module: Bundler, Strict mode
- Path alias: `@/` → `src/`
- Files: `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`

## Git Workflow
- Main: `main`
- Features: `MED-###-description`
- Conventional commits
- `.gitignore`: `dist/`, `node_modules/`, logs, IDE files

## Repository Structure
- `.serena/` - Serena agent cache/memories
- `dist/` - Build output
- `public/` - Static assets
- `docs/` - Documentation
- `.dev/` - Development tooling