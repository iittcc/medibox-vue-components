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

        <SurfaceCard title="Scoringsskema">
          <template #content>
            <form @submit.prevent="handleSubmit">
              <template v-for="sectionName in ['Tømning', 'Fyldning', 'Andre symptomer', 'Seksualfunktion']" :key="sectionName">
                <h2>{{ sectionName }}</h2>
                <QuestionComponent
                  v-for="(question, index) in questions.filter(q => q.section === sectionName)"
                  :key="question.textA"
                  :name="sectionName"
                  :question="question"
                  :optionsA="question.optionsA"
                  :optionsB="question.optionsB"
                  :index="index"
                  :is-unanswered="formSubmitted && isUnanswered(question)"
                />
              </template>

              <div v-if="validationMessage" class="text-red-500 mt-5 font-bold">{{ validationMessage }}</div>
              <div v-if="validationMessageSexual" class="mt-1">{{ validationMessageSexual }}</div>

              <div class="flex justify-end text-right mt-5 gap-3">
                <CopyDialog title="Kopier til Clipboard" icon="pi pi-clipboard" severity="secondary" class="mr-3" :disabled="!hasResults">
                  <template #container>
                    <b>{{ config.name }}</b><br /><br />
                    Navn: {{ patient.name }} <br />Alder: {{ patient.age }} år<br /><br />
                    <template v-if="result">
                      <div v-for="sec in result.sections" :key="sec.name">
                        {{ sec.name }}:&nbsp;&nbsp;&nbsp; Symptom {{ sec.totalA }} &nbsp;&nbsp;&nbsp;Gene {{ sec.totalB }} &nbsp;&nbsp;&nbsp;Total {{ sec.totalAB }}
                      </div>
                      <br />Vandladningsproblem Score: &nbsp;&nbsp;&nbsp;Symptom {{ result.totalA }}&nbsp;&nbsp;&nbsp; Gene {{ result.totalB }} &nbsp;&nbsp;&nbsp;Total {{ result.totalAB }}
                      <br /><br />
                      <template v-if="result.sexualSection">
                        Seksual funktion: &nbsp;&nbsp;&nbsp;Symptom {{ result.sexualSection.totalA }} &nbsp;&nbsp;&nbsp;Gene {{ result.sexualSection.totalB }} &nbsp;&nbsp;&nbsp;Total {{ result.sexualSection.totalAB }}
                        <br /><br />
                      </template>
                      Konklusion: {{ result.interpretation }}
                    </template>
                  </template>
                </CopyDialog>
                <SecondaryButton label="Print" icon="pi pi-print" severity="secondary" :disabled="!hasResults" @click="handlePrint" />
                <SecondaryButton label="Slet" icon="pi pi-ban" severity="secondary" @click="reset" />
                <Button type="submit" label="Beregn" class="pr-6 pl-6 rounded-lg" icon="pi pi-calculator" />
              </div>
            </form>
          </template>
        </SurfaceCard>

        <div v-if="hasResults" class="results" ref="resultsSection">
          <SurfaceCard title="Resultat">
            <template #content>
              <table class="w-full border-collapse">
                <thead>
                  <tr>
                    <th class="border border-slate-200 bg-emerald-100 p-1 text-left">Funktion</th>
                    <th class="border border-slate-200 bg-emerald-100 p-1 text-left">Symptom</th>
                    <th class="border border-slate-200 bg-emerald-100 p-1 text-left">Gene</th>
                    <th class="border border-slate-200 bg-emerald-100 p-1 text-left">Total</th>
                    <th class="border border-slate-200 bg-emerald-100 p-1 text-left">Interval</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sec in result!.sections" :key="sec.name">
                    <td class="border border-slate-200 bg-emerald-50 p-1">{{ sec.name }}</td>
                    <td class="border border-slate-200 p-1">{{ sec.totalA }}</td>
                    <td class="border border-slate-200 p-1">{{ sec.totalB }}</td>
                    <td class="border border-slate-200 p-1">{{ sec.totalAB }}</td>
                    <td class="border border-slate-200 p-1">{{ sec.interval }}</td>
                  </tr>
                  <tr class="font-semibold border-t-2 border-slate-300">
                    <td class="border border-slate-200 bg-emerald-50 p-1">Vandladning Score</td>
                    <td class="border border-slate-200 p-1">{{ result!.totalA }}</td>
                    <td class="border border-slate-200 p-1">{{ result!.totalB }}</td>
                    <td class="border border-slate-200 p-1">{{ result!.totalAB }}</td>
                    <td class="border border-slate-200 p-1">0-108</td>
                  </tr>
                  <tr>
                    <td class="border border-slate-200 bg-emerald-50 p-1">Seksualfunktion</td>
                    <td class="border border-slate-200 p-1">{{ result!.sexualSection ? result!.sexualSection.totalA : '-' }}</td>
                    <td class="border border-slate-200 p-1">{{ result!.sexualSection ? result!.sexualSection.totalB : '-' }}</td>
                    <td class="border border-slate-200 p-1">{{ result!.sexualSection ? result!.sexualSection.totalAB : '-' }}</td>
                    <td class="border border-slate-200 p-1">0-27</td>
                  </tr>
                </tbody>
              </table>
              <br />
              <Message class="flex justify-center p-3" :severity="resultSeverityDisplay">{{ result!.interpretation }}</Message><br />
              <p class="text-sm text-center">Score &lt; 8: Lette symptomer | Score 8-19: Moderate symptomer | Score &gt; 19: Svære symptomer</p>
              <p class="text-sm text-center">(Seksualfunktion tæller ikke med i score)</p>
            </template>
          </SurfaceCard>
        </div>
      </div>

      <DanpssCalculatorPrint :config="config" :patient="patient" :result="result" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from '@/volt/Button.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'
import Message from '@/volt/Message.vue'
import QuestionComponent from '../QuestionComponent.vue'
import CopyDialog from '../CopyDialog.vue'
import SurfaceCard from '../SurfaceCard.vue'
import PersonInfo from '../PersonInfo.vue'
import DanpssCalculatorPrint from './DanpssCalculatorPrint.vue'
import { useDanpssForm } from '../../composables/useDanpssForm'
import { danpssConfig, createDanpssQuestions, calculateDanpss } from '../../scoring/danpss'
import sendDataToServer from '../../assets/sendDataToServer'

const config = danpssConfig
const {
  questions, patient, result, formSubmitted,
  validationMessage, validationMessageSexual,
  hasResults, validateMain, validateSexual, calculate, reset, isUnanswered
} = useDanpssForm(config, createDanpssQuestions, calculateDanpss)

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
  validateSexual()
  if (validateMain()) {
    calculate()
    scrollToResults()
    sendDataToServer(apiUrl, keyUrl, {
      name: patient.value.name, age: patient.value.age, gender: patient.value.gender,
      answers: questions.value,
      scores: {
        totalA: result.value?.totalA ?? 0,
        totalB: result.value?.totalB ?? 0,
        totalAB: result.value?.totalAB ?? 0
      }
    }).then(() => {}).catch(() => {})
  }
}

function handlePrint(): void { window.print() }
function scrollToResults(): void { if (resultsSection.value) resultsSection.value.scrollIntoView({ behavior: 'smooth' }) }
</script>
