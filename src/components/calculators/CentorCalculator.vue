<template>
  <div class="medical-calculator-container">
    <div class="calculator-print-wrapper">

      <!-- Interactive view -->
      <div class="calculator-interactive-view w-full max-w-[800px] mx-auto px-4">

        <SurfaceCard title="Patient">
          <template #content>
            <PersonInfo
              :name="patient.name"
              :age="patient.age"
              :minAge="config.minAge"
              :maxAge="config.maxAge"
              :gender="patient.gender"
              genderdisplay="block"
              @update:name="patient.name = $event"
              @update:age="patient.age = $event"
              @update:gender="patient.gender = $event"
            />
          </template>
        </SurfaceCard>

        <SurfaceCard :title="config.name" :description="config.description">
          <template #content>

            <form @submit.prevent="handleSubmit">
              <!-- Criteria cards -->
              <div class="space-y-2">
                <div
                  v-for="(question, index) in questions"
                  :key="index"
                  class="rounded-xl p-3"
                  :style="{ backgroundColor: 'var(' + question.bg + ')' }"
                >
                  <div class="flex items-center gap-3">
                    <!-- Number badge -->
                    <div
                      class="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
                      :style="{ backgroundColor: 'var(--p-primary-500)', color: 'white' }"
                    >
                      {{ factors[index].letter }}
                    </div>

                    <!-- Text content -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-semibold text-gray-800">{{ factors[index].name }}</span>
                        <span
                          class="text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap"
                          :style="{ backgroundColor: 'var(--p-primary-200)', color: 'var(--p-primary-700)' }"
                        >
                          {{ factors[index].pointLabel }}
                        </span>
                      </div>
                      <p v-if="question.description" class="text-xs text-gray-500 mt-0.5 leading-snug">
                        {{ question.description }}
                      </p>
                    </div>

                    <!-- SelectButton aligned right -->
                    <div class="shrink-0">
                      <SelectButton
                        v-model="question.answer"
                        :options="question.options"
                        optionLabel="text"
                        optionValue="value"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="validationMessage" class="text-red-500 mt-5 font-bold">
                {{ validationMessage }}
              </div>

              <div class="flex justify-end text-right mt-5 gap-3">
                <CopyDialog
                  title="Kopier til Clipboard"
                  icon="pi pi-clipboard"
                  severity="secondary"
                  class="mr-3"
                  :disabled="!hasResults"
                >
                  <template #container>
                    <b>{{ config.name }}</b>
                    <br /><br />
                    Navn: {{ patient.name }} <br />
                    Køn: {{ patient.gender }} <br />
                    Alder: {{ patient.age }} år<br /><br />
                    <template v-if="result">
                      <div v-for="qr in result.questionResults" :key="qr.questionNumber">
                        {{ qr.questionText }}: {{ qr.answerText }} ({{ qr.score }} point)
                      </div>
                      <br /><br />
                      {{ config.shortName }} Score {{ result.score }} : {{ result.interpretation }}
                      <br />
                      {{ activeRecommendation.title }}
                    </template>
                  </template>
                </CopyDialog>

                <SecondaryButton
                  label="Print"
                  icon="pi pi-print"
                  severity="secondary"
                  :disabled="!hasResults"
                  @click="handlePrint"
                />

                <SecondaryButton
                  label="Reset"
                  icon="pi pi-sync"
                  severity="secondary"
                  @click="reset"
                />

                <Button
                  type="submit"
                  label="Beregn"
                  class="pr-6 pl-6 rounded-lg"
                  icon="pi pi-calculator"
                />
              </div>
            </form>
          </template>
        </SurfaceCard>

        <div v-if="hasResults" class="results" ref="resultsSection">
          <SurfaceCard title="Resultat">
            <template #content>
              <br />
              <Message
                class="flex justify-center p-3 text-center"
                :severity="resultSeverityDisplay"
              >
                <h2>{{ config.shortName }} Score {{ result!.score }} <br /> {{ result!.interpretation }}</h2>
              </Message>
              <br />

              <!-- Active recommendation for the patient's score -->
              <div
                class="mt-2 p-4 rounded-lg border text-sm"
                :style="{
                  backgroundColor: 'var(--p-primary-50)',
                  borderColor: 'var(--p-primary-200)'
                }"
              >
                <p class="font-semibold text-gray-700 mb-2">{{ activeRecommendation.title }}</p>
                <p class="text-gray-600 leading-relaxed">{{ activeRecommendation.text }}</p>
                <p v-if="activeRecommendation.note" class="text-gray-500 text-xs mt-2 italic">
                  {{ activeRecommendation.note }}
                </p>
              </div>

              <!-- All groups reference table -->
              <div class="overflow-hidden rounded-lg border border-gray-200 mt-4">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-200" :style="{ backgroundColor: 'var(--p-primary-50)' }">
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Gruppe</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Score</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Anbefaling</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in guidanceTable"
                      :key="row.group"
                      class="border-b border-gray-100 last:border-b-0 text-gray-600"
                    >
                      <td class="px-3 py-1.5">{{ row.group }}</td>
                      <td class="px-3 py-1.5">{{ row.score }}</td>
                      <td class="px-3 py-1.5">{{ row.recommendation }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Additional clinical note about children -->
              <div class="mt-4 p-3 rounded-lg text-xs text-gray-500" :style="{ backgroundColor: 'var(--p-primary-50)' }">
                <p class="font-semibold text-gray-600 mb-1">Bemærk ved små børn:</p>
                <p>Symptomerne ved GAS-infektion kan være atypiske: dårlig appetit, feber og mavesmerter, kvalme og opkastninger.</p>
              </div>
            </template>
          </SurfaceCard>
        </div>
      </div>

      <CentorCalculatorPrint
        :config="config"
        :patient="patient"
        :result="result"
      />

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
import CentorCalculatorPrint from './CentorCalculatorPrint.vue'

import { useCalculatorForm } from '../../composables/useCalculatorForm'
import { centorConfig, calculateCentor, AGE_QUESTION_INDEX } from '../../scoring/centor'
import sendDataToServer from '../../assets/sendDataToServer'

const config = centorConfig
const {
  questions,
  patient,
  result,
  formSubmitted,
  validationMessage,
  hasResults,
  validate,
  calculate,
  reset
} = useCalculatorForm(config, calculateCentor)

const resultsSection = ref<HTMLDivElement | null>(null)

// Sync patient age slider → age SelectButton
watch(() => patient.value.age, (age) => {
  const q = questions.value[AGE_QUESTION_INDEX]
  let target: number
  if (age < 3) target = 0        // Under 3 år
  else if (age <= 14) target = 1  // 3-14 år
  else if (age <= 44) target = 2  // 15-44 år
  else target = 3                 // Over 45 år
  if (q.answer !== target) q.answer = target
}, { immediate: true })

// Sync age SelectButton → patient age slider
watch(() => questions.value[AGE_QUESTION_INDEX].answer, (answer) => {
  const age = patient.value.age
  if (answer === 0 && age >= 3) patient.value.age = 2
  else if (answer === 1 && (age < 3 || age > 14)) patient.value.age = 10
  else if (answer === 2 && (age < 15 || age > 44)) patient.value.age = 25
  else if (answer === 3 && age <= 44) patient.value.age = 50
})

const apiUrlServer = import.meta.env.VITE_API_URL
const apiUrl = apiUrlServer + '/index.php/callback/LogCB/log'
const keyUrl = apiUrlServer + '/index.php/KeyServer/getPublicKey'

const factors = computed(() =>
  questions.value.map((q, index) => {
    const parts = q.text.split(' — ')
    if (index === AGE_QUESTION_INDEX) {
      return {
        letter: parts[0],
        name: parts[1] || q.text,
        pointLabel: '-1 – +1'
      }
    }
    return {
      letter: parts[0],
      name: parts[1] || q.text,
      pointLabel: '+1'
    }
  })
)

const guidanceTable = [
  { group: '3', score: '0–1', recommendation: 'Ingen test. Symptomatisk behandling' },
  { group: '2', score: '2–3', recommendation: 'Streptokok hurtigtest anbefales' },
  { group: '1', score: '4–5', recommendation: 'Overvej antibiotika eller hurtigtest' }
]

const recommendations = {
  group3: {
    title: 'Gruppe 3: Lav sandsynlighed for GAS-infektion (score 0–1)',
    text: 'Patienter med milde synkesmerter og tegn på virusinfektion (snue, hoste) og kun let rødme af tonsiller. Disse patienter har en meget lille sandsynlighed for GAS-infektion og skal ikke testes med Streptokok hurtigtest. Antibiotika har ingen effekt på deres symptomer uanset evt. tilstedeværelse af GAS i halsen.',
    note: null
  },
  group2: {
    title: 'Gruppe 2: Moderat sandsynlighed for GAS-infektion (score 2–3)',
    text: 'Patienter med moderate til svære symptomer, der ikke er alment påvirkede. Disse patienter bør undersøges med en Streptokok hurtigtest. Er testen positiv, bør patienten behandles med antibiotika. Er den negativ, bør der ikke gives antibiotika, men alene tilrådes symptomatisk behandling.',
    note: null
  },
  group1: {
    title: 'Gruppe 1: Høj sandsynlighed for GAS-infektion (score 4–5)',
    text: 'Patienter med svære symptomer, som er alment påvirkede, har med stor sandsynlighed en GAS-infektion og kan påbegynde antibiotikabehandling uden yderligere undersøgelser. Hvis patienten ikke er alment påvirket, bør der foretages en Streptokok hurtigtest.',
    note: 'Hvis symptomerne har udviklet sig langsomt, bør man være opmærksom på muligheden for mononukleose.'
  }
}

const activeRecommendation = computed(() => {
  if (!result.value) return recommendations.group3
  const score = result.value.score
  if (score >= 4) return recommendations.group1
  if (score >= 2) return recommendations.group2
  return recommendations.group3
})

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
    submitData()
  }
}

function submitData(): void {
  const payload = {
    name: patient.value.name,
    age: patient.value.age,
    gender: patient.value.gender,
    answers: questions.value,
    scores: {
      totalScore: result.value?.score ?? 0
    }
  }

  sendDataToServer(apiUrl, keyUrl, payload)
    .then(() => {})
    .catch(() => {})
}

function handlePrint(): void {
  window.print()
}

function scrollToResults(): void {
  if (resultsSection.value) {
    resultsSection.value.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>
