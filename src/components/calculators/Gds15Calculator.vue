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
              Det er vigtigt også at udspørge de pårørende om depressive symptomer hos patienten, da nogle patienter med depression underrapporterer symptomerne.
            </p>

            <form @submit.prevent="handleSubmit">
              <QuestionSingleComponent
                v-for="(question, index) in questions" :key="index"
                name="gds15"
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
                      <br /><br />{{ config.shortName }} Score {{ result.score }} : {{ result.interpretation }}
                    </template>
                  </template>
                </CopyDialog>
                <SecondaryButton label="Print" icon="pi pi-print" severity="secondary" :disabled="!hasResults" @click="handlePrint" />
                <SecondaryButton label="Reset" icon="pi pi-sync" severity="secondary" @click="reset" />
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

      <Gds15CalculatorPrint :config="config" :patient="patient" :result="result" />
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
import Gds15CalculatorPrint from './Gds15CalculatorPrint.vue'
import { useCalculatorForm } from '../../composables/useCalculatorForm'
import { gds15Config, calculateGds15 } from '../../scoring/gds15'
import sendDataToServer from '../../assets/sendDataToServer'

const config = gds15Config
const { questions, patient, result, formSubmitted, validationMessage, hasResults, validate, calculate, reset, isUnanswered } = useCalculatorForm(config, calculateGds15)
const resultsSection = ref<HTMLDivElement | null>(null)
const apiUrlServer = import.meta.env.VITE_API_URL
const apiUrl = apiUrlServer + '/index.php/callback/LogCB/log'
const keyUrl = apiUrlServer + '/index.php/KeyServer/getPublicKey'

const allQuestionsAnswered = computed(() => questions.value.every(q => q.answer !== null))

const scoreTable = [
  { score: '0-4', interpretation: 'Normal scoring' },
  { score: '5-7', interpretation: 'Mulig depression' },
  { score: '≥ 8', interpretation: 'Sandsynligvis depression' }
]

const resultSeverityDisplay = computed(() => {
  if (!result.value) return 'info'
  if (result.value.severity === 'severe') return 'error'
  if (result.value.severity === 'moderate') return 'warn'
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
