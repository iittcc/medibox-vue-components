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
            <p class="text-xs text-gray-500 mb-4 pl-1 leading-snug">
              Nedenstående spørgsmål handler om, hvordan du har haft det gennem de sidste 2 uger. For item 8 og 10 vælges det svar der har højeste score.
            </p>

            <form @submit.prevent="handleSubmit">
              <QuestionTabs
                :activeTab="activeTab" @update:activeTab="activeTab = $event"
                :sections="sections" name="mdi"
                :formSubmitted="formSubmitted" :isUnanswered="isUnanswered"
              />

              <div v-if="validationMessage" class="text-red-500 mt-5 font-bold">{{ validationMessage }}</div>

              <div class="flex justify-end mt-4 mb-8 gap-3">
                <SecondaryButton v-if="!isFirstTab" label="Forrige afsnit" icon="pi pi-arrow-left" @click="prevTab" />
                <SecondaryButton v-if="!isLastTab" label="Næste afsnit" icon="pi pi-arrow-right" iconPos="right" :disabled="!currentSectionComplete" @click="nextTab" />
              </div>

              <div class="flex justify-end text-right mt-5 gap-3">
                <CopyDialog title="Kopier til Clipboard" icon="pi pi-clipboard" severity="secondary" class="mr-3" :disabled="!hasResults">
                  <template #container>
                    <b>{{ config.name }}</b><br /><br />
                    Navn: {{ patient.name }} <br />Køn: {{ patient.gender }} <br />Alder: {{ patient.age }} år<br /><br />
                    <template v-if="result">
                      <div v-for="qr in result.questionResults" :key="qr.questionNumber">{{ qr.questionText }}: {{ qr.answerText }} ({{ qr.score }})</div>
                      <br /><br />
                      MDI Rating: {{ result.score }} point — {{ result.interpretation }}<br />
                      ICD-10: {{ icd10.diagnosis }} ({{ icd10.bCount }}B + {{ icd10.cCount }}C)
                      <template v-if="icd10.treatment"><br />Behandlingsoplæg: {{ icd10.treatment }}</template>
                    </template>
                  </template>
                </CopyDialog>
                <SecondaryButton label="Print" icon="pi pi-print" severity="secondary" :disabled="!hasResults" @click="handlePrint" />
                <SecondaryButton label="Reset" icon="pi pi-sync" severity="secondary" @click="handleReset" />
                <Button type="submit" label="Beregn" class="pr-6 pl-6 rounded-lg" icon="pi pi-calculator" :disabled="!allQuestionsAnswered" />
              </div>
            </form>
          </template>
        </SurfaceCard>

        <div v-if="hasResults" class="results" ref="resultsSection">
          <SurfaceCard title="Resultat">
            <template #content>
              <br />
              <Message class="flex justify-center p-3 text-center" :severity="resultSeverityDisplay">
                <h2>{{ config.shortName }} Score {{ result!.score }} : {{ result!.interpretation }}</h2>
              </Message>

              <!-- ICD-10 diagnostic result -->
              <div class="mt-3 p-3 rounded-lg border border-gray-200">
                <p class="text-sm font-semibold text-gray-700 mb-1">ICD-10 diagnose:</p>
                <p class="text-sm text-gray-600">
                  {{ icd10.diagnosis }} ({{ icd10.bCount }}B + {{ icd10.cCount }}C)
                  <template v-if="icd10.treatment"> — {{ icd10.treatment }}</template>
                </p>
              </div>
              <br />

              <!-- Rating score table -->
              <div class="overflow-hidden rounded-lg border border-gray-200 mt-2">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-200" :style="{ backgroundColor: 'var(--p-primary-50)' }">
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Score</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Fortolkning (rating)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in scoreTable" :key="row.score" class="border-b border-gray-100 last:border-b-0 text-gray-600">
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

      <MdiCalculatorPrint :config="config" :patient="patient" :result="result" :icd10="icd10" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from '@/volt/Button.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'
import Message from '@/volt/Message.vue'
import QuestionTabs from '../QuestionTabs.vue'
import CopyDialog from '../CopyDialog.vue'
import SurfaceCard from '../SurfaceCard.vue'
import PersonInfo from '../PersonInfo.vue'
import MdiCalculatorPrint from './MdiCalculatorPrint.vue'
import { useCalculatorForm } from '../../composables/useCalculatorForm'
import { mdiConfig, calculateMdi, getMdiIcd10, MDI_SECTIONS } from '../../scoring/mdi'
import sendDataToServer from '../../assets/sendDataToServer'

const config = mdiConfig
const { questions, patient, result, formSubmitted, validationMessage, hasResults, validate, calculate, reset, isUnanswered } = useCalculatorForm(config, calculateMdi)
const resultsSection = ref<HTMLDivElement | null>(null)
const activeTab = ref('0')
const apiUrlServer = import.meta.env.VITE_API_URL
const apiUrl = apiUrlServer + '/index.php/callback/LogCB/log'
const keyUrl = apiUrlServer + '/index.php/KeyServer/getPublicKey'

const sections = computed(() => {
  const secs = MDI_SECTIONS
  return secs.map((sec, i) => {
    const nextStart = i < secs.length - 1 ? secs[i + 1].startIndex : questions.value.length
    return { key: String(i), title: sec.title, startIndex: sec.startIndex, questions: questions.value.slice(sec.startIndex, nextStart) }
  })
})

const icd10 = computed(() => getMdiIcd10(questions.value))

const allQuestionsAnswered = computed(() => questions.value.every(q => q.answer !== null))
const isFirstTab = computed(() => Number(activeTab.value) === 0)
const isLastTab = computed(() => Number(activeTab.value) >= sections.value.length - 1)
const currentSectionComplete = computed(() => {
  const sec = sections.value[Number(activeTab.value)]
  return sec ? sec.questions.every(q => q.answer !== null) : false
})
function nextTab() { activeTab.value = String(Number(activeTab.value) + 1) }
function prevTab() { activeTab.value = String(Number(activeTab.value) - 1) }

const scoreTable = [
  { score: '< 20', interpretation: 'Ingen tegn på depression' },
  { score: '20-24', interpretation: 'Let depression' },
  { score: '25-29', interpretation: 'Moderat depression' },
  { score: '≥ 30', interpretation: 'Svær depression' }
]

const resultSeverityDisplay = computed(() => {
  if (!result.value) return 'info'
  if (result.value.severity === 'severe') return 'error'
  if (result.value.severity === 'moderate') return 'warn'
  if (result.value.severity === 'mild') return 'success'
  return 'success'
})

function handleReset(): void { reset(); activeTab.value = '0' }
function handleSubmit(): void {
  formSubmitted.value = true
  if (validate()) {
    calculate()
    scrollToResults()
    sendDataToServer(apiUrl, keyUrl, { name: patient.value.name, age: patient.value.age, gender: patient.value.gender, answers: questions.value, scores: { totalScore: result.value?.score ?? 0, ...icd10.value } }).then(() => {}).catch(() => {})
  }
}
function handlePrint(): void { window.print() }
function scrollToResults(): void { if (resultsSection.value) resultsSection.value.scrollIntoView({ behavior: 'smooth' }) }
</script>
