<template>
  <div class="medical-calculator-container">
    <div class="w-full max-w-[800px] mx-auto px-4">

      <SurfaceCard title="Patient">
        <template #content>
          <PersonInfo
            :name="framework.patientData.value.name || ''"
            :age="framework.patientData.value.age || 50"
            :minAge="10"
            :maxAge="110"
            :gender="framework.patientData.value.gender as GenderValue || 'male'"
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
              :is-unanswered="formSubmitted && (question.answer === null || question.answer === undefined)"
              @update:answer="framework.setFieldValue('calculator', question.id, $event)"
            />
            <div v-if="validationMessage" class="text-red-500 mt-5 font-bold">
              {{ validationMessage }}
            </div>

            <div class="flex justify-end mt-5 gap-3">
            <CopyDialog
              title="Kopier til Clipboard"
              icon="pi pi-clipboard"
              severity="secondary"
              class="mr-3"
              :disabled="!framework.state.isComplete"
            >
              <template #container>
                <b>{{ config.name }}</b>
                <br /><br />
                Navn: {{ framework.patientData.value.name }} <br />
                Køn: {{ getGenderLabelByAge(framework.patientData.value.gender as GenderValue, framework.patientData.value.age || 50) }} <br />
                Alder: {{ framework.patientData.value.age }} år<br /><br />
                <div v-for="question in resultsSection1" :key="question.id" >{{ question.text }} {{ (framework.calculatorData.value as any)[question.id] }}</div>
                <br /><br />
                AUDIT Score {{ framework.result.value?.score }} : {{ framework.result.value?.interpretation }}
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
              :label="framework.state.isSubmitting ? '' : 'Beregn'"
              class="pr-6 pl-6"
              :icon="framework.state.isSubmitting ? 'pi pi-spin pi-spinner' : 'pi pi-calculator'"
              :disabled="framework.state.isSubmitting"
            />
            </div>
          </form>
        </template>
      </SurfaceCard>

      <div data-testid="results-section" v-if="framework.state.isComplete && framework.result.value" class="results">
        <SurfaceCard title="Resultat">
          <template #content>
            <br />
            <Message class="flex justify-center p-3" :severity="framework.result.value.riskLevel === 'low' ? 'success' : 'warn'">
              <h2>AUDIT Score {{ framework.result.value.score }} : {{ framework.result.value.interpretation }}</h2>
            </Message>
            <br />
            <p class="text-sm text-center ">Score ≥ 8 er der grund til at vurdere tiltag med henblik på at reducere alkoholforbruget</p>
          </template>
        </SurfaceCard>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from "vue";
import Button from '@/volt/Button.vue';
import SecondaryButton from '@/volt/SecondaryButton.vue';
import QuestionSingleComponent from "./QuestionSingleComponent.vue";
import CopyDialog from "./CopyDialog.vue";
import SurfaceCard from "./SurfaceCard.vue";
import PersonInfo from "./PersonInfo.vue";
import Message from '@/volt/Message.vue';
import { useCalculatorFramework, type CalculatorConfig, type CalculatorStep } from '@/composables/useCalculatorFramework';
import { getGenderLabelByAge, type GenderValue } from '@/utils/genderUtils';

// Removed unused imports

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

const config: CalculatorConfig = {
  type: 'audit',
  name: 'AUDIT Alkoholafhængighedstest',
  version: '2.0.0',
  category: 'psychology',
  theme: 'sky',
  estimatedDuration: 2,
};

const framework = useCalculatorFramework(config);

// Form validation state
const formSubmitted = ref(false);
const validationMessage = ref('');

const steps: CalculatorStep[] = [
  { id: 'calculator', title: 'AUDIT Questionnaire', order: 1, validation: true },
];
framework.initializeSteps(steps);

// Initialize with default patient data
framework.setFieldValue('patient', 'age', 50);
framework.setFieldValue('patient', 'gender', 'male');

const options1 = ref<Option[]>([
  { text: "Aldrig", value: 0 },
  { text: "Månedligt eller sjældnere", value: 1 },
  { text: "To til fire gange om måneden", value: 2 },
  { text: "To til tre gange om ugen", value: 3 },
  { text: "Fire gange om ugen oftere", value: 4 }
]);

