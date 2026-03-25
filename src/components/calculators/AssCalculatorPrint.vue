<template>
  <CalculatorPrintLayout :calculatorName="config.name" :patientName="patient.name" :patientCpr="patient.cpr" :patientAge="patient.age" :patientGender="patient.gender">
    <template #score-result>
      <div v-if="result" class="ass-print-score">
        <div class="ass-score-value">{{ config.shortName }} Tolkningsforslag</div>
        <div class="ass-interpretation-lines">
          <div v-for="(line, i) in interpretationLines" :key="i" class="ass-interp-line">{{ line }}</div>
        </div>
      </div>
    </template>
    <template #questions>
      <div v-if="result" class="ass-print-questions">
        <div v-for="qr in result.questionResults" :key="qr.questionNumber" class="ass-print-question">
          <div class="ass-question-text">{{ qr.questionText }}</div>
          <div class="ass-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
        </div>
      </div>
    </template>
  </CalculatorPrintLayout>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import CalculatorPrintLayout from './CalculatorPrintLayout.vue'
import type { ScoreResult, PatientInfo, CalculatorConfig } from '../../scoring/types'

const props = defineProps<{ config: CalculatorConfig; patient: PatientInfo; result: ScoreResult | null }>()

const interpretationLines = computed(() => {
  if (!props.result) return []
  return props.result.interpretation.split('\n')
})
</script>
<style>
.ass-print-score { border: 1.5pt solid #333; padding: 6pt 10pt; margin-bottom: 6pt; page-break-inside: avoid; }
.ass-score-value { font-family: system-ui, -apple-system, sans-serif; font-size: 12pt; font-weight: 700; color: #1a1a1a; margin-bottom: 4pt; text-align: center; }
.ass-interpretation-lines { font-size: 8.5pt; color: #333; }
.ass-interp-line { padding: 1.5pt 0; }
.ass-print-questions { margin-top: 6pt; }
.ass-print-question { margin-bottom: 1pt; padding: 2pt 0; border-bottom: 1px solid #eee; page-break-inside: avoid; }
.ass-print-question:last-child { border-bottom: none; }
.ass-question-text { font-size: 8.5pt; color: #333; }
.ass-answer-text { font-size: 8.5pt; padding-left: 12pt; color: #1a1a1a; font-weight: 600; }
</style>
