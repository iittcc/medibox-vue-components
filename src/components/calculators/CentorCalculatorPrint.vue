<template>
  <CalculatorPrintLayout
    :calculatorName="config.name"
    :patientName="patient.name"
    :patientCpr="patient.cpr"
    :patientAge="patient.age"
    :patientGender="patient.gender"
  >
    <template #score-result>
      <div v-if="result" class="centor-print-score">
        <div class="centor-score-value">
          {{ config.shortName }} Score: {{ result.score }}
        </div>
        <div class="centor-score-interpretation">
          {{ result.interpretation }}
        </div>
        <div class="centor-score-recommendation">
          {{ activeRecommendation }}
        </div>
        <div class="centor-score-legend">
          <span>● 0–1: Gruppe 3 — ingen test</span>
          <span>● 2–3: Gruppe 2 — hurtigtest</span>
          <span>● 4–5: Gruppe 1 — overvej antibiotika</span>
        </div>
      </div>
    </template>

    <template #questions>
      <div v-if="result" class="centor-print-questions">
        <div
          v-for="qr in result.questionResults"
          :key="qr.questionNumber"
          class="centor-print-question"
        >
          <div class="centor-question-text">{{ qr.questionText }}</div>
          <div class="centor-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
        </div>
      </div>
    </template>
  </CalculatorPrintLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CalculatorPrintLayout from './CalculatorPrintLayout.vue'
import type { ScoreResult, PatientInfo, CalculatorConfig } from '../../scoring/types'

const props = defineProps<{
  config: CalculatorConfig
  patient: PatientInfo
  result: ScoreResult | null
}>()

const activeRecommendation = computed(() => {
  if (!props.result) return ''
  const score = props.result.score
  if (score >= 4) return 'Gruppe 1: Høj sandsynlighed. Overvej antibiotikabehandling eller udfør hurtigtest.'
  if (score >= 2) return 'Gruppe 2: Moderat sandsynlighed. Streptokok hurtigtest anbefales.'
  return 'Gruppe 3: Lav sandsynlighed. Ingen test nødvendig. Symptomatisk behandling.'
})
</script>

<style>
.centor-print-score {
  border: 1.5pt solid #333;
  padding: 8pt 12pt;
  margin-bottom: 8pt;
  text-align: center;
  page-break-inside: avoid;
}

.centor-score-value {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16pt;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2pt;
}

.centor-score-interpretation {
  font-size: 10pt;
  font-weight: 600;
  color: #333;
  margin-bottom: 2pt;
}

.centor-score-recommendation {
  font-size: 8.5pt;
  color: #444;
  margin-bottom: 5pt;
}

.centor-score-legend {
  display: flex;
  justify-content: center;
  gap: 12pt;
  font-size: 7pt;
  color: #888;
  padding-top: 4pt;
  border-top: 1px solid #ddd;
}

.centor-print-questions {
  margin-top: 6pt;
}

.centor-print-question {
  margin-bottom: 1pt;
  padding: 2.5pt 0;
  border-bottom: 1px solid #eee;
  page-break-inside: avoid;
}

.centor-print-question:last-child {
  border-bottom: none;
}

.centor-question-text {
  font-size: 8.5pt;
  color: #333;
  margin-bottom: 0;
}

.centor-answer-text {
  font-size: 8.5pt;
  padding-left: 12pt;
  color: #1a1a1a;
  font-weight: 600;
}
</style>
