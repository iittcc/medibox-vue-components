# Medical Calculator Architecture

Print-first calculator platform for MediBOX Vue 3 medical scoring tools.

## Overview

Each calculator follows a 4-component architecture that separates clinical content, scoring logic, form state, and print rendering. The EPDS calculator is the reference implementation.

```text
┌─────────────────────────────────────────────────────────────────┐
│  Entry Point (e.g. epds.ts)                                     │
│  └── Imports theme CSS + mounts calculator component            │
│                                                                 │
│  ┌── Scoring File (scoring/epds.ts) ─────────────────────────┐  │
│  │  • CalculatorConfig (name, thresholds, defaults)          │  │
│  │  • createQuestions() factory (clinical content)           │  │
│  │  • calculateScore() pure function (no DOM, no side fx)    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                         │                                       │
│                         ▼                                       │
│  ┌── Composable (useCalculatorForm) ─────────────────────────┐  │
│  │  • Reactive state: questions, patient, result             │  │
│  │  • Methods: validate(), calculate(), reset()              │  │
│  │  • Shared between interactive + print views               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                    │                    │                        │
│                    ▼                    ▼                        │
│  ┌── Interactive View ──┐  ┌── Print View ──────────────────┐  │
│  │  Visible on screen   │  │  Hidden on screen              │  │
│  │  QuestionSingle*     │  │  Visible only @media print     │  │
│  │  PersonInfo          │  │  A4 layout, MediBOX logo       │  │
│  │  Buttons (calc/      │  │  Score + questions + signature  │  │
│  │   print/copy/reset)  │  │  Uses CalculatorPrintLayout    │  │
│  └──────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```text
src/vue-components/
  src/
    scoring/
      types.ts                          # Shared interfaces (Question, ScoreResult, etc.)
      utils.ts                          # calculateSimpleSum() shared utility
      epds.ts                           # EPDS config + scoring (REFERENCE)
      audit.ts                          # AUDIT config + scoring
      who5.ts                           # WHO-5 config + scoring (×4 multiplier)
      puqe.ts                           # PUQE config + scoring (values start at 1)
      westleyCroupScore.ts              # Westley Croup config + scoring
      gcs.ts                            # GCS config + scoring (defaults to best response)
      ipss.ts                           # IPSS config + scoring (7 questions with descriptions)
      lrti.ts                           # LRTI config + scoring (boolean Toggle questions)
      danpss.ts                         # DANPSS custom types + A×B product scoring
    composables/
      useCalculatorForm.ts              # Shared form state (simple-sum calculators)
      useDanpssForm.ts                  # DANPSS-specific dual A/B form state
    components/
      calculators/
        CalculatorPrintLayout.vue       # Shared A4 print wrapper (showCpr prop)
        EpdsCalculator.vue              # EPDS orchestrator (REFERENCE)
        EpdsCalculatorPrint.vue         # EPDS print view
        AuditCalculator.vue             # AUDIT orchestrator
        AuditCalculatorPrint.vue        # AUDIT print view
        Who5Calculator.vue              # WHO-5 orchestrator
        Who5CalculatorPrint.vue         # WHO-5 print view
        PuqeCalculator.vue              # PUQE orchestrator
        PuqeCalculatorPrint.vue         # PUQE print view
        WestleyCroupCalculator.vue      # Westley Croup orchestrator
        WestleyCroupCalculatorPrint.vue # Westley Croup print view
        GcsCalculator.vue               # GCS orchestrator
        GcsCalculatorPrint.vue          # GCS print view
        IpssCalculator.vue              # IPSS orchestrator
        IpssCalculatorPrint.vue         # IPSS print view
        LrtiCalculator.vue              # LRTI orchestrator (ToggleButtons)
        LrtiCalculatorPrint.vue         # LRTI print view
        DanpssCalculator.vue            # DANPSS orchestrator (QuestionComponent, charts)
        DanpssCalculatorPrint.vue       # DANPSS print view (section table)
      PersonInfo.vue                    # Patient info (name, age, gender, CPR)
      QuestionSingleComponent.vue       # Single-answer question renderer
      QuestionComponent.vue             # Dual A/B question renderer (DANPSS)
      CopyDialog.vue                    # Copy to clipboard
      SurfaceCard.vue                   # Card wrapper
    epds.ts                             # Entry points (one per calculator)
    audit.ts
    who-5.ts
    puqe.ts
    westleyCroupScore.ts
    gcs.ts
    ipss.ts
    lrti.ts
    danpss.ts
  tests/
    scoring/                            # Parity tests (one per calculator)
      utils.test.ts                     # Shared utility tests
      epds-scoring.test.ts
      audit-scoring.test.ts
      who5-scoring.test.ts
      puqe-scoring.test.ts
      westleyCroupScore-scoring.test.ts
      gcs-scoring.test.ts
      ipss-scoring.test.ts
      lrti-scoring.test.ts
      danpss-scoring.test.ts
      fixtures/                         # JSON reference data per calculator
    components/                         # Component tests (one per calculator)
      calculator-test-helper.ts         # Shared stubs for mountCalculator()
      AuditCalculator.test.ts
      Who5Calculator.test.ts
      ...
    unit/                               # Composable tests
      useCalculatorForm.test.ts
      useDanpssForm.test.ts
