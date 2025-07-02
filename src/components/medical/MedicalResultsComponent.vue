<template>
  <div class="medical-calculator-container">
    <div class="medical-results" :class="resultClasses">
      <!-- Results Header -->
      <div class="results-header mb-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">
              {{ title || 'Beregningsresultat' }}
            </h2>
            <p v-if="subtitle" class="text-gray-600">
              {{ subtitle }}
            </p>
          </div>
          <div class="flex gap-2">
            <Button
              v-if="showExport"
              icon="pi pi-download"
              severity="secondary"
              outlined
              @click="exportResults"
              v-tooltip.left="'Eksporter resultat'"
            />
            <Button
              v-if="showPrint"
              icon="pi pi-print"
              severity="secondary"
              outlined
              @click="printResults"
              v-tooltip.left="'Udskriv resultat'"
            />
            <Button
              v-if="showCopy"
              icon="pi pi-copy"
              severity="secondary"
              outlined
              @click="copyResults"
              v-tooltip.left="'Kopier til udklipsholder'"
            />
          </div>
        </div>

        <!-- Metadata -->
        <div v-if="showMetadata" class="metadata text-sm text-gray-500 space-y-1">
          <div>Beregnet: {{ formatDate(calculatedAt) }}</div>
          <div v-if="duration">Varighed: {{ formatDuration(duration) }}</div>
          <div v-if="calculatorVersion">Version: {{ calculatorVersion }}</div>
        </div>
      </div>

      <!-- Score Display -->
      <div class="score-section mb-6">
        <Card class="score-card" :class="scoreCardClasses">
          <template #content>
            <div class="score-display text-center">
              <!-- Main Score -->
              <div class="main-score mb-4">
                <div class="score-value text-6xl font-bold mb-2" :class="scoreValueClasses">
                  {{ formattedScore }}
                </div>
                <div v-if="maxScore" class="score-range text-lg text-gray-600">
                  af {{ maxScore }}
                </div>
                <div v-if="unit" class="score-unit text-sm text-gray-500">
                  {{ unit }}
                </div>
              </div>

              <!-- Risk Level Badge -->
              <div v-if="riskLevel" class="risk-level mb-4">
                <Tag :value="riskLevelText" :severity="riskLevelSeverity" class="text-base px-4 py-2" />
              </div>

              <!-- Score Details -->
              <div v-if="scoreDetails && Object.keys(scoreDetails).length > 0" class="score-details">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div v-for="(value, key) in scoreDetails" :key="key" class="detail-item">
                    <div class="text-sm font-medium text-gray-700">{{ formatDetailKey(key) }}</div>
                    <div class="text-lg font-semibold" :class="getDetailValueClass(key, value)">
                      {{ formatDetailValue(value) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Chart Section -->
      <div v-if="chartData && showChart" class="chart-section mb-6">
        <Card>
          <template #title>Visuelt resultat</template>
          <template #content>
            <Chart
              :type="chartType"
              :data="chartData"
              :options="chartOptions"
              class="chart-container"
            />
          </template>
        </Card>
      </div>

      <!-- Interpretation -->
      <div class="interpretation-section mb-6">
        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-info-circle text-blue-600"></i>
              Fortolkning
            </div>
          </template>
          <template #content>
            <div class="interpretation-content space-y-4">
              <p class="text-gray-700 leading-relaxed">
                {{ interpretation }}
              </p>
              
              <!-- Clinical Significance -->
              <div v-if="clinicalSignificance" class="clinical-significance">
                <h4 class="font-semibold text-gray-800 mb-2">Klinisk betydning:</h4>
                <p class="text-gray-700">{{ clinicalSignificance }}</p>
              </div>

              <!-- Warnings -->
              <div v-if="warnings && warnings.length > 0" class="warnings">
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div class="flex items-start gap-2">
                    <i class="pi pi-exclamation-triangle text-yellow-600 mt-1"></i>
                    <div>
                      <h4 class="font-semibold text-yellow-800 mb-2">Vigtige bemærkninger:</h4>
                      <ul class="space-y-1">
                        <li v-for="warning in warnings" :key="warning" class="text-yellow-700">
                          • {{ warning }}
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Recommendations -->
      <div v-if="recommendations && recommendations.length > 0" class="recommendations-section mb-6">
        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-lightbulb text-green-600"></i>
              Anbefalinger
            </div>
          </template>
          <template #content>
            <div class="recommendations-content">
              <div class="space-y-3">
                <div
                  v-for="(recommendation, index) in recommendations"
                  :key="index"
                  class="recommendation-item flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div class="recommendation-number">
                    <span class="inline-flex items-center justify-center w-6 h-6 bg-green-600 text-white text-sm font-semibold rounded-full">
                      {{ index + 1 }}
                    </span>
                  </div>
                  <div class="recommendation-text text-green-800">
                    {{ recommendation }}
                  </div>
                </div>
              </div>

              <!-- Next Steps -->
              <div v-if="nextSteps" class="next-steps mt-4 pt-4 border-t border-green-200">
                <h4 class="font-semibold text-green-800 mb-2">Næste skridt:</h4>
                <p class="text-green-700">{{ nextSteps }}</p>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Additional Information -->
      <div v-if="additionalInfo" class="additional-info-section mb-6">
        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-book text-purple-600"></i>
              Yderligere information
            </div>
          </template>
          <template #content>
            <div class="additional-info-content">
              <div v-html="additionalInfo" class="prose prose-sm max-w-none"></div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Reference Information -->
      <div v-if="showReferences && references" class="references-section">
        <Card>
          <template #title>
            <div class="flex items-center gap-2">
              <i class="pi pi-file-pdf text-gray-600"></i>
              Referencer
            </div>
          </template>
          <template #content>
            <div class="references-content">
              <div class="text-sm text-gray-600 space-y-2">
                <div v-for="reference in references" :key="reference" class="reference-item">
                  {{ reference }}
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Chart from 'primevue/chart'
import { useToast } from 'primevue/usetoast'
import type { MedicalChartData, MedicalChartOptions, CalculatorDetails, RiskLevel } from '@/types/calculatorTypes'

export interface ResultScore {
  value: number
  max?: number
  unit?: string
  details?: CalculatorDetails
}

export interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar'
  data: MedicalChartData
  options?: MedicalChartOptions
}

interface Props {
  // Core result data
  score: number | ResultScore
  interpretation: string
  recommendations?: string[]
  riskLevel?: RiskLevel
  
  // Display options
  title?: string
  subtitle?: string
  maxScore?: number
  unit?: string
  theme?: 'sky' | 'teal' | 'orange'
  
  // Additional content
  warnings?: string[]
  clinicalSignificance?: string
  additionalInfo?: string
  nextSteps?: string
  references?: string[]
  
  // Chart data
  chartData?: MedicalChartData
  chartType?: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar'
  chartOptions?: MedicalChartOptions
  showChart?: boolean
  
  // Metadata
  calculatedAt?: Date
  duration?: number
  calculatorVersion?: string
  showMetadata?: boolean
  
  // Action buttons
  showExport?: boolean
  showPrint?: boolean
  showCopy?: boolean
  showReferences?: boolean
  
  // Score details
  scoreDetails?: CalculatorDetails
}

interface Emits {
  (e: 'export', format: string): void
  (e: 'print'): void
  (e: 'copy'): void
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'teal',
  showChart: true,
  showMetadata: true,
  showExport: true,
  showPrint: true,
  showCopy: true,
  showReferences: false,
  chartType: 'bar'
})

