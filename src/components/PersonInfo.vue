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
                    optionLabel="label"
                    optionValue="value"
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

// Gender values for internal use (standard types)
const genderOptions = ref(["male", "female"]);
const genderOptionsChild = ref(["male", "female"]);

// Display mapping for Danish UI
const genderDisplayMap = {
    "male": "Mand",
    "female": "Kvinde"
};

const childGenderDisplayMap = {
    "male": "Dreng", 
    "female": "Pige"
};

const localName = ref<string>(props.name);

const localAge = ref<number>(props.age);

// Display options for SelectButton (Danish labels)
const currentGenderOptions = computed(() => {
    if (localAge.value <= 16) {
        return genderOptionsChild.value.map(value => ({
            label: childGenderDisplayMap[value as keyof typeof childGenderDisplayMap],
            value: value
        }));
    } else {
        return genderOptions.value.map(value => ({
            label: genderDisplayMap[value as keyof typeof genderDisplayMap],
            value: value
        }));
    }
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

</script>
<style scoped>
html {
    font-size: 12px;
}
</style>