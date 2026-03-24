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
              <!-- Risk factor cards grouped by section -->
              <div class="space-y-2">
                <template v-for="(question, index) in questions" :key="index">
                  <!-- Section header -->
                  <div
                    v-if="sectionAtIndex(index)"
                    class="pt-3 pb-1 pl-1 text-sm font-semibold text-gray-500 italic"
                    :class="{ 'pt-0': index === 0 }"
                  >
                    {{ sectionAtIndex(index) }}
                  </div>

                  <!-- Question card -->
                  <div
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
                </template>
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
                      {{ recommendation }}
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
                <p class="text-sm mt-1">{{ recommendation }}</p>
              </Message>
              <br />

              <!-- Risk rate reference table -->
              <div class="overflow-hidden rounded-lg border border-gray-200 mt-2">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-200" :style="{ backgroundColor: 'var(--p-primary-50)' }">
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Score</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Sandsynlighed</th>
                      <th class="px-3 py-2 text-left font-semibold text-gray-700">Anbefaling</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="row in riskRateTable"
                      :key="row.score"
                      class="border-b border-gray-100 last:border-b-0 text-gray-600"
                    >
                      <td class="px-3 py-1.5">{{ row.score }}</td>
                      <td class="px-3 py-1.5">{{ row.probability }}</td>
                      <td class="px-3 py-1.5">{{ row.recommendation }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Clinical disclaimers -->
              <div class="mt-4 p-3 rounded-lg bg-gray-50 text-xs text-gray-500 italic space-y-1">
                <p v-for="(note, i) in clinicalNotes" :key="i">{{ note }}</p>
              </div>
            </template>
          </SurfaceCard>
        </div>
      </div>

      <WellsDvtCalculatorPrint
        :config="config"
        :patient="patient"
        :result="result"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

import Button from '@/volt/Button.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'
import Message from '@/volt/Message.vue'
import SelectButton from '@/volt/SelectButton.vue'
import CopyDialog from '../CopyDialog.vue'
import SurfaceCard from '../SurfaceCard.vue'
import PersonInfo from '../PersonInfo.vue'
import WellsDvtCalculatorPrint from './WellsDvtCalculatorPrint.vue'

import { useCalculatorForm } from '../../composables/useCalculatorForm'
import { wellsDvtConfig, calculateWellsDvt, WELLS_DVT_SECTIONS, WELLS_DVT_RECOMMENDATION, WELLS_DVT_CLINICAL_NOTES } from '../../scoring/wellsDvt'
import sendDataToServer from '../../assets/sendDataToServer'

const config = wellsDvtConfig
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
} = useCalculatorForm(config, calculateWellsDvt)

const resultsSection = ref<HTMLDivElement | null>(null)
const clinicalNotes = WELLS_DVT_CLINICAL_NOTES

const apiUrlServer = import.meta.env.VITE_API_URL
const apiUrl = apiUrlServer + '/index.php/callback/LogCB/log'
const keyUrl = apiUrlServer + '/index.php/KeyServer/getPublicKey'

function sectionAtIndex(index: number): string | null {
  const section = WELLS_DVT_SECTIONS.find(s => s.startIndex === index)
  return section ? section.title : null
}

const factors = computed(() =>
  questions.value.map(q => {
    const parts = q.text.split(' — ')
    const nonZeroValue = q.options.find(o => o.value !== 0)?.value ?? 0
    return {
      letter: parts[0],
      name: parts[1] || q.text,
      pointLabel: nonZeroValue > 0 ? `+${nonZeroValue}` : `${nonZeroValue}`
    }
  })
)

const recommendation = computed(() => {
  if (!result.value) return ''
  return WELLS_DVT_RECOMMENDATION[result.value.severity] ?? ''
})

const riskRateTable = [
  { score: '≤ 0', probability: 'Lav (3-5%)', recommendation: 'D-dimer ved mistanke' },
  { score: '1-2', probability: 'Intermediær (15-20%)', recommendation: 'D-dimer nødvendig' },
  { score: '≥ 3', probability: 'Høj (50-75%)', recommendation: 'Ultralyd direkte' }
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