const emit = defineEmits<Emits>()

const toast = useToast()

// Computed properties for score handling
const scoreValue = computed(() => {
  return typeof props.score === 'number' ? props.score : props.score.value
})

const scoreMax = computed(() => {
  if (typeof props.score === 'object' && props.score.max) {
    return props.score.max
  }
  return props.maxScore
})

const scoreUnit = computed(() => {
  if (typeof props.score === 'object' && props.score.unit) {
    return props.score.unit
  }
  return props.unit
})

const scoreDetails = computed(() => {
  if (typeof props.score === 'object' && props.score.details) {
    return props.score.details
  }
  return props.scoreDetails
})

const formattedScore = computed(() => {
  if (scoreUnit.value === '%') {
    return `${scoreValue.value}%`
  }
  return scoreValue.value.toString()
})

// Risk level handling
const riskLevelText = computed(() => {
  const riskLabels: Record<string, string> = {
    'low': 'Lavt risiko',
    'minimal': 'Minimal risiko',
    'mild': 'Let',
    'medium': 'Moderat risiko',
    'moderate': 'Moderat',
    'high': 'Højt risiko',
    'severe': 'Alvorlig',
    'very_high': 'Meget højt risiko'
  }
  
  return riskLabels[props.riskLevel || ''] || props.riskLevel || ''
})

