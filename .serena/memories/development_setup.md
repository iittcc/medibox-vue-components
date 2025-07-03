# Development Setup

## Prerequisites
- **Node.js** (no specific version pinned in package.json)
- **npm** for package management
- **Git** for version control

## Installation
```bash
npm install
```

## Development Server
```bash
npm run dev
```

## IDE Setup (Recommended)
**VSCode** with extensions:
- `Vue.volar` - Vue language support
- `dbaeumer.vscode-eslint` - ESLint integration
- `esbenp.prettier-vscode` - Prettier formatting

## Environment Configuration
- `.env.testing` - Points to `https://test.medibox.dk`
- `.env.staging` - Points to `https://test.medibox.dk`
- `.env.production` - Points to `https://www.medibox.dk`

## TypeScript Configuration
- **Target**: `esnext`
- **Module resolution**: `Bundler`
- **Strict mode** enabled
- **Path aliasing**: `@/` points to `src/`

## Git Workflow
- **Main branch**: `master`
- **Feature branches**: Use descriptive names with Jira project and issue number (e.g., `MED-829-gdpr-compliance`)
- **Commit messages**: Use conventional commit format when possible

## Development Tools
- **Hot reload** enabled in development
- **TypeScript checking** in IDE and via `npm run type-check`
- **ESLint** integration for code quality
- **Prettier** for consistent formatting

## Logging
```bash
# Development with logging
npm run dev 2>&1 | tee -a dev.log

# Background development with logging
npm run dev >> dev.log 2>&1 &

# Watch logs
tail -f dev.log
```

## Testing Setup
- **Vitest** configured with Happy DOM
- **Manual testing** preferred for medical calculators
- **Test files** in `tests/` directory
- **Setup file**: `tests/setup.ts`