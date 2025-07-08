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
          :gender="(framework.patientData.value.gender as GenderValue) || 'male'"
          genderdisplay="block"
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
            name="question1"
            :question="{ 
              type: 'Listbox',
              bg: '--p-primary-100',
              text: '1. I de sidste 2 uger har jeg været glad og i godt humør',
              optionsType: 'wellbeing'
            }"
            :options="wellbeingOptions"
            :index="0"
            :framework-answer="who5Data.question1"
            :is-unanswered="formSubmitted && !who5Data.question1"
            scrollHeight="18rem"
            @update:answer="framework.setFieldValue('calculator', 'question1', $event)"
          />
          
          <QuestionSingleComponent
            name="question2"
            :question="{ 
              type: 'Listbox',
              bg: '--p-primary-50',
              text: '2. I de sidste 2 uger har jeg følt mig rolig og afslappet',
              optionsType: 'wellbeing'
            }"
            :options="wellbeingOptions"
            :index="1"
            :framework-answer="who5Data.question2"
            :is-unanswered="formSubmitted && !who5Data.question2"
            scrollHeight="18rem"
            @update:answer="framework.setFieldValue('calculator', 'question2', $event)"
          />
          
          <QuestionSingleComponent
            name="question3"
            :question="{ 
              type: 'Listbox',
              bg: '--p-primary-100',
              text: '3. I de sidste 2 uger har jeg følt mig aktiv og energisk',
              optionsType: 'wellbeing'
            }"
            :options="wellbeingOptions"
            :index="2"
            :framework-answer="who5Data.question3"
            :is-unanswered="formSubmitted && !who5Data.question3"
            scrollHeight="18rem"
            @update:answer="framework.setFieldValue('calculator', 'question3', $event)"
          />
          
          <QuestionSingleComponent
            name="question4"
            :question="{ 
              type: 'Listbox',
              bg: '--p-primary-50',
              text: '4. I de sidste 2 uger er jeg vågnet frisk og udhvilet',
              optionsType: 'wellbeing'
            }"
            :options="wellbeingOptions"
            :index="3"
            :framework-answer="who5Data.question4"
            :is-unanswered="formSubmitted && !who5Data.question4"
            scrollHeight="18rem"
            @update:answer="framework.setFieldValue('calculator', 'question4', $event)"
          />
          
          <QuestionSingleComponent
            name="question5"
            :question="{ 
              type: 'Listbox',
              bg: '--p-primary-100',
              text: '5. I de sidste 2 uger har min daglig været fyldt med ting der interesserer mig',
              optionsType: 'wellbeing'
            }"
            :options="wellbeingOptions"
            :index="4"
            :framework-answer="who5Data.question5"
            :is-unanswered="formSubmitted && !who5Data.question5"
            scrollHeight="18rem"
            @update:answer="framework.setFieldValue('calculator', 'question5', $event)"
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
                Køn: {{ getGenderLabel((framework.patientData.value.gender as GenderValue) || 'male') }} <br />
                Alder: {{ framework.patientData.value.age }} år<br /><br />
               
                1. Glad og i godt humør: {{ who5Data.question1 }}<br />
                2. Rolig og afslappet: {{ who5Data.question2 }}<br />
                3. Aktiv og energisk: {{ who5Data.question3 }}<br />
                4. Vågnet frisk og udhvilet: {{ who5Data.question4 }}<br />
                5. Daglig fyldt med interessante ting: {{ who5Data.question5 }}<br />
                <br /><br />
                WHO-5 Score {{ framework.result.value?.score }} : {{ framework.result.value?.interpretation || '' }}
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
            <h2>WHO-5 Score {{ framework.result.value.score }} : {{ framework.result.value.interpretation }}</h2>
          </Message>
          <br />
          <p class="text-sm text-center">{{ config.scoreInterpretation }}</p>
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
import type { RiskLevel, Who5Responses } from '@/types/calculatorTypes'

// Framework configuration
const config: CalculatorConfig = {
  type: 'who5',
  name: 'WHO-5 Trivselindex',
  version: '2.0.0',
  category: 'psychology',
  theme: 'sky',
  defaultAge: 40,
  defaultGender: 'male',
  minAge: 16,
  maxAge: 110,
  estimatedDuration: 5,
  scoreInterpretation: 'Score ≤ 28: Dårligt velbefindende - mulig depression | Score 29-49: Under gennemsnit | Score 50-67: Gennemsnitligt | Score 68-84: Godt | Score ≥ 85: Fremragende velbefindende'
}

// Initialize framework
const framework = useCalculatorFramework(config)

// Initialize steps
const steps: CalculatorStep[] = [
  { id: 'calculator', title: 'WHO-5 Assessment', order: 1, validation: true }
]
framework.initializeSteps(steps)

// State
const formSubmitted = ref<boolean>(false)
const validationMessage = ref<string>('')
const resultsSection = ref<HTMLDivElement | null>(null)

// Typed calculator data
const who5Data = computed(() => framework.calculatorData.value as Partial<Who5Responses>)

// Options for WHO-5 questions
const wellbeingOptions = [
  { text: "Hele tiden", value: 5 },
  { text: "Det mest af tiden", value: 4 },
  { text: "Lidt mere end halvdelen af tiden", value: 3 },
  { text: "Lidt mindre end halvdelen af tiden", value: 2 },
  { text: "Lidt af tiden", value: 1 },
  { text: "På intet tidspunkt", value: 0 }
]

// Expose options to parent component (tests)
defineExpose({ wellbeingOptions })

// Function to set default values
const setDefaultValues = () => {
  // Set default calculator values (all start at 5 for WHO-5)
  framework.setFieldValue('calculator', 'question1', 5)
  framework.setFieldValue('calculator', 'question2', 5)
  framework.setFieldValue('calculator', 'question3', 5)
  framework.setFieldValue('calculator', 'question4', 5)
  framework.setFieldValue('calculator', 'question5', 5)
  
  // Set default patient values
  if (!framework.patientData.value.name) {
    framework.setFieldValue('patient', 'name', '')
  }
  if (!framework.patientData.value.age) {
    framework.setFieldValue('patient', 'age', config.defaultAge)
  }
  if (!framework.patientData.value.gender) {
    framework.setFieldValue('patient', 'gender', 'male')
  }
}

// Set default values only if data is empty
onMounted(() => {
  if (!who5Data.value.question1 && !who5Data.value.question2 && !who5Data.value.question3 && !who5Data.value.question4 && !who5Data.value.question5) {
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
    high: 'error',
    very_high: 'error'
  }
  return mapping[riskLevel] || 'info'
}
</script>

