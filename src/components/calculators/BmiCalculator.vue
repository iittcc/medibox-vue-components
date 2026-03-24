<template>
  <div class="medical-calculator-container">
    <div class="calculator-print-wrapper">
      <div class="calculator-interactive-view w-full max-w-[800px] mx-auto px-4">

        <SurfaceCard title="Patient">
          <template #content>
            <PersonInfo
              :name="name"
              :age="55"
              :minAge="1"
              :maxAge="120"
              :gender="'male'"
              genderdisplay="none"
              @update:name="name = $event"
            />
          </template>
        </SurfaceCard>

        <SurfaceCard title="Body Mass Index">
          <template #button>
            <CopyDialog
              title="Kopier til Clipboard"
              icon="pi pi-clipboard"
              severity="secondary"
            >
              <template #container>
                <b>{{ bmiConfig.name }}</b>
                <br /><br />
                Navn: {{ name }}<br /><br />
                Højde: {{ height }} cm<br />
                Vægt: {{ weight }} kg<br />
                Beregnet BMI: {{ bmiValue.toFixed(1) }}<br />
                Klassifikation: {{ bmiCategory.label }}<br />
                Idealvægt: {{ idealWeight.min }} – {{ idealWeight.max }} kg<br /><br />
                <b>Vægtplan</b><br />
                Ønsket vægtændring: {{ weightChange }} kg<br />
                Over: {{ weeks }} {{ weeks === 1 ? 'uge' : 'uger' }}<br />
                Målvægt: {{ (weight + weightChange).toFixed(1) }} kg
              </template>
            </CopyDialog>
          </template>
          <template #content>
            <div class="flex flex-col sm:flex-row gap-2">
              <SurfaceCardItem class="flex-1">
                <template #icon>
                  <span class="material-symbols-outlined">straighten</span>
                </template>
                <template #title>Højde</template>
                <template #content>
                  <NumberSliderInput
                    v-model="height"
                    :min="bmiConfig.minHeight"
                    :max="bmiConfig.maxHeight"
                    :step="1"
                    suffix=" cm"
                    :normalMin="155"
                    :normalMax="195"
                    :tooltip="false"
                    sliderType="prime"
                  />
                </template>
              </SurfaceCardItem>

              <SurfaceCardItem class="flex-1">
                <template #icon>
                  <span class="material-symbols-outlined">monitor_weight</span>
                </template>
                <template #title>Vægt</template>
                <template #content>
                  <NumberSliderInput
                    v-model="weight"
                    :min="bmiConfig.minWeight"
                    :max="bmiConfig.maxWeight"
                    :step="1"
                    suffix=" kg"
                    :normalMin="idealWeight.min"
                    :normalMax="idealWeight.max"
                    :tooltip="false"
                    sliderType="custom"
                  />
                </template>
              </SurfaceCardItem>
            </div>

            <!-- BMI Result -->
            <div class="mt-6">
              <Message
                class="flex justify-center p-3 text-center"
                :severity="bmiSeverity"
              >
                <h2>BMI: {{ bmiValue.toFixed(1) }} — {{ bmiCategory.label }}</h2>
                <p class="text-sm mt-1">
                  Idealvægt: {{ idealWeight.min }} – {{ idealWeight.max }} kg
                </p>
              </Message>
            </div>

            <!-- BMI Categories Reference Table -->
            <div class="overflow-hidden rounded-lg border border-gray-200 mt-4">
              <table class="w-full text-sm">
                <thead>
                  <tr
                    class="border-b border-gray-200"
                    :style="{ backgroundColor: 'var(--p-primary-50)' }"
                  >
                    <th class="px-3 py-2 w-8"></th>
                    <th class="px-3 py-2 text-left font-semibold text-gray-700">BMI</th>
                    <th class="px-3 py-2 text-left font-semibold text-gray-700">
                      Klassifikation
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="cat in BMI_CATEGORIES"
                    :key="cat.label"
                    class="border-b border-gray-100 last:border-b-0 text-gray-600"
                    :class="{ 'font-bold text-gray-900': bmiCategory.label === cat.label }"
                    :style="
                      bmiCategory.label === cat.label
                        ? { backgroundColor: 'var(--p-primary-100)' }
                        : {}
                    "
                  >
                    <td class="px-3 py-1.5 text-center">
                      <span v-if="bmiCategory.label === cat.label">►</span>
                    </td>
                    <td class="px-3 py-1.5">{{ formatBmiRange(cat) }}</td>
                    <td class="px-3 py-1.5">{{ cat.label }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </SurfaceCard>

        <!-- Weight Plan -->
        <SurfaceCard title="Vægtplan">
          <template #content>
            <div class="flex flex-col sm:flex-row gap-2">
              <SurfaceCardItem class="flex-1">
                <template #icon>
                  <span class="material-symbols-outlined">swap_vert</span>
                </template>
                <template #title>Ønsket vægtændring</template>
                <template #content>
                  <NumberSliderInput
                    v-model="weightChange"
                    :min="bmiConfig.minWeightChange"
                    :max="bmiConfig.maxWeightChange"
                    :step="1"
                    suffix=" kg"
                    :normalMin="-10"
                    :normalMax="0"
                    :tooltip="false"
                    sliderType="prime"
                  />
                </template>
              </SurfaceCardItem>

              <SurfaceCardItem class="flex-1">
                <template #icon>
                  <span class="material-symbols-outlined">date_range</span>
                </template>
                <template #title>Over en periode på</template>
                <template #content>
                  <NumberSliderInput
                    v-model="weeks"
                    :min="bmiConfig.minWeeks"
                    :max="bmiConfig.maxWeeks"
                    :step="1"
                    :suffix="weeks === 1 ? ' uge' : ' uger'"
                    :normalMin="4"
                    :normalMax="26"
                    :tooltip="false"
                    sliderType="prime"
                  />
                </template>
              </SurfaceCardItem>
            </div>

            <!-- Weight Plan Summary -->
            <div class="mt-4 flex gap-4 text-sm text-gray-600 pl-1">
              <span>Startvægt: <b>{{ weight }} kg</b></span>
              <span>Målvægt: <b>{{ (weight + weightChange).toFixed(1) }} kg</b></span>
              <span>
                Per uge: <b>{{ (weeks > 0 ? weightChange / weeks : 0).toFixed(2) }} kg</b>
              </span>
            </div>

            <!-- Chart -->
            <div class="mt-4 h-[440px]">
              <Chart
                ref="chartRef"
                type="line"
                :data="chartData"
                :options="chartOptions"
                class="w-full h-full"
              />
            </div>
          </template>
        </SurfaceCard>

        <!-- Action Buttons -->
        <div class="flex justify-end text-right mt-5 gap-3 mb-8">
          <SecondaryButton
            label="Print"
            icon="pi pi-print"
            severity="secondary"
            @click="handlePrint"
          />
          <SecondaryButton
            label="Reset"
            icon="pi pi-sync"
            severity="secondary"
            @click="handleReset"
          />
        </div>
      </div>

      <BmiCalculatorPrint
        :name="name"
        :height="height"
        :weight="weight"
        :bmiValue="bmiValue"
        :bmiCategory="bmiCategory"
        :idealWeight="idealWeight"
        :weightChange="weightChange"
        :weeks="weeks"
        :weightPlan="weightPlan"
        :chartImageSrc="chartImageSrc"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import Chart from 'primevue/chart'
import Message from '@/volt/Message.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'
import SurfaceCard from '../SurfaceCard.vue'
import SurfaceCardItem from '../SurfaceCardItem.vue'
import CopyDialog from '../CopyDialog.vue'
import PersonInfo from '../PersonInfo.vue'
import NumberSliderInput from '../NumberSliderInput.vue'
import BmiCalculatorPrint from './BmiCalculatorPrint.vue'

import {
  bmiConfig,
  calculateBmi,
  getBmiCategory,
  calculateIdealWeight,
  calculateWeightPlan,
  formatBmiRange,
  BMI_CATEGORIES,
} from '../../scoring/bmi'

const name = ref('')
const height = ref(bmiConfig.defaultHeight)
const weight = ref(bmiConfig.defaultWeight)
const weightChange = ref(bmiConfig.defaultWeightChange)
const weeks = ref(bmiConfig.defaultWeeks)
const chartRef = ref<InstanceType<typeof Chart> | null>(null)
const chartImageSrc = ref('')

// Capture chart as static image for print view (canvas is invisible in display:none)
function updateChartImage() {
  nextTick(() => {
    const chart = (chartRef.value as any)?.chart
    if (chart) {
      chartImageSrc.value = chart.toBase64Image()
    }
  })
}
watch([height, weight, weightChange, weeks], updateChartImage, { immediate: false })
// Initial capture after mount
nextTick(() => setTimeout(updateChartImage, 100))

const bmiValue = computed(() => calculateBmi(height.value, weight.value))
const bmiCategory = computed(() => getBmiCategory(bmiValue.value))
const idealWeight = computed(() => calculateIdealWeight(height.value))
const weightPlan = computed(() =>
  calculateWeightPlan(weight.value, weightChange.value, weeks.value)
)

const bmiSeverity = computed(() => {
  switch (bmiCategory.value.severity) {
    case 'normal': return 'success'
    case 'mild': return 'warn'
    case 'moderate': return 'error'
    case 'severe': return 'error'
    default: return 'info'
  }
})

// Chart data — 2-point {x,y} datasets for straight lines, all week labels for grid
const chartData = computed(() => {
  const plan = weightPlan.value
  const ideal = idealWeight.value
  const w = plan.weeks

  return {
    labels: Array.from({ length: w + 1 }, (_, i) => i),
    datasets: [
      {
        label: 'Vægtændring',
        data: [{ x: 0, y: plan.startWeight }, { x: w, y: plan.targetWeight }],
        borderColor: '#16a34a',
        backgroundColor: 'rgba(22, 163, 74, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        spanGaps: true,
      },
      {
        label: 'Idealvægt (min)',
        data: [{ x: 0, y: ideal.min }, { x: w, y: ideal.min }],
        borderColor: '#dc2626',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        spanGaps: true,
      },
      {
        label: 'Idealvægt (max)',
        data: [{ x: 0, y: ideal.max }, { x: w, y: ideal.max }],
        borderColor: '#dc2626',
        borderWidth: 1,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
        spanGaps: true,
      },
    ],
  }
})

const chartOptions = computed(() => {
  const plan = weightPlan.value
  const ideal = idealWeight.value

  const allWeights = [
    ...plan.points.map(p => p.weight),
    ideal.min,
    ideal.max,
  ]
  const yMin = Math.floor(Math.min(...allWeights) / 5) * 5
  const yMax = Math.ceil(Math.max(...allWeights) / 5) * 5

  return {
    animation: { duration: 0 },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'linear' as const,
        min: 0,
        max: plan.weeks,
        title: { display: true, text: 'Uger' },
        ticks: { stepSize: 1 },
        grid: { display: true, color: '#d4d4d4' },
      },
      y: {
        title: { display: true, text: 'kg' },
        min: yMin,
        max: yMax,
        grid: { display: true, color: '#d4d4d4' },
      },
    },
    plugins: {
      legend: { display: true, position: 'bottom' as const },
      datalabels: { display: false },
    },
  }
})

// Week text for suffix changes handled inline via computed in template

function handleReset(): void {
  name.value = ''
  height.value = bmiConfig.defaultHeight
  weight.value = bmiConfig.defaultWeight
  weightChange.value = bmiConfig.defaultWeightChange
  weeks.value = bmiConfig.defaultWeeks
}

function handlePrint(): void {
  window.print()
}
</script>
