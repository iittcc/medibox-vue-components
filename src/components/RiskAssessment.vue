<!-- src/components/RiskAssessment.vue -->
<template>
  <div class="medical-calculator-container">
    <div class="w-full max-w-[800px] mx-auto px-4">
    <SurfaceCard title="Oplysninger">
      <template #button
        ><CopyDialog
          title="Kopier til clipboard"
          info="Teksten skulle nu ligge i Clipboard. Hvis ikke, marker teksten og kopier den med CTRL+ C. Indsæt i journalsystemet med CTRL + V."
        >
          <template #container>
            <b>10 års risiko for fatal hændelse pga. iskæmisk hjerte-karsygdom</b>
            <br /><br />
            Navn: {{ name }} <br />
            Køn: {{ gender }} <br />
            Alder: {{ age }} år<br /><br />

            <b>Undersøgelse</b><br /><br />
            Systolisk blodtryk: {{ sysBP }} mmHg<br />
            LDL-Kolesterol: {{ LDLCholesterol }} mmol/L<br />
            Rygning: {{ smoking == false ? "Nej" : "Ja" }} <br /><br />
            <b>Behandlingsmål</b><br /><br />
            Systolisk blodtryk: {{ targetSysBP }} mmHg<br />
            LDL-Kolesterol: {{ targetLDLCholesterol }} mmol/L<br />
            Rygning: {{ targetSmoking == false ? "Nej" : "Ja" }}
            <br /><br />
            <b>Risiko</b>
            <br /><br />
            Nuværende risiko: {{ riskGroup }} ({{ risk }}%)
            <br />
            Behandlingsmål risiko: {{ targetRiskGroup }} ({{ targetRisk }}%)
          </template>
        </CopyDialog>
      </template>
      <template #content>
        <PersonInfo
          :name="name"
          :age="age"
          :minAge="40"
          :maxAge="90"
          :gender="gender"
          genderdisplay="block"
          @update:name="name = $event"
          @update:age="age = $event"
          @update:gender="gender = $event"
        />
      </template>
    </SurfaceCard>

    <div class="flex flex-col sm:flex-row w-full">
      <SurfaceCard title="Undersøgelse" class="w-full">
        <template #content>
          <SurfaceCardItem class="mb-3">
            <template #icon> <CustomIcon icon="blood_pressure" /></template>
            <template #title>Systolisk blodtryk</template>
            <template #content>
              <NumberSliderInput
                  v-model="sysBP"
                  :min="20"
                  :max="200"
                  mode="decimal"
                  :showButtons="true"
                  :step="1"
                  suffix=" mmHg"
                  :normalMin="minSysBP"
                  :normalMax="maxSysBP"
                  :tooltip="false"
                  sliderType="custom"
                />
             
            </template>
          </SurfaceCardItem>
          <SurfaceCardItem class="mb-3">
            <template #icon><CustomIcon icon="labs" /></template>
            <template #title>LDL kolesterol</template>
            <template #content>
                <NumberSliderInput
                  v-model="LDLCholesterol"
                  :min="0"
                  :max="8"
                  mode="decimal"
                  :showButtons="true"
                  :step="0.1"
                  suffix=" mmol/L"
                  :normalMin="minLDLCholesterol"
                  :normalMax="maxLDLCholesterol"
                  :tooltip="false"
                  sliderType="custom"
                />
              
            </template>
          </SurfaceCardItem>
          <SurfaceCardItem class="mb-3">
            <template #icon><CustomIcon icon="lungs" /></template>
            <template #title>Rygning</template>
            <template #content>
              <ToggleButton v-model="smoking" onLabel="Ja" offLabel="Nej" />
            </template>
          </SurfaceCardItem>
        </template>
      </SurfaceCard>

      <SurfaceCard title="Behandlingsmål" class="w-full">
        <template #content>
          <SurfaceCardItem class="mb-3">
            <template #icon> <CustomIcon icon="blood_pressure" /></template>
            <template #title>Systolisk blodtryk</template>
            <template #content>
              <NumberSliderInput
                  v-model="targetSysBP"
                  :min="20"
                  :max="200"
                  mode="decimal"
                  :showButtons="true"
                  :step="1"
                  suffix=" mmHg"
                  :normalMin="targetMinSysBP"
                  :normalMax="targetMaxSysBP"
                  :tooltip="false"
                  sliderType="custom"
                />
            </template>
          </SurfaceCardItem>
          <SurfaceCardItem class="mb-3">
            <template #icon><CustomIcon icon="labs" /></template>
            <template #title>LDL kolesterol</template>
            <template #content>
              <NumberSliderInput
                  v-model="targetLDLCholesterol"
                  :min="0"
                  :max="8"
                  mode="decimal"
                  :showButtons="true"
                  :step="0.1"
                  suffix=" mmol/L"
                  :normalMin="targetMinLDLCholesterol"
                  :normalMax="targetMaxLDLCholesterol"
                  :tooltip="false"
                />
            </template>
          </SurfaceCardItem>
          <SurfaceCardItem class="mb-2">
            <template #icon><CustomIcon icon="lungs" /></template>
            <template #title>Rygning</template>
            <template #content>
              <ToggleButton v-model="targetSmoking" onLabel="Ja" offLabel="Nej" />
            </template>
          </SurfaceCardItem>
        </template>
      </SurfaceCard>
    </div>

    <div class="flex w-full relative">
      <SurfaceCard title="Resultat" class="w-full">
        <template #content>
          <div class="flex flex-col sm:flex-row w-full items-center">
            <div class="flex flex-col w-full items-center">
              <div class="text-3xl text-700">Nuværende risiko</div>
              <div
                :class="[
                  'flex h-32 w-48 m-2 rounded-xl result-card shadow-md items-center justify-center',
                  riskGroupStyle + '-radial',
                ]"
              >
                <p class="items-center text-5xl">
                  <b>{{ risk !== -1 ? risk : "-" }}%</b>
                </p>
              </div>
            </div>

            <div class="flex flex-col w-full items-center">
              <div class="text-3xl text-700">Behandlingsmål risiko</div>
              <div
                :class="[
                  'flex h-32 w-48 m-2 rounded-xl result-card shadow-md items-center justify-center',
                  targetRiskGroupStyle + '-radial',
                ]"
              >
                <p class="items-center text-5xl">
                  <b>{{ targetRisk !== -1 ? targetRisk : "-" }}%</b>
                </p>
              </div>
            </div>
          </div>
          <br />
          <div class="flex flex-col w-full items-center">
            <p class="flex items-center justify-center h-1rem text-600">
              Absolut risikoreduktion (ARR): {{ Math.round(arr) }}%. Relativ
              risikoreduktion: {{ Math.round(rrr * 100) }}%. NNT:
              {{ nnt != 0 ? Math.round(nnt * 100) : "-" }}
            </p>
            <div class="flex items-center justify-center h-2rem">
              <h5 class="text-500">
                Aldersgruppe {{ riskGroupAgeStr }}:
                <div class="h-1rem w-1rem risk-low icon-inline" />
                Lav-Moderat risiko {{ riskGroupLowStr }}
                <div class="h-1rem w-1rem risk-high icon-inline" />
                Høj risiko {{ riskGroupHighStr }}
                <div class="h-1rem w-1rem risk-very-high icon-inline" />
                Meget høj risiko {{ riskGroupVeryHighStr }}
              </h5>
            </div>
          </div>
        </template>
      </SurfaceCard>
    </div>

    <div class="flex flex-col md:flex-row w-full">
      <SurfaceCard title="Behandlingsmål effekt" class="md:w-full">
        <template #content>
          <Chart ref="ChartRef" type="bar" :data="chartData" :options="chartOptions" />
        </template>
      </SurfaceCard>

      <SurfaceCard title="Behandlingsmål effektfraktion" class="md:w-full">
        <template #content>
          <Chart
            ref="ChartRef"
            type="pie"
            :data="chartPieData"
            :options="chartPieOptions"
          />
        </template>
      </SurfaceCard>
    </div>
  </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import Chart from "primevue/chart";
