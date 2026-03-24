<template>
  <CalculatorPrintLayout
    :calculatorName="config.name"
    :patientName="patient.name"
    :patientCpr="patient.cpr"
    :patientAge="patient.age"
    :patientGender="patient.gender"
  >
    <template #score-result>
      <div v-if="result" class="chadsvasc-print-score">
        <div class="chadsvasc-score-value">
          {{ config.shortName }} Score: {{ result.score }}
        </div>
        <div class="chadsvasc-score-interpretation">
          {{ result.interpretation }}
        </div>
        <div class="chadsvasc-score-risk">
          Tromboembolirate: {{ annualRisk }} pr. år
        </div>
        <div class="chadsvasc-score-legend">
          <span>● 0: Ingen behandling</span>
          <span>● 1: Bør overvejes</span>
          <span>● ≥ 2: AK-behandling anbefales</span>
        </div>
      </div>
    </template>

    <template #questions>
      <div v-if="result" class="chadsvasc-print-questions">
        <div
          v-for="qr in result.questionResults"
          :key="qr.questionNumber"
          class="chadsvasc-print-question"
        >
          <div class="chadsvasc-question-text">{{ qr.questionText }}</div>
          <div class="chadsvasc-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
        </div>
      </div>
    </template>
  </CalculatorPrintLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CalculatorPrintLayout from './CalculatorPrintLayout.vue'
import type { ScoreResult, PatientInfo, CalculatorConfig } from '../../scoring/types'
import { CHADSVASC_ANNUAL_RISK, CHADSVASC_ANNUAL_RISK_GTE2 } from '../../scoring/chadsvasc'

const props = defineProps<{
  config: CalculatorConfig
  patient: PatientInfo
  result: ScoreResult | null
}>()

const annualRisk = computed(() => {
  if (!props.result) return ''
  return CHADSVASC_ANNUAL_RISK[props.result.score] ?? CHADSVASC_ANNUAL_RISK_GTE2
})
</script>

<style>
.chadsvasc-print-score {
  border: 1.5pt solid #333;
  padding: 8pt 12pt;
  margin-bottom: 8pt;
  text-align: center;
  page-break-inside: avoid;
}

.chadsvasc-score-value {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16pt;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2pt;
}

.chadsvasc-score-interpretation {
  font-size: 10pt;
  font-weight: 600;
  color: #333;
  margin-bottom: 2pt;
}

.chadsvasc-score-risk {
  font-size: 9pt;
  color: #555;
  margin-bottom: 5pt;
}

.chadsvasc-score-legend {
  display: flex;
  justify-content: center;
  gap: 12pt;
  font-size: 7pt;
  color: #888;
  padding-top: 4pt;
  border-top: 1px solid #ddd;
}

.chadsvasc-print-questions {
  margin-top: 6pt;
}

.chadsvasc-print-question {
  margin-bottom: 1pt;
  padding: 2.5pt 0;
  border-bottom: 1px solid #eee;
  page-break-inside: avoid;
}

.chadsvasc-print-question:last-child {
  border-bottom: none;
}

.chadsvasc-question-text {
  font-size: 8.5pt;
  color: #333;
  margin-bottom: 0;
}

.chadsvasc-answer-text {
  font-size: 8.5pt;
  padding-left: 12pt;
  color: #1a1a1a;
  font-weight: 600;
}
</style>
