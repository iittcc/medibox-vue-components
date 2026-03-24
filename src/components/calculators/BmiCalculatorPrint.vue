<template>
  <CalculatorPrintLayout
    calculatorName="Body Mass Index (BMI)"
    :patientName="name"
    patientCpr=""
    :patientAge="0"
    patientGender=""
    :showCpr="false"
  >
    <template #score-result>
      <div class="bmi-print-score">
        <div class="bmi-score-value">
          BMI: {{ bmiValue.toFixed(1) }} — {{ bmiCategory.label }}
        </div>
        <div class="bmi-score-details">
          Højde: {{ height }} cm &nbsp;·&nbsp;
          Vægt: {{ weight }} kg &nbsp;·&nbsp;
          Idealvægt: {{ idealWeight.min }} – {{ idealWeight.max }} kg
        </div>
        <div class="bmi-score-legend">
          <span v-for="cat in BMI_CATEGORIES" :key="cat.label">
            <template v-if="cat.maxBmi < 10000">
              ● {{ cat.minBmi.toFixed(1) }}–{{ cat.maxBmi.toFixed(1) }}: {{ cat.label }}
            </template>
            <template v-else>
              ● {{ cat.minBmi.toFixed(1) }}+: {{ cat.label }}
            </template>
          </span>
        </div>
      </div>
    </template>

    <template #questions>
      <div v-if="weightPlan" class="bmi-print-weightplan">
        <div class="bmi-plan-header">Vægtplan</div>
        <div class="bmi-plan-summary">
          Ønsket vægtændring: <b>{{ weightChange }} kg</b> &nbsp;·&nbsp;
          Over: <b>{{ weeks }} {{ weeks === 1 ? 'uge' : 'uger' }}</b> &nbsp;·&nbsp;
          Målvægt: <b>{{ (weight + weightChange).toFixed(1) }} kg</b> &nbsp;·&nbsp;
          Per uge: <b>{{ (weeks > 0 ? weightChange / weeks : 0).toFixed(2) }} kg</b>
        </div>

        <!-- Chart as static image captured from the interactive canvas -->
        <div v-if="chartImageSrc" class="bmi-print-chart">
          <img :src="chartImageSrc" alt="Vægtplan graf" class="bmi-print-chart-img" />
        </div>

        <!-- Week-by-week tables -->
        <div
          v-for="(chunk, ci) in weekChunks"
          :key="ci"
          class="bmi-week-table"
        >
          <table>
            <tr>
              <td class="bmi-week-label">Uge</td>
              <td v-for="point in chunk" :key="'w' + point.week" class="bmi-week-cell">
                {{ point.week }}
              </td>
            </tr>
            <tr>
              <td class="bmi-week-label">Forventet vægt</td>
              <td v-for="point in chunk" :key="'e' + point.week" class="bmi-week-cell">
                {{ point.weight }}
              </td>
            </tr>
            <tr>
              <td class="bmi-week-label">Målt vægt</td>
              <td v-for="point in chunk" :key="'m' + point.week" class="bmi-week-cell">
                <template v-if="point.week === 0">{{ weight.toFixed(1) }}</template>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </template>
  </CalculatorPrintLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CalculatorPrintLayout from './CalculatorPrintLayout.vue'
import { BMI_CATEGORIES, type BmiCategory, type WeightPlanResult } from '../../scoring/bmi'

const props = defineProps<{
  name: string
  height: number
  weight: number
  bmiValue: number
  bmiCategory: BmiCategory
  idealWeight: { min: number, max: number }
  weightChange: number
  weeks: number
  weightPlan: WeightPlanResult
  chartImageSrc: string
}>()

// Split week points into chunks of 13 for table rows
const weekChunks = computed(() => {
  const chunks = []
  const points = props.weightPlan.points
  for (let i = 0; i < points.length; i += 13) {
    chunks.push(points.slice(i, i + 13))
  }
  return chunks
})
</script>

<style>
.bmi-print-score {
  border: 1.5pt solid #333;
  padding: 8pt 12pt;
  margin-bottom: 8pt;
  text-align: center;
  page-break-inside: avoid;
}

.bmi-score-value {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 16pt;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 2pt;
}

.bmi-score-details {
  font-size: 9pt;
  color: #333;
  margin-bottom: 5pt;
}

.bmi-score-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4pt 12pt;
  font-size: 6.5pt;
  color: #888;
  padding-top: 4pt;
  border-top: 1px solid #ddd;
}

.bmi-print-weightplan {
  margin-top: 8pt;
}

.bmi-plan-header {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 10pt;
  font-weight: 700;
  color: #333;
  text-align: center;
  margin: 0 auto;
}


.bmi-plan-summary {
  font-size: 8.5pt;
  color: #333;
  text-align: center;
  margin: 0 auto;
}

.bmi-print-chart {
  margin-bottom: 6pt;
  page-break-inside: avoid;
}

.bmi-print-chart-img {
  width: 100%;
  max-height: 300pt;
  object-fit: contain;
}

.bmi-week-table {
  margin-bottom: 4pt;
  page-break-inside: avoid;
  text-align: center;
}

.bmi-week-table table {
  border-collapse: collapse;
  font-size: 7.5pt;
  font-family: system-ui, -apple-system, sans-serif;
  text-align: center;
  margin: 0 auto;
}

.bmi-week-label {
  border: 1px solid #333;
  padding: 2pt 4pt;
  font-weight: 600;
  text-align: left;
  white-space: nowrap;
}

.bmi-week-cell {
  border: 1px solid #333;
  padding: 2pt 4pt;
  text-align: center;
  min-width: 24pt;
}
</style>