import ToggleButton from '@/volt/ToggleButton.vue';
import SurfaceCard from "./SurfaceCard.vue";
import SurfaceCardItem from "./SurfaceCardItem.vue";
import CopyDialog from "./CopyDialog.vue";
import CustomIcon from "./CustomIcon.vue";
import { calculateRisk, filterByAgeGroup } from "../assets/riskCalculator.ts";
import PersonInfo from "./PersonInfo.vue";
import NumberSliderInput from './NumberSliderInput.vue';

export interface Option {
  label: string;
  value: string | number;
}

const genderOptions = ref(["Mand", "Kvinde"]);

const name = ref<string>("");
const gender = ref<"Mand" | "Kvinde">("Mand");
const age = ref<number>(55);
const sysBP = ref<number>(140);
const minSysBP = ref(90); // Minimum value for the slider
const maxSysBP = ref(140); // Maximum value for the slider
const LDLCholesterol = ref<number>(5.0);
const minLDLCholesterol = ref(3.0);
const maxLDLCholesterol = ref(5.0);
const smoking = ref<boolean>(false);
const targetSysBP = ref<number>(120);
const targetMinSysBP = ref(80); // Minimum value for the slider
const targetMaxSysBP = ref(120); // Maximum value for the slider
const targetLDLCholesterol = ref<number>(2.0);
const targetMinLDLCholesterol = ref(1.0);
const targetMaxLDLCholesterol = ref(2.5);
const targetSmoking = ref<boolean>(false);
const risk = ref<number>(-1);
const riskGroup = ref<string>("");
const targetRisk = ref<number>(-1);
const targetRiskGroup = ref<string>("");
const riskGroupStyle = ref<string>("risk-low"); //ref<string>('#40AC48');
const targetRiskGroupStyle = ref<string>("risk-low"); //ref<string>('#40AC48');
const riskGroupLowColor = ref<string>("#1da750"); //ref<string>('#40AC48');
const riskGroupHighColor = ref<string>("#eab308"); //ref<string>('#E49E31');
const riskGroupVeryHighColor = ref<string>("#d9342b"); //ref<string>('#AF1D12');
const riskGroupAgeStr = ref<string>("< 50 år"); //ref<string>('#40AC48');
const riskGroupLowStr = ref<string>("< 2.5%"); //ref<string>('#40AC48');
const riskGroupHighStr = ref<string>("2.5% til <7.5%"); //ref<string>('#E49E31');
const riskGroupVeryHighStr = ref<string>(">= 7.5%"); //ref<string>('#AF1D12');

