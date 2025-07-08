<template>
  <div class="medical-calculator-container">
    <div class="w-full max-w-[800px] mx-auto px-4">

    <SurfaceCard title="Patient">
      <template #content>
        <PersonInfo
          :name="framework.patientData.value.name || ''"
          :age="framework.patientData.value.age || 50"
          :minAge="5"
          :maxAge="110"
          :gender="(framework.patientData.value.gender as GenderValue) || 'male'"
          genderdisplay="block"
          @update:name="framework.setFieldValue('patient', 'name', $event)"
          @update:age="framework.setFieldValue('patient', 'age', $event)"
          @update:gender="framework.setFieldValue('patient', 'gender', $event)"
        />
      </template>
    </SurfaceCard>
    
    <SurfaceCard title="Glasgow Coma Scale">
      <template #content>
        <form @submit.prevent="handleSubmit">
          <QuestionSingleComponent
            name="eyeOpening"
            :question="{ 
              type: 'Listbox',
              bg: '--p-primary-100',
              text: 'Øjenåbning',
              optionsType: 'eyeOpening',
              answer: framework.calculatorData.value.eyeOpening || 4
            }"
            :options="eyeOpeningOptions"
            :index="0"
            :framework-answer="framework.calculatorData.value.eyeOpening"
            :is-unanswered="formSubmitted && !framework.calculatorData.value.eyeOpening"
            scrollHeight="18rem"
            @update:answer="framework.setFieldValue('calculator', 'eyeOpening', $event)"
          />
          
          <QuestionSingleComponent
            name="verbalResponse"
            :question="{ 
              type: 'Listbox',
              bg: '--p-primary-50',
              text: 'Verbalt responds',
              optionsType: 'verbalResponse',
              answer: framework.calculatorData.value.verbalResponse || 5
            }"
            :options="verbalResponseOptions"
            :index="1"
            :framework-answer="framework.calculatorData.value.verbalResponse"
            :is-unanswered="formSubmitted && !framework.calculatorData.value.verbalResponse"
            scrollHeight="18rem"
            @update:answer="framework.setFieldValue('calculator', 'verbalResponse', $event)"
          />
          
          <QuestionSingleComponent
            name="motorResponse"
            :question="{ 
              type: 'Listbox',
              bg: '--p-primary-100',
              text: 'Bedste motoriske responds',
              optionsType: 'motorResponse',
              answer: framework.calculatorData.value.motorResponse || 6
            }"
            :options="motorResponseOptions"
            :index="2"
            :framework-answer="framework.calculatorData.value.motorResponse"
            :is-unanswered="formSubmitted && !framework.calculatorData.value.motorResponse"
            scrollHeight="18rem"
            @update:answer="framework.setFieldValue('calculator', 'motorResponse', $event)"
          />
          
          <div v-if="validationMessage" class="text-red-500 mt-5 font-bold">
            {{ validationMessage }}
          </div>

          <div class="flex justify-end text-right mt-5 gap-3">
            <CopyDialog 
              title="Kopier til Clipboard" 
              icon="pi pi-clipboard" 
              severity="secondary" 
              class="mr-3" 
              :disabled="!framework.result.value" 
            >
              <template #container>
                <b>Glasgow Coma Scale</b>
                <br /><br />
                Navn: {{ framework.patientData.value.name }} <br />
                Køn: {{ getGenderLabel((framework.patientData.value.gender as GenderValue) || 'male') }} <br />
                Alder: {{ framework.patientData.value.age }} år<br /><br />
                Øjenåbning: {{ framework.calculatorData.value.eyeOpening || 4 }}<br />
                Verbalt responds: {{ framework.calculatorData.value.verbalResponse || 5 }}<br />
                Bedste motoriske responds: {{ framework.calculatorData.value.motorResponse || 6 }}<br />
                <br /><br />
                {{ framework.result.value?.interpretation || '' }}
              </template>
            </CopyDialog>
            <SecondaryButton label="Reset" icon="pi pi-sync" severity="secondary" @click="framework.resetCalculator"/>
            <Button type="submit" label="Beregn" class="mr-3 pr-6 pl-6" icon="pi pi-calculator"/>
          </div>
        </form>
      </template>
    </SurfaceCard>
    
    <div v-if="framework.result.value" class="results" ref="resultsSection">
      <SurfaceCard title="Resultat">
        <template #content>          
          <br />
          <Message class="flex justify-center p-3" :severity="getSeverityFromRisk(framework.result.value.riskLevel)">
            <h2>{{ framework.result.value.interpretation }}</h2>
            <div class="flex justify-center">{{ framework.result.value.details?.clinicalSignificance }}</div>
          </Message>
          <br />
          <div v-if="framework.result.value.recommendations">
            <h3 class="text-lg font-semibold mb-2">Anbefalinger:</h3>
            <ul class="list-disc list-inside space-y-1">
              <li v-for="rec in framework.result.value.recommendations" :key="rec">{{ rec }}</li>
            </ul>
          </div>
        </template>
      </SurfaceCard>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useCalculatorFramework, type CalculatorConfig, type CalculatorStep } from '@/composables/useCalculatorFramework'
