<template>
  <CalculatorPrintLayout
    :calculatorName="config.name"
    :patientName="patient.name"
    :patientCpr="patient.cpr"
    :patientAge="patient.age"
    :patientGender="patient.gender"
  >
    <template #score-result>
      <div v-if="result" class="ybocs-print-score">
        <div class="ybocs-score-value">
          {{ config.shortName }} Score: {{ result.score }}
        </div>
        <div class="ybocs-score-interpretation">
          {{ result.interpretation }}
        </div>
        <div class="ybocs-score-legend">
          <span>● 0-14: Ubetydelig/mild</span>
          <span>● 15-23: Mild/moderat</span>
          <span>● 23-29: Moderat/svær</span>
          <span>● 30-40: Svær/invaliderende</span>
        </div>
      </div>
    </template>

    <template #questions>
      <div v-if="result" class="ybocs-print-questions">
        <div
          v-for="qr in result.questionResults"
          :key="qr.questionNumber"
          class="ybocs-print-question"
        >
          <div class="ybocs-question-text">{{ qr.questionText }}</div>
          <div class="ybocs-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
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
.ybocs-print-score {
  border: 1.5pt solid #333;
  padding: 8pt 12pt;
  margin-bottom: 8pt;
  text-align: center;
  page-break-inside: avoid;
}

.ybocs-score-value {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16pt;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2pt;
}

.ybocs-score-interpretation {
  font-size: 10pt;
  font-weight: 600;
  color: #333;
  margin-bottom: 5pt;
}

.ybocs-score-legend {
  display: flex;
  justify-content: center;
  gap: 8pt;
  font-size: 6.5pt;
  color: #888;
  padding-top: 4pt;
  border-top: 1px solid #ddd;
}

.ybocs-print-questions {
  margin-top: 6pt;
}

.ybocs-print-question {
  margin-bottom: 1pt;
  padding: 2pt 0;
  border-bottom: 1px solid #eee;
  page-break-inside: avoid;
}

.ybocs-print-question:last-child {
  border-bottom: none;
}

.ybocs-question-text {
  font-size: 8pt;
  color: #333;
  margin-bottom: 0;
}

.ybocs-answer-text {
  font-size: 8pt;
  padding-left: 12pt;
  color: #1a1a1a;
  font-weight: 600;
}
</style>
