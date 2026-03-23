<template>
  <CalculatorPrintLayout :calculatorName="config.name" :patientName="patient.name" :patientCpr="patient.cpr" :patientAge="patient.age" :patientGender="patient.gender">
    <template #score-result>
      <div v-if="result" class="danpss-print-score">
        <table class="danpss-print-table">
          <thead>
            <tr>
              <th>Funktion</th><th>Symptom</th><th>Gene</th><th>Total</th><th>Interval</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sec in result.sections" :key="sec.name">
              <td>{{ sec.name }}</td><td>{{ sec.totalA }}</td><td>{{ sec.totalB }}</td><td>{{ sec.totalAB }}</td><td>{{ sec.interval }}</td>
            </tr>
            <tr class="danpss-total-row">
              <td>Vandladning</td><td>{{ result.totalA }}</td><td>{{ result.totalB }}</td><td><strong>{{ result.totalAB }}</strong></td><td>0-108</td>
            </tr>
            <tr v-if="result.sexualSection">
              <td>Seksualfunktion</td><td>{{ result.sexualSection.totalA }}</td><td>{{ result.sexualSection.totalB }}</td><td>{{ result.sexualSection.totalAB }}</td><td>{{ result.sexualSection.interval }}</td>
            </tr>
          </tbody>
        </table>
        <div class="danpss-score-interpretation">{{ result.interpretation }}</div>
        <div class="danpss-score-legend">
          <span>● &lt; 8: Let</span><span>● 8-19: Moderat</span><span>● &gt; 19: Svær</span>
        </div>
      </div>
    </template>
    <template #questions>
      <div v-if="result" class="danpss-print-questions">
        <div v-for="qr in result.questionResults" :key="qr.questionTextA" class="danpss-print-question">
          <div class="danpss-question-text">{{ qr.questionTextA }}</div>
          <div class="danpss-answer-text">► {{ qr.answerTextA }} ({{ qr.scoreA }}) | Gene: {{ qr.answerTextB }} ({{ qr.scoreB }}) | A×B: {{ qr.scoreAB }}</div>
        </div>
      </div>
    </template>
  </CalculatorPrintLayout>
</template>
<script setup lang="ts">
import CalculatorPrintLayout from './CalculatorPrintLayout.vue'
import type { PatientInfo } from '../../scoring/types'
import type { DanpssScoreResult, DanpssConfig } from '../../scoring/danpss'
defineProps<{ config: DanpssConfig; patient: PatientInfo; result: DanpssScoreResult | null }>()
</script>
<style>
.danpss-print-score { margin-bottom: 8pt; page-break-inside: avoid; }
.danpss-print-table { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 6pt; }
.danpss-print-table th { border: 1px solid #999; padding: 3pt 6pt; background: #f0f0f0; text-align: left; font-size: 8pt; }
.danpss-print-table td { border: 1px solid #ccc; padding: 2pt 6pt; }
.danpss-total-row { font-weight: 700; border-top: 2pt solid #333; }
.danpss-score-interpretation { font-size: 10pt; font-weight: 600; color: #333; text-align: center; margin: 6pt 0 4pt; }
.danpss-score-legend { display: flex; justify-content: center; gap: 16pt; font-size: 7pt; color: #888; }
.danpss-print-questions { margin-top: 4pt; }
.danpss-print-question { margin-bottom: 0; padding: 1.5pt 0; border-bottom: 1px solid #eee; page-break-inside: avoid; }
.danpss-print-question:last-child { border-bottom: none; }
.danpss-question-text { font-size: 7.5pt; color: #333; }
.danpss-answer-text { font-size: 7.5pt; padding-left: 10pt; color: #1a1a1a; font-weight: 600; }
</style>
