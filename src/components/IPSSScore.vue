<template>
  <div class="medical-calculator-container">
    <div class="w-full max-w-[800px] mx-auto px-4">

    <SurfaceCard title="Patient">
      <template #content>
        <PersonInfo
          :name="framework.patientData.value.name || ''"
          :age="framework.patientData.value.age || 50"
          :minAge="18"
          :maxAge="110"
          :gender="framework.patientData.value.gender as GenderValue || 'male'"
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
            v-for="(question, index) in questionsSection1"
            :key="index"
            :name="question.id"
            :question="question"
            :options="getOptions(question.optionsType as keyof OptionsSets)"
            :index="index"
            :framework-answer="(framework.calculatorData.value as any)[question.id]"
            :is-unanswered="formSubmitted && ((framework.calculatorData.value as any)[question.id] === null || (framework.calculatorData.value as any)[question.id] === undefined)"
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
              :disabled="!framework.state.value.isComplete" 
            >
              <template #container>
                <b>{{ config.name }}</b>
                <br /><br />
                Navn: {{ framework.patientData.value.name }} <br />
                Køn: {{ getGenderLabel(framework.patientData.value.gender as GenderValue) }} <br />
                Alder: {{ framework.patientData.value.age }} år<br /><br />
                <div v-for="question in questionsSection1" :key="question.id">{{ question.text }} {{ (framework.calculatorData.value as any)[question.id] }}</div>
                <br /><br />
                IPSS Score {{ framework.result.value?.score }} : {{ framework.result.value?.interpretation }}
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
            <h2>IPSS Score {{ framework.result.value.score }} : {{ framework.result.value.interpretation }}</h2>
            <div class="flex justify-center">{{ getDetailedDescription(framework.result.value.details) }}</div>
          </Message><br />
          
        </template>
      </SurfaceCard>
    </div>
    </div>
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
import { useCalculatorFramework, type CalculatorConfig, type CalculatorStep } from '@/composables/useCalculatorFramework';
import { getGenderLabel, type GenderValue } from '@/utils/genderUtils';
import type { RiskLevel } from '@/types/calculatorTypes';
import type { IpssDetails } from '@/calculators/ipss/ipssTypes';

export interface Option {
  text: string;
  value: number;
}

export type OptionsSets = {
  options1: Option[];
  options2: Option[];
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
  type: 'ipss',
  name: 'IPSS, International prostata symptom score',
  version: '2.0.0',
  category: 'general',
  theme: 'teal',
  minAge: 18,
  allowedGenders: ['male'],
  estimatedDuration: 3,
};

const framework = useCalculatorFramework(config);

// Form validation state
const formSubmitted = ref(false);
const validationMessage = ref('');

const steps: CalculatorStep[] = [
  { id: 'calculator', title: 'IPSS Assessment', order: 1, validation: true },
];
framework.initializeSteps(steps);

// Initialize with default patient data
framework.setFieldValue('patient', 'age', 50);
framework.setFieldValue('patient', 'gender', 'male');

const options1 = ref<Option[]>([
  { text: "Aldrig", value: 0 },
  { text: "Mindre end 1 af 5 gange", value: 1 },
  { text: "Mindre end halvdelen af gangene", value: 2 },
  { text: "Omtrent halvdelen af gangene", value: 3 },
  { text: "Mere end halvdelen af gangene", value: 4 },
  { text: "Næsten altid", value: 5 }
]);

