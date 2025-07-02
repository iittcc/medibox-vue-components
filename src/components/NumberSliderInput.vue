<template>
  <div class="flex flex-wrap w-56 gap-2">
    <div>
      <InputNumber
        :modelValue="modelValue"
        :min="min"
        :max="max"
        :mode="mode"
        :showButtons="showButtons"
        :step="step"
        :suffix="suffix"
        @update:modelValue="updateValue"
      />
    </div>
    <div>
      <CustomSlider
        v-if="sliderType === 'custom'"
        :modelValue="modelValue"
        :min="min"
        :max="max"
        :normalMin="normalMin"
        :normalMax="normalMax"
        :step="step"
        :tooltip="tooltip"
        @update:modelValue="updateValue"
      />
      <Slider
        v-else
        :modelValue="modelValue"
        :min="min"
        :max="max"
        :step="step"
        class="mt-2 w-48"
        @update:modelValue="updateValue"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import InputNumber from '@/volt/InputNumber.vue';
import Slider from '@/volt/Slider.vue';
import CustomSlider from './CustomSlider.vue';

defineProps({
  modelValue: {
    type: Number,
    required: true
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  mode: {
    type: String,
    default: 'decimal'
  },
  showButtons: {
    type: Boolean,
    default: true
  },
  step: {
    type: Number,
    default: 1
  },
  suffix: {
    type: String,
    default: ''
  },
  normalMin: {
    type: Number,
    required: false,
    default: 0
  },
  normalMax: {
    type: Number,
    required: false,
    default: 100
  },
  tooltip: {
    type: Boolean,
    default: false
  },
  sliderType: {
    type: String,
    default: 'custom',
    validator: (value: string) => ['custom', 'prime'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue']);

const updateValue = (value: number | number[]) => {
  if (Array.isArray(value)) {
    emit('update:modelValue', value[0]);
  } else {
    emit('update:modelValue', value);
  }
};
</script>