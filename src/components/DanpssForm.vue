<template>
  <div class="medical-calculator-container">
    <div class="w-full max-w-[800px] mx-auto px-4">

    <SurfaceCard title="Patient">
      <template #content>
        <PersonInfo
          :name="name"
          :age="age"
          :minAge="0"
          :maxAge="120"
          :gender="gender"
          genderdisplay="none"
          @update:name="name = $event"
          @update:age="age = $event"
          @update:gender="gender = $event"
        />
      </template>
    </SurfaceCard>
    
    <SurfaceCard title="Scoringsskema">
      <template #content>
      <form @submit.prevent="handleSubmit">
        <h2>Tømning</h2>
        <QuestionComponent
          name="section1"
          v-for="(question, index) in questionsSection1"
          :key="index"
          :question="question"
          :optionsA="getOptions(question.optionsAType as keyof OptionsSets)"
          :optionsB="getOptions(question.optionsBType as keyof OptionsSets)"
          :index="index"
          :is-unanswered="formSubmitted && isUnanswered(question)"
        />
        <h2>Fyldning</h2>
        <QuestionComponent
          name="section2"
          v-for="(question, index) in questionsSection2"
          :key="index"
          :question="question"
          :optionsA="getOptions(question.optionsAType as keyof OptionsSets)"
          :optionsB="getOptions(question.optionsBType as keyof OptionsSets)"
          :index="index"
          :is-unanswered="formSubmitted && isUnanswered(question)"
        />
        <h2>Andre symptomer</h2>
        <QuestionComponent
          name="section3"
          v-for="(question, index) in questionsSection3"
          :key="index"
          :question="question"
          :optionsA="getOptions(question.optionsAType as keyof OptionsSets)"
          :optionsB="getOptions(question.optionsBType as keyof OptionsSets)"
          :index="index"
          :is-unanswered="formSubmitted && isUnanswered(question)"
        />
        <h2>Seksualfunktion</h2>
        <QuestionComponent
          name="section4"
          v-for="(question, index) in questionsSection4"
          :key="index"
          :question="question"
          :optionsA="getOptions(question.optionsAType as keyof OptionsSets)"
          :optionsB="getOptions(question.optionsBType as keyof OptionsSets)"
          :index="index"
        />

        <div v-if="validationMessage" class="text-red-500 mt-5 font-bold">
          {{ validationMessage }}
        </div>

        <div v-if="validationMessageSexual" class="mt-1">
          {{ validationMessageSexual }}
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
              <b>DANPSS SCORE</b>
              <br /><br />
              Navn: {{ name }} <br />
              Alder: {{ age }} år<br /><br />
              Tømning:&nbsp;&nbsp;&nbsp; Symptom {{ totalScoreASection1  }} &nbsp;&nbsp;&nbsp;Gene {{ totalScoreBSection1  }} &nbsp;&nbsp;&nbsp;Total {{ totalScoreABSection1 }}<br />
              Fyldning:&nbsp;&nbsp;&nbsp; Symptom {{ totalScoreASection2  }} &nbsp;&nbsp;&nbsp;Gene {{ totalScoreBSection2  }} &nbsp;&nbsp;&nbsp;Total {{ totalScoreABSection2 }}<br />
              Andre symptomer:  &nbsp;&nbsp;&nbsp;Symptom {{ totalScoreASection3  }} &nbsp;&nbsp;&nbsp;Gene {{ totalScoreBSection3  }} &nbsp;&nbsp;&nbsp;Total {{ totalScoreABSection3 }}
              <br />
              Vandladningsproblem Score: &nbsp;&nbsp;&nbsp;Symptom {{ totalScoreA }}&nbsp;&nbsp;&nbsp; Gene {{ totalScoreB }} &nbsp;&nbsp;&nbsp;Total {{ totalScoreAB }}
              <br /><br />
              Seksual funktion:  &nbsp;&nbsp;&nbsp;Symptom {{ (allSexualQuestionsAnswered ? totalScoreASection4 : '-')  }} &nbsp;&nbsp;&nbsp;Gene {{ (allSexualQuestionsAnswered ? totalScoreBSection4 : '-') }} &nbsp;&nbsp;&nbsp;Total {{ (allSexualQuestionsAnswered ? totalScoreABSection4 : '-') }}
              <br /><br />
              Konklusion:{{ conclusion }}
            </template>
          </CopyDialog>
          <SecondaryButton label="Slet" icon="pi pi-ban" severity="secondary"  @click="clearAllQuestionsAndResults"/>
          <!-- <Button label="Random" icon="pi pi-ban" severity="secondary" class="mr-3" @click="randomlyCheckQuestions"/> -->
     
          <Button type="submit" label="Beregn" class="mr-3 pr-6 pl-6" icon="pi pi-calculator"/>
        </div>
      </form>
      </template>
    </SurfaceCard>
    <div v-if="resultsSection1.length > 0" class="results" ref="resultsSection">
  <SurfaceCard title="Resultat">
    <template #content>
        
          <table class="w-full border-collapse">
            <thead>
              <tr>
                <th class="border border-slate-200 bg-emerald-100 p-1 text-left">Funktion</th>
                <th class="border border-slate-200 bg-emerald-100 p-1 text-left">Symptom</th>
                <th class="border border-slate-200 bg-emerald-100 p-1 text-left">Gene</th>
                <th class="border border-slate-200 bg-emerald-100 p-1 text-left">Total</th>
                <th class="border border-slate-200 bg-emerald-100 p-1 text-left">Interval</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="border border-slate-200 bg-emerald-50 p-1">Tømning</td>
                <td class="border border-slate-200 p-1">{{ totalScoreASection1  }}</td>
                <td class="border border-slate-200 p-1">{{ totalScoreBSection1  }}</td>
                <td class="border border-slate-200 p-1">{{ totalScoreABSection1 }}</td>
                <td class="border border-slate-200 p-1">0-36</td>
              </tr>
              <tr>
                <td class="border border-slate-200 bg-emerald-50 p-1">Fyldning</td>
                <td class="border border-slate-200 p-1">{{ totalScoreASection2  }}</td>
                <td class="border border-slate-200 p-1">{{ totalScoreBSection2  }}</td>
                <td class="border border-slate-200 p-1">{{ totalScoreABSection2 }}</td>
                <td class="border border-slate-200 p-1">0-36</td>
              </tr>
              <tr>
                <td class="border border-slate-200 bg-emerald-50 p-1">Andre Symptomer</td>
                <td class="border border-slate-200 p-1">{{ totalScoreASection3  }}</td>
                <td class="border border-slate-200 p-1">{{ totalScoreBSection3  }}</td>
                <td class="border border-slate-200 p-1">{{ totalScoreABSection3 }}</td>
                <td class="border border-slate-200 p-1">0-36</td>
              </tr>
              <tr class="font-semibold border-t-2 border-slate-300">
                <td class="border border-slate-200 bg-emerald-50 p-1">Vandladning Score</td>
                <td class="border border-slate-200 p-1">{{ totalScoreA }}</td>
                <td class="border border-slate-200 p-1">{{ totalScoreB }}</td>
                <td class="border border-slate-200 p-1">{{ totalScoreAB }}</td>
                <td class="border border-slate-200 p-1">0-108</td>
              </tr>
             
              <tr>
                <td class="border border-slate-200 bg-emerald-50 p-1">Seksualfunktion</td>
                <td class="border border-slate-200 p-1">{{ (allSexualQuestionsAnswered ? totalScoreASection4 : '-')  }}</td>
                <td class="border border-slate-200 p-1">{{ (allSexualQuestionsAnswered ? totalScoreBSection4 : '-') }}</td>
                <td class="border border-slate-200 p-1">{{ (allSexualQuestionsAnswered ? totalScoreABSection4 : '-') }}</td>
                <td class="border border-slate-200 p-1">0-27</td>
              </tr>
            </tbody>
          </table>
          <br />
          
          <br />
          <Message class="flex justify-center p-3" :severity="conclusionSeverity">{{ conclusion }}</Message><br />

          
            <p class="text-sm text-center ">Score < 8: Lette symptomer | Score 8-19: Moderate symptomer | Score > 19: Svære symptomer</p>
            <p class="text-sm text-center ">(Seksualfunktion tæller ikke med i score)</p>
            <div class="flex flex-row flex-wrap justify-center mt-5">
            <div class="flex flex-wrap justify-center">
              
              <div class="chart-container text-center mt-3" >
                <p class="text-lg font-medium">Score fraktion</p>
            <Chart
              ref="ChartRef"
              type="pie"
              :data="chartPieData"
              :options="chartPieOptions"
              class="h-72"
              style=""
            />
          </div>
            <div class="chart-container text-center mt-3">
              <p class="text-lg font-medium">Symptomer vs Gene</p>
            <Chart
              ref="ChartRef"
              type="radar"
              :data="chartRadarData"
              :options="chartRadarOptions"
              class="h-96"
            />
            </div>
          </div>
        </div>
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
import Chart from "primevue/chart";
import QuestionComponent from "./QuestionComponent.vue";
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
  options6: Option[];
  options7: Option[];
  options8: Option[];
  options9: Option[];
  options10: Option[];
  optionsB: Option[];
};

