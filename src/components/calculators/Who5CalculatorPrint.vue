<template>
  <CalculatorPrintLayout
    :calculatorName="config.name"
    :patientName="patient.name"
    :patientCpr="patient.cpr"
    :patientAge="patient.age"
    :patientGender="patient.gender"
  >
    <template #score-result>
      <div v-if="result" class="who5-print-score">
        <div class="who5-score-value">
          {{ config.shortName }} Score: {{ result.score }}
        </div>
        <div class="who5-score-interpretation">
          {{ result.interpretation }}
        </div>
        <div class="who5-score-legend">
          <span>● ≤ 35: Stor risiko</span>
          <span>● 36-50: Risiko</span>
          <span>● &gt; 50: Ingen risiko</span>
        </div>
      </div>
    </template>

    <template #questions>
      <div v-if="result" class="who5-print-questions">
        <div
          v-for="qr in result.questionResults"
          :key="qr.questionNumber"
          class="who5-print-question"
        >
          <div class="who5-question-text">{{ qr.questionText }}</div>
          <div class="who5-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
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
.who5-print-score {
  border: 1.5pt solid #333;
  padding: 8pt 12pt;
  margin-bottom: 8pt;
  text-align: center;
  page-break-inside: avoid;
}
.who5-score-value {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16pt;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2pt;
}
.who5-score-interpretation {
  font-size: 10pt;
  font-weight: 600;
  color: #333;
  margin-bottom: 5pt;
}
.who5-score-legend {
  display: flex;
  justify-content: center;
  gap: 16pt;
  font-size: 7pt;
  color: #888;
  padding-top: 4pt;
  border-top: 1px solid #ddd;
}
.who5-print-questions { margin-top: 6pt; }
.who5-print-question {
  margin-bottom: 1pt;
  padding: 2.5pt 0;
  border-bottom: 1px solid #eee;
  page-break-inside: avoid;
}
.who5-print-question:last-child { border-bottom: none; }
.who5-question-text { font-size: 8.5pt; color: #333; margin-bottom: 0; }
.who5-answer-text {
  font-size: 8.5pt;
  padding-left: 12pt;
  color: #1a1a1a;
  font-weight: 600;
}
</style>
