<template>
  <CalculatorPrintLayout :calculatorName="config.name" :patientName="patient.name" :patientCpr="patient.cpr" :patientAge="patient.age" :patientGender="patient.gender">
    <template #score-result>
      <div v-if="result" class="hama-print-score">
        <div class="hama-score-value">{{ config.shortName }} Score: {{ result.score }}</div>
        <div class="hama-score-interpretation">{{ result.interpretation }}</div>
        <div class="hama-score-legend">
          <span>● 0–7: Ingen</span><span>● 8–14: Tvivlsom</span><span>● 15–19: Let</span><span>● 20–29: Moderat</span><span>● 30–56: Svær</span>
        </div>
      </div>
    </template>
    <template #questions>
      <div v-if="result" class="hama-print-questions">
        <div v-for="qr in result.questionResults" :key="qr.questionNumber" class="hama-print-question">
          <div class="hama-question-text">{{ qr.questionText }}</div>
          <div class="hama-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
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
.hama-print-score { border: 1.5pt solid #333; padding: 8pt 12pt; margin-bottom: 8pt; text-align: center; page-break-inside: avoid; }
.hama-score-value { font-family: system-ui, -apple-system, sans-serif; font-size: 16pt; font-weight: 700; color: #1a1a1a; margin-bottom: 2pt; }
.hama-score-interpretation { font-size: 10pt; font-weight: 600; color: #333; margin-bottom: 5pt; }
.hama-score-legend { display: flex; justify-content: center; gap: 8pt; font-size: 7pt; color: #888; padding-top: 4pt; border-top: 1px solid #ddd; flex-wrap: wrap; }
.hama-print-questions { margin-top: 6pt; }
.hama-print-question { margin-bottom: 1pt; padding: 2pt 0; border-bottom: 1px solid #eee; page-break-inside: avoid; }
.hama-print-question:last-child { border-bottom: none; }
.hama-question-text { font-size: 8pt; color: #333; }
.hama-answer-text { font-size: 8pt; padding-left: 12pt; color: #1a1a1a; font-weight: 600; }
</style>