const riskLevelSeverity = computed(() => {
  const severityMap: Record<string, string> = {
    'low': 'success',
    'minimal': 'success',
    'mild': 'info',
    'medium': 'warning',
    'moderate': 'warning',
    'high': 'danger',
    'severe': 'danger',
    'very_high': 'danger'
  }
  
  return severityMap[props.riskLevel || ''] || 'info'
})

// Styling classes
const resultClasses = computed(() => ({
  'results-sky': props.theme === 'sky',
  'results-teal': props.theme === 'teal',
  'results-orange': props.theme === 'orange'
}))

const scoreCardClasses = computed(() => ({
  'score-card-success': props.riskLevel === 'low' || props.riskLevel === 'minimal',
  'score-card-warning': props.riskLevel === 'medium' || props.riskLevel === 'moderate' || props.riskLevel === 'mild',
  'score-card-danger': props.riskLevel === 'high' || props.riskLevel === 'severe' || props.riskLevel === 'very_high'
}))

const scoreValueClasses = computed(() => ({
  'text-green-600': props.riskLevel === 'low' || props.riskLevel === 'minimal',
  'text-yellow-600': props.riskLevel === 'medium' || props.riskLevel === 'moderate' || props.riskLevel === 'mild',
  'text-red-600': props.riskLevel === 'high' || props.riskLevel === 'severe' || props.riskLevel === 'very_high',
  'text-gray-700': !props.riskLevel
}))

// Chart options
const chartOptions = computed(() => {
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
  
  return { ...defaultOptions, ...props.chartOptions }
})

// Utility functions
const formatDate = (date?: Date): string => {
  if (!date) return ''
  return new Intl.DateTimeFormat('da-DK', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date)
}

const formatDuration = (seconds?: number): string => {
  if (!seconds) return ''
  
  if (seconds < 60) {
    return `${seconds} sekunder`
  } else {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }
}

const formatDetailKey = (key: string): string => {
  const keyLabels: Record<string, string> = {
    'depressionScore': 'Depression score',
    'anxietyScore': 'Angst score',
    'symptomScore': 'Symptom score',
    'qualityOfLife': 'Livskvalitet',
    'rawScore': 'Rå score',
    'percentageScore': 'Procent score'
  }
  
  return keyLabels[key] || key.charAt(0).toUpperCase() + key.slice(1)
}

const formatDetailValue = (value: string | number | boolean): string => {
  if (typeof value === 'boolean') {
    return value ? 'Ja' : 'Nej'
  }
  if (typeof value === 'number') {
    return value.toString()
  }
  return String(value)
}

const getDetailValueClass = (key: string, value: string | number | boolean): string => {
  if (typeof value === 'number') {
    return 'text-blue-600'
  }
  if (typeof value === 'boolean') {
    return value ? 'text-green-600' : 'text-red-600'
  }
  return 'text-gray-700'
}

// Action handlers
const exportResults = () => {
  emit('export', 'json')
  toast.add({
    severity: 'success',
    summary: 'Eksport startet',
    detail: 'Resultatet bliver forberedt til download',
    life: 3000
  })
}

const printResults = () => {
  emit('print')
  window.print()
}