```

## Calculator Inventory

| Calculator | Questions | Scoring | Theme | Complexity | Status |
| --- | --- | --- | --- | --- | --- |
| EPDS | 10 | Sum, threshold ≥10 | sky | Simple | Migrated |
| AUDIT | 10 | Sum, threshold ≥8 | teal | Simple | Migrated |
| WHO-5 | 5 | Sum ×4, threshold ≤35 | sky | Simple | Migrated |
| PUQE | 3 | Sum, 3 thresholds | orange | Simple | Migrated |
| Westley Croup | 5 | Sum, 3 thresholds | orange | Simple | Migrated |
| GCS | 3 | Sum, 4 thresholds | teal | Simple | Migrated |
| IPSS | 7 | Sum, 4 thresholds | orange | Simple | Migrated |
| LRTI | 8 | Boolean toggles | orange | Medium | Migrated |
| DANPSS | 15 (4 sections) | Dual A/B (A×B product), 4 sections | teal | Hard | Migrated |
| Score2 | 3 inputs | Lookup table, Chart.js | teal | Very hard | To migrate |
| MedicinBoern | Cascading dropdowns | Drug lookup, weight formula | sky | Very hard | To migrate |

### Remaining (not yet migrated)

- **Score2** — lookup table + Chart.js (needs custom scoring approach, not question-based)
- **MedicinBoern** — cascading dropdowns for drug dosing (not a scoring calculator)

---

## Step-by-Step Migration Guide

### Prerequisites

- Read the EPDS reference files before starting:
  - `src/scoring/epds.ts` — scoring function pattern
  - `src/scoring/types.ts` — shared interfaces
  - `src/composables/useCalculatorForm.ts` — composable pattern
  - `src/components/calculators/EpdsCalculator.vue` — orchestrator pattern
  - `src/components/calculators/EpdsCalculatorPrint.vue` — print view pattern

### Step 1: Create the Scoring File

Create `src/scoring/<name>.ts`. This is the most important file — it contains all clinical content.

**1a. Extract question definitions from the old component:**

Find the questions array and options in the old `<Name>Score.vue`. Move them into a factory function:

```typescript
// src/scoring/audit.ts
import type { CalculatorConfig, Question, ScoreResult, QuestionResult } from './types'

export function createAuditQuestions(): Question[] {
  return [
    {
      type: 'Listbox',
      bg: '--p-primary-100',
      text: '1. Hvor ofte drikker du alkohol?',
      options: [
        { text: 'Aldrig', value: 0 },
        { text: 'Månedligt eller sjældnere', value: 1 },
        // ... all options from old component
      ],
      answer: 0  // default to first option value
    },
    // ... remaining questions
  ]
}
```

**Key rules:**

- Copy question text and options EXACTLY from the old component (clinical content must not change)
- Options are now embedded IN the question (not via `optionsType` lookup)
- Default `answer` to the first option's value (not `null`)
- Use a factory function to prevent shared mutable state

**1b. Define the calculator config:**

```typescript
export const auditConfig: CalculatorConfig = {
  name: 'Alcohol Use Disorders Identification Test',
  shortName: 'AUDIT',
  defaultAge: 50,
  defaultGender: 'Mand',
  minAge: 10,
  maxAge: 110,
  showCpr: true,
  questions: createAuditQuestions(),
  thresholds: [
    { minScore: 0, maxScore: 7, interpretation: 'Lav risiko.', severity: 'normal' },
    { minScore: 8, maxScore: 40, interpretation: 'Risikoforbrug.', severity: 'severe' }
  ]
}
```

**Where to find defaults:** Look at the old component's `PersonInfo` bindings for `defaultAge`, `defaultGender`, `minAge`, `maxAge`.

**1c. Write the pure scoring function using the shared utility:**

```typescript
import { calculateSimpleSum } from './utils'