const options2 = ref<Option[]>([
  { text: "Ingen", value: 0 },
  { text: "1 gang", value: 1 },
  { text: "2 gange", value: 2 },
  { text: "3 gange", value: 3 },
  { text: "4 gange", value: 4 },
  { text: "5 gange", value: 5 }
]);

    const questionsSection1 = ref<Question[]>([
      {
        id: 'incompleteEmptying',
        type: 'Listbox',
        bg: '--p-primary-100',
        text: "1. Ufuldstændig tømning",
        description: "I løbet af den sidste måned, hvor ofte har du haft følelsen af, at blæren ikke er blevet fuldstændig tømt efter afsluttet vandladning?",
        optionsType: 'options1',
        answer: null
      },
      {
        id: 'frequency',
        type: 'Listbox',
        bg: '--p-primary-50',
        text: "2. Vandladningsfrekvens",
        description: "I løbet af den sidste måned, hvor ofte har du måttet lade vandet på ny mindre end 2 timer efter forrige vandladning?",
        optionsType: 'options1',
        answer: null
      },
      {
        id: 'intermittency',
        type: 'Listbox',
        bg: '--p-primary-100',
        text: "3. Afbrudt vandladning",
        description: "I løbet af den sidste måned, hvor ofte har du måttet stoppe og starte igen, mens du lod vandet?",
        optionsType: 'options1',
        answer: null
      },
      {
        id: 'urgency',
        type: 'Listbox',
        bg: '--p-primary-50',
        text: "4. Vandladningstrang",
        description: "I løbet af den sidste måned, hvor ofte synes du, det har været vanskeligt at udsætte vandladningen?",
        optionsType: 'options1',
        answer: null
      },
      {
        id: 'weakStream',
        type: 'Listbox',
        bg: '--p-primary-100',
        text: "5. Svag strålekraft",
        description: "I løbet af den sidste måned, hvor ofte har du haft svag urinstråle?",
        optionsType: 'options1',
        answer: null
      },
      {
        id: 'straining',
        type: 'Listbox',
        bg: '--p-primary-50',
        text: "6. Stranguri",
        description: "I løbet af den sidste måned, hvor ofte har du måttet trykke eller presse for at lade vandet?",
        optionsType: 'options1',
        answer: null
      },
      {
        id: 'nocturia',
        type: 'Listbox',
        bg: '--p-primary-100',
        text: "7. Nykturi",
        description: "I løbet af den sidste måned, hvor mange gange har du typisk måtte stå op i løbet af natten for at lade vandet?",
        optionsType: 'options2',
        answer: null
      }
    ]);

// Initialize default answers
questionsSection1.value.forEach(question => {
  const defaultValue = question.optionsType === 'options1' ? 0 : 0;
  framework.setFieldValue('calculator', question.id, defaultValue);
});

// Add quality of life question
framework.setFieldValue('calculator', 'qualityOfLife', 0);

const optionsSets = {
  options1,
  options2
};

const getOptions = (type: keyof OptionsSets): Option[] => {
  return optionsSets[type].value;
}

const handleSubmit = async () => {
  formSubmitted.value = true;

  if (validateQuestions()) {
    try {
      const success = await framework.submitCalculation();
      if (success) {
        validationMessage.value = '';
      }
    } catch (error) {
      console.error('Calculation failed:', error);
      validationMessage.value = 'Der opstod en fejl under beregningen.';
    }
  }
};

const validateQuestions = (): boolean => {
  const calculatorData = framework.calculatorData.value as any;
  const requiredFields = ['incompleteEmptying', 'frequency', 'intermittency', 'urgency', 'weakStream', 'straining', 'nocturia'];
  
  const unansweredFields = requiredFields.filter(
    field => calculatorData[field] === null || calculatorData[field] === undefined
  );
  
  if (unansweredFields.length > 0) {
    validationMessage.value = 'Alle spørgsmål skal udfyldes.';
    return false;
  } else {
    validationMessage.value = '';
    return true;
  }
};

const handleReset = () => {
  framework.resetCalculator();
  questionsSection1.value.forEach(question => {
    const defaultValue = question.optionsType === 'options1' ? 0 : 0;
    framework.setFieldValue('calculator', question.id, defaultValue);
  });
  framework.setFieldValue('calculator', 'qualityOfLife', 0);
  formSubmitted.value = false;
  validationMessage.value = '';
};

const getSeverityFromRiskLevel = (riskLevel: RiskLevel): string => {
  switch (riskLevel) {
    case 'mild':
    case 'low':
      return 'success';
    case 'moderate':
    case 'medium':
      return 'warn';
    case 'severe':
    case 'high':
      return 'error';
    default:
      return 'info';
  }
};

const getDetailedDescription = (details: any): string => {
  if (!details) return '';
  
  const ipssDetails = details as IpssDetails;
  if (ipssDetails.symptomSeverity === 'severe') {
    return 'Patienten bør eventuelt henvises til urinvejskirurg for udredning og evt. invasiv behandling';
  } else if (ipssDetails.symptomSeverity === 'moderate') {
    return 'Anses velegnet for medikamentel behandling.';
  } else if (ipssDetails.symptomSeverity === 'mild') {
    return 'Tilstanden kan observeres (Nykturi kan behandles ved at reducere væskeindtaget om aftenen og med diuretika ved deklive ødemer, som mobiliseres og kvitteres om natten)';
  }
  return '';
}
</script>

