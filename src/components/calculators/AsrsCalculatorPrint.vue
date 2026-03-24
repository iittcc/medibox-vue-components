<template>
  <CalculatorPrintLayout
    :calculatorName="config.name"
    :patientName="patient.name"
    :patientCpr="patient.cpr"
    :patientAge="patient.age"
    :patientGender="patient.gender"
  >
    <template #score-result>
      <div v-if="result" class="asrs-print-score">
        <div class="asrs-score-value">
          Positive A-spørgsmål: {{ result.score }} af 6
        </div>
        <div class="asrs-score-interpretation">
          {{ result.interpretation }}
        </div>
        <div class="asrs-score-detail">
          Positive B-spørgsmål: {{ positiveBCount }} af 12
        </div>
      </div>
    </template>

    <template #questions>
      <div v-if="result" class="asrs-print-questions">
        <div
          v-for="qr in result.questionResults"
          :key="qr.questionNumber"
          class="asrs-print-question"
        >
          <div class="asrs-question-text">{{ qr.questionText }}</div>
          <div class="asrs-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
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
  positiveBCount: number
}>()
</script>

<style>
.asrs-print-score {
  border: 1.5pt solid #333;
  padding: 8pt 12pt;
  margin-bottom: 8pt;
  text-align: center;
  page-break-inside: avoid;
}

.asrs-score-value {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14pt;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2pt;
}

.asrs-score-interpretation {
  font-size: 10pt;
  font-weight: 600;
  color: #333;
  margin-bottom: 2pt;
}

.asrs-score-detail {
  font-size: 9pt;
  color: #555;
}

.asrs-print-questions {
  margin-top: 6pt;
}

.asrs-print-question {
  margin-bottom: 1pt;
  padding: 2pt 0;
  border-bottom: 1px solid #eee;
  page-break-inside: avoid;
}

.asrs-print-question:last-child {
  border-bottom: none;
}

.asrs-question-text {
  font-size: 8pt;
  color: #333;
}

.asrs-answer-text {
  font-size: 8pt;
  padding-left: 12pt;
  color: #1a1a1a;
  font-weight: 600;
}
</style>
