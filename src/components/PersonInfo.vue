<template>
    <!-- Layout with CPR: 2-row grid -->
    <div v-if="showCpr"
        class="grid grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto_1fr] gap-x-3 gap-y-4 w-full items-center">
        <!-- Row 1: Navn + CPR -->
        <span for="personName" class="inline-flex items-center gap-1 whitespace-nowrap"><i class="pi pi-user"></i>
            Navn:</span>
        <InputText class="w-full" v-model="localName" placeholder="Indtast navn" @input="updateName" id="personName" />

        <span for="personCpr" class="inline-flex items-center gap-1 whitespace-nowrap"><i class="pi pi-id-card"></i>
            CPR:</span>
        <InputText class="w-full" v-model="localCpr" placeholder="Indtast CPR" @input="updateCpr" id="personCpr" />

        <!-- Row 2: Køn + Alder -->
        <span :style="{ display: genderdisplay }" class="inline-flex items-center gap-1 whitespace-nowrap"><i
                class="pi pi-venus"></i><i class="pi pi-mars"></i> Køn:</span>
        <div :style="{ display: genderdisplay }">
            <SelectButton v-model="localGender" :options="currentGenderOptions" aria-labelledby="basic"
                @update:modelValue="updateGender" />
        </div>

        <span for="personAge" class="inline-flex items-center gap-1 whitespace-nowrap"><i class="pi pi-clock"></i>
            Alder:</span>
        <div class="min-w-0">
            <NumberSliderInput v-model="localAge" :sliderType="props.sliderType" :min="props.minAge" :max="props.maxAge"
                mode="decimal" :showButtons="true" suffix=" År" @update:modelValue="updateAge" id="personAge" />
        </div>
    </div>

    <!-- Layout without CPR: single-row flex (original) -->
    <div v-else class="flex flex-col md:flex-row md:gap-7 gap-5 w-full">
        <div class="md:w-1/3">
            <div class="flex items-center justify-items-start gap-2">
                <i class="pi pi-user"></i> Navn:
                <InputText class="ml-1" v-model="localName" placeholder="Indtast navn" @input="updateName"
                    id="personName" />
            </div>
        </div>
        <div :style="{ display: genderdisplay }" class="md:w-1/3 flex md:justify-items-center">
            <div class="flex items-center justify-start gap-2">
                <i class="pi pi-venus"></i><i class="pi pi-mars"></i> Køn:
                <SelectButton v-model="localGender" :options="currentGenderOptions" aria-labelledby="basic"
                    @update:modelValue="updateGender" class="ml-1 w-48" />
            </div>
        </div>
        <div class="md:w-1/3 flex flex-row gap-3 md:justify-items-end">
            <div class="flex mt-2 gap-2 justify-start"><i class="pi pi-clock mt-1"></i> Alder: </div>
            <NumberSliderInput v-model="localAge" :sliderType="props.sliderType" :min="props.minAge" :max="props.maxAge"
                mode="decimal" :showButtons="true" suffix=" År" @update:modelValue="updateAge" id="personAge" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import InputText from '@/volt/InputText.vue';
import SelectButton from '@/volt/SelectButton.vue';
import NumberSliderInput from './NumberSliderInput.vue';

export interface Props {
    name: string,
    age: number,
    minAge: number,
    maxAge: number,
    gender: string,
    genderdisplay?: string;
    sliderType?: string;
    showCpr?: boolean;
    cpr?: string;
}

const props = withDefaults(defineProps<Props>(), {
    sliderType: "prime",
    showCpr: false,
    cpr: ''
});

const genderOptions = ref(["Mand", "Kvinde"]);
const genderOptionsChild = ref(["Dreng", "Pige"]);

const localName = ref<string>(props.name);
const localCpr = ref<string>(props.cpr);

const localAge = ref<number>(props.age);

// Why: When a parent component programmatically updates the age prop
// (e.g., age SelectButton → patient age sync in ChadsvascCalculator/CentorCalculator),
// localAge must stay in sync. Without this watcher, the UI shows stale values.
watch(() => props.age, (newAge) => {
    if (newAge !== localAge.value) {
        localAge.value = newAge
    }
})

const currentGenderOptions = computed(() => {
    return localAge.value <= 16 ? genderOptionsChild.value : genderOptions.value;
});
const localGender = ref<string>(props.gender);
const emit = defineEmits(['update:name', 'update:age', 'update:gender', 'update:cpr']);

const updateName = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:name', target.value);
};

const updateGender = (value: string) => {
    emit('update:gender', value);
};

const updateAge = (value: number | number[]) => {
    emit('update:age', Array.isArray(value) ? value[0] : value);
};

const updateCpr = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:cpr', target.value);
};

watch(localAge, (newAge) => {
    if (newAge <= 16 && (localGender.value === "Mand" || localGender.value === "Kvinde")) {
        localGender.value = (localGender.value === "Mand") ? genderOptionsChild.value[0] : genderOptionsChild.value[1];
        emit('update:gender', localGender.value);
    } else if (newAge >= 16 && (localGender.value === "Dreng" || localGender.value === "Pige")) {
        localGender.value = (localGender.value === "Dreng") ? genderOptions.value[0] : genderOptions.value[1];
        emit('update:gender', localGender.value);
    }
});
</script>
<style scoped>
html {
    font-size: 12px;
}
</style>