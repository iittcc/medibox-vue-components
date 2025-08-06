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
          :gender="(framework.patientData.value.gender as GenderValue) || config.defaultGender"
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
            v-for="(question, index) in questionsSection1"
            :key="index"
            :name="question.id"
            :question="question"
            :options="getOptions(question.optionsType as keyof OptionsSets)"
            :index="index"
            :framework-answer="(epdsData as any)[question.id]"
            :is-unanswered="formSubmitted && ((epdsData as any)[question.id] === null || (epdsData as any)[question.id] === undefined)"
            scrollHeight="18rem"
            @update:answer="framework.setFieldValue('calculator', question.id, $event)"
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
                <b>{{ config.name }}</b>
                <br /><br />
                Navn: {{ framework.patientData.value.name }} <br />
                Køn: {{ getGenderLabel(framework.patientData.value.gender as GenderValue) }} <br />
                Alder: {{ framework.patientData.value.age }} år<br /><br />
                <div v-for="question in resultsSection1" :key="question.id" >{{ question.text }} {{ (epdsData as any)[question.id] }}</div>
                <br /><br />
                Edinburgh postnatale depressionsscore {{ framework.result.value?.score }} : {{ framework.result.value?.interpretation }}
              </template>
            </CopyDialog>
            <SecondaryButton
              label="Reset"
              icon="pi pi-sync"
              severity="secondary"
              @click="handleReset"
            />
            <Button
              type="submit"
              :label="framework.state.value.isSubmitting ? '' : 'Beregn'"
              class="pr-6 pl-6"
              :icon="framework.state.value.isSubmitting ? 'pi pi-spin pi-spinner' : 'pi pi-calculator'"
              :disabled="framework.state.value.isSubmitting"
            />
          </div>
        </form>
      </template>
    </SurfaceCard>
    <div data-testid="results-section" v-if="framework.result.value" class="results" ref="resultsSection">
      <SurfaceCard title="Resultat">
        <template #content>          
          <br />
          <Message class="flex justify-center p-3" :severity="getSeverityFromRiskLevel(framework.result.value.riskLevel)">
            <h2>Edinburgh postnatale depressionsscore {{ framework.result.value.score }} : {{ framework.result.value.interpretation }}</h2>
            <div class="flex justify-center" v-if="getDetailedDescription(framework.result.value.details)">{{ getDetailedDescription(framework.result.value.details) }}</div>
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
import QuestionSingleComponent from "./QuestionSingleComponent.vue"
import CopyDialog from "./CopyDialog.vue"
import SurfaceCard from "./SurfaceCard.vue"
import PersonInfo from "./PersonInfo.vue"
import Message from '@/volt/Message.vue'
import { getGenderLabel, type GenderValue } from '@/utils/genderUtils'
import type { RiskLevel, EpdsResponses } from '@/types/calculatorTypes'
import type { EpdsDetails } from '@/calculators/epds/epdsTypes'

export interface Option {
  text: string;
  value: number;
}

export type OptionsSets = {
  options1: Option[];
  options2: Option[];
  options3: Option[];
  options4: Option[];
  options5: Option[];
  options6: Option[];
  options7: Option[];
  options8: Option[];
  options9: Option[];
  options10: Option[];
};

export interface Question {
  type: string;
  bg?: string;
  text: string;
  description?: string;
  optionsType?: keyof OptionsSets;
  answer: number | null;
}

export interface Result {
  question: string;
  text: string;
  score: number;
}

// Framework configuration
const config: CalculatorConfig = {
  type: 'epds',
  name: 'Edinburgh postnatale depressionsscore',
  version: '2.0.0',
  category: 'pregnancy',
  theme: 'teal',
  defaultAge: 30,
  defaultGender: 'female',
  minAge: 12,
  maxAge: 50,
  estimatedDuration: 3,
  scoreInterpretation: 'Score ≤ 9: Ikke tegn til alvorlig depression | Score ≥ 10: Behandlingskrævende depression kan foreligge'
}

// Initialize framework
const framework = useCalculatorFramework(config)

// Initialize steps
const steps: CalculatorStep[] = [
  { id: 'calculator', title: 'EPDS Questionnaire', order: 1, validation: true },
]
framework.initializeSteps(steps)

// State
const formSubmitted = ref<boolean>(false)
const validationMessage = ref<string>('')
const resultsSection = ref<HTMLDivElement | null>(null)

// Typed calculator data
const epdsData = computed(() => framework.calculatorData.value as Partial<EpdsResponses>)

const options1 = ref<Option[]>([
  { text: "Lige så meget som jeg altid har kunnet", value: 0 },
  { text: "Ikke helt så meget som tidligere", value: 1 },
  { text: "Afgjort ikke så meget som tidligere", value: 2 },
  { text: "Overhovedet ikke", value: 3 }
]);

const options2 = ref<Option[]>([
  { text: "Lige så meget som jeg tidligere har gjort", value: 0 },
  { text: "En del mindre end jeg tidligere har gjort", value: 1 },
  { text: "Afgjort mindre end jeg tidligere har gjort", value: 2 },
  { text: "Næsten ikke", value: 3 }
]);

const options3 = ref<Option[]>([
  { text: "Ja, det meste af tiden", value: 3 },
  { text: "Ja, af og til", value: 2 },
  { text: "Ikke så tit", value: 1 },
  { text: "Nej, slet ikke", value: 0 }
]);

const options4 = ref<Option[]>([
  { text: "Nej, overhovedet ikke", value: 0 },
  { text: "Meget sjældent", value: 1 },
  { text: "Ja, nogle gange", value: 2 },
  { text: "Ja, meget ofte ", value: 3 }
]);

