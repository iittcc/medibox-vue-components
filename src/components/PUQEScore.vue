<template>
  <div class="medical-calculator-container">
    <div class="w-full max-w-[800px] mx-auto px-4">

    <SurfaceCard title="Patient">
      <template #content>
        <PersonInfo
          :name="name"
          :age="age"
          :minAge="12"
          :maxAge="60"
          :gender="gender as GenderValue"
          genderdisplay="none"
          @update:name="name = $event"
          @update:age="age = $event"
          @update:gender="gender = $event"
        />
      </template>
    </SurfaceCard>
    
    <SurfaceCard title="PUQE Scoringsskema">
      <template #content>
        <form @submit.prevent="handleSubmit">
          <QuestionSingleComponent
            name="section1"
            v-for="(question, index) in questionsSection1"
            :key="index"
            :question="question"
            :options="getOptions(question.optionsType as keyof OptionsSets)"
            :index="index"
            :framework-answer="question.answer ?? undefined"
            :is-unanswered="formSubmitted && isUnanswered(question)"
            @update:answer="question.answer = $event"
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
                <b>PUQE SCORE</b>
                <br /><br />
                Navn: {{ name }} <br />
                Alder: {{ age }} år<br /><br />
                <div v-for="(question, index) in resultsSection1" :key="index">{{ question.text }} {{ question.score }}</div>
                <br /><br />
                PUQE Score {{ totalScore }} : {{ conclusion }}
              </template>
            </CopyDialog>
            <SecondaryButton label="Reset" icon="pi pi-sync" severity="secondary"  @click="resetQuestions"/>
          <!--  <Button label="Random" icon="pi pi-ban" severity="secondary" class="mr-3" @click="randomlyCheckQuestions"/>-->
      
            <Button type="submit" label="Beregn" class="mr-3 pr-6 pl-6" icon="pi pi-calculator"/>
          </div>
        </form>
      </template>
    </SurfaceCard>
    <div v-if="resultsSection1.length > 0" class="results" ref="resultsSection">
      <SurfaceCard title="Resultat">
        <template #content>          
       
          <Message class="flex justify-center p-3" :severity="conclusionSeverity"><h2>PUQE Score {{ totalScore }} : {{ conclusion }}</h2></Message><br />
          <p class="text-sm text-center ">Score ≤ 6 : Mild graviditetskvalme | Score 7-12: Moderat graviditetskvalme | Score ≥ 13: Svær graviditetskvalme (Hyperemesis Gravidarum)</p>
        </template>
      </SurfaceCard>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import QuestionSingleComponent from "./QuestionSingleComponent.vue";
import CopyDialog from "./CopyDialog.vue";
import SurfaceCard from "./SurfaceCard.vue";
import PersonInfo from "./PersonInfo.vue";
import Message from '@/volt/Message.vue';
import Button from '@/volt/Button.vue';
import SecondaryButton from '@/volt/SecondaryButton.vue';
import sendDataToServer from '../assets/sendDataToServer.ts';
import { type GenderValue } from '@/utils/genderUtils';

export interface Option {
  text: string;
  value: number;
}

export type OptionsSets = {
  options1: Option[];
  options2: Option[];
  options3: Option[];
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
const gender = ref<GenderValue>("female");
const age = ref<number>(28);

const formSubmitted = ref<boolean>(false);

const resultsSection1 = ref<Result[]>([]);

const totalScore = ref<number>(0);

const conclusion = ref<string>('');
const conclusionSeverity = ref<string>('');
const validationMessage = ref<string>('');

const options1 = ref<Option[]>([
  { text: "Slet ikke", value: 1 },
  { text: "≤ 1 time", value: 2 },
  { text: "2-3 timer", value: 3 },
  { text: "4-6 timer", value: 4 },
  { text: "> 6 timer", value: 5 }
]);

const options2 = ref<Option[]>([
  { text: "Ingen opkastninger", value: 1 },
  { text: "1-2 gange", value: 2 },
  { text: "3-4 gange", value: 3 },
  { text: "5-6 gange", value: 4 },
  { text: "≥ 7 gange", value: 5 }
]);

const options3 = ref<Option[]>([
  { text: "Nej", value: 1 },
  { text: "1-2 gange", value: 2 },
  { text: "3-4 gange", value: 3 },
  { text: "5-6 gange", value: 4 },
  { text: "≥ 7 gange", value: 5 }
]);

const questionsSection1 = ref<Question[]>([
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "1. Hvor lang tid har du følt dig forkvalmet, i løbet af de sidste 24 timer?",
    description: "",
    optionsType: 'options1',
    answer: options1.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "2. Hvor mange gange har du kastet op, i løbet af de sidste 24 timer?",
    description: "",
    optionsType: 'options2',
    answer: options2.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "3. Har du haft opkastningsbevægelser (uden der kommer noget med op), i løbet af de sidste 24 timer?",
    description: "",
    optionsType: 'options3',
    answer: options3.value[0].value
  }
]);

// Default answers are already set in question configurations above
  
const optionsSets = {
  options1,
  options2,
  options3
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
    validationMessage.value = 'Alle spørgsmål om vandladningsproblemer skal udfyldes. ';
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
  totalScore.value = resultsSection1.value.reduce((sum, result) => sum + result.score, 0);

  if (totalScore.value > 12) {
    conclusion.value = "Svær graviditetskvalme (Hyperemesis Gravidarum) (PUQE ≥ 13)";
    conclusionSeverity.value = "error";
  } else if (totalScore.value >= 7) {
    conclusion.value = "Moderat graviditetskvalme (PUQE 7-12)";
    conclusionSeverity.value = "warn";
  } else {
    conclusion.value = "Mild graviditetskvalme (PUQE ≤ 6)";
    conclusionSeverity.value = "success";
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

