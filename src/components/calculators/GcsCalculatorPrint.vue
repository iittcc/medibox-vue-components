<template>
  <CalculatorPrintLayout :calculatorName="config.name" :patientName="patient.name" :patientCpr="patient.cpr" :patientAge="patient.age" :patientGender="patient.gender">
    <template #score-result>
      <div v-if="result" class="gcs-print-score">
        <div class="gcs-score-value">{{ config.shortName }} Score: {{ result.score }}</div>
        <div class="gcs-score-interpretation">{{ result.interpretation }}</div>
        <div class="gcs-score-legend">
          <span>● 15: Fuld bevidsthed</span><span>● 13-14: Let svækkelse</span><span>● 9-12: Middel</span><span>● 3-8: Coma</span>
        </div>
      </div>
    </template>
    <template #questions>
      <div v-if="result" class="gcs-print-questions">
        <div v-for="qr in result.questionResults" :key="qr.questionNumber" class="gcs-print-question">
          <div class="gcs-question-text">{{ qr.questionText }}</div>
          <div class="gcs-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
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
.gcs-print-score { border: 1.5pt solid #333; padding: 8pt 12pt; margin-bottom: 8pt; text-align: center; page-break-inside: avoid; }
.gcs-score-value { font-family: system-ui, -apple-system, sans-serif; font-size: 16pt; font-weight: 700; color: #1a1a1a; margin-bottom: 2pt; }
.gcs-score-interpretation { font-size: 10pt; font-weight: 600; color: #333; margin-bottom: 5pt; }
.gcs-score-legend { display: flex; justify-content: center; gap: 12pt; font-size: 7pt; color: #888; padding-top: 4pt; border-top: 1px solid #ddd; }
.gcs-print-questions { margin-top: 6pt; }
.gcs-print-question { margin-bottom: 1pt; padding: 2.5pt 0; border-bottom: 1px solid #eee; page-break-inside: avoid; }
.gcs-print-question:last-child { border-bottom: none; }
.gcs-question-text { font-size: 8.5pt; color: #333; margin-bottom: 0; }
.gcs-answer-text { font-size: 8.5pt; padding-left: 12pt; color: #1a1a1a; font-weight: 600; }
</style>