export interface Question {
  bg: string;
  textA: string;
  textB: string;
  optionsAType: keyof OptionsSets;
  optionsBType: keyof OptionsSets;
  answerA: number | null;
  answerB: number | null;
}

export interface Result {
  question: string;
  scoreA: number;
  scoreB: number;
  scoreAB: number;
}
const apiUrlServer = import.meta.env.VITE_API_URL;
const apiUrl = apiUrlServer+'/index.php/callback/LogCB/log';
const keyUrl = apiUrlServer+'/index.php/KeyServer/getPublicKey';

const resultsSection = ref<HTMLDivElement | null>(null);
const name = ref<string>("");
const gender = ref<string>("male");
const age = ref<number>(55);
const formSubmitted = ref<boolean>(false);

const resultsSection1 = ref<Result[]>([]);
const resultsSection2 = ref<Result[]>([]);
const resultsSection3 = ref<Result[]>([]);
const resultsSection4 = ref<Result[]>([]);
const combinedResults = ref<Result[]>([]);

const totalScoreASection1 = ref<number>(0);
const totalScoreBSection1 = ref<number>(0);
const totalScoreABSection1 = ref<number>(0);

const totalScoreASection2 = ref<number>(0);
const totalScoreBSection2 = ref<number>(0);
const totalScoreABSection2 = ref<number>(0);

