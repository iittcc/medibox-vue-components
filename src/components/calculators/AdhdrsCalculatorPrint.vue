<template>
  <CalculatorPrintLayout
    :calculatorName="config.name"
    :patientName="patient.name"
    :patientCpr="patient.cpr"
    :patientAge="patient.age"
    :patientGender="patient.gender"
  >
    <template #score-result>
      <div v-if="result" class="adhdrs-print-score">
        <div class="adhdrs-score-value">
          {{ config.shortName }} Score: {{ result.score }}
        </div>
        <div class="adhdrs-score-interpretation">
          {{ result.interpretation }}
        </div>
        <div class="adhdrs-score-subscores">
          Uopmærksomhed: {{ subscores.inattention }} |
          Hyperaktiv/impulsiv: {{ subscores.hyperactivityImpulsivity }} |
          Oppositionel: {{ subscores.oppositional }}
        </div>
        <div v-if="filledBy || relation" class="adhdrs-score-meta">
          <span v-if="filledBy">Udfyldt af: {{ filledBy }}</span>
          <span v-if="filledBy && relation"> | </span>
          <span v-if="relation">Relation: {{ relation }}</span>
        </div>
        <div class="adhdrs-score-legend">
          <span>● ≤ 60: Normal</span>
          <span>● 61-69: Borderline</span>
          <span>● ≥ 70: Svær</span>
        </div>
      </div>
    </template>

    <template #questions>
      <div v-if="result" class="adhdrs-print-questions">
        <div
          v-for="qr in result.questionResults"
          :key="qr.questionNumber"
          class="adhdrs-print-question"
        >
          <div class="adhdrs-question-text">{{ qr.questionText }}</div>
          <div class="adhdrs-answer-text">► {{ qr.answerText }} ({{ qr.score }})</div>
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
  subscores: { inattention: number; hyperactivityImpulsivity: number; oppositional: number; total: number }
  filledBy: string
  relation: string
}>()
</script>

<style>
.adhdrs-print-score {
  border: 1.5pt solid #333;
  padding: 8pt 12pt;
  margin-bottom: 8pt;
  text-align: center;
  page-break-inside: avoid;
}

.adhdrs-score-value {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16pt;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2pt;
}

.adhdrs-score-interpretation {
  font-size: 10pt;
  font-weight: 600;
  color: #333;
  margin-bottom: 2pt;
}

.adhdrs-score-subscores {
  font-size: 8pt;
  color: #555;
  margin-bottom: 2pt;
}

.adhdrs-score-meta {
  font-size: 8pt;
  color: #666;
  font-style: italic;
  margin-bottom: 4pt;
}

.adhdrs-score-legend {
  display: flex;
  justify-content: center;
  gap: 12pt;
  font-size: 7pt;
  color: #888;
  padding-top: 4pt;
  border-top: 1px solid #ddd;
}

.adhdrs-print-questions {
  margin-top: 6pt;
}

.adhdrs-print-question {
  margin-bottom: 0;
  padding: 1.5pt 0;
  border-bottom: 1px solid #eee;
  page-break-inside: avoid;
}

.adhdrs-print-question:last-child {
  border-bottom: none;
}

.adhdrs-question-text {
  font-size: 7.5pt;
  color: #333;
}

.adhdrs-answer-text {
  font-size: 7.5pt;
  padding-left: 12pt;
  color: #1a1a1a;
  font-weight: 600;
}
</style>
