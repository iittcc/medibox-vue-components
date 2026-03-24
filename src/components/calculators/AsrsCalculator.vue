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
              Besvar alle spørgsmål ved at vælge det svar, der bedst beskriver, hvordan du har følt og opført dig de seneste seks måneder.
            </p>

            <form @submit.prevent="handleSubmit">
              <QuestionTabs
                :activeTab="activeTab" @update:activeTab="activeTab = $event"
                :sections="sections" name="asrs"
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
                      Antal positive A-spørgsmål: {{ result.score }}<br />
                      Antal positive B-spørgsmål: {{ positiveBCount }}<br />
                      ASRS Tolkning: {{ result.interpretation }}
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
                <h2>{{ result!.interpretation }}</h2>
                <p class="text-sm mt-1">
                  Positive A-spørgsmål: {{ result!.score }} af 6 &nbsp;|&nbsp;
                  Positive B-spørgsmål: {{ positiveBCount }} af 12
                </p>
              </Message>
              <br />
            </template>
          </SurfaceCard>
        </div>
      </div>

      <AsrsCalculatorPrint :config="config" :patient="patient" :result="result" :positiveBCount="positiveBCount" />
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
import AsrsCalculatorPrint from './AsrsCalculatorPrint.vue'
import { useCalculatorForm } from '../../composables/useCalculatorForm'
import { asrsConfig, calculateAsrs, getPositiveB, ASRS_SECTIONS } from '../../scoring/asrs'
import sendDataToServer from '../../assets/sendDataToServer'

const config = asrsConfig
const { questions, patient, result, formSubmitted, validationMessage, hasResults, validate, calculate, reset, isUnanswered } = useCalculatorForm(config, calculateAsrs)
const resultsSection = ref<HTMLDivElement | null>(null)
const activeTab = ref('0')
const apiUrlServer = import.meta.env.VITE_API_URL
const apiUrl = apiUrlServer + '/index.php/callback/LogCB/log'
const keyUrl = apiUrlServer + '/index.php/KeyServer/getPublicKey'

const sections = computed(() => {
  const secs = ASRS_SECTIONS
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

const allQuestionsAnswered = computed(() => questions.value.every(q => q.answer !== null))
const isFirstTab = computed(() => Number(activeTab.value) === 0)
const isLastTab = computed(() => Number(activeTab.value) >= sections.value.length - 1)
const currentSectionComplete = computed(() => {
  const sec = sections.value[Number(activeTab.value)]
  return sec ? sec.questions.every(q => q.answer !== null) : false
})
function nextTab() { activeTab.value = String(Number(activeTab.value) + 1) }
function prevTab() { activeTab.value = String(Number(activeTab.value) - 1) }

const positiveBCount = computed(() => getPositiveB(questions.value))

const resultSeverityDisplay = computed(() => {
  if (!result.value) return 'info'
  return result.value.severity === 'severe' ? 'error' : 'success'
})

function handleReset(): void { reset(); activeTab.value = '0' }
function handleSubmit(): void {
  formSubmitted.value = true
  if (validate()) {
    calculate()
    scrollToResults()
    sendDataToServer(apiUrl, keyUrl, { name: patient.value.name, age: patient.value.age, gender: patient.value.gender, answers: questions.value, scores: { positiveA: result.value?.score ?? 0, positiveB: positiveBCount.value } }).then(() => {}).catch(() => {})
  }
}
function handlePrint(): void { window.print() }
function scrollToResults(): void { if (resultsSection.value) resultsSection.value.scrollIntoView({ behavior: 'smooth' }) }
</script>