const totalScoreASection3 = ref<number>(0);
const totalScoreBSection3 = ref<number>(0);
const totalScoreABSection3 = ref<number>(0);

const totalScoreASection4 = ref<number>(0);
const totalScoreBSection4 = ref<number>(0);
const totalScoreABSection4 = ref<number>(0);

const totalScoreA = ref<number>(0);
const totalScoreB = ref<number>(0);
const totalScoreAB = ref<number>(0);

const conclusion = ref<string>('');
const conclusionSeverity = ref<string>('');
const validationMessage = ref<string>('');
const validationMessageSexual = ref<string>('');
const allSexualQuestionsAnswered = ref<boolean>(false);

const options1 = ref<Option[]>([
  { text: "Nej", value: 0 },
  { text: "Sjældent", value: 1 },
  { text: "Dagligt", value: 2 },
  { text: "Hver gang", value: 3 },
]);

const options2 = ref<Option[]>([
  { text: "Normal?", value: 0 },
  { text: "Lidt slap?", value: 1 },
  { text: "Meget slap?", value: 2 },
  { text: "Dryppende?", value: 3 },
]);

const options3 = ref<Option[]>([
  { text: "Ja, altid", value: 0 },
  { text: "Oftest", value: 1 },
  { text: "Sjældent", value: 2 },
  { text: "Tømmes aldrig helt", value: 3 },
]);

const options4 = ref<Option[]>([
  { text: "Mere end 3 timer", value: 0 },
  { text: "2-3 timer", value: 1 },
  { text: "1-2 timer", value: 2 },
  { text: "Mindre end 1 time", value: 3 },
]);

const options5 = ref<Option[]>([
  { text: "0 gange", value: 0 },
  { text: "1-2 gange", value: 1 },
  { text: "3-4 gange", value: 2 },
  { text: "5 gange eller mere", value: 3 }
]);

const options6 = ref<Option[]>([
  { text: "Aldrig", value: 0 },
  { text: "Sjældent", value: 1 },
  { text: "Dagligt", value: 2 },
  { text: "Hver gang", value: 3 },
]);

const options7 = ref<Option[]>([
  { text: "Nej", value: 0 },
  { text: "I toilettet", value: 1 },
  { text: "Lidt i bukserne", value: 2 },
  { text: "Meget i bukserne", value: 3 },
]);

