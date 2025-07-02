<template>
    <div class="slider-container">
      <input
        type="range"
        :min="min"
        :max="max"
        :step="step"
        :tooltip="tooltip"
        :value="modelValue"
        @input="onInput"
        @mousedown="showTooltip"
        @mouseup="hideTooltip"
        @mousemove="updateTooltipPosition"
        class="slider"
        :style="sliderStyle"
      />
      <div v-if="isTooltipVisible" class="tooltip" :style="tooltipStyle">{{ modelValue }}</div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';

  interface Props {
    modelValue: number
    min: number
    max: number
    step: number
    tooltip?: boolean
    normalMin: number
    normalMax: number
  }

  const props = withDefaults(defineProps<Props>(), {
    tooltip: true
  })

  const emit = defineEmits<{
    'update:modelValue': [value: number]
  }>()

  const isTooltipVisible = ref(false);
  const tooltipStyle = ref({});

  const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    emit('update:modelValue', Number(target.value));
    updateTooltipPosition(event);
  };

  const updateTooltipPosition = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const sliderRect = target.getBoundingClientRect();
    const containerRect = target.parentElement?.getBoundingClientRect();
    if (!containerRect) return;

    const handlePosition = ((props.modelValue - props.min) / (props.max - props.min)) * sliderRect.width;
    const tooltipWidth = 40; // Adjust this value based on your tooltip width
    tooltipStyle.value = {
      left: `${handlePosition - tooltipWidth / 2}px`,
      top: `${sliderRect.top - containerRect.top - 40}px`, // Adjust this value for correct tooltip positioning
    };
  };

  const showTooltip = (event: MouseEvent) => {
    if (!props.tooltip) return;
    isTooltipVisible.value = true;
    updateTooltipPosition(event);
  };

  const hideTooltip = () => {
    isTooltipVisible.value = false;
  };

  const sliderStyle = computed(() => ({
    '--min': props.min,
    '--max': props.max,
    '--normalMin': props.normalMin,
    '--normalMax': props.normalMax,
    '--value': props.modelValue,
  }));
  </script>
  
  <style scoped>

  .slider-container {
    position: relative;
    width: 100%;
  }
  
  .slider {
    width: 100%;
    height: 3px;
    -webkit-appearance: none;
    appearance: none;
    border: none;
    border-radius: 6px;
    background: linear-gradient(
      to right,
      var(--color-red-600) 0%,
      var(--color-red-300) calc((var(--normalMin) - var(--min)) / (var(--max) - var(--min)) * 100%),
      var(--color-green-600) calc((var(--normalMin) - var(--min)) / (var(--max) - var(--min)) * 100%),
      var(--color-green-600) calc((var(--normalMax) - var(--min)) / (var(--max) - var(--min)) * 100%),
      var(--color-red-300) calc((var(--normalMax) - var(--min)) / (var(--max) - var(--min)) * 100%),
      var(--color-red-600) 100%
    );
  }
  
  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    height: 20px;
    width: 20px;
    background: #fff;
    border: 2px solid var(--color-gray-200);
    border-radius: 50%;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, outline-color 0.2s;
    outline-color: transparent;
    cursor: grab;
    box-shadow: 0 0 0 2px var(--p-surface-ground); /* Add this line */
  }
  
  .slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    box-shadow: 0 0 0 2px var(--p-surface-ground); /* Add this line */
  }

  .tooltip {
  position: absolute;
  width: 40px;
  transform: translateX(-0%);
  padding: 5px 10px;
  background:var(--color-gray-100);
  color: var(--color-gray-700);
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
  pointer-events: none;
}
  </style>
