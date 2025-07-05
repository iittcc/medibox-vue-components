<template>
  <div class="medical-calculator-container">
    <div class="w-full max-w-[800px] mx-auto px-4">

    <SurfaceCard title="Patient">
      <template #content>
        <PersonInfo
          :name="name"
          :age="age"
          :minAge="0"
          :maxAge="12"
          :gender="gender as GenderValue"
          genderdisplay="block"
          child="true"
          @update:name="name = $event"
          @update:age="age = $event"
          @update:gender="gender = $event"
        />
      </template>
    </SurfaceCard>
    
    <SurfaceCard title="Westley Croup Score">
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
              <b>WESTLEY CROUP SCORE</b>
              <br /><br />
              Navn: {{ name }} <br />
              Køn: {{ getGenderLabelByAge(gender as GenderValue, age) }} <br />
              Alder: {{ age }} år<br /><br />
              <div v-for="(question, index) in resultsSection1" :key="index">{{ question.text }} {{ question.score }}</div>
              <br /><br />
              Westley Croup Score {{ totalScore }} : {{ conclusion }}
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
          <Message class="flex justify-center p-3" :severity="conclusionSeverity"><h2>Westley Croup Score {{ totalScore }} : {{ conclusion }}</h2></Message><br />
          <p class="text-sm text-center ">Score ≤ 2 : Mild pseudocroup | Score 3-7: Moderat pseudocroup | Score ≥ 8: Svær pseudocroup</p>
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
import { getGenderLabelByAge, type GenderValue } from '@/utils/genderUtils';

export interface Option {
  text: string;
  value: number;
}

export type OptionsSets = {
  options1: Option[];
  options2: Option[];
  options3: Option[];
  options4: Option[];
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
const age = ref<number>(6);

const formSubmitted = ref<boolean>(false);

const resultsSection1 = ref<Result[]>([]);

const totalScore = ref<number>(0);

const conclusion = ref<string>('');
const conclusionSeverity = ref<string>('');
const validationMessage = ref<string>('');

const options1 = ref<Option[]>([
  { text: "Vågen (eller sovende)", value: 0 },
  { text: "Desorienteret/forvirret", value: 5 }
]);

const options2 = ref<Option[]>([
  { text: "Ingen", value: 0 },
  { text: "Ved ophidselse", value: 4 },
  { text: "I hvile", value: 5 }
]);

const options3 = ref<Option[]>([
  { text: "Normal", value: 0 },
  { text: "Nedsat", value: 1 },
  { text: "Udtalt nedsat", value: 2 }
]);

const options4 = ref<Option[]>([
  { text: "Ingen", value: 0 },
  { text: "Milde", value: 1 },
  { text: "Moderate", value: 2 },
  { text: "Svære", value: 3 }
]);


const questionsSection1 = ref<Question[]>([
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "Bevidsthedsniveau",
    description: "",  
    optionsType: 'options1',
    answer: options1.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "Cyanose",
    description: "",
    optionsType: 'options2',
    answer: options2.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "Stridor",
    description: "",
    optionsType: 'options2',
    answer: options2.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "Luftskifte (st.p.)",
    description: "",
    optionsType: 'options3',
    answer: options3.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "Indtrækninger",
    description: "",
    optionsType: 'options4',
    answer: options4.value[0].value
  }
]);

// Default answers are already set in question configurations above

const optionsSets = {
  options1,
  options2,
  options3,
  options4
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
    .then((_data) => {
      //console.log('Data successfully sent:', data);
    })
    .catch((_error) => {
      //console.error('Failed to send data:', error.message);
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

  if (totalScore.value > 7) {
    conclusion.value = "Svær  pseudocroup ≥ 8";
    conclusionSeverity.value = "error";
  } else if (totalScore.value >= 3) {
    conclusion.value = "Moderat pseudocroup 3-7";
    conclusionSeverity.value = "warn";
  } else {
    conclusion.value = "Mild pseudocroup ≤ 2";
    conclusionSeverity.value = "success";
  }
};

const scrollToResults = () => {
  const resultsSectionEl = resultsSection.value as HTMLElement;
  if (resultsSectionEl) {
    resultsSectionEl.scrollIntoView({ behavior: 'smooth' });
  }
};

const _randomlyCheckQuestions = () => {
  const randomValue = (options: Option[]) => options[Math.floor(Math.random() * options.length)].value;

  questionsSection1.value.forEach(question => {
    if (question.optionsType) {
      question.answer = randomValue(optionsSets[question.optionsType]?.value);
    }
  });
};

const _clearAllQuestionsAndResults = () => {
  questionsSection1.value.forEach(question => {
    question.answer = null;
  });

  resultsSection1.value = [];
  totalScore.value = 0;
  validationMessage.value = '';
  formSubmitted.value = false;
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

