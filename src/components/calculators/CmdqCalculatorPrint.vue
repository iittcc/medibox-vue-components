<template>
  <CalculatorPrintLayout :calculatorName="config.name" :patientName="patient.name" :patientCpr="patient.cpr" :patientAge="patient.age" :patientGender="patient.gender">
    <template #score-result>
      <div v-if="result" class="cmdq-print-score">
        <div class="cmdq-score-value">{{ config.shortName }} Screening</div>
        <div class="cmdq-subscale-results">
          <div v-for="sub in subscaleResults" :key="sub.key" class="cmdq-subscale-row">
            <span class="cmdq-subscale-label">{{ sub.label }}:</span>
            <span class="cmdq-subscale-score">{{ sub.score }}</span>
            <span v-if="sub.positive" class="cmdq-subscale-positive">POSITIV SCREENING</span>
          </div>
        </div>
      </div>
    </template>
    <template #questions>
      <div v-if="result" class="cmdq-print-questions">
        <div v-for="qr in result.questionResults" :key="qr.questionNumber" class="cmdq-print-question">
          <div class="cmdq-question-text">{{ qr.questionText }}</div>
          <div class="cmdq-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
        </div>
      </div>
    </template>
  </CalculatorPrintLayout>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import CalculatorPrintLayout from './CalculatorPrintLayout.vue'
import type { ScoreResult, PatientInfo, CalculatorConfig, Question } from '../../scoring/types'
import { getCmdqSubscaleScores } from '../../scoring/cmdq'

const props = defineProps<{
  config: CalculatorConfig
  patient: PatientInfo
  result: ScoreResult | null
  questions: Question[]
}>()

const subscaleResults = computed(() => getCmdqSubscaleScores(props.questions))
</script>
<style>
.cmdq-print-score { border: 1.5pt solid #333; padding: 6pt 10pt; margin-bottom: 6pt; page-break-inside: avoid; }
.cmdq-score-value { font-family: system-ui, -apple-system, sans-serif; font-size: 12pt; font-weight: 700; color: #1a1a1a; margin-bottom: 4pt; text-align: center; }
.cmdq-subscale-results { font-size: 8.5pt; }
.cmdq-subscale-row { display: flex; gap: 6pt; padding: 1.5pt 0; border-bottom: 1px solid #eee; }
.cmdq-subscale-row:last-child { border-bottom: none; }
.cmdq-subscale-label { flex: 1; color: #333; }
.cmdq-subscale-score { font-weight: 600; min-width: 20pt; }
.cmdq-subscale-positive { color: #c00; font-weight: 700; font-size: 7.5pt; }
.cmdq-print-questions { margin-top: 4pt; }
.cmdq-print-question { margin-bottom: 0; padding: 1.5pt 0; border-bottom: 1px solid #eee; page-break-inside: avoid; }
.cmdq-print-question:last-child { border-bottom: none; }
.cmdq-question-text { font-size: 7.5pt; color: #333; }
.cmdq-answer-text { font-size: 7.5pt; padding-left: 10pt; color: #1a1a1a; font-weight: 600; }
</style>
