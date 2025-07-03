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
    
    <SurfaceCard title="Symptomer">
      <template #content>
        <SurfaceCardItem>
            <template #icon> </template>
            <template #title>Hoste (Tør eller produktiv)</template>
            <template #content>
                <ToggleButton v-model="coughing" onLabel="Ja" offLabel="Nej" />
            </template>
        </SurfaceCardItem>
        <SurfaceCardItem>
            <template #icon> </template>
            <template #title>Træthed</template>
            <template #content>
                <ToggleButton v-model="tiredness" onLabel="Ja" offLabel="Nej" />
            </template>
        </SurfaceCardItem>
        <SurfaceCardItem>
            <template #icon> </template>
            <template #title>Kulderystelser</template>
            <template #content>
                <ToggleButton v-model="shivers" onLabel="Ja" offLabel="Nej" />
            </template>
        </SurfaceCardItem>
        <SurfaceCardItem>
            <template #icon> </template>
            <template #title>Vejrtrækningsbesvær</template>
            <template #content>
                <ToggleButton v-model="dyspnea" onLabel="Ja" offLabel="Nej" />
            </template>
        </SurfaceCardItem>
        <SurfaceCardItem>
            <template #icon> </template>
            <template #title>Smerter ved inspiration</template>
            <template #content>
                <ToggleButton v-model="inspirationPain" onLabel="Ja" offLabel="Nej" />
            </template>
        </SurfaceCardItem>
        <SurfaceCardItem>
            <template #icon> </template>
            <template #title>Konfusion</template>
            <template #content>
                <ToggleButton v-model="confusion" onLabel="Ja" offLabel="Nej" />
            </template>
        </SurfaceCardItem>
      </template>
    </SurfaceCard>
    <SurfaceCard title="Symptomer">
      <template #content>
        <SurfaceCardItem>
            <template #icon> </template>
            <template #title>Alment påvirket</template>
            <template #content>
                <ToggleButton v-model="condition" onLabel="Ja" offLabel="Nej" />
            </template>
        </SurfaceCardItem>
        <SurfaceCardItem>
            <template #icon> </template>
            <template #title>Dæmpning ved perkussion</template>
            <template #content>
                <ToggleButton v-model="percussion" onLabel="Ja" offLabel="Nej" />
            </template>
        </SurfaceCardItem>
        <SurfaceCardItem>
            <template #icon> </template>
            <template #title>Kulderystelser</template>
            <template #content>
                <ToggleButton v-model="shivers" onLabel="Ja" offLabel="Nej" />
            </template>
        </SurfaceCardItem>
        <SurfaceCardItem>
            <template #icon> </template>
            <template #title>Vejrtrækningsbesvær</template>
            <template #content>
                <ToggleButton v-model="dyspnea" onLabel="Ja" offLabel="Nej" />
            </template>
        </SurfaceCardItem>
        <SurfaceCardItem>
            <template #icon> </template>
            <template #title>Smerter ved inspiration</template>
            <template #content>
                <ToggleButton v-model="inspirationPain" onLabel="Ja" offLabel="Nej" />
            </template>
        </SurfaceCardItem>
        <SurfaceCardItem>
            <template #icon> </template>
            <template #title>Konfusion</template>
            <template #content>
                <ToggleButton v-model="confusion" onLabel="Ja" offLabel="Nej" />
            </template>
        </SurfaceCardItem>
      </template>
    </SurfaceCard>
    <div v-if="resultsSection1.length > 0" class="results" ref="resultsSection">
  <SurfaceCard title="Resultat">
    <template #content>          
          <br />
          <Message class="flex justify-content-center p-3" :severity="conclusionSeverity"><h2>Westley Croup Score {{ totalScore }} : {{ conclusion }}</h2></Message><br />
          <p class="text-sm text-center ">Score ≤ 2 : Mild pseudocroup | Score 3-7: Moderat pseudocroup | Score ≥ 8: Svær pseudocroup</p>
            
         
        
      </template>
        </SurfaceCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';
import ToggleButton from "primevue/togglebutton";
import InputText from 'primevue/inputtext';
import QuestionSingleComponent from "./QuestionSingleComponent.vue";
import CopyDialog from "./CopyDialog.vue";
import SurfaceCard from "./SurfaceCard.vue";
import SurfaceCardItem from "./SurfaceCardItem.vue";
import PersonInfo from "./PersonInfo.vue";
import Message from 'primevue/message';
import sendDataToServer from '../assets/sendDataToServer.ts';
import { type GenderValue } from '@/utils/genderUtils';

export interface Option {
  text: string;
  value: number;
}

export interface Result {
  question: string;
  text: string;
  score: number;
}
const coughing = ref<boolean>(false);
const tiredness = ref<boolean>(false);
const shivers = ref<boolean>(false);
const dyspnea = ref<boolean>(false);
const inspirationPain = ref<boolean>(false);
const confusion = ref<boolean>(false);
const condition = ref<boolean>(false);
const percussion = ref<boolean>(false);
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

const handleSubmit = () => {
  formSubmitted.value = true;
};

const calculateResults = () => {
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

const clearAllQuestionsAndResults = () => {
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
      scores: {
        totalScore: totalScore.value
      },
    };
}
</script>

