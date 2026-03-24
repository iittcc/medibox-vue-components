<template>
  <CalculatorPrintLayout
    :calculatorName="config.name"
    :patientName="patient.name"
    :patientCpr="patient.cpr"
    :patientAge="patient.age"
    :patientGender="patient.gender"
  >
    <template #score-result>
      <div v-if="result" class="wells-pe-print-score">
        <div class="wells-pe-score-value">
          {{ config.shortName }} Score: {{ result.score }}
        </div>
        <div class="wells-pe-score-interpretation">
          {{ result.interpretation }}
        </div>
        <div class="wells-pe-score-recommendation">
          {{ recommendation }}
        </div>
        <div class="wells-pe-score-legend">
          <span>● &lt; 2: Lav</span>
          <span>● 2-5: Moderat</span>
          <span>● ≥ 6: Høj</span>
        </div>
      </div>
    </template>

    <template #questions>
      <div v-if="result" class="wells-pe-print-questions">
        <div
          v-for="qr in result.questionResults"
          :key="qr.questionNumber"
          class="wells-pe-print-question"
        >
          <div class="wells-pe-question-text">{{ qr.questionText }}</div>
          <div class="wells-pe-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
        </div>
      </div>
    </template>
  </CalculatorPrintLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CalculatorPrintLayout from './CalculatorPrintLayout.vue'
import type { ScoreResult, PatientInfo, CalculatorConfig } from '../../scoring/types'
import { WELLS_PE_RECOMMENDATION } from '../../scoring/wellsPe'

const props = defineProps<{
  config: CalculatorConfig
  patient: PatientInfo
  result: ScoreResult | null
}>()

const recommendation = computed(() => {
  if (!props.result) return ''
  return WELLS_PE_RECOMMENDATION[props.result.severity] ?? ''
})
</script>

<style>
.wells-pe-print-score {
  border: 1.5pt solid #333;
  padding: 8pt 12pt;
  margin-bottom: 8pt;
  text-align: center;
  page-break-inside: avoid;
}

.wells-pe-score-value {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16pt;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2pt;
}

.wells-pe-score-interpretation {
  font-size: 10pt;
  font-weight: 600;
  color: #333;
  margin-bottom: 2pt;
}

.wells-pe-score-recommendation {
  font-size: 9pt;
  color: #555;
  margin-bottom: 5pt;
}

.wells-pe-score-legend {
  display: flex;
  justify-content: center;
  gap: 12pt;
  font-size: 7pt;
  color: #888;
  padding-top: 4pt;
  border-top: 1px solid #ddd;
}

.wells-pe-print-questions {
  margin-top: 6pt;
}

.wells-pe-print-question {
  margin-bottom: 1pt;
  padding: 2.5pt 0;
  border-bottom: 1px solid #eee;
  page-break-inside: avoid;
}

.wells-pe-print-question:last-child {
  border-bottom: none;
}

.wells-pe-question-text {
  font-size: 8.5pt;
  color: #333;
  margin-bottom: 0;
}

.wells-pe-answer-text {
  font-size: 8.5pt;
  padding-left: 12pt;
  color: #1a1a1a;
  font-weight: 600;
}
</style>
