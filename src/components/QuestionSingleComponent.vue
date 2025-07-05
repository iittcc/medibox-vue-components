<template>
  <div v-if="question.type === 'RadiobuttonVertical'">
    <div :class="['question', { 'border-r-2 border-l-2 border-red-400': isUnanswered }, 'pl-3', 'pt-2', 'w-full', 'pb-0', 'ml-1', 'pr-1', 'mb-0','mt-1', 'rounded-xl']" :style="{ backgroundColor: 'var(' + question.bg + ')' }">
      <div>
        <p class="text-lg font-medium">{{ question.text }}</p>
        <p class="text-base text-gray-500">{{ question.description }}</p>
      </div>
          <div v-for="(option, optionIndex) in options" :key="optionIndex">
            <div class="grid w-full p-1">
              <div class="col">
                <div class="text-left">{{ option.text }}</div>
              </div>
              <div class="col-fixed" style="min-width:150px">
                <div class="text-right items-center">
                  <label :for="`${name}a${index}${optionIndex}`" class="mr-2">{{ (option.value > 0) ? '+ '+option.value : (option.value < 0) ? '- '+Math.abs(option.value) : option.value }}</label>
                  <RadioButton :inputId="`${name}a${index}${optionIndex}`" :value="option.value" v-model="currentAnswer" style="vertical-align: baseline" />
                </div>
              </div>
            </div>
          </div>
    </div>
    <Divider />
  </div>

  <div v-else-if="question.type === 'Listbox'">
      <div :class="['pb-0', { 'border-r-2 border-l-2 border-red-400': isUnanswered }, 'flex', 'pl-0', 'pt-1', 'w-full', 'pb-0', 'flex-col', 'md:flex-row', 'ml-1', 'pr-1', 'mb-0','mt-1', 'rounded-xl', 'justify-between']" :style="{ backgroundColor: 'var(' + question.bg + ')' }">
        <div class="md:w-1/2 w-full p-0">
          <p class="text-base font-bold pl-2">{{ question.text }}</p>
          <p class="text-base text-gray-500 pl-2">{{ question.description }}</p>
        </div>
        <div class="md:w-1/2 w-full h-full p-2 flex-initial" >
          <div class="text-left items-center" >
            <Listbox 
              v-model="currentAnswer" 
              :options="options" 
              optionLabel="text" 
              optionValue="value" 
              class="md:ml-3 h-full" 
              :scrollHeight="scrollHeight"
              :pt="{
                root: 'bg-gray-50 border border-gray-200 rounded-lg shadow-sm',
                list: 'p-2 space-y-1',
                option: 'px-3 py-2 rounded-md cursor-pointer hover:bg-primary-600 hover:text-white active:bg-primary-600 focus:bg-surface-200 hover:p-selected:bg-primary-600 transition-colors p-selected:bg-primary-500 p-selected:text-white',
                optionGroup: 'px-3 py-2 font-semibold text-gray-500'
              }"
            >
              <template #option="slotProps">
                <div class="flex items-center justify-between w-full h-full py-0 my-0" :class="{ 'font-medium': isSelected(slotProps.option.value) }">
                  <span class="">{{ slotProps.option.text }}</span>
                  <span class="text-right">{{ (slotProps.option.value > 0) ? '+ '+slotProps.option.value : (slotProps.option.value < 0) ? '- '+Math.abs(slotProps.option.value) : slotProps.option.value }}</span>
                </div>
              </template>
            </Listbox>
          </div>
        </div>
      </div>
    <Divider />
  </div>

  <div v-else-if="question.type === 'SelectButton'">
      <div :class="['question', { 'border-r-2 border-l-2 border-red-400': isUnanswered }, 'pl-3', 'pt-1', 'w-full', 'grid', 'pb-0', 'flex-col', 'md:flex-row', 'ml-1', 'pr-1', 'mb-0','mt-1', 'rounded-xl']" :style="{ backgroundColor: 'var(' + question.bg + ')' }">
        <div class="col p-0">
          <p class="text-lg font-medium">{{ question.text }}</p>
          <p class="text-base text-gray-500">{{ question.description }}</p>
        </div>
        <div class="col-fixed">
          <div class="text-left items-center">
            <SelectButton v-model="currentAnswer" :options="options" optionLabel="text" optionValue="value" class="ml-3" />
          </div>
        </div>
      </div>
    <Divider />
  </div>

  <div v-else-if="question.type === 'Select'">
      <div :class="['question', { 'border-r-2 border-l-2 border-red-400': isUnanswered }, 'pl-3', 'pt-1', 'w-full', 'grid', 'pb-0', 'flex-col', 'md:flex-row', 'ml-1', 'pr-1', 'mb-0','mt-1', 'rounded-xl']" :style="{ backgroundColor: 'var(' + question.bg + ')' }">
        <div class="col p-0">
          <p class="text-lg font-medium">{{ question.text }}</p>
          <p class="text-base text-gray-500">{{ question.description }}</p>
        </div>
        <div class="col-fixed">
          <div class="text-left items-center">
            <Select v-model="currentAnswer" :options="options" optionLabel="text" optionValue="value" placeholder="Vælg ..." checkmark :highlightOnSelect="false" class="ml-3"  style="min-width:150px"/>
          </div>
        </div>
      </div>
    <Divider />
  </div>


</template>

<script setup lang="ts">
import { computed } from 'vue';
import RadioButton from '@/volt/RadioButton.vue';
import SelectButton from '@/volt/SelectButton.vue';
import Select from '@/volt/Select.vue';
import Divider from '@/volt/Divider.vue';
import Listbox from '@/volt/Listbox.vue';

export interface Option {
  text: string;
  value: number;
}

export interface Question {
  type: string;
  bg?: string;
  text: string;
  description?: string;
  optionsType?: string;
}

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  question: {
    type: Object as () => Question,
    required: true,
  },
  options: {
    type: Array as () => Option[],
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  isUnanswered: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'Default',
  },
  scrollHeight: {
    type: String,
    default: '14rem',
  },
  frameworkAnswer: {
    type: [Number, String],
    default: null,
  },
});

const emit = defineEmits<{
  'update:answer': [value: number | null]
}>()

// Use framework answer as the single source of truth
const currentAnswer = computed({
  get: () => props.frameworkAnswer,
  set: (value) => emit('update:answer', value)
})

const isSelected = (value: number): boolean => {
  return value === props.frameworkAnswer;
};
</script>