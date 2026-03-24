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
            <div class="flex gap-4 mt-3">
              <div class="flex-1">
                <label class="text-sm text-gray-500">Skema udfyldt af</label>
                <input v-model="filledBy" type="text" class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Navn" />
              </div>
              <div class="flex-1">
                <label class="text-sm text-gray-500">Relation til barnet</label>
                <input v-model="relation" type="text" class="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Forælder, lærer, etc." />
              </div>
            </div>
          </template>
        </SurfaceCard>

        <SurfaceCard :title="config.name" :description="config.description">
          <template #content>
            <p class="text-xs text-gray-500 mb-4 pl-1 leading-snug">
              Marker det svar, der beskriver barnets adfærd derhjemme eller i skolen det sidste halve år.
            </p>

            <form @submit.prevent="handleSubmit">
              <Tabs :value="activeTab" @update:value="activeTab = $event"
              :pt="{
                root: 'bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-0 pt-[0.875rem] pb-0 px-[1.125rem] outline-none'
              }"
              :ptOptions="{ mergeProps: true }">
                <TabList >
                  <Tab v-for="section in sections" :key="section.key" :value="section.key">
                    {{ section.title }}
                  </Tab>
                </TabList>
                <TabPanels :pt="{
                root: 'bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-0 pt-[0.875rem] pb-0 px-[1.125rem] outline-none'
              }"
              :ptOptions="{ mergeProps: true }">
                  <TabPanel v-for="section in sections" :key="section.key" :value="section.key">
                    <QuestionSingleComponent
                      v-for="(question, qIdx) in section.questions"
                      :key="section.startIndex + qIdx"
                      name="adhdrs"
                      :question="question" :options="question.options" :index="section.startIndex + qIdx"
                      :is-unanswered="formSubmitted && isUnanswered(question)"
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>

              <div v-if="validationMessage" class="text-red-500 mt-5 font-bold">{{ validationMessage }}</div>

              <div class="flex justify-end mt-4 mb-8 gap-3 ">
                <SecondaryButton v-if="!isFirstTab" label="Forrige afsnit" icon="pi pi-arrow-left" @click="prevTab" />
                <SecondaryButton v-if="!isLastTab" label="Næste afsnit" icon="pi pi-arrow-right" iconPos="right" :disabled="!currentSectionComplete" @click="nextTab" />
              </div>

              <div class="flex justify-end text-right mt-5 gap-3">
                <CopyDialog title="Kopier til Clipboard" icon="pi pi-clipboard" severity="secondary" class="mr-3" :disabled="!hasResults">
                  <template #container>
                    <b>{{ config.name }}</b><br /><br />
                    Navn: {{ patient.name }} <br />Køn: {{ patient.gender }} <br />Alder: {{ patient.age }} år<br />
                    <template v-if="filledBy">Udfyldt af: {{ filledBy }}<br /></template>
                    <template v-if="relation">Relation til barnet: {{ relation }}<br /></template>
                    <br />
                    <template v-if="result">
                      <div v-for="qr in result.questionResults" :key="qr.questionNumber">{{ qr.questionText }}: {{ qr.answerText }} ({{ qr.score }})</div>
                      <br /><br />
                      Uopmærksomhed (1-9): {{ subscores.inattention }}<br />
                      Hyperaktiv/impulsiv (10-18): {{ subscores.hyperactivityImpulsivity }}<br />
                      Oppositionel (19-26): {{ subscores.oppositional }}<br />
                      I alt: {{ result.score }}<br />
                      Tolkning: {{ result.interpretation }}
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

              <!-- Domain subscores table -->
              <div class="overflow-hidden rounded-lg border border-gray-200 mt-2">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-200" :style="{ backgroundColor: 'var(--p-primary-50)' }">
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Domæne</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Items</th>
                      <th class="px-3 py-2 text-right font-semibold text-gray-700">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-b border-gray-100 text-gray-600">
                      <td class="px-3 py-1.5">Uopmærksomhed</td>
                      <td class="px-3 py-1.5">1-9</td>
                      <td class="px-3 py-1.5 text-right font-medium">{{ subscores.inattention }}</td>
                    </tr>
                    <tr class="border-b border-gray-100 text-gray-600">
                      <td class="px-3 py-1.5">Hyperaktiv/impulsiv adfærd</td>
                      <td class="px-3 py-1.5">10-18</td>
                      <td class="px-3 py-1.5 text-right font-medium">{{ subscores.hyperactivityImpulsivity }}</td>
                    </tr>
                    <tr class="border-b border-gray-100 text-gray-600">
                      <td class="px-3 py-1.5">Oppositionel adfærd</td>
                      <td class="px-3 py-1.5">19-26</td>
                      <td class="px-3 py-1.5 text-right font-medium">{{ subscores.oppositional }}</td>
                    </tr>
                    <tr class="text-gray-800 font-semibold">
                      <td class="px-3 py-1.5">I alt</td>
                      <td class="px-3 py-1.5"></td>
                      <td class="px-3 py-1.5 text-right">{{ subscores.total }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Interpretation table -->
              <div class="overflow-hidden rounded-lg border border-gray-200 mt-3">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-200" :style="{ backgroundColor: 'var(--p-primary-50)' }">
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Score</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Fortolkning</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-b border-gray-100 text-gray-600">
                      <td class="px-3 py-1.5">≤ 60</td>
                      <td class="px-3 py-1.5">Normal symptombelastning</td>
                    </tr>
                    <tr class="border-b border-gray-100 text-gray-600">
                      <td class="px-3 py-1.5">61-69</td>
                      <td class="px-3 py-1.5">Borderline symptombelastning</td>
                    </tr>
                    <tr class="text-gray-600">
                      <td class="px-3 py-1.5">≥ 70</td>
                      <td class="px-3 py-1.5">Svær symptombelastning</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </SurfaceCard>
        </div>
      </div>

      <AdhdrsCalculatorPrint :config="config" :patient="patient" :result="result" :subscores="subscores" :filledBy="filledBy" :relation="relation" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Button from '@/volt/Button.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'
import Message from '@/volt/Message.vue'
import Tabs from '@/volt/Tabs.vue'
import TabList from '@/volt/TabList.vue'
import Tab from '@/volt/Tab.vue'
import TabPanels from '@/volt/TabPanels.vue'
import TabPanel from '@/volt/TabPanel.vue'
import QuestionSingleComponent from '../QuestionSingleComponent.vue'
import CopyDialog from '../CopyDialog.vue'
import SurfaceCard from '../SurfaceCard.vue'
import PersonInfo from '../PersonInfo.vue'
import AdhdrsCalculatorPrint from './AdhdrsCalculatorPrint.vue'
import { useCalculatorForm } from '../../composables/useCalculatorForm'
import { adhdrsConfig, calculateAdhdrs, getAdhdrsSubscores, ADHDRS_SECTIONS } from '../../scoring/adhdrs'
import sendDataToServer from '../../assets/sendDataToServer'

const config = adhdrsConfig
const { questions, patient, result, formSubmitted, validationMessage, hasResults, validate, calculate, reset, isUnanswered } = useCalculatorForm(config, calculateAdhdrs)
const resultsSection = ref<HTMLDivElement | null>(null)
const activeTab = ref('0')
const filledBy = ref('')
const relation = ref('')
const apiUrlServer = import.meta.env.VITE_API_URL
const apiUrl = apiUrlServer + '/index.php/callback/LogCB/log'
const keyUrl = apiUrlServer + '/index.php/KeyServer/getPublicKey'

const sections = computed(() => {
  const secs = ADHDRS_SECTIONS
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

const subscores = computed(() => getAdhdrsSubscores(questions.value))

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
    sendDataToServer(apiUrl, keyUrl, {
      name: patient.value.name, age: patient.value.age, gender: patient.value.gender,
      filledBy: filledBy.value, relation: relation.value,
      answers: questions.value,
      scores: { totalScore: result.value?.score ?? 0, ...subscores.value }
    }).then(() => {}).catch(() => {})
  }
}
function handlePrint(): void { window.print() }
function scrollToResults(): void { if (resultsSection.value) resultsSection.value.scrollIntoView({ behavior: 'smooth' }) }
</script>
