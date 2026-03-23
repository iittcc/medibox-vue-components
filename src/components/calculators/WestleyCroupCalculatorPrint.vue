<template>
  <CalculatorPrintLayout :calculatorName="config.name" :patientName="patient.name" :patientCpr="patient.cpr" :patientAge="patient.age" :patientGender="patient.gender">
    <template #score-result>
      <div v-if="result" class="westley-print-score">
        <div class="westley-score-value">{{ config.name }}: {{ result.score }}</div>
        <div class="westley-score-interpretation">{{ result.interpretation }}</div>
        <div class="westley-score-legend">
          <span>● ≤ 2: Mild</span><span>● 3-7: Moderat</span><span>● ≥ 8: Svær</span>
        </div>
      </div>
    </template>
    <template #questions>
      <div v-if="result" class="westley-print-questions">
        <div v-for="qr in result.questionResults" :key="qr.questionNumber" class="westley-print-question">
          <div class="westley-question-text">{{ qr.questionText }}</div>
          <div class="westley-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
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
.westley-print-score { border: 1.5pt solid #333; padding: 8pt 12pt; margin-bottom: 8pt; text-align: center; page-break-inside: avoid; }
.westley-score-value { font-family: system-ui, -apple-system, sans-serif; font-size: 16pt; font-weight: 700; color: #1a1a1a; margin-bottom: 2pt; }
.westley-score-interpretation { font-size: 10pt; font-weight: 600; color: #333; margin-bottom: 5pt; }
.westley-score-legend { display: flex; justify-content: center; gap: 16pt; font-size: 7pt; color: #888; padding-top: 4pt; border-top: 1px solid #ddd; }
.westley-print-questions { margin-top: 6pt; }
.westley-print-question { margin-bottom: 1pt; padding: 2.5pt 0; border-bottom: 1px solid #eee; page-break-inside: avoid; }
.westley-print-question:last-child { border-bottom: none; }
.westley-question-text { font-size: 8.5pt; color: #333; margin-bottom: 0; }
.westley-answer-text { font-size: 8.5pt; padding-left: 12pt; color: #1a1a1a; font-weight: 600; }
</style>
