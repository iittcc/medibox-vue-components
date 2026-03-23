<template>
  <CalculatorPrintLayout :calculatorName="config.name" :patientName="patient.name" :patientCpr="patient.cpr" :patientAge="patient.age" :patientGender="patient.gender">
    <template #score-result>
      <div v-if="result" class="puqe-print-score">
        <div class="puqe-score-value">{{ config.shortName }} Score: {{ result.score }}</div>
        <div class="puqe-score-interpretation">{{ result.interpretation }}</div>
        <div class="puqe-score-legend">
          <span>● ≤ 6: Mild</span><span>● 7-12: Moderat</span><span>● ≥ 13: Svær</span>
        </div>
      </div>
    </template>
    <template #questions>
      <div v-if="result" class="puqe-print-questions">
        <div v-for="qr in result.questionResults" :key="qr.questionNumber" class="puqe-print-question">
          <div class="puqe-question-text">{{ qr.questionText }}</div>
          <div class="puqe-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
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
.puqe-print-score { border: 1.5pt solid #333; padding: 8pt 12pt; margin-bottom: 8pt; text-align: center; page-break-inside: avoid; }
.puqe-score-value { font-family: system-ui, -apple-system, sans-serif; font-size: 16pt; font-weight: 700; color: #1a1a1a; margin-bottom: 2pt; }
.puqe-score-interpretation { font-size: 10pt; font-weight: 600; color: #333; margin-bottom: 5pt; }
.puqe-score-legend { display: flex; justify-content: center; gap: 16pt; font-size: 7pt; color: #888; padding-top: 4pt; border-top: 1px solid #ddd; }
.puqe-print-questions { margin-top: 6pt; }
.puqe-print-question { margin-bottom: 1pt; padding: 2.5pt 0; border-bottom: 1px solid #eee; page-break-inside: avoid; }
.puqe-print-question:last-child { border-bottom: none; }
.puqe-question-text { font-size: 8.5pt; color: #333; margin-bottom: 0; }
.puqe-answer-text { font-size: 8.5pt; padding-left: 12pt; color: #1a1a1a; font-weight: 600; }
</style>
