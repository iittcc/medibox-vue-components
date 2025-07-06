<template>
  <div class="medical-calculator-container">
    <div class="w-full max-w-[800px] mx-auto px-4">

    <SurfaceCard title="Patient">
      <template #content>
        <PersonInfo
          :name="framework.patientData.value.name || ''"
          :age="framework.patientData.value.age || 35"
          :minAge="12"
          :maxAge="70"
          :gender="framework.patientData.value.gender as GenderValue || 'female'"
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
                <div v-for="question in resultsSection1" :key="question.id" >{{ question.text }} {{ (framework.calculatorData.value as any)[question.id] }}</div>
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
    <div data-testid="results-section" v-if="framework.state.value.isComplete && framework.result.value" class="results">
      <SurfaceCard title="Resultat">
        <template #content>
          <br />
          <Message class="flex justify-center p-3" :severity="framework.result.value.riskLevel === 'minimal' ? 'success' : 'warn'">
            <h2>Edinburgh postnatale depressionsscore {{ framework.result.value.score }} <br /> {{ framework.result.value.interpretation }}</h2>
          </Message>
          <br />
          <p class="text-sm text-center ">Score ≤ 9: Ikke tegn til alvorlig depression Score ≥ 10: Behandlingskrævende depression kan foreligges</p>
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
import Toast from '@/volt/Toast.vue';
import { useCalculatorFramework, type CalculatorConfig, type CalculatorStep } from '@/composables/useCalculatorFramework';
import { getGenderLabel, type GenderValue } from '@/utils/genderUtils';

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

const config: CalculatorConfig = {
  type: 'epds',
  name: 'Edinburgh postnatale depressionsscore',
  version: '2.0.0',
  category: 'pregnancy',
  theme: 'teal',
  estimatedDuration: 3,
};

const framework = useCalculatorFramework(config);

// Form validation state
const formSubmitted = ref(false);
const validationMessage = ref('');

const steps: CalculatorStep[] = [
  { id: 'calculator', title: 'EPDS Questionnaire', order: 1, validation: true },
];
framework.initializeSteps(steps);

// Initialize with default patient data
framework.setFieldValue('patient', 'age', 35);
framework.setFieldValue('patient', 'gender', 'female');

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
</script>