const options2 = ref<Option[]>([
  { text: "1-2", value: 0 },
  { text: "3-4", value: 1 },
  { text: "5-6", value: 2 },
  { text: "7-9", value: 3 },
  { text: "10 eller flere", value: 4 }
]);

const options3 = ref<Option[]>([
  { text: "Aldrig", value: 0 },
  { text: "Sjældent", value: 1 },
  { text: "Månedligt", value: 2 },
  { text: "Ugentligt", value: 3 },
  { text: "Dagligt eller næsten dagligt", value: 4 }
]);

const options4 = ref<Option[]>([
  { text: "Aldrig", value: 0 },
  { text: "Sjældent", value: 1 },
  { text: "Nogle gange om måneden", value: 2 },
  { text: "Nogle gange om ugen", value: 3 },
  { text: "Næsten dagligt", value: 4 }
]);

const options5 = ref<Option[]>([
  { text: "Nej", value: 0 },
  { text: "Ja, men ikke inden for det seneste år", value: 2 },
  { text: "Ja, inden for det seneste år", value: 4 }
]);

const questionsSection1 = [
  reactive({
    id: 'question1',
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "1. Hvor tit drikker du alkohol?",
    description: "",
    optionsType: 'options1',
    answer: null,
  }),
  reactive({
    id: 'question2',
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "2. Hvor mange genstande drikker du almindeligvis, når du drikker noget?",
    description: "",
    optionsType: 'options2',
    answer: null,
  }),
  reactive({
    id: 'question3',
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "3. Hvor tit drikker du fem genstande eller flere ved samme lejlighed?",
    description: "",
    optionsType: 'options3',
    answer: null,
  }),
  reactive({
    id: 'question4',
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "4. Har du inden for det seneste år oplevet, at du ikke kunne stoppe, når du først var begyndt at drikke?",
    description: "",
    optionsType: 'options3',
    answer: null,
  }),
  reactive({
    id: 'question5',
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "5. Har du inden for det seneste år oplevet, at du ikke kunne gøre det, du skulle, fordi du havde drukket?",
    description: "",
    optionsType: 'options4',
    answer: null,
  }),
  reactive({
    id: 'question6',
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "6. Har du inden for det seneste år måttet have en lille én om morgenen, efter at du havde drukket meget dagen før?",
    description: "",
    optionsType: 'options4',
    answer: null,
  }),
  reactive({
    id: 'question7',
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "7. Har du inden for det seneste år haft dårlig samvittighed eller fortrudt, efter du har drukket?",
    description: "",
    optionsType: 'options4',
    answer: null,
  }),
  reactive({
    id: 'question8',
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "8. Har du inden for det seneste år oplevet, at du ikke kunne huske, hvad der skete aftenen før, fordi du havde drukket?",
    description: "",
    optionsType: 'options4',
    answer: null,
  }),
  reactive({
    id: 'question9',
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "9. Er du selv eller andre nogensinde kommet til skade ved en ulykke, fordi du havde drukket?",
    description: "",
    optionsType: 'options5',
    answer: null,
  }),
  reactive({
    id: 'question10',
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "10. Har nogen i familien, en ven, en læge eller andre været bekymred over dine alkoholvaner eller foreslået dig at sætte forbruget ned?",
    description: "",
    optionsType: 'options5',
    answer: null,
  })
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

const resultsSection1 = questionsSection1;

// Sync question answers to framework data
questionsSection1.forEach(question => {
  watch(() => question.answer, (newValue) => {
    if (newValue !== null) {
      framework.setFieldValue('calculator', question.id, newValue)
    }
  })
})

const handleSubmit = async () => {
  formSubmitted.value = true;
  validationMessage.value = '';
  
  try {
    await framework.submitCalculation();
  } catch (error) {
    console.error('Submit error:', error);
    validationMessage.value = 'Der opstod en fejl ved beregning. Prøv igen.';
  }
};

const handleReset = () => {
  formSubmitted.value = false;
  validationMessage.value = '';
  
  // Reset local question state
  questionsSection1.forEach(question => {
    question.answer = null;
  });
  
  framework.resetCalculator();
};

</script>
