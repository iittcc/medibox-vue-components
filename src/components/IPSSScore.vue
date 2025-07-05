<template>
  <div class="medical-calculator-container">
    <div class="w-full max-w-[800px] mx-auto px-4">

    <SurfaceCard title="Patient">
      <template #content>
        <PersonInfo
          :name="name"
          :age="age"
          :minAge="10"
          :maxAge="110"
          :gender="gender as GenderValue"
          genderdisplay="none"
          @update:name="name = $event"
          @update:age="age = $event"
          @update:gender="gender = $event"
        />
      </template>
    </SurfaceCard>
    
    <SurfaceCard title="IPSS, International prostata symptom score">
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
            scrollHeight="18rem"
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
                <b>IPSS, International prostata symptom score</b>
                <br /><br />
                Navn: {{ name }} <br />
                Køn: {{ getGenderLabel(gender as GenderValue) }} <br />
                Alder: {{ age }} år<br /><br />
                <div v-for="(question, index) in resultsSection1" :key="index">{{ question.text }} {{ question.score }}</div>
                <br /><br />
                IPSS Score {{ totalScore }} : {{ conclusion }}
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
          <Message class="flex justify-center p-3" :severity="conclusionSeverity"><h2>IPSS Score {{ totalScore }} : {{ conclusion }}</h2><div class="flex justify-center">{{ conclusionDescription }}</div></Message><br />
          
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
  options2: Option[];
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
const gender = ref<GenderValue>("male");
const age = ref<number>(50);

const formSubmitted = ref<boolean>(false);

const resultsSection1 = ref<Result[]>([]);

const totalScore = ref<number>(0);

const conclusion = ref<string>('');
const conclusionDescription = ref<string>('');
const conclusionSeverity = ref<string>('');
const validationMessage = ref<string>('');

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
        type: 'Listbox',
        bg: '--p-primary-100',
        text: "1. Ufuldstændig tømning",
        description: "I løbet af den sidste måned, hvor ofte har du haft følelsen af, at blæren ikke er blevet fuldstændig tømt efter afsluttet vandladning?",
        optionsType: 'options1',
        answer: options1.value[0].value
      },
      {
        type: 'Listbox',
        bg: '--p-primary-50',
        text: "2. Vandladningsfrekvens",
        description: "I løbet af den sidste måned, hvor ofte har du måttet lade vandet på ny mindre end 2 timer efter forrige vandladning?",
        optionsType: 'options1',
        answer: options1.value[0].value
      },
      {
        type: 'Listbox',
        bg: '--p-primary-100',
        text: "3. Afbrudt vandladning",
        description: "I løbet af den sidste måned, hvor ofte har du måttet stoppe og starte igen, mens du lod vandet?",
        optionsType: 'options1',
        answer: options1.value[0].value
      },
      {
        type: 'Listbox',
        bg: '--p-primary-50',
        text: "4. Vandladningstrang",
        description: "I løbet af den sidste måned, hvor ofte synes du, det har været vanskeligt at udsætte vandladningen?",
        optionsType: 'options1',
        answer: options1.value[0].value
      },
      {
        type: 'Listbox',
        bg: '--p-primary-100',
        text: "5. Svag strålekraft",
        description: "I løbet af den sidste måned, hvor ofte har du haft svag urinstråle?",
        optionsType: 'options1',
        answer: options1.value[0].value
      },
      {
        type: 'Listbox',
        bg: '--p-primary-50',
        text: "6. Stranguri",
        description: "I løbet af den sidste måned, hvor ofte har du måttet trykke eller presse for at lade vandet?",
        optionsType: 'options1',
        answer: options1.value[0].value
      },
      {
        type: 'Listbox',
        bg: '--p-primary-100',
        text: "7. Nykturi",
        description: "I løbet af den sidste måned, hvor mange gange har du typisk måtte stå op i løbet af natten for at lade vandet?",
        optionsType: 'options2',
        answer: options2.value[0].value
      }
    ]);

// Default answers are already set in question configurations above

const optionsSets = {
  options1,
  options2
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
    validationMessage.value = 'Alle spørgsmål skal udfyldes.';
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

  if (totalScore.value > 19) {
    conclusion.value = "Symptomatisk, alvorlig";
    conclusionDescription.value = "Patienten bør eventuelt henvises til urinvejskirurg for udredning og evt. invasiv behandling";
    conclusionSeverity.value = "error";
  } else if (totalScore.value >= 8) {
    conclusion.value = "Symptomatisk, moderat";
    conclusionDescription.value = "Anses velegnet for medikamentel behandling.";
    conclusionSeverity.value = "warn";
  } else if (totalScore.value >= 1) {
    conclusion.value = "Symptomatisk, mild";
    conclusionDescription.value = "Tilstanden kan observeres (Nykturi kan behandles ved at reducere væskeindtaget om aftenen og med diuretika ved deklive ødemer, som mobiliseres og kvitteres om natten)";
    conclusionSeverity.value = "success";
  } else {
    conclusion.value = "Asymptomatisk";
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

