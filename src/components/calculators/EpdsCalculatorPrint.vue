<template>
  <!--
    What: A4 print view for the EPDS calculator.
    How: Renders scored EPDS results in the shared CalculatorPrintLayout.
    Displays score result with emphasis, all 10 questions with selected answers,
    and clinical threshold reference.

    Design spec: 18pt bold score, 10pt questions, grayscale-safe emphasis.
  -->
  <CalculatorPrintLayout
    :calculatorName="config.name"
    :patientName="patient.name"
    :patientCpr="patient.cpr"
    :patientAge="patient.age"
    :patientGender="patient.gender"
    :showCpr="true"
  >
    <template #score-result>
      <div v-if="result" class="epds-print-score">
        <div class="epds-score-value">
          {{ config.shortName }} Score: {{ result.score }}
        </div>
        <div class="epds-score-interpretation">
          {{ result.interpretation }}
        </div>
        <div class="epds-score-legend">
          <span>● ≤ 9: Ikke tegn til alvorlig depression</span>
          <span>● ≥ 10: Behandlingskrævende depression kan foreligge</span>
        </div>
      </div>
    </template>

    <template #questions>
      <div v-if="result" class="epds-print-questions">
        <div
          v-for="qr in result.questionResults"
          :key="qr.questionNumber"
          class="epds-print-question"
        >
          <div class="epds-question-text">{{ qr.questionText }}</div>
          <div class="epds-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
        </div>
      </div>
    </template>
  </CalculatorPrintLayout>
</template>

<script setup lang="ts">
import CalculatorPrintLayout from './CalculatorPrintLayout.vue'
import type { ScoreResult, PatientInfo, CalculatorConfig } from '../../scoring/types'

defineProps<{
  config: CalculatorConfig
  patient: PatientInfo
  result: ScoreResult | null
}>()
</script>

<style>
/* ─── EPDS Score Result Box ──────────────────────────────── */
/* Why: Compact sizing to fit all 10 questions + score on one A4 page */

.epds-print-score {
  border: 1.5pt solid #333;
  padding: 8pt 12pt;
  margin-bottom: 8pt;
  text-align: center;
  page-break-inside: avoid;
}

.epds-score-value {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16pt;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2pt;
}

.epds-score-interpretation {
  font-size: 10pt;
  font-weight: 600;
  color: #333;
  margin-bottom: 5pt;
}

.epds-score-legend {
  display: flex;
  justify-content: center;
  gap: 16pt;
  font-size: 7pt;
  color: #888;
  padding-top: 4pt;
  border-top: 1px solid #ddd;
}

/* ─── EPDS Question List ─────────────────────────────────── */

.epds-print-questions {
  margin-top: 6pt;
}

.epds-print-question {
  margin-bottom: 1pt;
  padding: 2.5pt 0;
  border-bottom: 1px solid #eee;
  page-break-inside: avoid;
}

.epds-print-question:last-child {
  border-bottom: none;
}

.epds-question-text {
  font-size: 8.5pt;
  color: #333;
  margin-bottom: 0;
}

.epds-answer-text {
  font-size: 8.5pt;
  padding-left: 12pt;
  color: #1a1a1a;
  font-weight: 600;
}
</style>