const copyResults = async () => {
  const resultText = generateResultText()
  
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(resultText)
        toast.add({
          severity: 'success',
          summary: 'Kopieret',
          detail: 'Resultatet er kopieret til udklipsholderen',
          life: 3000
        })
        emit('copy')
        return
      } catch (clipboardError) {
        console.warn('Clipboard API failed, falling back to textarea method:', clipboardError)
      }
    }
    
    // Fallback to textarea method for unsupported browsers or HTTPS issues
    const textarea = document.createElement('textarea')
    textarea.value = resultText
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    textarea.style.top = '-9999px'
    textarea.style.opacity = '0'
    textarea.setAttribute('readonly', '')
    textarea.setAttribute('aria-hidden', 'true')
    
    document.body.appendChild(textarea)
    
    try {
      textarea.select()
      textarea.setSelectionRange(0, textarea.value.length)
      
      const successful = document.execCommand('copy')
      if (successful) {
        toast.add({
          severity: 'success',
          summary: 'Kopieret',
          detail: 'Resultatet er kopieret til udklipsholderen',
          life: 3000
        })
        emit('copy')
      } else {
        throw new Error('Document.execCommand copy failed')
      }
    } finally {
      document.body.removeChild(textarea)
    }
    
  } catch (error) {
    console.error('All copy methods failed:', error)
    toast.add({
      severity: 'error',
      summary: 'Fejl',
      detail: 'Kunne ikke kopiere til udklipsholder',
      life: 5000
    })
  }
}

const generateResultText = (): string => {
  let text = `${props.title || 'Beregningsresultat'}\n`
  text += `Score: ${formattedScore.value}`
  if (scoreMax.value) text += ` af ${scoreMax.value}`
  text += '\n'
  
  if (props.riskLevel) {
    text += `Risiko niveau: ${riskLevelText.value}\n`
  }
  
  text += `\nFortolkning: ${props.interpretation}\n`
  
  if (props.recommendations && props.recommendations.length > 0) {
    text += '\nAnbefalinger:\n'
    props.recommendations.forEach((rec, index) => {
      text += `${index + 1}. ${rec}\n`
    })
  }
  
  if (props.calculatedAt) {
    text += `\nBeregnet: ${formatDate(props.calculatedAt)}`
  }
  
  return text
}
</script>

<style scoped>
.medical-results {
  @apply space-y-6;
}

.score-card {
  @apply border-2;
}

.score-card-success {
  @apply border-green-200 bg-green-50;
}

.score-card-warning {
  @apply border-yellow-200 bg-yellow-50;
}

.score-card-danger {
  @apply border-red-200 bg-red-50;
}

.chart-container {
  @apply h-64;
}

.recommendation-item {
  @apply transition-all duration-200 hover:shadow-sm;
}

.recommendation-number {
  @apply flex-shrink-0;
}

/* Theme-specific styling */
.results-sky .score-card {
  @apply border-sky-200;
}

.results-teal .score-card {
  @apply border-teal-200;
}

.results-orange .score-card {
  @apply border-orange-200;
}

/* Print styles */
@media print {
  .medical-results {
    @apply bg-white text-black;
  }
  
  .results-header .flex {
    @apply flex-col space-y-2;
  }
  
  .chart-container {
    @apply h-auto;
  }
  
  /* Hide action buttons when printing */
  .results-header .flex .gap-2 {
    @apply hidden;
  }
}

/* Responsive design */
@media (max-width: 640px) {
  .score-display .main-score .score-value {
    @apply text-4xl;
  }
  
  .grid.grid-cols-2 {
    @apply grid-cols-1;
  }
  
  .results-header .flex {
    @apply flex-col space-y-4;
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .recommendation-item {
    @apply transition-none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .score-card,
  .recommendation-item {
    @apply border-2 border-black;
  }
  
  .score-value {
    @apply text-black;
  }
}

/* Focus styles for accessibility */
:deep(.p-button:focus) {
  @apply ring-2 ring-blue-500 ring-offset-2;
}
</style>