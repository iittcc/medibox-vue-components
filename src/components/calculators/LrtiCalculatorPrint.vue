<template>
  <CalculatorPrintLayout :calculatorName="config.name" :patientName="patient.name" :patientCpr="patient.cpr" :patientAge="patient.age" :patientGender="patient.gender">
    <template #score-result>
      <div v-if="result" class="lrti-print-score">
        <div class="lrti-score-value">{{ config.shortName }}: {{ result.score }} symptomer</div>
        <div class="lrti-score-interpretation">{{ result.interpretation }}</div>
      </div>
    </template>
    <template #questions>
      <div v-if="result" class="lrti-print-questions">
        <div v-for="qr in result.questionResults" :key="qr.questionNumber" class="lrti-print-question">
          <div class="lrti-question-text">{{ qr.questionText }}</div>
          <div class="lrti-answer-text">► {{ qr.answerText }}</div>
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
.lrti-print-score { border: 1.5pt solid #333; padding: 8pt 12pt; margin-bottom: 8pt; text-align: center; page-break-inside: avoid; }
.lrti-score-value { font-family: system-ui, -apple-system, sans-serif; font-size: 16pt; font-weight: 700; color: #1a1a1a; margin-bottom: 2pt; }
.lrti-score-interpretation { font-size: 10pt; font-weight: 600; color: #333; }
.lrti-print-questions { margin-top: 6pt; }
.lrti-print-question { margin-bottom: 1pt; padding: 2.5pt 0; border-bottom: 1px solid #eee; page-break-inside: avoid; }
.lrti-print-question:last-child { border-bottom: none; }
.lrti-question-text { font-size: 8.5pt; color: #333; margin-bottom: 0; }
.lrti-answer-text { font-size: 8.5pt; padding-left: 12pt; color: #1a1a1a; font-weight: 600; }
</style>
