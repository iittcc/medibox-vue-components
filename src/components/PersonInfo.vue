<template>
    <div class="flex flex-col md:flex-row md:gap-7 gap-5 w-full justify-start">
        
        <div>
            <div class="flex items-center justify-start gap-2">
            <i class="pi pi-user"></i> Navn: 
            <InputText class="ml-1"v-model="localName" placeholder="Indtast navn" @input="updateName" id="personName"/>
            </div>
        </div>
        <div :style="{display: genderdisplay}">
            <div class="flex items-center justify-start gap-2">
                <i class="pi pi-venus"></i><i class="pi pi-mars"></i> Køn:
                <SelectButton
                    v-model="localGender"
                    :options="currentGenderOptions"
                    aria-labelledby="basic"
                    @update:modelValue="updateGender"
                    class="ml-1"
                />
            </div>
        </div>        
        <div class="flex flex-row gap-3 ">
            <div class="flex mt-2 gap-2"><i class="pi pi-clock mt-1"></i> Alder: </div>
            
            <NumberSliderInput
                  v-model="localAge"
                  :sliderType= "props.sliderType"
                  :min="props.minAge"
                  :max="props.maxAge"
                  mode="decimal"
                  :showButtons="true"
                  suffix=" År"
                  @update:modelValue="updateAge"
                  id="personAge"
                />
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
}

const props = withDefaults(defineProps<Props>(), {
    sliderType: "prime"
});

const genderOptions = ref(["Mand", "Kvinde"]);
const genderOptionsChild = ref(["Dreng", "Pige"]);

const localName = ref<string>(props.name);

const localAge = ref<number>(props.age);

const currentGenderOptions = computed(() => {
    return localAge.value <= 16 ? genderOptionsChild.value : genderOptions.value;
});
const localGender = ref<string>(props.gender);
const emit = defineEmits(['update:name', 'update:age', 'update:gender']);

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