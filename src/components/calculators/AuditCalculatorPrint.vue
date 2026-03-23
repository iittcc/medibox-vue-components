<template>
  <CalculatorPrintLayout
    :calculatorName="config.name"
    :patientName="patient.name"
    :patientCpr="patient.cpr"
    :patientAge="patient.age"
    :patientGender="patient.gender"
  >
    <template #score-result>
      <div v-if="result" class="audit-print-score">
        <div class="audit-score-value">
          {{ config.shortName }} Score: {{ result.score }}
        </div>
        <div class="audit-score-interpretation">
          {{ result.interpretation }}
        </div>
        <div class="audit-score-legend">
          <span>● &lt; 8: Ikke tegn på alkoholafhængighed</span>
          <span>● ≥ 8: Tegn på alkoholafhængighed</span>
        </div>
      </div>
    </template>

    <template #questions>
      <div v-if="result" class="audit-print-questions">
        <div
          v-for="qr in result.questionResults"
          :key="qr.questionNumber"
          class="audit-print-question"
        >
          <div class="audit-question-text">{{ qr.questionText }}</div>
          <div class="audit-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
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
.audit-print-score {
  border: 1.5pt solid #333;
  padding: 8pt 12pt;
  margin-bottom: 8pt;
  text-align: center;
  page-break-inside: avoid;
}

.audit-score-value {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16pt;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2pt;
}

.audit-score-interpretation {
  font-size: 10pt;
  font-weight: 600;
  color: #333;
  margin-bottom: 5pt;
}

.audit-score-legend {
  display: flex;
  justify-content: center;
  gap: 16pt;
  font-size: 7pt;
  color: #888;
  padding-top: 4pt;
  border-top: 1px solid #ddd;
}

.audit-print-questions {
  margin-top: 6pt;
}

.audit-print-question {
  margin-bottom: 1pt;
  padding: 2.5pt 0;
  border-bottom: 1px solid #eee;
  page-break-inside: avoid;
}

.audit-print-question:last-child {
  border-bottom: none;
}

.audit-question-text {
  font-size: 8.5pt;
  color: #333;
  margin-bottom: 0;
}

.audit-answer-text {
  font-size: 8.5pt;
  padding-left: 12pt;
  color: #1a1a1a;
  font-weight: 600;
}
</style>
