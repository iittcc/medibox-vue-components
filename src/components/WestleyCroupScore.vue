<template>
  <div class="medical-calculator-container">
    <div class="w-full max-w-[800px] mx-auto px-4">

    <SurfaceCard title="Patient">
      <template #content>
        <PersonInfo
          :name="framework.patientData.value.name || ''"
          :age="framework.patientData.value.age || 6"
          :minAge="0"
          :maxAge="12"
          :gender="framework.patientData.value.gender as GenderValue || 'male'"
          genderdisplay="block"
          child="true"
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
            :framework-answer="(framework.calculatorData.value as any)[question.id]"
            :is-unanswered="formSubmitted && ((framework.calculatorData.value as any)[question.id] === null || (framework.calculatorData.value as any)[question.id] === undefined)"
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
              :disabled="!framework.state.value.isComplete"
            >
              <template #container>
                <b>{{ config.name }}</b>
                <br /><br />
                Navn: {{ framework.patientData.value.name }} <br />
                Køn: {{ getGenderLabelByAge(framework.patientData.value.gender as GenderValue, framework.patientData.value.age) }} <br />
                Alder: {{ framework.patientData.value.age }} år<br /><br />
                <div v-for="question in questionsSection1" :key="question.id" >{{ question.text }} {{ (framework.calculatorData.value as any)[question.id] }}</div>
                <br /><br />
                Westley Croup Score {{ framework.result.value?.score }} : {{ framework.result.value?.interpretation }}
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
    <div data-testid="results-section" v-if="framework.state.value.isComplete && framework.result.value" class="results">
      <SurfaceCard title="Resultat">
        <template #content>
          <br />
          <Message class="flex justify-center p-3" :severity="getSeverityFromRiskLevel(framework.result.value.riskLevel)">
            <h2>Westley Croup Score {{ framework.result.value.score }} : {{ framework.result.value.interpretation }}</h2>
          </Message>
          <br />
          <p class="text-sm text-center ">Score ≤ 2 : Let croup | Score 3-5: Moderat croup | Score ≥ 6: Alvorlig croup</p>
        </template>
      </SurfaceCard>
    </div>
    </div>
    
    <!-- Toast component for notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import Button from '@/volt/Button.vue';
import SecondaryButton from '@/volt/SecondaryButton.vue';
import QuestionSingleComponent from "./QuestionSingleComponent.vue";
import CopyDialog from "./CopyDialog.vue";
import SurfaceCard from "./SurfaceCard.vue";
import PersonInfo from "./PersonInfo.vue";
import Message from '@/volt/Message.vue';
import Toast from 'primevue/toast';
import { useCalculatorFramework, type CalculatorConfig, type CalculatorStep } from '@/composables/useCalculatorFramework';
import { getGenderLabelByAge, type GenderValue } from '@/utils/genderUtils';
import type { RiskLevel } from '@/types/calculatorTypes';

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
};

export interface Question {
  id: string;
  type: string;
  bg?: string;
  text: string;
  description?: string;
  optionsType?: keyof OptionsSets;
  answer: number | null;
}

const config: CalculatorConfig = {
  type: 'westleycroupscore',
  name: 'Westley Croup Score',
  version: '2.0.0',
  category: 'general',
  theme: 'orange',
  estimatedDuration: 2,
};

const framework = useCalculatorFramework(config);

// Form validation state
const formSubmitted = ref(false);
const validationMessage = ref('');

const steps: CalculatorStep[] = [
  { id: 'calculator', title: 'Westley Croup Assessment', order: 1, validation: true },
];
framework.initializeSteps(steps);

// Initialize with default patient data
framework.setFieldValue('patient', 'age', 6);
framework.setFieldValue('patient', 'gender', 'male');

const options1 = ref<Option[]>([
  { text: "Vågen (eller sovende)", value: 0 },
  { text: "Desorienteret/forvirret", value: 5 }
]);

// Cyanosis options (0, 4, 5)
const options2 = ref<Option[]>([
  { text: "Ingen", value: 0 },
  { text: "Ved ophidselse", value: 4 },
  { text: "I hvile", value: 5 }
]);

// Stridor options (0, 1, 2)
const options3 = ref<Option[]>([
  { text: "Ingen", value: 0 },
  { text: "Ved ophidselse", value: 1 },
  { text: "I hvile", value: 2 }
]);

// Air entry options (0, 1, 2)
const options4 = ref<Option[]>([
  { text: "Normal", value: 0 },
  { text: "Nedsat", value: 1 },
  { text: "Udtalt nedsat", value: 2 }
]);

// Retractions options (0, 1, 2, 3)
const options5 = ref<Option[]>([
  { text: "Ingen", value: 0 },
  { text: "Milde", value: 1 },
  { text: "Moderate", value: 2 },
  { text: "Svære", value: 3 }
]);


const questionsSection1 = [
  {
    id: 'levelOfConsciousness',
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "Bevidsthedsniveau",
    description: "",  
    optionsType: 'options1',
    answer: options1.value[0].value
  },
  {
    id: 'cyanosis',
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "Cyanose",
    description: "",
    optionsType: 'options2',
    answer: options2.value[0].value
  },
  {
    id: 'stridor',
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "Stridor",
    description: "",
    optionsType: 'options3',
    answer: options3.value[0].value
  },
  {
    id: 'airEntry',
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "Luftskifte (st.p.)",
    description: "",
    optionsType: 'options4',
    answer: options4.value[0].value
  },
  {
    id: 'retractions',
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "Indtrækninger",
    description: "",
    optionsType: 'options5',
    answer: options5.value[0].value
  }
];

const optionsSets = {
  options1,
  options2,
  options3,
  options4,
  options5
};

const getOptions = (type: keyof OptionsSets): Option[] => {
  return optionsSets[type].value;
}

// Initialize with default answers from question configurations
questionsSection1.forEach(question => {
  framework.setFieldValue('calculator', question.id, question.answer);
});

const handleSubmit = async () => {
  formSubmitted.value = true;
  validationMessage.value = '';
  
  try {
    await framework.submitCalculation();
  } catch (error) {
    console.error('Submit error:', error);
    
    // Check if calculation succeeded despite submission error
    if (framework.state.value.isComplete && framework.result.value) {
      // Calculation succeeded, just submission failed
      console.warn('Calculation succeeded but submission failed:', error);
      validationMessage.value = 'Beregning gennemført. Indsendelse til server fejlede.';
    } else {
      // Actual calculation error
      validationMessage.value = 'Der opstod en fejl ved beregning. Prøv igen.';
    }
  }
};

const handleReset = () => {
  formSubmitted.value = false;
  validationMessage.value = '';
  
  framework.resetCalculator();
};

const getSeverityFromRiskLevel = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'mild':
      return 'success';
    case 'moderate':
      return 'warn';
    case 'severe':
      return 'error';
    default:
      return 'info';
  }
};
</script>