import Button from '@/volt/Button.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'
import QuestionSingleComponent from './QuestionSingleComponent.vue'
import CopyDialog from './CopyDialog.vue'
import SurfaceCard from './SurfaceCard.vue'
import PersonInfo from './PersonInfo.vue'
import Message from '@/volt/Message.vue'
import { getGenderLabel, type GenderValue } from '@/utils/genderUtils'
import type { RiskLevel } from '@/types/calculatorTypes'
import { GCS_OPTIONS } from '@/calculators/gcs/gcsTypes'

// Framework configuration
const config: CalculatorConfig = {
  type: 'gcs',
  name: 'Glasgow Coma Scale',
  version: '2.0.0',
  category: 'general',
  theme: 'teal',
  minAge: 5,
  maxAge: 110,
  estimatedDuration: 3
}

// Initialize framework
const framework = useCalculatorFramework(config)

// Initialize steps
const steps: CalculatorStep[] = [
  { id: 'calculator', title: 'Glasgow Coma Scale Assessment', order: 1, validation: true }
]
framework.initializeSteps(steps)

// State
const formSubmitted = ref<boolean>(false)
const validationMessage = ref<string>('')
const resultsSection = ref<HTMLDivElement | null>(null)

// Options from GCS configuration
const eyeOpeningOptions = GCS_OPTIONS.eyeOpening.map(opt => ({ 
  text: opt.label, 
  value: opt.value 
}))

const verbalResponseOptions = GCS_OPTIONS.verbalResponse.map(opt => ({ 
  text: opt.label, 
  value: opt.value 
}))

const motorResponseOptions = GCS_OPTIONS.motorResponse.map(opt => ({ 
  text: opt.label, 
  value: opt.value 
}))

// Set default values if not already set
if (!framework.calculatorData.value.eyeOpening) {
  framework.setFieldValue('calculator', 'eyeOpening', 4)
}
if (!framework.calculatorData.value.verbalResponse) {
  framework.setFieldValue('calculator', 'verbalResponse', 5)
}
if (!framework.calculatorData.value.motorResponse) {
  framework.setFieldValue('calculator', 'motorResponse', 6)
}

// Submit handler
const handleSubmit = async () => {
  formSubmitted.value = true
  validationMessage.value = ''
  
  try {
    await framework.submitCalculation()
    await nextTick()
    scrollToResults()
  } catch (_error) {
    // Handle graceful degradation
    if (framework.state.value.isComplete && framework.result.value) {
      validationMessage.value = 'Beregning gennemført. Indsendelse til server fejlede.'
    } else {
      validationMessage.value = 'Der opstod en fejl ved beregning. Prøv igen.'
    }
  }
}

// Helper functions
const scrollToResults = () => {
  const resultsSectionEl = resultsSection.value as HTMLElement
  if (resultsSectionEl) {
    resultsSectionEl.scrollIntoView({ behavior: 'smooth' })
  }
}

const getSeverityFromRisk = (riskLevel: RiskLevel): string => {
  const mapping = {
    low: 'success',
    mild: 'warn', 
    moderate: 'error',
    severe: 'error',
    unknown: 'info'
  }
  return mapping[riskLevel] || 'info'
}
</script>

