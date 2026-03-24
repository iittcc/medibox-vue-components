<template>
  <CalculatorPrintLayout
    :calculatorName="config.name" :patientName="patient.name" :patientCpr="patient.cpr"
    :patientAge="patient.age" :patientGender="patient.gender"
  >
    <template #score-result>
      <div v-if="result" class="gds15-print-score">
        <div class="gds15-score-value">{{ config.shortName }} Score: {{ result.score }}</div>
        <div class="gds15-score-interpretation">{{ result.interpretation }}</div>
        <div class="gds15-score-legend">
          <span>● 0-4: Normal</span><span>● 5-7: Mulig</span><span>● ≥ 8: Sandsynligvis</span>
        </div>
      </div>
    </template>
    <template #questions>
      <div v-if="result" class="gds15-print-questions">
        <div v-for="qr in result.questionResults" :key="qr.questionNumber" class="gds15-print-question">
          <div class="gds15-question-text">{{ qr.questionText }}</div>
          <div class="gds15-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
        </div>
      </div>
    </template>
  </CalculatorPrintLayout>
</template>

<script setup lang="ts">
import CalculatorPrintLayout from './CalculatorPrintLayout.vue'
import type { ScoreResult, PatientInfo, CalculatorConfig } from '../../scoring/types'

defineProps<{ config: CalculatorConfig; patient: PatientInfo; result: ScoreResult | null }>()
</script>

<style>
.gds15-print-score { border: 1.5pt solid #333; padding: 8pt 12pt; margin-bottom: 8pt; text-align: center; page-break-inside: avoid; }
.gds15-score-value { font-family: system-ui, -apple-system, sans-serif; font-size: 16pt; font-weight: 700; color: #1a1a1a; margin-bottom: 2pt; }
.gds15-score-interpretation { font-size: 10pt; font-weight: 600; color: #333; margin-bottom: 5pt; }
.gds15-score-legend { display: flex; justify-content: center; gap: 12pt; font-size: 7pt; color: #888; padding-top: 4pt; border-top: 1px solid #ddd; }
.gds15-print-questions { margin-top: 6pt; }
.gds15-print-question { margin-bottom: 1pt; padding: 2.5pt 0; border-bottom: 1px solid #eee; page-break-inside: avoid; }
.gds15-print-question:last-child { border-bottom: none; }
.gds15-question-text { font-size: 8.5pt; color: #333; }
.gds15-answer-text { font-size: 8.5pt; padding-left: 12pt; color: #1a1a1a; font-weight: 600; }
</style>