const options5 = ref<Option[]>([
  { text: "Ja, en hel del", value: 3 },
  { text: "Ja, nogle gange", value: 2 },
  { text: "Nej, ikke meget", value: 1 },
  { text: "Nej, overhovedet ikke", value: 0 }
]);

const options6 = ref<Option[]>([
  { text: "Ja, det meste af tiden", value: 3 },
  { text: "Ja, nogle gange", value: 2 },
  { text: "Nej, det meste af tiden har jeg kunne overskue min situation", value: 1 },
  { text: "Nej, jeg har kunne overskue min situation lige så godt, som jeg plejer", value: 0 }
]);

const options7 = ref<Option[]>([
  { text: "Ja, det meste af tiden", value: 3 },
  { text: "Ja, nogle gange", value: 2 },
  { text: "Sjældent", value: 1 },
  { text: "Nej, aldrig", value: 0 }
]);

const options8 = ref<Option[]>([
  { text: "Ja, det meste af tiden", value: 3 },
  { text: "Ja, ret tit", value: 2 },
  { text: "Sjældent", value: 1 },
  { text: "Nej, aldrig", value: 0 }
]);

const options9 = ref<Option[]>([
  { text: "Ja, det meste af tiden", value: 3 },
  { text: "Ja, ret tit", value: 2 },
  { text: "Ja, ved enkelte lejligheder", value: 1 },
  { text: "Nej, aldrig", value: 0 }
]);

const options10 = ref<Option[]>([
  { text: "Ja, ganske ofte", value: 3 },
  { text: "Nogle gange", value: 2 },
  { text: "Sjældent", value: 1 },
  { text: "Aldrig", value: 0 }
]);

const questionsSection1 = [
  {
    id: 'question1',
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "1. Har du de sidste 7 dage været i stand til at le og se tingene fra den humoristiske side?",
    description: "", 
    optionsType: 'options1',
    answer: options1.value[0].value
  },
  {
    id: 'question2',
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "2. Har du de sidste 7 dage kunnet se frem til ting med glæde?",
    description: "", 
    optionsType: 'options2',
    answer: options2.value[0].value
  },
  {
    id: 'question3',
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "3. Har du de sidste 7 dage unødvendigt bebrejdet dig selv, når ting ikke gik som de skulle?",
    description: "", 
    optionsType: 'options3',
    answer: options3.value[3].value
  },
  {
    id: 'question4',
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "4. Har du de sidste 7 dage været  anspændt og bekymret uden nogen særlig grund?",
    description: "", 
    optionsType: 'options4',
    answer: options4.value[0].value
  },
  {
    id: 'question5',
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "5. Har du de sidste 7 dage følt dig angst eller panikslagen uden nogen særlig grund?",
    description: "", 
    optionsType: 'options5',
    answer: options5.value[3].value
  },
  {
    id: 'question6',
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "6. Har du de sidste 7 dage følt, at tingene voksede dig over hovedet?",
    description: "", 
    optionsType: 'options6',
    answer: options6.value[3].value
  },
  {
    id: 'question7',
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "7. Har du de sidste 7 dage været så ked af det, at du har haft svært ved at sove?",
    description: "", 
    optionsType: 'options7',
    answer: options7.value[3].value
  },
  {
    id: 'question8',
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "8. Har du de sidste 7 dage følt dig trist eller elendigt til mode?",
    description: "", 
    optionsType: 'options8',
    answer: options8.value[3].value
  },
  {
    id: 'question9',
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "9. Har du de sidste 7 dage været så ulykkelig, at du har grædt?",
    description: "", 
    optionsType: 'options9',
    answer: options9.value[3].value
  },
  {
    id: 'question10',
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "10. Har tanken om at gøre skade på dig selv strejfet dig de sidste 7 dage?",
    description: "", 
    optionsType: 'options10',
    answer: options10.value[3].value
  }
];

const optionsSets = {
  options1,
  options2,
  options3,
  options4,
  options5,
  options6,
  options7,
  options8,
  options9,
  options10
};

const getOptions = (type: keyof OptionsSets): Option[] => {
  return optionsSets[type].value;
}

const resultsSection1 = questionsSection1;

// Expose options to parent component (tests)
defineExpose({ options1, options2, options3, options4, options5, options6, options7, options8, options9, options10 })

// Function to set default values
const setDefaultValues = () => {
  // Set default calculator values using question configurations
  questionsSection1.forEach(question => {
    framework.setFieldValue('calculator', question.id, question.answer)
  })
  
  // Set default patient values
  if (!framework.patientData.value.name) {
    framework.setFieldValue('patient', 'name', '')
  }
  if (!framework.patientData.value.age) {
    framework.setFieldValue('patient', 'age', config.defaultAge)
  }
  if (!framework.patientData.value.gender) {
    framework.setFieldValue('patient', 'gender', config.defaultGender)
  }
}

// Set default values only if data is empty
onMounted(() => {
  const hasData = Object.values(epdsData.value).some(value => value !== null && value !== undefined)
  if (!hasData) {
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
  formSubmitted.value = false
  validationMessage.value = ''
  
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
    minimal: 'success',
    medium: 'warn',
    high: 'error',
    very_high: 'error'
  }
  return mapping[riskLevel] || 'info'
}

const getDetailedDescription = (details: any): string => {
  if (!details) return ''
  
  const epdsDetails = details as EpdsDetails
  return epdsDetails.urgentReferralNeeded ? 'Kræver øjeblikkelig handling' : ''
}
</script>

