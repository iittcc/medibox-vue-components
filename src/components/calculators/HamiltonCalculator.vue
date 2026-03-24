<template>
  <div class="medical-calculator-container">
    <div class="calculator-print-wrapper">
      <div class="calculator-interactive-view w-full max-w-[800px] mx-auto px-4">

        <SurfaceCard title="Patient">
          <template #content>
            <PersonInfo
              :name="patient.name" :age="patient.age"
              :minAge="config.minAge" :maxAge="config.maxAge"
              :gender="patient.gender" genderdisplay="block"
              @update:name="patient.name = $event"
              @update:age="patient.age = $event"
              @update:gender="patient.gender = $event"
            />
          </template>
        </SurfaceCard>

        <SurfaceCard :title="config.name" :description="config.description">
          <template #content>
            <!-- Mode toggle -->
            <div class="flex items-center gap-3 mb-4">
              <span class="text-sm font-medium text-gray-600">Version:</span>
              <SelectButton v-model="mode" :options="modeOptions" optionLabel="text" optionValue="value" />
            </div>

            <p class="text-xs text-gray-500 mb-4 pl-1 leading-snug">
              Semistruktureret interview. Hvis der ikke er symptomer svarende til et spørgsmål, undlades svaret.
            </p>

            <form @submit.prevent="handleSubmit">
              <div class="space-y-2">
                <div
                  v-for="question in visibleQuestions" :key="question.originalIndex"
                  class="rounded-xl p-3"
                  :style="{ backgroundColor: 'var(' + question.q.bg + ')' }"
                >
                  <div class="flex flex-col md:flex-row md:items-center gap-2">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-semibold text-gray-800">{{ question.q.text }}</span>
                        <span
                          class="text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"
                          :style="{ backgroundColor: 'var(--p-primary-200)', color: 'var(--p-primary-700)' }"
                        >
                          0–{{ question.maxScore }}
                        </span>
                      </div>
                      <p v-if="question.q.description" class="text-xs text-gray-500 mt-0.5 leading-snug">
                        {{ question.q.description }}
                      </p>
                    </div>
                    <div class="shrink-0">
                      <SelectButton
                        v-model="question.q.answer"
                        :options="question.q.options"
                        optionLabel="text"
                        optionValue="value"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="validationMessage" class="text-red-500 mt-5 font-bold">{{ validationMessage }}</div>
              <div class="flex justify-end text-right mt-5 gap-3">
                <CopyDialog title="Kopier til Clipboard" icon="pi pi-clipboard" severity="secondary" class="mr-3" :disabled="!hasCustomResults">
                  <template #container>
                    <b>{{ config.name }} ({{ mode === 'ham17' ? 'HAM-17' : 'HAM-6' }})</b><br /><br />
                    Navn: {{ patient.name }} <br />Køn: {{ patient.gender }} <br />Alder: {{ patient.age }} år<br /><br />
                    <template v-if="customResult">
                      <div v-for="qr in customResult.questionResults" :key="qr.questionNumber">{{ qr.questionText }}: {{ qr.answerText }} ({{ qr.score }})</div>
                      <br /><br />Resultat: {{ customResult.score }} point — {{ customResult.interpretation }}
                    </template>
                  </template>
                </CopyDialog>
                <SecondaryButton label="Print" icon="pi pi-print" severity="secondary" :disabled="!hasCustomResults" @click="handlePrint" />
                <SecondaryButton label="Reset" icon="pi pi-sync" severity="secondary" @click="handleReset" />
                <Button type="submit" label="Beregn" class="pr-6 pl-6 rounded-lg" icon="pi pi-calculator" />
              </div>
            </form>
          </template>
        </SurfaceCard>

        <div v-if="hasCustomResults" class="results" ref="resultsSection">
          <SurfaceCard title="Resultat">
            <template #content>
              <br />
              <Message class="flex justify-center p-3 text-center" :severity="resultSeverityDisplay">
                <h2>{{ mode === 'ham17' ? 'Hamilton 17-item' : 'Hamilton 6-item' }}: {{ customResult!.score }} point</h2>
                <p class="text-sm mt-1">{{ customResult!.interpretation }}</p>
              </Message>
              <br />
              <div class="overflow-hidden rounded-lg border border-gray-200 mt-2">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-200" :style="{ backgroundColor: 'var(--p-primary-50)' }">
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Score</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Fortolkning</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in activeScoreTable" :key="row.score" class="border-b border-gray-100 last:border-b-0 text-gray-600">
                      <td class="px-3 py-1.5">{{ row.score }}</td>
                      <td class="px-3 py-1.5">{{ row.interpretation }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </SurfaceCard>
        </div>
      </div>

      <HamiltonCalculatorPrint :config="config" :patient="patient" :result="customResult" :mode="mode" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Button from '@/volt/Button.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'
import Message from '@/volt/Message.vue'
import SelectButton from '@/volt/SelectButton.vue'
import CopyDialog from '../CopyDialog.vue'
import SurfaceCard from '../SurfaceCard.vue'
import PersonInfo from '../PersonInfo.vue'
import HamiltonCalculatorPrint from './HamiltonCalculatorPrint.vue'
import { useCalculatorForm } from '../../composables/useCalculatorForm'
import { hamiltonConfig, calculateHamilton17, calculateHamilton6, calculateHamilton, HAM6_INDICES } from '../../scoring/hamilton'
import type { ScoreResult } from '../../scoring/types'
import sendDataToServer from '../../assets/sendDataToServer'

const config = hamiltonConfig
const { questions, patient, formSubmitted, validationMessage, reset } = useCalculatorForm(config, calculateHamilton)
const resultsSection = ref<HTMLDivElement | null>(null)
const mode = ref('ham17')
const customResult = ref<ScoreResult | null>(null)
const hasCustomResults = computed(() => customResult.value !== null)
const apiUrlServer = import.meta.env.VITE_API_URL
const apiUrl = apiUrlServer + '/index.php/callback/LogCB/log'
const keyUrl = apiUrlServer + '/index.php/KeyServer/getPublicKey'

const modeOptions = [
  { text: 'HAM-17', value: 'ham17' },
  { text: 'HAM-6', value: 'ham6' }
]

// Clear results when mode changes
watch(mode, () => { customResult.value = null })

const visibleQuestions = computed(() => {
  const mapQ = (q: typeof questions.value[0], idx: number) => ({
    q, originalIndex: idx,
    maxScore: Math.max(...q.options.map(o => o.value))
  })
  if (mode.value === 'ham6') {
    return HAM6_INDICES.map(idx => mapQ(questions.value[idx], idx))
  }
  return questions.value.map((q, idx) => mapQ(q, idx))
})

const ham17Table = [
  { score: '0-7', interpretation: 'Ingen tegn på depression' },
  { score: '8-12', interpretation: 'Tvivlsom depression' },
  { score: '13-17', interpretation: 'Lettere depression' },
  { score: '18-24', interpretation: 'Moderat depression' },
  { score: '25-52', interpretation: 'Middelsvær til svær depression' }
]

const ham6Table = [
  { score: '0-4', interpretation: 'Ingen tegn på depression' },
  { score: '5-6', interpretation: 'Tvivlsom depression' },
  { score: '7-8', interpretation: 'Lettere depression' },
  { score: '9-11', interpretation: 'Moderat depression' },
  { score: '12-22', interpretation: 'Middelsvær til svær depression' }
]

const activeScoreTable = computed(() => mode.value === 'ham17' ? ham17Table : ham6Table)

const resultSeverityDisplay = computed(() => {
  if (!customResult.value) return 'info'
  if (customResult.value.severity === 'severe') return 'error'
  if (customResult.value.severity === 'moderate') return 'warn'
  if (customResult.value.severity === 'mild') return 'success'
  return 'success'
})

function handleSubmit(): void {
  formSubmitted.value = true
  customResult.value = mode.value === 'ham17'
    ? calculateHamilton17(questions.value)
    : calculateHamilton6(questions.value)
  scrollToResults()
  sendDataToServer(apiUrl, keyUrl, {
    name: patient.value.name, age: patient.value.age, gender: patient.value.gender,
    mode: mode.value, answers: questions.value,
    scores: { totalScore: customResult.value?.score ?? 0 }
  }).then(() => {}).catch(() => {})
}

function handleReset(): void {
  reset()
  customResult.value = null
  mode.value = 'ham17'
}

function handlePrint(): void { window.print() }
function scrollToResults(): void { if (resultsSection.value) resultsSection.value.scrollIntoView({ behavior: 'smooth' }) }
</script>