const arr = ref<number>(0);
const rrr = ref<number>(0);
const nnt = ref<number>(0);

const cholesterolOptions: Option[] = [
  { label: "4.0", value: 4.0 },
  { label: "5.0", value: 5.0 },
  { label: "6.0", value: 6.0 },
  { label: "7.0", value: 7.0 },
  { label: "8.0", value: 8.0 },
];

const smokingOptions: Option[] = [
  { label: "Ja", value: "Ja" },
  { label: "Nej", value: "Nej" },
];

const chartData = ref({
  labels: ["Risiko (Nuværende)", "Risiko (Behandlingsmål)"],
  datasets: [
    {
      label: "Risiko",
      backgroundColor: [riskGroupLowColor.value, riskGroupLowColor.value],
      data: [0, 0],
    },
  ],
});

const chartPieData = ref({
  labels: ["Systolisk BP", "LDL", "Rygning"],
  datasets: [
    {
      label: "Risiko",

      backgroundColor: ["#14b8a6", "#ec4899", "#a855f7"],
      data: [0, 0, 0],
    },
  ],
});

const chartOptions = ref({
  animation: { duration: 0 },

  scales: {
    y: {
      min: 0,
      max: 50,
      ticks: {
        stepSize: 1,
      },
    },
  },
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    tooltip: {
      enabled: true,
    },
    datalabels: {
      anchor: "end",
      align: "end",
      font: {
        weight: "bold",
        size: "15px",
      },
      formatter: function (value: number) {
        return value + "%";
      },
    },
  },
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

const ageGroupData = filterByAgeGroup("Mand", "Ikke-ryger", "40-44");

// Function to update the chart data based on sysBP and age
const calcRisk = () => {
  risk.value = calculateRisk(
    gender.value,
    age.value,
    smoking.value,
    sysBP.value,
    LDLCholesterol.value
  );
  var groupData = calcRiskGroup(risk.value, age.value);
  if (risk.value !== -1) {
    riskGroup.value = groupData[0];
    riskGroupStyle.value = groupData[2];
    chartData.value.datasets[0].data[0] = risk.value;
    chartData.value.datasets[0].backgroundColor[0] = groupData[1];
  }
  calcRiskFragment();
  calcRiskValues();
};

const calcTargetRisk = () => {
  targetRisk.value = calculateRisk(
    gender.value,
    age.value,
    targetSmoking.value,
    targetSysBP.value,
    targetLDLCholesterol.value
  );
  var groupData = calcRiskGroup(targetRisk.value, age.value);
  if (targetRisk.value !== -1) {
    targetRiskGroup.value = groupData[0];
    targetRiskGroupStyle.value = groupData[2];
    chartData.value.datasets[0].data[1] = targetRisk.value;
    chartData.value.datasets[0].backgroundColor[1] = groupData[1];
  }

  calcRiskFragment();
  calcRiskValues();
};

const calcRiskValues = () => {
  arr.value = risk.value - targetRisk.value;
  rrr.value = arr.value / risk.value;
  nnt.value = arr.value != 0 ? 1 / arr.value : 0;
};

const calcRiskGroup = (risk: number, age: number) => {
  var groupStyle: string = "";
  var groupColor: string = "";
  var group: string = "";

  if (age < 50) {
    riskGroupAgeStr.value = "< 50 år";
    riskGroupLowStr.value = "<2.5%";
    riskGroupHighStr.value = "2.5% til <7.5%";
    riskGroupVeryHighStr.value = ">=7.5%";
    if (risk < 2.5) {
      groupStyle = "risk-low";
      groupColor = riskGroupLowColor.value;
      group = "Lav-moderat risiko";
    } else if (risk >= 2.5 && risk < 7.5) {
      groupStyle = "risk-high";
      groupColor = riskGroupHighColor.value;
      group = "Høj risiko";
    } else {
      groupStyle = "risk-very-high";
      groupColor = riskGroupVeryHighColor.value;
      group = "Meget høj risiko";
    }
  } else if (age >= 50 && age < 70) {
    riskGroupAgeStr.value = "50 - 69 år";
    riskGroupLowStr.value = "<5%";
    riskGroupHighStr.value = "5% til <10%";
    riskGroupVeryHighStr.value = ">=10%";
    if (risk < 5) {
      groupStyle = "risk-low";
      groupColor = riskGroupLowColor.value;
      group = "Lav-moderat risiko";
    } else if (risk >= 5 && risk < 10) {
      groupStyle = "risk-high";
      groupColor = riskGroupHighColor.value;
      group = "Høj risiko";
    } else {
      groupStyle = "risk-very-high";
      groupColor = riskGroupVeryHighColor.value;
      group = "Meget høj risiko";
    }
  } else {
    riskGroupAgeStr.value = ">= 70 år";
    riskGroupLowStr.value = "<7.5%";
    riskGroupHighStr.value = "7.5% til <15%";
    riskGroupVeryHighStr.value = ">=15%";

    if (risk < 7.5) {
      groupStyle = "risk-low";
      groupColor = riskGroupLowColor.value;
      group = "Lav-moderat risiko";
    } else if (risk >= 7.5 && risk < 15) {
      groupStyle = "risk-high";
      groupColor = riskGroupHighColor.value;
      group = "Høj risiko";
    } else {
      groupStyle = "risk-very-high";
      groupColor = riskGroupVeryHighColor.value;
      group = "Meget høj risiko";
    }
  }
  return [group, groupColor, groupStyle];
};

const calcRiskFragment = () => {
  var systolicBP_diff = Math.max(
    Math.log(risk.value) -
      Math.log(
        calculateRisk(
          gender.value,
          age.value,
          smoking.value,
          targetSysBP.value,
          LDLCholesterol.value
        )
      ),
    0
  );
  var ldl_diff = Math.max(
    Math.log(risk.value) -
      Math.log(
        calculateRisk(
          gender.value,
          age.value,
          smoking.value,
          sysBP.value,
          targetLDLCholesterol.value
        )
      ),
    0
  );
  var smoking_diff = Math.max(
    Math.log(risk.value) -
      Math.log(
        calculateRisk(
          gender.value,
          age.value,
          targetSmoking.value,
          sysBP.value,
          LDLCholesterol.value
        )
      ),
    0
  );

  var diff_sum = systolicBP_diff + ldl_diff + smoking_diff;

  if (diff_sum > 0) {
    var systolicBP_fragment = Math.round((systolicBP_diff / diff_sum) * 100);
    var ldl_fragment = Math.round((ldl_diff / diff_sum) * 100);
    var smoking_fragment = Math.round((smoking_diff / diff_sum) * 100);

    chartPieData.value.datasets[0].data[0] = systolicBP_fragment;

    chartPieData.value.datasets[0].data[1] = ldl_fragment;
    chartPieData.value.datasets[0].data[2] = smoking_fragment;
  }
};

const updateMinMaxRanges = () => {
  /*
    Normale værdier er:
      18 - < 30 år: 1,2 - 4,3 mmol/L
      30 - < 50 år 1,4 - 4,7 mmol/L
      50 år og ældre: 2,0 - 5,3 mmol/L
  */

  if (gender.value == "Mand") {
    minSysBP.value = 90;
    maxSysBP.value = 140;

    if (age.value < 30) {
      minLDLCholesterol.value = 1.2;
      maxLDLCholesterol.value = 4.3;
    } else if (age.value < 50) {
      minLDLCholesterol.value = 1.4;
      maxLDLCholesterol.value = 4.7;
    } else {
      minLDLCholesterol.value = 2.0;
      maxLDLCholesterol.value = 5.3;
    }
  } else {
    minSysBP.value = 90;
    maxSysBP.value = 140;
    if (age.value < 30) {
      minLDLCholesterol.value = 1.2;
      maxLDLCholesterol.value = 4.3;
    } else if (age.value < 50) {
      minLDLCholesterol.value = 1.4;
      maxLDLCholesterol.value = 4.7;
    } else {
      minLDLCholesterol.value = 2.0;
      maxLDLCholesterol.value = 5.3;
    }
  }
};

// Watcher to update chart when sysBP changes
watch([sysBP, LDLCholesterol, smoking], () => {
  calcRisk();
});

watch([targetSysBP, targetLDLCholesterol, targetSmoking], () => {
  calcTargetRisk();
});

watch([gender, age], () => {
  updateMinMaxRanges();
  calcRisk();
  calcTargetRisk();
});

// Initialize on component mount
calcRisk();
calcTargetRisk();
</script>

<style scoped>

.container {
  display: flex;
  flex-direction: column;
  font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 12px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.form-section {
  display: flex;
  flex-direction: column;
}

.form-group {
  margin-bottom: 1rem;
}

.chart-section {
  margin-top: 2rem;
}

.material-icons {
  opacity: 0.8;
}

.risk-low {
  background-color: var(--color-green-600);
}
.risk-low-radial {
  background: rgb(76, 208, 125); /* green-600 -> green-400 */
  background: linear-gradient(45deg, rgba(76, 208, 125, 1) 0%, rgba(29, 167, 80, 1) 75%);
  color: #fff;
}

.risk-high-radial {
  background: rgb(242, 208, 102);
  background: linear-gradient(45deg, rgba(242, 208, 102, 1) 0%, rgba(234, 179, 8, 1) 75%);
}

.risk-high {
  background-color: var(--color-yellow-500);
}

.risk-very-high-radial {
  background: rgb(255, 98, 89);
  background: linear-gradient(45deg, rgba(255, 98, 89, 1) 0%, rgba(217, 52, 43, 1) 75%);
  color: #fff;
}

.risk-very-high {
  background-color: var(--color-red-600);
}

.icon-inline {
  display: inline-flex;
  align-items: center;
}

.icon-inline .material-icons {
  vertical-align: middle;
  margin-right: 5px; /* Adjust spacing as needed */
}
</style>
