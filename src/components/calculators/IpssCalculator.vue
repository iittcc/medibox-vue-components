<template>
  <div class="medical-calculator-container">
    <div class="calculator-print-wrapper">
      <div class="calculator-interactive-view w-full max-w-[800px] mx-auto px-4">
        <SurfaceCard title="Patient">
          <template #content>
            <PersonInfo
              :name="patient.name" :age="patient.age"
              :minAge="config.minAge" :maxAge="config.maxAge"
              :gender="patient.gender" genderdisplay="none"
              @update:name="patient.name = $event"
              @update:age="patient.age = $event"
              @update:gender="patient.gender = $event"
            />
          </template>
        </SurfaceCard>

        <SurfaceCard :title="config.name">
          <template #content>
            <form @submit.prevent="handleSubmit">
              <QuestionSingleComponent
                name="section1"
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
                      <div v-for="qr in result.questionResults" :key="qr.questionNumber">{{ qr.questionText }} {{ qr.score }}</div>
                      <br /><br />{{ config.shortName }} Score {{ result.score }} : {{ result.interpretation }}
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
                <h2>{{ config.shortName }} Score {{ result!.score }} : {{ result!.interpretation }}</h2>
              </Message><br />
            </template>
          </SurfaceCard>
        </div>
      </div>

      <IpssCalculatorPrint :config="config" :patient="patient" :result="result" />
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
import IpssCalculatorPrint from './IpssCalculatorPrint.vue'
import { useCalculatorForm } from '../../composables/useCalculatorForm'
import { ipssConfig, calculateIpss } from '../../scoring/ipss'
import sendDataToServer from '../../assets/sendDataToServer'

const config = ipssConfig
const { questions, patient, result, formSubmitted, validationMessage, hasResults, validate, calculate, reset, isUnanswered } = useCalculatorForm(config, calculateIpss)
const resultsSection = ref<HTMLDivElement | null>(null)
const apiUrlServer = import.meta.env.VITE_API_URL
const apiUrl = apiUrlServer + '/index.php/callback/LogCB/log'
const keyUrl = apiUrlServer + '/index.php/KeyServer/getPublicKey'
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
    calculate(); scrollToResults()
    sendDataToServer(apiUrl, keyUrl, { name: patient.value.name, age: patient.value.age, gender: patient.value.gender, answers: questions.value, scores: { totalScore: result.value?.score ?? 0 } }).then(() => {}).catch(() => {})
  }
}
function handlePrint(): void { window.print() }
function scrollToResults(): void { if (resultsSection.value) resultsSection.value.scrollIntoView({ behavior: 'smooth' }) }
</script>
