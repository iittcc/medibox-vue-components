<template>
  <div class="medical-calculator-container">
    <div class="w-full max-w-[800px] mx-auto px-4">

    <SurfaceCard title="Patient">
      <template #content>
        <PersonInfo
          :name="framework.patientData.value.name || ''"
          :age="framework.patientData.value.age || config.defaultAge"
          :minAge="config.minAge"
          :maxAge="config.maxAge"
          :gender="(framework.patientData.value.gender as GenderValue) || 'female'"
          genderdisplay="none"
          @update:name="framework.setFieldValue('patient', 'name', $event)"
          @update:age="framework.setFieldValue('patient', 'age', $event)"
          @update:gender="framework.setFieldValue('patient', 'gender', $event)"
        />
      </template>
    </SurfaceCard>
    
    <SurfaceCard :title="config.name">
      <template #content>
        <form @submit.prevent="handleSubmit">
          <QuestionSingleComponent
            name="nausea"
            :question="{ 
              type: 'Listbox',
              bg: '--p-primary-100',
              text: '1. Hvor lang tid har du følt dig forkvalmet, i løbet af de sidste 24 timer?',
              optionsType: 'nausea'
            }"
            :options="nauseaOptions"
            :index="0"
            :framework-answer="puqeData.nausea"
            :is-unanswered="formSubmitted && !puqeData.nausea"
            scrollHeight="18rem"
            @update:answer="framework.setFieldValue('calculator', 'nausea', $event)"
          />
          
          <QuestionSingleComponent
            name="vomiting"
            :question="{ 
              type: 'Listbox',
              bg: '--p-primary-50',
              text: '2. Hvor mange gange har du kastet op, i løbet af de sidste 24 timer?',
              optionsType: 'vomiting'
            }"
            :options="vomitingOptions"
            :index="1"
            :framework-answer="puqeData.vomiting"
            :is-unanswered="formSubmitted && !puqeData.vomiting"
            scrollHeight="18rem"
            @update:answer="framework.setFieldValue('calculator', 'vomiting', $event)"
          />
          
          <QuestionSingleComponent
            name="retching"
            :question="{ 
              type: 'Listbox',
              bg: '--p-primary-100',
              text: '3. Har du haft opkastningsbevægelser (uden der kommer noget med op), i løbet af de sidste 24 timer?',
              optionsType: 'retching'
            }"
            :options="retchingOptions"
            :index="2"
            :framework-answer="puqeData.retching"
            :is-unanswered="formSubmitted && !puqeData.retching"
            scrollHeight="18rem"
            @update:answer="framework.setFieldValue('calculator', 'retching', $event)"
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
                <b>{{config.name}}</b>
                <br /><br />
                Navn: {{ framework.patientData.value.name }} <br />
                Køn: {{ getGenderLabel((framework.patientData.value.gender as GenderValue) || 'female') }} <br />
                Alder: {{ framework.patientData.value.age }} år<br /><br />
               
                1. Kvalme: {{ puqeData.nausea }}<br />
                2. Opkastning: {{ puqeData.vomiting }}<br />
                3. Opkastningsbevægelser: {{ puqeData.retching }}<br />
                <br /><br />
                PUQE Score {{ framework.result.value?.score }} : {{ framework.result.value?.interpretation || '' }}
              </template>
            </CopyDialog>
            <SecondaryButton label="Reset" icon="pi pi-sync" severity="secondary" @click="handleReset"/>
            <Button type="submit"
              :label="framework.state.value.isSubmitting ? '' : 'Beregn'"
              class="mr-3 pr-6 pl-6"
              :icon="framework.state.value.isSubmitting ? 'pi pi-spin pi-spinner' : 'pi pi-calculator'"
              :disabled="framework.state.value.isSubmitting"
            />
          </div>
        </form>
      </template>
    </SurfaceCard>
    
    <div v-if="framework.result.value" class="results" ref="resultsSection">
      <SurfaceCard title="Resultat">
        <template #content>          
          <br />
          <Message class="flex justify-center p-3" :severity="getSeverityFromRiskLevel(framework.result.value.riskLevel)">
            <h2>PUQE Score {{ framework.result.value.score }} : {{ framework.result.value.interpretation }}</h2>
            <div class="flex justify-center">{{ getDetailedDescription(framework.result.value.details) }}</div>
          </Message>
          <br />
          <p class="text-sm text-center">Score ≤ 6 : Mild graviditetskvalme | Score 7-12: Moderat graviditetskvalme | Score ≥ 13: Svær graviditetskvalme (Hyperemesis Gravidarum)</p>
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
import { ref, nextTick, computed, onMounted } from 'vue'
import { useCalculatorFramework, type CalculatorConfig, type CalculatorStep } from '@/composables/useCalculatorFramework'
import Button from '@/volt/Button.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'
import QuestionSingleComponent from './QuestionSingleComponent.vue'
import CopyDialog from './CopyDialog.vue'
import SurfaceCard from './SurfaceCard.vue'
import PersonInfo from './PersonInfo.vue'
import Message from '@/volt/Message.vue'
import { getGenderLabel, type GenderValue } from '@/utils/genderUtils'
import type { RiskLevel, PuqeResponses } from '@/types/calculatorTypes'
import type { PuqeDetails } from '@/calculators/puqe/puqeTypes'

