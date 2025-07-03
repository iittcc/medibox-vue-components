<template>
  <div class="medical-calculator-container">
    <div class="w-full max-w-[800px] mx-auto px-4">

    <SurfaceCard title="Patient">
      <template #content>
        <PersonInfo
          :name="name"
          :age="age"
          :minAge="12"
          :maxAge="70"
          :gender="gender"
          genderdisplay="block"
          @update:name="name = $event"
          @update:age="age = $event"
          @update:gender="gender = $event"
        />
      </template>
    </SurfaceCard>
    
    <SurfaceCard title="Edinburgh postnatale depressionsscore">
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
                <b>Edinburgh postnatale depressionsscore</b>
                <br /><br />
                Navn: {{ name }} <br />
                Køn: {{ getGenderLabel(gender as GenderValue) }} <br />
                Alder: {{ age }} år<br /><br />
                <div v-for="(question, index) in resultsSection1" >{{ question.text }} {{ question.score }}</div />
                <br /><br />
                Edinburgh postnatale depressionsscore {{ totalScore }} : {{ conclusion }}
              </template>
            </CopyDialog>
            <SecondaryButton 
              label="Reset" 
              icon="pi pi-sync" 
              severity="secondary" 
              @click="resetQuestions"
            />
          <!--  <Button label="Random" icon="pi pi-ban" severity="secondary" class="mr-3" @click="randomlyCheckQuestions"/>-->
      
            <Button 
              type="submit" 
              label="Beregn" 
              class="pr-6 pl-6 rounded-lg" 
              icon="pi pi-calculator"
            />
          </div>
        </form>
      </template>
    </SurfaceCard>
    <div v-if="resultsSection1.length > 0" class="results" ref="resultsSection">
      <SurfaceCard title="Resultat">
        <template #content>          
          <br />
          <Message class="flex justify-center p-3 text-center" :severity="conclusionSeverity"><h2>Edinburgh postnatale depressionsscore {{ totalScore }} <br /> {{ conclusion }}</h2></Message><br />
          <p class="text-sm text-center ">Score ≤ 9: Ikke tegn til alvorlig depression Score ≥ 10: Behandlingskrævende depression kan foreligges</p>
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
const apiUrlServer = import.meta.env.VITE_API_URL;
const apiUrl = apiUrlServer+'/index.php/callback/LogCB/log';
const keyUrl = apiUrlServer+'/index.php/KeyServer/getPublicKey';

const resultsSection = ref<HTMLDivElement | null>(null);
const name = ref<string>("");
const gender = ref<string>("female");
const age = ref<number>(35);

const formSubmitted = ref<boolean>(false);

const resultsSection1 = ref<Result[]>([]);

const totalScore = ref<number>(0);

const conclusion = ref<string>('');
const conclusionSeverity = ref<string>('');
const validationMessage = ref<string>('');

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

const questionsSection1 = ref<Question[]>([
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "1. Har du de sidste 7 dage været i stand til at le og se tingene fra den humoristiske side?",
    description: "", 
    optionsType: 'options1',
    answer: options1.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "2. Har du de sidste 7 dage kunnet se frem til ting med glæde?",
    description: "", 
    optionsType: 'options2',
    answer: options2.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "3. Har du de sidste 7 dage unødvendigt bebrejdet dig selv, når ting ikke gik som de skulle?",
    description: "", 
    optionsType: 'options3',
    answer: options3.value[3].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "4. Har du de sidste 7 dage været  anspændt og bekymret uden nogen særlig grund?",
    description: "", 
    optionsType: 'options4',
    answer: options4.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "5. Har du de sidste 7 dage følt dig angst eller panikslagen uden nogen særlig grund?",
    description: "", 
    optionsType: 'options5',
    answer: options5.value[3].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "6. Har du de sidste 7 dage følt, at tingene voksede dig over hovedet?",
    description: "", 
    optionsType: 'options6',
    answer: options6.value[3].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "7. Har du de sidste 7 dage været så ked af det, at du har haft svært ved at sove?",
    description: "", 
    optionsType: 'options7',
    answer: options7.value[3].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "8. Har du de sidste 7 dage følt dig trist eller elendigt til mode?",
    description: "", 
    optionsType: 'options8',
    answer: options8.value[3].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "9. Har du de sidste 7 dage været så ulykkelig, at du har grædt?",
    description: "", 
    optionsType: 'options9',
    answer: options9.value[3].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "10. Har tanken om at gøre skade på dig selv strejfet dig de sidste 7 dage?",
    description: "", 
    optionsType: 'options10',
    answer: options10.value[3].value
  }
]);
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
  totalScore.value = (resultsSection1.value.reduce((sum, result) => sum + result.score, 0));

 if (totalScore.value > 10) {
    conclusion.value = "Behandlingskrævende depression kan foreligge.";
    conclusionSeverity.value = "error";
  } else {
    conclusion.value = "Ikke tegn til alvorlig depression.";
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

