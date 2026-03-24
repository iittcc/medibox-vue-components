<template>
  <CalculatorPrintLayout
    :calculatorName="config.name" :patientName="patient.name" :patientCpr="patient.cpr"
    :patientAge="patient.age" :patientGender="patient.gender"
  >
    <template #score-result>
      <div v-if="result" class="icd10-print-score">
        <div class="icd10-score-value">{{ result.interpretation }}</div>
        <div class="icd10-score-legend">
          <span>● 3A+2B+2C: Let</span><span>● 3A+2B+4C: Moderat</span><span>● 3A+3B+5C: Svær</span>
        </div>
      </div>
    </template>
    <template #questions>
      <div v-if="result" class="icd10-print-questions">
        <div v-for="qr in result.questionResults" :key="qr.questionNumber" class="icd10-print-question">
          <div class="icd10-question-text">{{ qr.questionText }}</div>
          <div class="icd10-answer-text">► {{ qr.answerText }}</div>
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
.icd10-print-score { border: 1.5pt solid #333; padding: 8pt 12pt; margin-bottom: 8pt; text-align: center; page-break-inside: avoid; }
.icd10-score-value { font-family: system-ui, -apple-system, sans-serif; font-size: 12pt; font-weight: 700; color: #1a1a1a; margin-bottom: 5pt; }
.icd10-score-legend { display: flex; justify-content: center; gap: 12pt; font-size: 7pt; color: #888; padding-top: 4pt; border-top: 1px solid #ddd; }
.icd10-print-questions { margin-top: 6pt; }
.icd10-print-question { margin-bottom: 1pt; padding: 2.5pt 0; border-bottom: 1px solid #eee; page-break-inside: avoid; }
.icd10-print-question:last-child { border-bottom: none; }
.icd10-question-text { font-size: 8.5pt; color: #333; }
.icd10-answer-text { font-size: 8.5pt; padding-left: 12pt; color: #1a1a1a; font-weight: 600; }
</style>