// Framework configuration
const config: CalculatorConfig = {
  type: 'puqe',
  name: 'PUQE Scoringsskema',
  version: '2.0.0',
  category: 'pregnancy',
  theme: 'teal',
  defaultAge: 28,
  defaultGender: 'female',
  minAge: 12,
  maxAge: 60,
  estimatedDuration: 3
}

// Initialize framework
const framework = useCalculatorFramework(config)

// Initialize steps
const steps: CalculatorStep[] = [
  { id: 'calculator', title: 'PUQE Assessment', order: 1, validation: true }
]
framework.initializeSteps(steps)

// State
const formSubmitted = ref<boolean>(false)
const validationMessage = ref<string>('')
const resultsSection = ref<HTMLDivElement | null>(null)

// Typed calculator data
const puqeData = computed(() => framework.calculatorData.value as Partial<PuqeResponses>)

// Options for PUQE questions
const nauseaOptions = [
  { text: "Slet ikke", value: 1 },
  { text: "≤ 1 time", value: 2 },
  { text: "2-3 timer", value: 3 },
  { text: "4-6 timer", value: 4 },
  { text: "> 6 timer", value: 5 }
]

const vomitingOptions = [
  { text: "Ingen opkastninger", value: 1 },
  { text: "1-2 gange", value: 2 },
  { text: "3-4 gange", value: 3 },
  { text: "5-6 gange", value: 4 },
  { text: "≥ 7 gange", value: 5 }
]

const retchingOptions = [
  { text: "Nej", value: 1 },
  { text: "1-2 gange", value: 2 },
  { text: "3-4 gange", value: 3 },
  { text: "5-6 gange", value: 4 },
  { text: "≥ 7 gange", value: 5 }
]

// Expose options to parent component (tests)
defineExpose({ nauseaOptions, vomitingOptions, retchingOptions })

// Function to set default values
const setDefaultValues = () => {
  // Set default calculator values (all start at 1 for PUQE)
  framework.setFieldValue('calculator', 'nausea', 1)
  framework.setFieldValue('calculator', 'vomiting', 1)
  framework.setFieldValue('calculator', 'retching', 1)
  
  // Set default patient values
  if (!framework.patientData.value.name) {
    framework.setFieldValue('patient', 'name', '')
  }
  if (!framework.patientData.value.age) {
    framework.setFieldValue('patient', 'age', config.defaultAge)
  }
  if (!framework.patientData.value.gender) {
    framework.setFieldValue('patient', 'gender', 'female')
  }
}

// Set default values only if data is empty
onMounted(() => {
  if (!puqeData.value.nausea && !puqeData.value.vomiting && !puqeData.value.retching) {
    setDefaultValues()
    console.log('Default values set')
  }
})

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

// Reset handler - reset calculator and set default values
const handleReset = () => {
  framework.resetCalculator()
  // Use nextTick to ensure the reset has completed before setting defaults
  nextTick(() => {
    setDefaultValues()
  })
}

// Helper functions
const scrollToResults = () => {
  const resultsSectionEl = resultsSection.value as HTMLElement
  if (resultsSectionEl) {
    resultsSectionEl.scrollIntoView({ behavior: 'smooth' })
  }
}

const getSeverityFromRiskLevel = (riskLevel: RiskLevel): string => {
  const mapping: Record<RiskLevel, string> = {
    low: 'success',
    mild: 'success', 
    moderate: 'warn',
    severe: 'error',
    unknown: 'info',
    minimal: 'info',
    medium: 'info',
    high: 'info',
    very_high: 'info'
  }
  return mapping[riskLevel] || 'info'
}

const getDetailedDescription = (details: any): string => {
  if (!details) return ''
  
  const puqeDetails = details as PuqeDetails
  if (puqeDetails.severity === 'severe') {
    return 'Patienten bør eventuelt henvises til læge for udredning og behandling af hyperemesis gravidarum'
  } else if (puqeDetails.severity === 'moderate') {
    return 'Kontakt jordemoder for rådgivning og eventuel behandling'
  } else if (puqeDetails.severity === 'mild') {
    return 'Små hyppige måltider og undgå trigger foods kan hjælpe'
  }
  return ''
}
</script>