const options8 = ref<Option[]>([
  { text: "Ja, med normal stivhed", value: 0 },
  { text: "Ja, med let nedsat stivhed", value: 1 },
  { text: "Ja, med meget nedsat stivhed", value: 2 },
  { text: "Nej, kan ikke få rejsning ", value: 3 },
]);

const options9 = ref<Option[]>([
  { text: "Ja, i normal mængde", value: 0 },
  { text: "Ja, i let nedsat mængde", value: 1 },
  { text: "Ja, i meget nedsat mængde", value: 2 },
  { text: "Nej", value: 3 },
]);

const options10 = ref<Option[]>([
  { text: "Nej", value: 0 },
  { text: "Ja, lette smerter/ubehag", value: 1 },
  { text: "Ja, moderat smerter/ubehag", value: 2 },
  { text: "Ja, stærk smerte/ubehag ", value: 3 },
]);

const optionsB = ref<Option[]>([
  { text: "Ikke generende", value: 0 },
  { text: "Lidt generende", value: 1 },
  { text: "Moderat generende", value: 2 },
  { text: "Meget generende", value: 3 },
]);

    const questionsSection1 = ref<Question[]>([
  {
    bg: '--p-primary-100',
    textA: "1A. Skal du vente på, at vandladningen kommer i gang?",
    optionsAType: 'options1',
    answerA: null,
    textB: "1B. Hvis du skal vente, hvor stor en gene er det så for dig?",
    optionsBType: 'optionsB',
    answerB: null,
  },
  {
    bg: '--p-primary-50',
    textA: "2A. Synes du urinstrålen er:",
    optionsAType: 'options2',
    answerA: null,
    textB: "2B. Hvis urinstrålen er slap, hvor stor en gene er dette så for dig?",
    optionsBType: 'optionsB',
    answerB: null,
  },
  {
    bg: '--p-primary-100',
    textA: "3A. Føler du, at du får tømt blæren helt ved vandladning?",
    optionsAType: 'options3',
    answerA: null,
    textB: "3B. Hvis du føler, at blæren ikke tømmes helt ved vandladning, hvor stor en gene er dette så for dig?",
    optionsBType: 'optionsB',
    answerB: null,
  },
  {
    bg: '--p-primary-50',
    textA: "4A. Skal du presse for at starte vandladningen og/eller for at holde vandladningen i gang?",
    optionsAType: 'options1',
    answerA: null,
    textB: "4B. Hvis du skal presse, hvor stor en gene er dette så for dig?",
    optionsBType: 'optionsB',
    answerB: null,
  },
]);
      
const questionsSection2 = ref<Question[]>([
  {
    bg: '--p-primary-100',
    textA: "5A. Hvor lang tid går der højst mellem hver vandladning, fra du vågner, til du går i seng?",
    optionsAType: 'options4',
    answerA: null,
    textB: "5B. Hvis du ofte skal lade vandet, hvor stor en gene er dette så for dig?",
    optionsBType: 'optionsB',
    answerB: null,
  },
  {
    bg: '--p-primary-50',
    textA: "6A. Hvor mange gange skal du lade vandet om natten?",
    optionsAType: 'options5',
    answerA: null,
    textB: "6B. Hvis du skal lade vandet om natten, hvor stor en gene er dette så for dig?",
    optionsBType: 'optionsB',
    answerB: null,
  },
  {
    bg: '--p-primary-100',
    textA: "7A. Oplever du en bydende (stærk) vandladningstrang?",
    optionsAType: 'options6',
    answerA: null,
    textB: "7B. Hvis du oplever en bydende (stærk) vandladningstrang, hvor stor en gene er dette så for dig?",
    optionsBType: 'optionsB',
    answerB: null,
  },
  {
    bg: '--p-primary-50',
    textA: "8A. Er vandladningstrangen så kraftig, at du ikke kan holde på vandet, inden du når toilettet?",
    optionsAType: 'options1',
    answerA: null,
    textB: "8B. Hvis urinen løber fra dig, inden du når toilettet, hvor stor en gene er dette så for dig?",
    optionsBType: 'optionsB',
    answerB: null,
  }
]);

