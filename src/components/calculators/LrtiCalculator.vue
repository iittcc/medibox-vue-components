<template>
  <div class="medical-calculator-container">
    <div class="calculator-print-wrapper">
      <div class="calculator-interactive-view w-full max-w-[800px] mx-auto px-4">
        <SurfaceCard title="Patient">
          <template #content>
            <PersonInfo
              :name="patient.name" :age="patient.age"
              :minAge="config.minAge" :maxAge="config.maxAge"
              :gender="patient.gender" genderdisplay="block" child="true"
              @update:name="patient.name = $event"
              @update:age="patient.age = $event"
              @update:gender="patient.gender = $event"
            />
          </template>
        </SurfaceCard>

        <SurfaceCard title="Symptomer">
          <template #content>
            <SurfaceCardItem v-for="(question, index) in questions" :key="index">
              <template #icon> </template>
              <template #title>{{ question.text }}</template>
              <template #content>
                <ToggleButton
                  :modelValue="question.answer === 1"
                  @update:modelValue="question.answer = $event ? 1 : 0"
                  onLabel="Ja" offLabel="Nej"
                />
              </template>
            </SurfaceCardItem>
          </template>
        </SurfaceCard>

        <div class="flex justify-end text-right mt-5 gap-3 px-4">
          <CopyDialog title="Kopier til Clipboard" icon="pi pi-clipboard" severity="secondary" class="mr-3" :disabled="!hasResults">
            <template #container>
              <b>{{ config.name }}</b><br /><br />
              Navn: {{ patient.name }} <br />Køn: {{ patient.gender }} <br />Alder: {{ patient.age }} år<br /><br />
              <template v-if="result">
                <div v-for="qr in result.questionResults" :key="qr.questionNumber">{{ qr.questionText }}: {{ qr.answerText }}</div>
                <br /><br />{{ config.shortName }} Score {{ result.score }} : {{ result.interpretation }}
              </template>
            </template>
          </CopyDialog>
          <SecondaryButton label="Print" icon="pi pi-print" severity="secondary" :disabled="!hasResults" @click="handlePrint" />
          <SecondaryButton label="Reset" icon="pi pi-sync" severity="secondary" @click="reset" />
          <Button label="Beregn" class="pr-6 pl-6 rounded-lg" icon="pi pi-calculator" @click="handleSubmit" />
        </div>

        <div v-if="hasResults" class="results mt-4" ref="resultsSection">
          <SurfaceCard title="Resultat">
            <template #content>
              <br />
              <Message class="flex justify-center p-3 text-center" :severity="resultSeverityDisplay">
                <h2>{{ config.shortName }} Score {{ result!.score }} <br /> {{ result!.interpretation }}</h2>
              </Message><br />
            </template>
          </SurfaceCard>
        </div>
      </div>

      <LrtiCalculatorPrint :config="config" :patient="patient" :result="result" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ToggleButton from 'primevue/togglebutton'
import Button from '@/volt/Button.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'
import Message from '@/volt/Message.vue'
import CopyDialog from '../CopyDialog.vue'
import SurfaceCard from '../SurfaceCard.vue'
import SurfaceCardItem from '../SurfaceCardItem.vue'
import PersonInfo from '../PersonInfo.vue'
import LrtiCalculatorPrint from './LrtiCalculatorPrint.vue'
import { useCalculatorForm } from '../../composables/useCalculatorForm'
import { lrtiConfig, calculateLrti } from '../../scoring/lrti'
import sendDataToServer from '../../assets/sendDataToServer'

const config = lrtiConfig
const { questions, patient, result, formSubmitted, hasResults, calculate, reset } = useCalculatorForm(config, calculateLrti)
const resultsSection = ref<HTMLDivElement | null>(null)
const apiUrlServer = import.meta.env.VITE_API_URL
const apiUrl = apiUrlServer + '/index.php/callback/LogCB/log'
const keyUrl = apiUrlServer + '/index.php/KeyServer/getPublicKey'
const resultSeverityDisplay = computed(() => {
  if (!result.value) return 'info'
  if (result.value.severity === 'severe') return 'error'
  if (result.value.severity === 'moderate') return 'warn'
  return 'success'
})

function handleSubmit(): void {
  formSubmitted.value = true
  calculate()
  scrollToResults()
  sendDataToServer(apiUrl, keyUrl, {
    name: patient.value.name, age: patient.value.age, gender: patient.value.gender,
    answers: questions.value, scores: { totalScore: result.value?.score ?? 0 }
  }).then(() => {}).catch(() => {})
}

function handlePrint(): void { window.print() }
function scrollToResults(): void { if (resultsSection.value) resultsSection.value.scrollIntoView({ behavior: 'smooth' }) }
</script>
