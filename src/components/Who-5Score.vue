<template>
  <div class="medical-calculator-container">
    <div class="w-full max-w-[800px] mx-auto px-4">

    <SurfaceCard title="Patient">
      <template #content>
        <PersonInfo
          :name="name"
          :age="age"
          :minAge="16"
          :maxAge="110"
          :gender="gender"
          genderdisplay="block"
          @update:name="name = $event"
          @update:age="age = $event"
          @update:gender="gender = $event"
        />
      </template>
    </SurfaceCard>
    
    <SurfaceCard title="WHO-5 Trivselindex">
      <template #content>
        <form @submit.prevent="handleSubmit">
          <QuestionSingleComponent
            name="section1"
            v-for="(question, index) in questionsSection1"
            :key="index"
            :question="question"
            :options="getOptions(question.optionsType as keyof OptionsSets)"
            :index="index"
            :is-unanswered="formSubmitted && isUnanswered(question)"
            scrollHeight="18rem"
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
              :disabled="(resultsSection ? false : true)" 
            >
              <template #container>
                <b>WHO-5 Trivselsindex</b>
                <br /><br />
                Navn: {{ name }} <br />
                Køn: {{ getGenderLabel(gender as GenderValue) }} <br />
                Alder: {{ age }} år<br /><br />
                <div v-for="(question, index) in resultsSection1" >{{ question.text }} {{ question.score }}</div />
                <br /><br />
                WHO-5 Trivselsindex {{ totalScore }} : {{ conclusion }}
              </template>
            </CopyDialog>
            <SecondaryButton label="Reset" icon="pi pi-sync" severity="secondary" @click="resetQuestions"/>
          <!--  <Button label="Random" icon="pi pi-ban" severity="secondary" class="mr-3" @click="randomlyCheckQuestions"/>-->
      
            <Button type="submit" label="Beregn" class="mr-3 pr-6 pl-6" icon="pi pi-calculator"/>
          </div>
        </form>
      </template>
    </SurfaceCard>
    <div v-if="resultsSection1.length > 0" class="results" ref="resultsSection">
      <SurfaceCard title="Resultat">
        <template #content>          
          <br />
          <Message class="flex justify-center p-3 text-center" :severity="conclusionSeverity"><h2>WHO-5 Trivselsindex {{ totalScore }} <br /> {{ conclusion }}</h2></Message><br />
          <p class="text-sm text-center ">Score ≤ 35: Der kan være stor risiko for depression eller stressbelastning Score 36-50: Der kan være risiko for depression eller stressbelastning Score > 50: Der er ingen risiko for depression eller stressbelastning</p>
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
import sendDataToServer from '../assets/sendDataToServer.ts';
import { getGenderLabel, type GenderValue } from '@/utils/genderUtils';

export interface Option {
  text: string;
  value: number;
}

export type OptionsSets = {
  options1: Option[];
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
const apiUrlServer = import.meta.env.VITE_API_URL;
const apiUrl = apiUrlServer+'/index.php/callback/LogCB/log';
const keyUrl = apiUrlServer+'/index.php/KeyServer/getPublicKey';

const resultsSection = ref<HTMLDivElement | null>(null);
const name = ref<string>("");
const gender = ref<string>("male");
const age = ref<number>(50);

const formSubmitted = ref<boolean>(false);

const resultsSection1 = ref<Result[]>([]);

const totalScore = ref<number>(0);

const conclusion = ref<string>('');
const conclusionSeverity = ref<string>('');
const validationMessage = ref<string>('');

const options1 = ref<Option[]>([
  { text: "Hele tiden", value: 5 },
  { text: "Det mest af tiden", value: 4 },
  { text: "Lidt mere end halvdelen af tiden", value: 3 },
  { text: "Lidt mindre end halvdelen af tiden", value: 2 },
  { text: "Lidt af tiden", value: 1 },
  { text: "På intet tidspunkt", value: 0 },
]);

const questionsSection1 = ref<Question[]>([
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "1. I de sidste 2 uger har jeg været glad og i godt humør",
    description: "", 
    optionsType: 'options1',
    answer: options1.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "2. I de sidste 2 uger har jeg følt mig rolig of afslappet",
    description: "", 
    optionsType: 'options1',
    answer: options1.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "3. I de sidste 2 uger har jeg følt mig aktiv og energisk",
    description: "", 
    optionsType: 'options1',
    answer: options1.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "4. I de sidste 2 uger har jeg er vågnet frisk og udhvilet",
    description: "", 
    optionsType: 'options1',
    answer: options1.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "5. I de sidste 2 uger har min daglig været fyldt med ting der interesserer mig",
    description: "", 
    optionsType: 'options1',
    answer: options1.value[0].value
  }
]);
const optionsSets = {
  options1
};

const getOptions = (type: keyof OptionsSets): Option[] => {
  return optionsSets[type].value;
}

const handleSubmit = () => {
  formSubmitted.value = true;

  if (validateQuestions()) {
    calculateResults();
    scrollToResults();
    sendDataToServer(apiUrl, keyUrl, generatePayload())
    .then(() => {
      //console.log('Data successfully sent');
    })
    .catch(() => {
      //console.error('Failed to send data');
    });
  }
};

const validateQuestions = (): boolean => {
  const allQuestions = [
    ...questionsSection1.value,
  ];
  const unansweredQuestions = allQuestions.filter(
    (question) => question.answer === null
  );
  if (unansweredQuestions.length > 0) {
    validationMessage.value = 'Alle spørgsmål skal udfyldes. ';
    return false;
  } else {
    validationMessage.value = '';
    return true;
  }
};

const isUnanswered = (question: Question): boolean => {
  return question.answer === null
};

const calculateResults = () => {
  const section1Results = questionsSection1.value.map((question, index) => {
    const score = question.answer ?? 0;
    return {
      question: `${index + 1}`,
      text: question.text,
      score
    };
  });

  resultsSection1.value = section1Results;
  totalScore.value = (resultsSection1.value.reduce((sum, result) => sum + result.score, 0))*4;

 if (totalScore.value > 50) {
    conclusion.value = "Der er ikke umiddelbart risiko for depression eller stressbelastning.";
    conclusionSeverity.value = "success";
  } else if (totalScore.value > 35) {
    conclusion.value = "Der kan være risiko for depression eller stressbelastning.";
    conclusionSeverity.value = "warn";
  } else {
    conclusion.value = "Der kan være stor risiko for depression eller stressbelastning.";
    conclusionSeverity.value = "error";
  }
};

const scrollToResults = () => {
  const resultsSectionEl = resultsSection.value as HTMLElement;
  if (resultsSectionEl) {
    resultsSectionEl.scrollIntoView({ behavior: 'smooth' });
  }
};


const resetQuestions = () => {
  questionsSection1.value.forEach(question => {
    if (question.optionsType) {
      question.answer = optionsSets[question.optionsType]?.value[0]?.value;
    }
  });

  resultsSection1.value = [];
  totalScore.value = 0;
  validationMessage.value = '';
  formSubmitted.value = false;
};

const generatePayload = () => {
  return {
      name: name.value,
      age: age.value,
      gender: gender.value,
      answers: [
        ...questionsSection1.value,
      ],
      scores: {
        totalScore: totalScore.value
      },
    };
}
</script>