const questionsSection3 = ref<Question[]>([
  {
    bg: '--p-primary-100',
    textA: "9A. Gør det ondt eller svier det, når du lader vandet?",
    optionsAType: 'options1',
    answerA: null,
    textB: "9B. Hvis det gør ondt eller svier, når du lader vandet, hvor stor en gene er dette så for dig?",
    optionsBType: 'optionsB',
    answerB: null,
  },
  {
    bg: '--p-primary-50',
    textA: "10A. Drypper der urin, når du tror, at vandladningen er færdig (efterdryp)?",
    optionsAType: 'options7',
    answerA: null,
    textB: "10B. Hvis der drypper urin, når du tror, at vandladningen er færdig (efterdryp), hvor stor en gene er dette så for dig?",
    optionsBType: 'optionsB',
    answerB: null,
  },
  {
    bg: '--p-primary-100',
    textA: "11A. Har du ufrivillig vandladning ved fysisk anstrengelse (fx hoste, nys eller løft)?",
    optionsAType: 'options1',
    answerA: null,
    textB: "11B. Hvis du har ufrivillig vandladning ved fysisk anstrengelse, hvor stor en gene er dette så for dig?",
    optionsBType: 'optionsB',
    answerB: null,
  },
  {
    bg: '--p-primary-50',
    textA: "12A. Har du ufrivillig vandladning uden fysisk anstrengelse og uden trang (siven)?",
    optionsAType: 'options1',
    answerA: null,
    textB: "12B. Hvis urinen siver fra dig uden fysisk anstrengelse og uden trang, hvor stor en gene er dette så for dig?",
    optionsBType: 'optionsB',
    answerB: null,
  }
]);
    
const questionsSection4 = ref<Question[]>([
  {
    bg: '--p-zinc-100',
    textA: "13A. Kan du få rejsning?",
    optionsAType: 'options8',
    answerA: null,
    textB: "13B. Hvis du har problemer med at få rejsning, hvor stor en gene er dette så for dig?",
    optionsBType: 'optionsB',
    answerB: null,
  },
  {
    bg: '--p-zinc-50',
    textA: "14A. Har du sædafgang?",
    optionsAType: 'options9',
    answerA: null,
    textB: "14B. Hvis du har nedsat eller ophævet sædafgang, hvor stor en gene er dette så for dig?",
    optionsBType: 'optionsB',
    answerB: null,
  },
  {
    bg: '--p-zinc-100',
    textA: "15A. Hvis du har sædafgang, oplever du da smerter/ubehag ved sædafgang?",
    optionsAType: 'options10',
    answerA: null,
    textB: "15B. Hvis du har smerter/ubehag ved sædafgang, hvor stor gene er dette så for dig?",
    optionsBType: 'optionsB',
    answerB: null,
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
  options10,
  optionsB,
};


const chartPieData = ref({
  labels: ["Tømning", "Fyldning", "Andre symptomer"],
  datasets: [
    {
      label: "Risiko",
      backgroundColor: ["#14b8a6", "#ec4899", "#a855f7"],
      data: [1, 1, 1],
    },
  ],
});

const chartPieOptions = ref({
  animation: { duration: 0 },
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      enabled: true,
    },
    datalabels: {
      anchor: "start",
      align: "end",
      color: "#fff",
      font: {
        weight: "bold",
        size: "15px",
      },
      formatter: function (value: number) {
        return value != 0 ? value + "%" : "";
      },
    },
  },
});
    
const chartRadarData = ref({
  labels: ["Tømning", "Fyldning", "Andre"],
  datasets: [
    {
      label: "Symptomer",
      borderColor: '#a3e635',
      pointBackgroundColor: '#a3e635',
      pointBorderColor: '#a3e635',
      pointHoverBackgroundColor: '#a3e635',
      pointHoverBorderColor: '#a3e635',
      data: [0, 0, 0],
    },
    {
      label: "Gene",
      borderColor: '#fbbf24',
      pointBackgroundColor: '#fbbf24',
      pointBorderColor: '#fbbf24',
      pointHoverBackgroundColor: '#fbbf24',
      pointHoverBorderColor: '#fbbf24',
      data: [0, 0, 0],
    }
  ],
});

const chartRadarOptions = ref({
  animation: { duration: 0 },
  aspectRatio : 1,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      enabled: true,
    }
  },
  scales: {
    r: {
      suggestedMin: 0,
      suggestedMax: 12
    }
  }
});
    
const getOptions = (type: keyof OptionsSets): Option[] => {
  return optionsSets[type].value;
}

