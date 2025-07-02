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
          :gender="gender"
          genderdisplay="block"
          @update:name="name = $event"
          @update:age="age = $event"
          @update:gender="gender = $event"
        />
      </template>
    </SurfaceCard>
    
    <SurfaceCard title="AUDIT Alkoholafhængighedstest">
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
          />
          <div v-if="validationMessage" class="validation-message">
            {{ validationMessage }}
          </div>

          <div class="flex justify-end mt-5 gap-3">
            <CopyDialog 
              title="Kopier til Clipboard" 
              icon="pi pi-clipboard" 
              severity="secondary" 
              class="mr-3 rounded-lg" 
              :disabled="(resultsSection ? false : true)" 
            >
              <template #container>
                <b>AUDIT Alkoholafhængighedstest</b>
                <br /><br />
                Navn: {{ name }} <br />
                Køn: {{ gender }} <br />
                Alder: {{ age }} år<br /><br />
                <div v-for="(question, index) in resultsSection1" >{{ question.text }} {{ question.score }}</div />
                <br /><br />
                AUDIT Score {{ totalScore }} : {{ conclusion }}
              </template>
            </CopyDialog>
            <SecondaryButton 
              label="Reset" 
              icon="pi pi-sync" 
              severity="secondary" 
              class="rounded-lg" 
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
          <Message class="flex justify-center p-3" :severity="conclusionSeverity"><h2>AUDIT Score {{ totalScore }} : {{ conclusion }}</h2></Message><br />
          <p class="text-sm text-center ">Score ≥ 8 er der grund til at vurdere tiltag med henblik på at reducere alkoholforbruget</p>
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
const gender = ref<string>("Mand");
const age = ref<number>(50);

const formSubmitted = ref<boolean>(false);

const resultsSection1 = ref<Result[]>([]);

const totalScore = ref<number>(0);

const conclusion = ref<string>('');
const conclusionSeverity = ref<string>('');
const validationMessage = ref<string>('');

const options1 = ref<Option[]>([
  { text: "Aldrig", value: 0 },
  { text: "Månedligt eller sjældnere", value: 1 },
  { text: "To til fire gange om måneden", value: 2 },
  { text: "To til tre gange om ugen", value: 3 },
  { text: "Fire gange om ugen eller oftere", value: 4 }
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

const questionsSection1 = ref<Question[]>([
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "1. Hvor tit drikker du alkohol?",
    description: "", 
    optionsType: 'options1',
    answer: options1.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "2. Hvor mange genstande drikker du almindeligvis, når du drikker noget?",
    description: "", 
    optionsType: 'options2',
    answer: options2.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "3. Hvor tit drikker du fem genstande eller flere ved samme lejlighed?",
    description: "", 
    optionsType: 'options3',
    answer: options3.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "4. Har du inden for det seneste år oplevet, at du ikke kunne stoppe, når du først var begyndt at drikke?",
    description: "", 
    optionsType: 'options3',
    answer: options3.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "5. Har du inden for det seneste år oplevet, at du ikke kunne gøre det, du skulle, fordi du havde drukket?",
    description: "", 
    optionsType: 'options4',
    answer: options4.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "6. Har du inden for det seneste år måttet have en lille én om morgenen, efter at du havde drukket meget dagen før?",
    description: "", 
    optionsType: 'options4',
    answer: options4.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "7. Har du inden for det seneste år haft dårlig samvittighed eller fortrudt, efter du har drukket?",
    description: "", 
    optionsType: 'options4',
    answer: options4.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "8. Har du inden for det seneste år oplevet, at du ikke kunne huske, hvad der skete aftenen før, fordi du havde drukket?",
    description: "",
    optionsType: 'options4',
    answer: options4.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-100',
    text: "9. Er du selv eller andre nogensinde kommet til skade ved en ulykke, fordi du havde drukket?",
    description: "", 
    optionsType: 'options5',
    answer: options5.value[0].value
  },
  {
    type: 'Listbox',
    bg: '--p-primary-50',
    text: "10. Har nogen i familien, en ven, en læge eller andre været bekymret over dine alkoholvaner eller foreslået dig at sætte forbruget ned?",
    description: "", 
    optionsType: 'options5',
    answer: options5.value[0].value
  }
]);
  
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

const handleSubmit = () => {

  formSubmitted.value = true;

  if (validateQuestions()) {
    calculateResults();
    scrollToResults();
    sendDataToServer(apiUrl, keyUrl, generatePayload())
    .then((data) => {
      //console.log('Data successfully sent:', data);
    })
    .catch((error) => {
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

 if (totalScore.value >= 8) {
    conclusion.value = "Tegn på alkoholafhængighed (AUDIT Score ≥ 8)";
    conclusionSeverity.value = "warn";
  } else {
    conclusion.value = "Ikke tegn på alkoholafhængighed (AUDIT Score < 8)";
    conclusionSeverity.value = "success";
  }


};

const scrollToResults = () => {
  const resultsSectionEl = resultsSection.value as HTMLElement;
  if (resultsSectionEl) {
    resultsSectionEl.scrollIntoView({ behavior: 'smooth' });
  }
};

const randomlyCheckQuestions = () => {
  const randomValue = (options: Option[]) => options[Math.floor(Math.random() * options.length)].value;

  questionsSection1.value.forEach(question => {
    if (question.optionsType) {
      question.answer = randomValue(optionsSets[question.optionsType]?.value);
    }
  });
};

const clearAllQuestionsAndResults = () => {
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