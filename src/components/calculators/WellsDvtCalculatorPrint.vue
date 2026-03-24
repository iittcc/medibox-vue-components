<template>
  <CalculatorPrintLayout
    :calculatorName="config.name"
    :patientName="patient.name"
    :patientCpr="patient.cpr"
    :patientAge="patient.age"
    :patientGender="patient.gender"
  >
    <template #score-result>
      <div v-if="result" class="wells-dvt-print-score">
        <div class="wells-dvt-score-value">
          {{ config.shortName }} Score: {{ result.score }}
        </div>
        <div class="wells-dvt-score-interpretation">
          {{ result.interpretation }}
        </div>
        <div class="wells-dvt-score-recommendation">
          {{ recommendation }}
        </div>
        <div class="wells-dvt-score-legend">
          <span>● ≤ 0: Lav (3-5%)</span>
          <span>● 1-2: Intermediær (15-20%)</span>
          <span>● ≥ 3: Høj (50-75%)</span>
        </div>
      </div>
    </template>

    <template #questions>
      <div v-if="result" class="wells-dvt-print-questions">
        <div
          v-for="qr in result.questionResults"
          :key="qr.questionNumber"
          class="wells-dvt-print-question"
        >
          <div class="wells-dvt-question-text">{{ qr.questionText }}</div>
          <div class="wells-dvt-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
        </div>
      </div>
    </template>
  </CalculatorPrintLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CalculatorPrintLayout from './CalculatorPrintLayout.vue'
import type { ScoreResult, PatientInfo, CalculatorConfig } from '../../scoring/types'
import { WELLS_DVT_RECOMMENDATION } from '../../scoring/wellsDvt'

const props = defineProps<{
  config: CalculatorConfig
  patient: PatientInfo
  result: ScoreResult | null
}>()

const recommendation = computed(() => {
  if (!props.result) return ''
  return WELLS_DVT_RECOMMENDATION[props.result.severity] ?? ''
})
</script>

<style>
.wells-dvt-print-score {
  border: 1.5pt solid #333;
  padding: 8pt 12pt;
  margin-bottom: 8pt;
  text-align: center;
  page-break-inside: avoid;
}

.wells-dvt-score-value {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16pt;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2pt;
}

.wells-dvt-score-interpretation {
  font-size: 10pt;
  font-weight: 600;
  color: #333;
  margin-bottom: 2pt;
}

.wells-dvt-score-recommendation {
  font-size: 9pt;
  color: #555;
  margin-bottom: 5pt;
}

.wells-dvt-score-legend {
  display: flex;
  justify-content: center;
  gap: 12pt;
  font-size: 7pt;
  color: #888;
  padding-top: 4pt;
  border-top: 1px solid #ddd;
}

.wells-dvt-print-questions {
  margin-top: 6pt;
}

.wells-dvt-print-question {
  margin-bottom: 1pt;
  padding: 2.5pt 0;
  border-bottom: 1px solid #eee;
  page-break-inside: avoid;
}

.wells-dvt-print-question:last-child {
  border-bottom: none;
}

.wells-dvt-question-text {
  font-size: 8.5pt;
  color: #333;
  margin-bottom: 0;
}

.wells-dvt-answer-text {
  font-size: 8.5pt;
  padding-left: 12pt;
  color: #1a1a1a;
  font-weight: 600;
}
</style>
