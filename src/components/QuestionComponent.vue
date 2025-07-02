<template>
  <table :class="['question', { unanswered: isUnanswered }, 'p-1', 'w-full', 'rounded-lg', 'mb-2', 'table-fixed']" :style="{ backgroundColor: 'var('+question.bg+')' }">
    <tbody >
    <tr >
      <td class="align-top"><b>{{ question.textA }}</b></td>
      <td class="align-top"><b>{{ question.textB }}</b></td>
    </tr>
    <tr>
      <td><div v-for="(option, optionIndex) in optionsA" :key="optionIndex">
          <div class="flex flex-row w-full p-1">
            <div class="w-2/3 ">
                <div class="text-left">{{ option.text  }}</div>
            </div>
            <div class="w-1/4 flex justify-end" >
                <div class="flex flex-row gap-3 justify-end items-center">
                  
                  <label :for="`${name}a${index}${optionIndex}`" >{{ optionIndex }}</label>
                  <RadioButton :inputId="`${name}a${index}${optionIndex}`" :value="option.value" v-model="question.answerA"/>
                </div>
            </div>
          </div>
        </div>
        </td>
      <td >
        <div v-for="(option, optionIndex) in optionsB" :key="optionIndex">
          <div class="flex flex-row w-full p-1">
            <div class="w-2/3">
                <div class="text-left">{{ option.text  }}</div>
            </div>
            <div class="w-1/4 flex justify-end" >
                <div class="flex flex-row gap-3 justify-end items-center">
                  <label :for="`${name}b${index}${optionIndex}`" >{{ optionIndex }}</label>
                  <RadioButton :inputId="`${name}b${index}${optionIndex}`" :value="option.value" v-model="question.answerB" />
                </div>
              </div>
            </div>
        </div>
      </td>
    </tr>
  </tbody>
  </table>
</template>

<script setup lang="ts">
import RadioButton from '@/volt/RadioButton.vue';

export type Option = {
  text: string;
  value: number;
}

export interface QuestionProp {
  bg: string;
  textA: string;
  textB: string;
  optionsAType: string;
  answerA: number | null;
  answerB: number | null;
}

defineProps<{
  name: string;
  question: QuestionProp;
  optionsA: Option[];
  optionsB: Option[];
  index: number;
  isUnanswered?: boolean;
}>();
</script>


<style scoped>


table tr td {
  padding: 0.5rem 0.75rem;
}

</style>