const handleSubmit = () => {
  formSubmitted.value = true;
  allSexualQuestionsAnswered.value = validateSexualQuestions();

  if (validateQuestions()) {
    calculateResults();
    scrollToResults();
    sendDataToServer(apiUrl, keyUrl, generatePayload())
    .then(() => {
      //console.log('Data successfully sent:', data);
    })
    .catch(() => {
      //console.error('Failed to send data:', error.message);
    });
  }
};

const validateQuestions = (): boolean => {
  const allQuestions = [
    ...questionsSection1.value,
    ...questionsSection2.value,
    ...questionsSection3.value,
  ];
  const unansweredQuestions = allQuestions.filter(
    (question) => question.answerA === null || question.answerB === null
  );
  if (unansweredQuestions.length > 0) {
    validationMessage.value = 'Alle spørgsmål om vandladningsproblemer skal udfyldes. ';
    return false;
  } else {
    validationMessage.value = '';
    return true;
  }
};

const validateSexualQuestions = (): boolean => {
  const allQuestions = [
    ...questionsSection4.value,
  ];

  const unansweredQuestions = allQuestions.filter(
    (question) => question.answerA === null || question.answerB === null
  );

  if (unansweredQuestions.length > 0) {
    if (unansweredQuestions.length == allQuestions.length) {
      validationMessageSexual.value = 'Seksual funktion ikke udfyldt.';
    }
    else if (unansweredQuestions.length < allQuestions.length) {
      validationMessageSexual.value = 'Seksual funktion ikke komplet.';
    }
    return false;
  } else {
    validationMessageSexual.value = '';
    return true;
  }
};

const isUnanswered = (question: Question): boolean => {
  return question.answerA === null || question.answerB === null;
};

const calculateResults = () => {
  const section1Results = questionsSection1.value.map((question, index) => {
    const scoreA = question.answerA ?? 0;
    const scoreB = question.answerB ?? 0;
    const scoreAB = scoreA * scoreB;
    return {
      question: `Tømning ${index + 1}`,
      scoreA,
      scoreB,
      scoreAB,
    };
  });

  const section2Results = questionsSection2.value.map((question, index) => {
    const scoreA = question.answerA ?? 0;
    const scoreB = question.answerB ?? 0;
    const scoreAB = scoreA * scoreB;
    return {
      question: `Fyldning ${index + 1}`,
      scoreA,
      scoreB,
      scoreAB,
    };
  });

  const section3Results = questionsSection3.value.map((question, index) => {
    const scoreA = question.answerA ?? 0;
    const scoreB = question.answerB ?? 0;
    const scoreAB = scoreA * scoreB;
    return {
      question: `Andre symptomer ${index + 1}`,
      scoreA,
      scoreB,
      scoreAB,
    };
  });

  const section4Results = questionsSection4.value.map((question, index) => {
    const scoreA = question.answerA ?? 0;
    const scoreB = question.answerB ?? 0;
    const scoreAB = scoreA * scoreB;
    return {
      question: `Seksual funktion ${index + 1}`,
      scoreA,
      scoreB,
      scoreAB,
    };
  });

  resultsSection1.value = section1Results;
  resultsSection2.value = section2Results;
  resultsSection3.value = section3Results;
  resultsSection4.value = section4Results;
  combinedResults.value = [...section1Results, ...section2Results, ...section3Results];
  
  totalScoreASection1.value = resultsSection1.value.reduce((sum, result) => sum + result.scoreA, 0);
  totalScoreBSection1.value = resultsSection1.value.reduce((sum, result) => sum + result.scoreB, 0);
  totalScoreABSection1.value = resultsSection1.value.reduce((sum, result) => sum + result.scoreAB, 0);
  
  totalScoreASection2.value = resultsSection2.value.reduce((sum, result) => sum + result.scoreA, 0);
  totalScoreBSection2.value = resultsSection2.value.reduce((sum, result) => sum + result.scoreB, 0);
  totalScoreABSection2.value = resultsSection2.value.reduce((sum, result) => sum + result.scoreAB, 0);

  totalScoreASection3.value = resultsSection3.value.reduce((sum, result) => sum + result.scoreA, 0);
  totalScoreBSection3.value = resultsSection3.value.reduce((sum, result) => sum + result.scoreB, 0);
  totalScoreABSection3.value = resultsSection3.value.reduce((sum, result) => sum + result.scoreAB, 0);
  
  if (allSexualQuestionsAnswered.value) {
    totalScoreASection4.value = resultsSection4.value.reduce((sum, result) => sum + result.scoreA, 0);
    totalScoreBSection4.value = resultsSection4.value.reduce((sum, result) => sum + result.scoreB, 0);
    totalScoreABSection4.value = resultsSection4.value.reduce((sum, result) => sum + result.scoreAB, 0);
  }
  
  totalScoreA.value =
    totalScoreASection1.value +
    totalScoreASection2.value +
    totalScoreASection3.value;

  totalScoreB.value =
    totalScoreBSection1.value +
    totalScoreBSection2.value +
    totalScoreBSection3.value;

  totalScoreAB.value =
    totalScoreABSection1.value +
    totalScoreABSection2.value +
    totalScoreABSection3.value;

  if (totalScoreAB.value > 19) {
    conclusion.value = "Svære symptomer (Vandladningsproblem total score > 19)";
    conclusionSeverity.value = "error";
  } else if (totalScoreAB.value >= 8) {
    conclusion.value = "Moderate symptomer (Vandladningsproblem total score 8-19)";
    conclusionSeverity.value = "warn";
  } else {
    conclusion.value = "Lette symptomer (Vandladningsproblem total score < 8)";
    conclusionSeverity.value = "success";
  }

  var empty_fragment = Math.round((totalScoreABSection1.value/ totalScoreAB.value) * 100);
  var full_fragment = Math.round((totalScoreABSection2.value / totalScoreAB.value) * 100);
  var other_fragment = Math.round((totalScoreABSection3.value/ totalScoreAB.value) * 100);

  chartPieData.value.datasets[0].data[0] = empty_fragment;
  chartPieData.value.datasets[0].data[1] = full_fragment;
  chartPieData.value.datasets[0].data[2] = other_fragment;

  chartRadarData.value.datasets[0].data[0] = totalScoreASection1.value;
  chartRadarData.value.datasets[0].data[1] = totalScoreASection2.value;
  chartRadarData.value.datasets[0].data[2] = totalScoreASection3.value;

  chartRadarData.value.datasets[1].data[0] = totalScoreBSection1.value;
  chartRadarData.value.datasets[1].data[1] = totalScoreBSection2.value;
  chartRadarData.value.datasets[1].data[2] = totalScoreBSection3.value;
};