// Simple-sum calculators delegate to the shared utility:
export function calculateAudit(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, auditConfig.thresholds)
}

// WHO-5 uses the optional score multiplier (raw sum × 4):
export function calculateWho5(questions: Question[]): ScoreResult {
  return calculateSimpleSum(questions, who5Config.thresholds, 4)
}
```

**All simple-sum calculators use `calculateSimpleSum()` from `src/scoring/utils.ts`.** Only the config (thresholds) and optional multiplier differ.

### Step 2: Write Parity Tests

Create `tests/scoring/<name>-scoring.test.ts` and `tests/scoring/fixtures/<name>-legacy-results.json`.

**2a. Create test fixtures:**

Run the old calculator in the browser and capture input/output pairs. At minimum include:

```json
[
  { "description": "All minimum scores", "answers": [0,0,...], "expectedScore": 0, "expectedSeverity": "normal", "expectedInterpretation": "..." },
  { "description": "All maximum scores", "answers": [4,4,...], "expectedScore": 40, "expectedSeverity": "severe", "expectedInterpretation": "..." },
  { "description": "At threshold boundary", "answers": [...], "expectedScore": 8, "expectedSeverity": "severe", "expectedInterpretation": "..." },
  { "description": "Just below threshold", "answers": [...], "expectedScore": 7, "expectedSeverity": "normal", "expectedInterpretation": "..." }
]
```

**Always test BOTH sides of every threshold boundary.**

**2b. Write the test file:**

Follow `tests/scoring/epds-scoring.test.ts` as the template. Key test groups:

- Parity tests against fixtures (`test.each`)
- Threshold boundary tests
- Question result mapping
- Null answer handling
- Question factory tests
- Config validation

**2c. Run tests:**

```bash
cd src/vue-components && npx vitest run tests/scoring/<name>-scoring.test.ts
```

All tests must pass before proceeding.

### Step 3: Create the Orchestrator Component

Create `src/components/calculators/<Name>Calculator.vue`.

Copy `EpdsCalculator.vue` and change:

1. Import the new scoring file instead of EPDS
2. Update the `config` reference
3. Update the copy dialog content if needed
4. Update the result display text/thresholds

**Template structure (always the same):**

```bash
<div class="medical-calculator-container">
  <div class="calculator-print-wrapper">

    <!-- Interactive view -->
    <div class="calculator-interactive-view ...">
      <SurfaceCard title="Patient">        <!-- PersonInfo -->
      <SurfaceCard :title="config.name">   <!-- Questions form + buttons -->
      <div v-if="hasResults">              <!-- Results display -->
    </div>

    <!-- Print view -->
    <<Name>CalculatorPrint ... />

  </div>
