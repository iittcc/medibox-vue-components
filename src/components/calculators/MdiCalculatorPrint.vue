<template>
  <CalculatorPrintLayout
    :calculatorName="config.name" :patientName="patient.name" :patientCpr="patient.cpr"
    :patientAge="patient.age" :patientGender="patient.gender"
  >
    <template #score-result>
      <div v-if="result" class="mdi-print-score">
        <div class="mdi-score-value">{{ config.shortName }} Score: {{ result.score }}</div>
        <div class="mdi-score-interpretation">{{ result.interpretation }}</div>
        <div class="mdi-score-icd10">ICD-10: {{ icd10.diagnosis }} ({{ icd10.bCount }}B + {{ icd10.cCount }}C)<template v-if="icd10.treatment"> — {{ icd10.treatment }}</template></div>
        <div class="mdi-score-legend">
          <span>● &lt;20: Ingen</span><span>● 20-24: Let</span><span>● 25-29: Moderat</span><span>● ≥30: Svær</span>
        </div>
      </div>
    </template>
    <template #questions>
      <div v-if="result" class="mdi-print-questions">
        <div v-for="qr in result.questionResults" :key="qr.questionNumber" class="mdi-print-question">
          <div class="mdi-question-text">{{ qr.questionText }}</div>
          <div class="mdi-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
        </div>
      </div>
    </template>
  </CalculatorPrintLayout>
</template>

<script setup lang="ts">
import CalculatorPrintLayout from './CalculatorPrintLayout.vue'
import type { ScoreResult, PatientInfo, CalculatorConfig } from '../../scoring/types'

defineProps<{
  config: CalculatorConfig
  patient: PatientInfo
  result: ScoreResult | null
  icd10: { bCount: number; cCount: number; diagnosis: string; treatment: string }
}>()
</script>

<style>
.mdi-print-score { border: 1.5pt solid #333; padding: 8pt 12pt; margin-bottom: 8pt; text-align: center; page-break-inside: avoid; }
.mdi-score-value { font-family: system-ui, -apple-system, sans-serif; font-size: 16pt; font-weight: 700; color: #1a1a1a; margin-bottom: 2pt; }
.mdi-score-interpretation { font-size: 10pt; font-weight: 600; color: #333; margin-bottom: 2pt; }
.mdi-score-icd10 { font-size: 9pt; color: #555; margin-bottom: 5pt; }
.mdi-score-legend { display: flex; justify-content: center; gap: 8pt; font-size: 6.5pt; color: #888; padding-top: 4pt; border-top: 1px solid #ddd; }
.mdi-print-questions { margin-top: 6pt; }
.mdi-print-question { margin-bottom: 0; padding: 2pt 0; border-bottom: 1px solid #eee; page-break-inside: avoid; }
.mdi-print-question:last-child { border-bottom: none; }
.mdi-question-text { font-size: 8pt; color: #333; }
.mdi-answer-text { font-size: 8pt; padding-left: 12pt; color: #1a1a1a; font-weight: 600; }
</style>