const scrollToResults = () => {
  const resultsSectionEl = resultsSection.value as HTMLElement;
  if (resultsSectionEl) {
    resultsSectionEl.scrollIntoView({ behavior: 'smooth' });
  }
};


const clearAllQuestionsAndResults = () => {
  questionsSection1.value.forEach(question => {
    question.answerA = null;
    question.answerB = null;
  });

  questionsSection2.value.forEach(question => {
    question.answerA = null;
    question.answerB = null;
  });

  questionsSection3.value.forEach(question => {
    question.answerA = null;
    question.answerB = null;
  });

  questionsSection4.value.forEach(question => {
    question.answerA = null;
    question.answerB = null;
  });

  resultsSection1.value = [];
  resultsSection2.value = [];
  resultsSection3.value = [];
  resultsSection4.value = [];
  combinedResults.value = [];
  totalScoreA.value = 0;
  totalScoreB.value = 0;
  totalScoreAB.value = 0;
  validationMessage.value = '';
  validationMessageSexual.value = '';
  formSubmitted.value = false;
};

const generatePayload = () => {
  return {
    name: name.value,
    age: age.value,
    gender: gender.value,
    answers: [
      ...questionsSection1.value,
      ...questionsSection2.value,
      ...questionsSection3.value,
      ...questionsSection4.value,
    ],
    scores: {
      totalScoreA: totalScoreA.value,
      totalScoreB: totalScoreB.value,
      totalScoreAB: totalScoreAB.value,
      sectionScores: {
        section1: { totalScoreA: totalScoreASection1.value, totalScoreB: totalScoreBSection1.value, totalScoreAB: totalScoreABSection1.value },
        section2: { totalScoreA: totalScoreASection2.value, totalScoreB: totalScoreBSection2.value, totalScoreAB: totalScoreABSection2.value },
        section3: { totalScoreA: totalScoreASection3.value, totalScoreB: totalScoreBSection3.value, totalScoreAB: totalScoreABSection3.value },
        section4: { totalScoreA: totalScoreASection4.value, totalScoreB: totalScoreBSection4.value, totalScoreAB: totalScoreABSection4.value },
      },
    },
  };
}
</script>

