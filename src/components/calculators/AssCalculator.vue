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

        <SurfaceCard>
          <template #content>
            <div class="mb-4 pl-1">
              <h2 class="text-xl font-bold text-gray-800">{{ config.name }}</h2>
              <p class="text-sm text-gray-500 mt-1">{{ config.description }}</p>
              <p class="text-xs text-gray-400 mt-1">Igennem de sidste to uger, hvor stor en del af tiden har du:</p>
            </div>

            <form @submit.prevent="handleSubmit">
              <QuestionSingleComponent
                name="ass"
                v-for="(question, index) in questions" :key="index"
                :question="question" :options="question.options" :index="index"
                :is-unanswered="formSubmitted && isUnanswered(question)"
              />

              <div v-if="validationMessage" class="text-red-500 mt-5 font-bold">{{ validationMessage }}</div>

              <div class="flex justify-end text-right mt-5 gap-3">
                <CopyDialog title="Kopier til Clipboard" icon="pi pi-clipboard" severity="secondary" class="mr-3" :disabled="!hasResults">
                  <template #container>
                    <b>{{ config.name }}</b><br /><br />
                    Navn: {{ patient.name }} <br />Køn: {{ patient.gender }} <br />Alder: {{ patient.age }} år<br /><br />
                    <template v-if="result">
                      <div v-for="qr in result.questionResults" :key="qr.questionNumber">{{ qr.questionText }}: {{ qr.answerText }} ({{ qr.score }})</div>
                      <br /><br />
                      <div v-for="(line, i) in interpretationLines" :key="i">{{ line }}</div>
                    </template>
                  </template>
                </CopyDialog>
                <SecondaryButton label="Print" icon="pi pi-print" severity="secondary" :disabled="!hasResults" @click="handlePrint" />
                <SecondaryButton label="Reset" icon="pi pi-sync" severity="secondary" @click="reset" />
                <Button type="submit" label="Beregn" class="pr-6 pl-6 rounded-lg" icon="pi pi-calculator" />
              </div>
            </form>
          </template>
        </SurfaceCard>

        <div v-if="hasResults" class="results" ref="resultsSection">
          <SurfaceCard title="Resultat">
            <template #content>
              <br />
              <Message class="flex justify-center p-3 text-center" :severity="resultSeverityDisplay">
                <h2>{{ config.shortName }} Tolkningsforslag</h2>
              </Message>
              <div class="mt-4 space-y-2">
                <div
                  v-for="(line, i) in interpretationLines" :key="i"
                  class="p-3 rounded-lg text-sm"
                  :style="{ backgroundColor: 'var(--p-primary-50)' }"
                >
                  {{ line }}
                </div>
              </div>
              <br />
              <div class="overflow-hidden rounded-lg border border-gray-200">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-200" :style="{ backgroundColor: 'var(--p-primary-50)' }">
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Spørgsmål</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Kategori</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-b border-gray-100 text-gray-600"><td class="px-3 py-1.5">1-2</td><td class="px-3 py-1.5">Generel angst/GAD</td></tr>
                    <tr class="border-b border-gray-100 text-gray-600"><td class="px-3 py-1.5">3</td><td class="px-3 py-1.5">Undvigeadfærd/agorafobi</td></tr>
                    <tr class="border-b border-gray-100 text-gray-600"><td class="px-3 py-1.5">4-5</td><td class="px-3 py-1.5">Panikangst</td></tr>
                    <tr class="border-b border-gray-100 text-gray-600"><td class="px-3 py-1.5">6-7</td><td class="px-3 py-1.5">OCD</td></tr>
                    <tr class="border-b border-gray-100 text-gray-600"><td class="px-3 py-1.5">8</td><td class="px-3 py-1.5">Socialfobi</td></tr>
                    <tr class="border-b border-gray-100 text-gray-600"><td class="px-3 py-1.5">9</td><td class="px-3 py-1.5">PTSD</td></tr>
                    <tr class="text-gray-600"><td class="px-3 py-1.5">10</td><td class="px-3 py-1.5">Funktionsnedsættelse</td></tr>
                  </tbody>
                </table>
              </div>
            </template>
          </SurfaceCard>
        </div>
      </div>

      <AssCalculatorPrint :config="config" :patient="patient" :result="result" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from '@/volt/Button.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'
import Message from '@/volt/Message.vue'
import QuestionSingleComponent from '../QuestionSingleComponent.vue'
import CopyDialog from '../CopyDialog.vue'
import SurfaceCard from '../SurfaceCard.vue'
import PersonInfo from '../PersonInfo.vue'
import AssCalculatorPrint from './AssCalculatorPrint.vue'
import { useCalculatorForm } from '../../composables/useCalculatorForm'
import { assConfig, calculateAss } from '../../scoring/ass'
import sendDataToServer from '../../assets/sendDataToServer'

const config = assConfig
const { questions, patient, result, formSubmitted, validationMessage, hasResults, validate, calculate, reset, isUnanswered } = useCalculatorForm(config, calculateAss)
const resultsSection = ref<HTMLDivElement | null>(null)
const apiUrlServer = import.meta.env.VITE_API_URL
const apiUrl = apiUrlServer + '/index.php/callback/LogCB/log'
const keyUrl = apiUrlServer + '/index.php/KeyServer/getPublicKey'

const interpretationLines = computed(() => {
  if (!result.value) return []
  return result.value.interpretation.split('\n')
})

const resultSeverityDisplay = computed(() => {
  if (!result.value) return 'info'
  if (result.value.severity === 'severe') return 'error'
  if (result.value.severity === 'moderate') return 'warn'
  if (result.value.severity === 'mild') return 'success'
  return 'success'
})

function handleSubmit(): void {
  formSubmitted.value = true
  if (validate()) {
    calculate()
    scrollToResults()
    sendDataToServer(apiUrl, keyUrl, { name: patient.value.name, age: patient.value.age, gender: patient.value.gender, answers: questions.value, scores: { totalScore: result.value?.score ?? 0 } }).then(() => {}).catch(() => {})
  }
}
function handlePrint(): void { window.print() }
function scrollToResults(): void { if (resultsSection.value) resultsSection.value.scrollIntoView({ behavior: 'smooth' }) }
</script>