</div>
```

**Critical classes:**

- `medical-calculator-container` — Tailwind scoping wrapper (MUST be outermost)
- `calculator-print-wrapper` — wraps both views
- `calculator-interactive-view` — hidden during print
- Print component renders `calculator-print-view` (hidden on screen)

### Step 4: Create the Print View

Create `src/components/calculators/<Name>CalculatorPrint.vue`.

Copy `EpdsCalculatorPrint.vue` and change:

1. Update the threshold legend text
2. Adjust any calculator-specific display

**The print view receives three props from the orchestrator:**

- `config: CalculatorConfig` — calculator metadata
- `patient: PatientInfo` — patient data
- `result: ScoreResult | null` — scored results

**Do NOT duplicate clinical content.** Question text and answer text come from `result.questionResults`, which was generated by the scoring function from the shared question definitions.

### Step 5: Update the Entry Point

Edit `src/<name>.ts` to import the new component:

```typescript
import App from './components/calculators/<Name>Calculator.vue'
```

### Step 6: Development files

Setup files for development purposes:

`src/<name>.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><name></title>
    <style>
      html {
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/<name>.ts"></script>
  </body>
</html>
```

Add to links in `index.html`

### Step 7: Component test in browser

```bash
# 1. Run the browser test
cd src/vue-components && npx vitest run tests/scoring/<name>-scoring.test.ts

# 2. Start development server
npm run dev
```

1. Open the calculator at `http://localhost:5173/<name>.html` use /browser skill to open the browser and navigate to the calculator.
2. Fill in all questions, click Beregn
3. Verify score matches expected values at threshold boundaries
4. Click Print — verify one-page A4 output with:
   - MediBOX PNG logo (top right)
   - Calculator name (top left)
   - Patient info row (Navn, CPR, Dato, Alder, Køn)
   - Score result box
   - All questions with selected answers
   - Signature + date lines
   - Footer with timestamp
5. Verify NO page chrome (header tags, Lægevejledning footer)
6. Verify NO ghost blank pages

Add files to `src/tsconfig.app.json` and `vite.config.ts`. Calculators are being built as separate files in integration in php/html pages. This is to avoid the need to build the entire application when only one calculator is being developed.

### Step 8: Integration test (Build, Deploy, Test)

```bash
# 1. Run ALL tests (not just the new ones)
cd src/vue-components && npx vitest run

# 2. Build Vue components
npm run build

# 3. Deploy to app assets
cd ~/localhost/medibox && npx gulp vue
```

Verify the CSS file exists in `dist/<name>.min.css` and is referenced in `functions.php`.

### Step 8: Test in Browser

1. Open the calculator at `localhost:1010` use /browser skill to open the browser and navigate to the calculator.
2. Fill in all questions, click Beregn
3. Verify score matches expected values at threshold boundaries
4. Click Print — verify one-page A4 output with:
   - MediBOX PNG logo (top right)
   - Calculator name (top left)
   - Patient info row (Navn, CPR, Dato, Alder, Køn)
   - Score result box
   - All questions with selected answers
   - Signature + date lines
   - Footer with timestamp
5. Verify NO page chrome (header tags, Lægevejledning footer)
6. Verify NO ghost blank pages

---

## Complex Calculator Implementations

### Multi-Section (DANPSS) — Implemented

DANPSS uses a completely separate architecture from simple-sum calculators:

- **Custom types** in `src/scoring/danpss.ts`: `DanpssQuestion` (dual answerA/answerB), `DanpssScoreResult` (section subtotals)
- **Custom composable** `src/composables/useDanpssForm.ts`: handles dual answers, section grouping, optional section 4 validation
- **Product scoring**: score per question = `answerA × answerB` (not sum)
- **4 sections**: Tømning (4q), Fyldning (4q), Andre symptomer (4q), Seksualfunktion (3q, optional)
- **Total** based on sections 1-3 only; section 4 is separate
- **Thresholds** on totalAB: <8 mild, 8-19 moderate, >19 severe
- **Print view** includes a section results table with Interval column

Does NOT use `useCalculatorForm` or `calculateSimpleSum`.

### LRTI (Boolean Toggles) — Implemented

LRTI models 8 boolean symptoms as standard Questions with `type: 'Toggle'` and binary options `[{text:'Nej', value:0}, {text:'Ja', value:1}]`. The orchestrator renders `ToggleButton` components. Uses the standard `useCalculatorForm` composable unchanged.

### Lookup Table (Score2)

Score2 uses age/BP/cholesterol to look up a risk percentage from a data table:

- The scoring function takes structured input (not a Question array)
- Consider a separate interface or use `CalculatorConfig` with slider-type inputs
- Chart.js integration stays in the component (not in the scoring function)
- The scoring function returns the risk values; the component renders the chart

### Medication Calculator (MedicinBoern)

This is not a scoring calculator — it's a dosing lookup tool:

- May not fit the `useCalculatorForm` pattern cleanly
- Extract the drug lookup logic into a separate module
- Keep the cascading dropdown UI in the component
- Focus migration on extracting testable logic, not forcing the same component structure

---

## Pitfalls & Troubleshooting

### Build Errors

| Error | Cause | Fix |
| --- | --- | --- |
| `Rollup failed to resolve import "/public/..."` | Static `src` attribute on `<img>` — Vite tries to resolve at build time | Use `:src="logoUrl"` with a const variable (runtime URL) |
| `npm run build` fails with Grunt error | Running root-level build instead of Vue build | Run `cd src/vue-components && npm run build` — never `npm run build` from project root |
| CSS 404 in browser | `functions.php` references `style.css` which doesn't exist | Point to `<name>.min.css` instead |

### Print Issues

| Problem | Cause | Fix |
| --- | --- | --- |
| Interactive form prints alongside print view | Print CSS selectors don't match DOM | Use `display:none` + `:has()` ancestor chain pattern (see rules file) |
| Ghost blank pages (2-4 pages) | `visibility:hidden` preserves layout space | Use `display:none` + `height:0` to collapse hidden content |
| MediBOX header/footer prints | Page chrome not hidden | Hide `.page-header`, `#doc_actions`, `#page-article ~ p`, `#page-article ~ hr` |
| Content overflows to page 2 | Font sizes / spacing too large | Use compact sizing: 9pt body, 8.5pt questions, tight margins |
| Logo shows blank/broken | SVG uses custom font (KlavikaRegular-TF) | Use PNG logo at `/public/MediBOX_logo.png` with `:src` binding |
| Logo doesn't print | External `<img src>` not loaded at print time | PNG is served by the app server, works at runtime |

### Scoring Issues

| Problem | Cause | Fix |
| --- | --- | --- |
| Score differs from old calculator | Threshold operator wrong (`>` vs `>=`) | Check clinical guidelines, always use `>=` for lower bounds |
| Parity test fails at boundary | Fixture uses correct value, old code had bug | Fixtures encode CORRECT behavior — fix the code, not the fixture |
| Shared state between instances | Questions array mutated across components | Use factory function (`createXxxQuestions()`) to create fresh arrays |

### Component Issues

| Problem | Cause | Fix |
| --- | --- | --- |
| Tailwind classes not working | Missing `medical-calculator-container` wrapper | Must be the outermost `<div>` in the component |
| CSS conflicts with MediBOX Bootstrap | Tailwind preflight enabled | Verify `tailwind.config.js` has `corePlugins: { preflight: false }` |
| PersonInfo CPR field shows on all calculators | `showCpr` prop defaults to `true` | Default is `false` — only set `true` where needed |
| `QuestionSingleComponent` options don't render | Passing `optionsType` string instead of array | New architecture: pass `question.options` directly as the `:options` prop |

### Testing Issues

| Problem | Cause | Fix |
| --- | --- | --- |
| Old `EPDSScore.test.ts` boundary test fails | Threshold changed from `>10` to `>=10` | Update the test expectation — score 10 now triggers depression |
| Tests pass but browser shows wrong score | Test mocks hide real component wiring | Run browser test alongside unit tests |
| Import path errors in tests | Missing `@/` alias | Check `vitest.config.ts` has path aliases matching `tsconfig.json` |

---

## Checklist — For Future Calculator Migrations (Score2, MedicinBoern)

- [ ] Create `src/scoring/<name>.ts` with config + factory + scoring function (use `calculateSimpleSum` if applicable)
- [ ] Verify threshold values against clinical guidelines
- [ ] Create `tests/scoring/fixtures/<name>-legacy-results.json` with boundary cases
- [ ] Create `tests/scoring/<name>-scoring.test.ts` — run and verify all pass
- [ ] Create `src/components/calculators/<Name>Calculator.vue` (copy from EPDS, adapt)
- [ ] Create `src/components/calculators/<Name>CalculatorPrint.vue` (copy from EPDS, adapt)
- [ ] Create `tests/components/<Name>Calculator.test.ts` (use `calculator-test-helper.ts`)
- [ ] Update `src/<name>.ts` entry point to import new component
- [ ] Create `src/<name>.html` file for development
- [ ] Run ALL tests: `cd src/vue-components && npx vitest run` (467+ must pass)
- [ ] Build: `npm run build` (from `src/vue-components/`)
- [ ] Deploy: `cd ~/localhost/medibox && npx gulp vue`
- [ ] Verify `functions.php` has correct CSS reference (`<name>.min.css`)
- [ ] Browser test: fill form → calculate → verify score
- [ ] Browser test: print → verify one A4 page, logo, no chrome, no ghost pages
