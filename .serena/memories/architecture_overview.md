# Architecture Overview

## Multi-Entry Point Architecture
The application uses a multi-entry point architecture where each medical scoring tool is a separate application, configured in `vite.config.ts`.

## Directory Structure
```
src/
├── components/          # Reusable Vue components
│   ├── medical/        # Medical-specific components
│   └── icons/          # Icon components
├── calculators/         # Medical calculation logic
│   ├── base/           # Base calculator classes
│   ├── audit/          # AUDIT calculator
│   ├── danpss/         # DANPSS calculator
│   └── ...             # Other calculators
├── volt/               # Custom PrimeVue wrappers
├── assets/             # Styles, utilities, data files
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── composables/        # Vue composables
└── schemas/            # Zod validation schemas
```

## Component Patterns
- **Main Vue components** (`src/*.vue`) - Top-level components for each scoring tool
- **Shared components** (`src/components/`) - Reusable UI components
- **Calculator components** - Follow pattern: form input → calculation logic → result display
- **Volt components** - Custom PrimeVue component wrappers with consistent styling

## Build System
- **Vite** with multi-entry configuration
- **Each calculator builds as separate JS file**
- **Asset naming**: `[name].[ext]` pattern
- **CSS code splitting** enabled
- **Auto-import** for PrimeVue components

## Key Files
- `vite.config.ts` - Build configuration with entry points
- `src/calculators/index.ts` - Calculator registry and type-safe access
- `src/assets/sendDataToServer.ts` - Encrypted data transmission
- `src/volt/utils.ts` - Tailwind class merging utilities
- `tailwind.config.js` - Scoped Tailwind configuration

## Styling Architecture
- **Tailwind CSS** with PrimeUI plugin
- **Scoped to `.medical-calculator-container`**
- **Preflight disabled** to avoid CSS conflicts
- **Color-coded themes** per medical domain
- **Custom Volt components** for consistent styling