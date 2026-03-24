<template>
  <CalculatorPrintLayout
    :calculatorName="config.name + ' (' + (mode === 'ham17' ? 'HAM-17' : 'HAM-6') + ')'"
    :patientName="patient.name" :patientCpr="patient.cpr"
    :patientAge="patient.age" :patientGender="patient.gender"
  >
    <template #score-result>
      <div v-if="result" class="hamilton-print-score">
        <div class="hamilton-score-value">{{ mode === 'ham17' ? 'Hamilton 17-item' : 'Hamilton 6-item' }}: {{ result.score }} point</div>
        <div class="hamilton-score-interpretation">{{ result.interpretation }}</div>
        <div class="hamilton-score-legend" v-if="mode === 'ham17'">
          <span>● 8-12: Tvivlsom</span><span>● 13-17: Lettere</span><span>● 18-24: Moderat</span><span>● 25+: Svær</span>
        </div>
        <div class="hamilton-score-legend" v-else>
          <span>● 5-6: Tvivlsom</span><span>● 7-8: Lettere</span><span>● 9-11: Moderat</span><span>● 12+: Svær</span>
        </div>
      </div>
    </template>
    <template #questions>
      <div v-if="result" class="hamilton-print-questions">
        <div v-for="qr in printQuestions" :key="qr.questionNumber" class="hamilton-print-question">
          <div class="hamilton-question-text">{{ qr.questionText }}</div>
          <div class="hamilton-answer-text">► {{ qr.answerText || 'Ikke til stede' }} ({{ qr.score }})</div>
        </div>
      </div>
    </template>
  </CalculatorPrintLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CalculatorPrintLayout from './CalculatorPrintLayout.vue'
import type { ScoreResult, PatientInfo, CalculatorConfig } from '../../scoring/types'
import { HAM6_INDICES } from '../../scoring/hamilton'

const props = defineProps<{ config: CalculatorConfig; patient: PatientInfo; result: ScoreResult | null; mode: string }>()

const printQuestions = computed(() => {
  if (!props.result) return []
  if (props.mode === 'ham6') {
    return props.result.questionResults.filter((_, i) => HAM6_INDICES.includes(i))
  }
  return props.result.questionResults
})
</script>

<style>
.hamilton-print-score { border: 1.5pt solid #333; padding: 8pt 12pt; margin-bottom: 8pt; text-align: center; page-break-inside: avoid; }
.hamilton-score-value { font-family: system-ui, -apple-system, sans-serif; font-size: 16pt; font-weight: 700; color: #1a1a1a; margin-bottom: 2pt; }
.hamilton-score-interpretation { font-size: 10pt; font-weight: 600; color: #333; margin-bottom: 5pt; }
.hamilton-score-legend { display: flex; justify-content: center; gap: 8pt; font-size: 7pt; color: #888; padding-top: 4pt; border-top: 1px solid #ddd; }
.hamilton-print-questions { margin-top: 6pt; }
.hamilton-print-question { margin-bottom: 1pt; padding: 2pt 0; border-bottom: 1px solid #eee; page-break-inside: avoid; }
.hamilton-print-question:last-child { border-bottom: none; }
.hamilton-question-text { font-size: 8.5pt; color: #333; }
.hamilton-answer-text { font-size: 8.5pt; padding-left: 12pt; color: #1a1a1a; font-weight: 600; }
</style>
