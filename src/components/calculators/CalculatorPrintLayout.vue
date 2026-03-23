<template>
  <!--
    What: Shared A4 print layout wrapper for all medical calculators.
    How: Provides header/content/footer slots in an A4-sized container.
    Visible only during @media print; hidden on screen.
    Must fit on exactly one A4 page.
  -->
  <div class="calculator-print-view">
    <div class="print-page">
      <header class="print-header">
        <div class="print-header-right">
          <div class="print-calculator-name">{{ calculatorName }}</div>
        </div>
        <div class="print-header-logo">
          <!-- Why: PNG logo because the SVG uses a custom font (KlavikaRegular-TF) not available in print.
               Runtime URL via :src to prevent Vite from resolving at build time — the PNG
               lives in the MediBOX app's /public dir, served at runtime by the web server. -->
          <img :src="logoUrl" alt="MediBOX" class="print-logo" />
        </div>
      </header>

      <div class="print-patient-info">
        <div class="print-patient-row">
          <span>Navn: <strong>{{ patientName || '—' }}</strong></span>
          <span v-if="showCpr">CPR: <strong>{{ patientCpr || '—' }}</strong></span>
          <span>Dato: <strong>{{ printDate }}</strong></span>
          <span>Alder: <strong>{{ patientAge }}</strong></span>
          <span>Køn: <strong>{{ patientGender }}</strong></span>
        </div>
      </div>

      <div class="print-content">
        <slot name="score-result" />
        <slot name="questions" />
      </div>

      <div class="print-signature">
        <div class="print-signature-line">
          <span>Underskrift:</span>
          <span class="print-line"></span>
        </div>
        <div class="print-signature-line">
          <span>Dato:</span>
          <span class="print-line"></span>
        </div>
      </div>

      <footer class="print-footer">
        MediBOX · {{ calculatorName }} · Udskrevet {{ printTimestamp }}
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

withDefaults(defineProps<{
  calculatorName: string
  patientName: string
  patientCpr: string
  patientAge: number
  patientGender: string
  showCpr?: boolean
}>(), {
  showCpr: false
})

const logoUrl = '/public/MediBOX_logo.png'

const printDate = computed(() => {
  return new Date().toLocaleDateString('da-DK')
})

const printTimestamp = computed(() => {
  return new Date().toLocaleString('da-DK')
})
</script>

<style>
/*
  Why: Print styles are NOT scoped — they must override the ENTIRE page.
  The calculator is nested deep inside the MediBOX PHP layout. Using
  visibility:hidden + display:none on all body descendants and making only
  the print view visible is the only robust approach.

  Ghost pages are caused by hidden content still occupying layout space.
  Setting height:0 + overflow:hidden on all non-print elements eliminates them.
*/

/* Hidden on screen */
.calculator-print-view {
  display: none;
}

@media print {
  @page {
    size: A4;
    margin: 12mm 15mm;
  }

  /* Step 1: Collapse ALL page content to zero height (eliminates ghost pages) */
  body > * {
    display: none !important;
    height: 0 !important;
    overflow: hidden !important;
    visibility: hidden !important;
  }

  /* Step 2: Re-enable the ancestor chain up to the print view */
  body > *:has(.calculator-print-view) {
    display: block !important;
    height: auto !important;
    overflow: visible !important;
    visibility: visible !important;
  }

  /* Step 3: Hide all siblings at every nesting level, keep only ancestors */
  *:has(> .calculator-print-view),
  *:has(> * > .calculator-print-view),
  *:has(> * > * > .calculator-print-view),
  *:has(> * > * > * > .calculator-print-view),
  *:has(> * > * > * > * > .calculator-print-view) {
    visibility: visible !important;
    display: block !important;
    height: auto !important;
    overflow: visible !important;
    padding: 0 !important;
    margin: 0 !important;
    border: none !important;
    background: none !important;
    box-shadow: none !important;
    max-width: none !important;
    min-height: 0 !important;
  }

  /* Step 4: The print view itself */
  .calculator-print-view {
    display: block !important;
    visibility: visible !important;
    position: relative !important;
    width: 100% !important;
    height: auto !important;
    overflow: visible !important;
    z-index: 99999 !important;
    background: white !important;
  }

  .calculator-print-view * {
    visibility: visible !important;
  }

  /* Step 5: Hide the interactive form sibling */
  .calculator-interactive-view {
    display: none !important;
    height: 0 !important;
  }

  /* Step 6: Hide MediBOX page chrome (header with tags + Lægevejledning footer) */
  .page-header,
  #breadcrumb,
  #doc_actions,
  #print_logo,
  #bookmark_star,
  #doc_owner,
  #doc_protected,
  #label_organisation,
  #comments,
  .Title {
    display: none !important;
    height: 0 !important;
  }

  /* Why: The Lægevejledning / Fagligt opdateret / Forfatter block is a
     p.text-right sibling AFTER #page-article (not inside it), plus the
     <hr> separator before it. Hide all non-Vue content after #page-article. */
  #page-article ~ p,
  #page-article ~ hr {
    display: none !important;
    height: 0 !important;
  }

  /* Step 7: Page sizing */
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    width: auto !important;
    height: auto !important;
  }
}

/* ─── Print page layout ──────────────────────────────────── */
/* Why: Compact sizing to fit 10 EPDS questions + score + signature on one A4 page */

.print-page {
  font-family: Georgia, 'Times New Roman', serif;
  color: #1a1a1a;
  font-size: 9pt;
  line-height: 1.35;
  max-width: 100%;
}

/* ─── Header with logo ───────────────────────────────────── */

.print-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1.5pt solid #333;
  padding-bottom: 6pt;
  margin-bottom: 8pt;
}

.print-header-right {
  flex: 1;
}

.print-calculator-name {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 10pt;
  font-weight: 600;
  color: #555;
}

.print-header-logo {
  flex-shrink: 0;
}

.print-logo {
  width: 100pt;
  height: auto;
}

/* ─── Patient info (single compact row) ──────────────────── */

.print-patient-info {
  margin-bottom: 8pt;
  padding: 5pt 8pt;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.print-patient-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4pt 20pt;
  font-size: 8.5pt;
}

.print-patient-row strong {
  font-weight: 700;
}

/* ─── Content area ───────────────────────────────────────── */

.print-content {
  margin-bottom: 6pt;
}

/* ─── Signature block ────────────────────────────────────── */

.print-signature {
  display: flex;
  gap: 40pt;
  margin-top: 12pt;
  padding-top: 8pt;
  border-top: 1px solid #ccc;
}

.print-signature-line {
  display: flex;
  align-items: flex-end;
  gap: 6pt;
  font-size: 9pt;
}

.print-signature-line .print-line {
  display: inline-block;
  width: 140pt;
  border-bottom: 1px solid #333;
  margin-bottom: 1pt;
}

/* ─── Footer ─────────────────────────────────────────────── */

.print-footer {
  margin-top: 10pt;
  padding-top: 5pt;
  border-top: 1px solid #ddd;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 7pt;
  color: #999;
  text-align: center;
}
</style>
