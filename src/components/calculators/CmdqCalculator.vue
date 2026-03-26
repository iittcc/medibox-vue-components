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

        <SurfaceCard :title="config.name">
          <template #content>
            <p class="text-xs text-gray-500 mb-4 pl-1 leading-snug">
              Valideret til brug i dansk almen praksis. Egner sig især til situationer hvor man har svært ved at skelne mellem funktionel lidelse, depression, angsttilstande og alkoholproblemer.
            </p>

            <form @submit.prevent="handleSubmit">
              <QuestionTabs
                :activeTab="activeTab" @update:activeTab="activeTab = $event"
                :sections="sections" name="cmdq"
                :formSubmitted="formSubmitted" :isUnanswered="isUnanswered"
              >
                <template #before-4>
                  <div class="mb-3 p-2 rounded-lg text-xs text-gray-500" :style="{ backgroundColor: 'var(--p-primary-50)' }">
                    Har du nogensinde inden for det sidste år ...
                  </div>
                </template>
              </QuestionTabs>

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
                      <div v-for="sub in subscaleResults" :key="sub.key">
                        {{ sub.label }}: {{ sub.score }}{{ sub.positive ? ' (POSITIV SCREENING)' : '' }}
                      </div>
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
              <div class="space-y-2">
                <div
                  v-for="sub in subscaleResults" :key="sub.key"
                  class="flex items-center justify-between p-3 rounded-lg border"
                  :class="sub.positive ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'"
                >
                  <span class="text-sm font-medium text-gray-700">{{ sub.label }}</span>
                  <div class="flex items-center gap-3">
                    <span class="text-sm font-bold">{{ sub.score }}</span>
                    <span v-if="sub.positive" class="text-xs font-bold text-red-600 px-2 py-0.5 bg-red-100 rounded-full">POSITIV</span>
                    <span v-else class="text-xs text-gray-400">&lt; {{ sub.threshold }}</span>
                  </div>
                </div>
              </div>
              <br />
              <div class="overflow-hidden rounded-lg border border-gray-200">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-200" :style="{ backgroundColor: 'var(--p-primary-50)' }">
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Subskala</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Normalværdi</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-b border-gray-100 text-gray-600"><td class="px-3 py-1.5">Symptom tjekliste (spm 1-12)</td><td class="px-3 py-1.5">&lt; 6</td></tr>
                    <tr class="border-b border-gray-100 text-gray-600"><td class="px-3 py-1.5">Helbredsangst (spm 13-19)</td><td class="px-3 py-1.5">&lt; 2</td></tr>
                    <tr class="border-b border-gray-100 text-gray-600"><td class="px-3 py-1.5">Angsttilstand (spm 20-23)</td><td class="px-3 py-1.5">&lt; 2</td></tr>
                    <tr class="border-b border-gray-100 text-gray-600"><td class="px-3 py-1.5">Depression (spm 24-29)</td><td class="px-3 py-1.5">&lt; 3</td></tr>
                    <tr class="text-gray-600"><td class="px-3 py-1.5">Alkoholproblem (spm 30-33)</td><td class="px-3 py-1.5">&lt; 2</td></tr>
                  </tbody>
                </table>
              </div>
            </template>
          </SurfaceCard>
        </div>
      </div>

      <CmdqCalculatorPrint :config="config" :patient="patient" :result="result" :questions="questions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from '@/volt/Button.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'
import QuestionTabs from '../QuestionTabs.vue'
import CopyDialog from '../CopyDialog.vue'
import SurfaceCard from '../SurfaceCard.vue'
import PersonInfo from '../PersonInfo.vue'
import CmdqCalculatorPrint from './CmdqCalculatorPrint.vue'
import { useCalculatorForm } from '../../composables/useCalculatorForm'
import { cmdqConfig, calculateCmdq, getCmdqSubscaleScores, CMDQ_SECTIONS } from '../../scoring/cmdq'
import sendDataToServer from '../../assets/sendDataToServer'

const config = cmdqConfig
const { questions, patient, result, formSubmitted, validationMessage, hasResults, validate, calculate, reset, isUnanswered } = useCalculatorForm(config, calculateCmdq)
const resultsSection = ref<HTMLDivElement | null>(null)
const activeTab = ref('0')
const apiUrlServer = import.meta.env.VITE_API_URL
const apiUrl = apiUrlServer + '/index.php/callback/LogCB/log'
const keyUrl = apiUrlServer + '/index.php/KeyServer/getPublicKey'

const sections = computed(() => {
  const secs = CMDQ_SECTIONS
  return secs.map((sec, i) => {
    const nextStart = i < secs.length - 1 ? secs[i + 1].startIndex : questions.value.length
    return {
      key: String(i),
      title: sec.title,
      startIndex: sec.startIndex,
      questions: questions.value.slice(sec.startIndex, nextStart)
    }
  })
})

const subscaleResults = computed(() => getCmdqSubscaleScores(questions.value))
const allQuestionsAnswered = computed(() => questions.value.every(q => q.answer !== null))
const isFirstTab = computed(() => Number(activeTab.value) === 0)
const isLastTab = computed(() => Number(activeTab.value) >= sections.value.length - 1)
const currentSectionComplete = computed(() => {
  const sec = sections.value[Number(activeTab.value)]
  return sec ? sec.questions.every(q => q.answer !== null) : false
})
function nextTab() { activeTab.value = String(Number(activeTab.value) + 1) }
function prevTab() { activeTab.value = String(Number(activeTab.value) - 1) }

function handleReset(): void { reset(); activeTab.value = '0' }
function handleSubmit(): void {
  formSubmitted.value = true
  if (validate()) {
    calculate()
    scrollToResults()
    const subscales = getCmdqSubscaleScores(questions.value)
    sendDataToServer(apiUrl, keyUrl, {
      name: patient.value.name, age: patient.value.age, gender: patient.value.gender,
      answers: questions.value,
      scores: { positiveCount: result.value?.score ?? 0, subscales: subscales.map(s => ({ key: s.key, score: s.score, positive: s.positive })) }
    }).then(() => {}).catch(() => {})
  }
}
function handlePrint(): void { window.print() }
function scrollToResults(): void { if (resultsSection.value) resultsSection.value.scrollIntoView({ behavior: 'smooth' }) }
</script>
