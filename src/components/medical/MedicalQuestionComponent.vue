<template>
  <div class="medical-calculator-container">
    <div class="medical-question" :class="questionClasses">
      <!-- Question Header -->
      <div class="question-header mb-4">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">
              <span v-if="showNumber" class="question-number">{{ questionNumber }}.</span>
              {{ question }}
            </h3>
            <p v-if="description" class="text-sm text-gray-600 mb-3">
              {{ description }}
            </p>
            <div v-if="required" class="text-xs text-red-600 flex items-center gap-1">
              <i class="pi pi-asterisk text-xs"></i>
              <span>Påkrævet</span>
            </div>
          </div>
          <div v-if="helpText" class="ml-4">
            <Button
              icon="pi pi-question-circle"
              severity="secondary"
              text
              rounded
              size="small"
              @click="showHelp = !showHelp"
              v-tooltip.left="'Vis hjælp'"
            />
          </div>
        </div>
        
        <!-- Help Panel -->
        <div v-if="helpText && showHelp" class="help-panel mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p class="text-sm text-blue-800">{{ helpText }}</p>
        </div>
      </div>

      <!-- Question Content -->
      <div class="question-content">
        <!-- Single Choice (Radio buttons) -->
        <div v-if="type === 'single'" class="space-y-3">
          <div 
            v-for="(option, index) in options" 
            :key="index"
            class="option-item"
          >
            <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                   :class="{ 'border-blue-500 bg-blue-50': modelValue === option.value }">
              <RadioButton
                :value="option.value"
                v-model="internalValue"
                :name="name || `question_${questionNumber}`"
                :disabled="disabled"
                :class="{ 'error': hasError }"
              />
              <div class="flex-1">
                <div class="font-medium text-gray-800">{{ option.label }}</div>
                <div v-if="option.description" class="text-sm text-gray-600 mt-1">
                  {{ option.description }}
                </div>
                <div v-if="option.points !== undefined" class="text-xs text-gray-500 mt-1">
                  {{ option.points }} {{ option.points === 1 ? 'point' : 'points' }}
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Multiple Choice (Checkboxes) -->
        <div v-else-if="type === 'multiple'" class="space-y-3">
          <div 
            v-for="(option, index) in options" 
            :key="index"
            class="option-item"
          >
            <label class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50"
                   :class="{ 'border-blue-500 bg-blue-50': isOptionSelected(option.value) }">
              <Checkbox
                :value="option.value"
                v-model="internalValue"
                :name="name || `question_${questionNumber}`"
                :disabled="disabled"
                :class="{ 'error': hasError }"
              />
              <div class="flex-1">
                <div class="font-medium text-gray-800">{{ option.label }}</div>
                <div v-if="option.description" class="text-sm text-gray-600 mt-1">
                  {{ option.description }}
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Numeric Input -->
        <div v-else-if="type === 'numeric'" class="space-y-3">
          <div class="numeric-input">
            <InputNumber
              v-model="internalValue"
              :min="min"
              :max="max"
              :step="step"
              :disabled="disabled"
              :placeholder="placeholder"
              :class="{ 'p-invalid': hasError }"
              class="w-full"
            />
            <div v-if="unit" class="text-sm text-gray-600 mt-1">
              Enhed: {{ unit }}
            </div>
            <div v-if="min !== undefined || max !== undefined" class="text-xs text-gray-500 mt-1">
              Gyldigt interval: {{ min || '-∞' }} til {{ max || '∞' }}
            </div>
          </div>
        </div>

        <!-- Text Input -->
        <div v-else-if="type === 'text'" class="space-y-3">
          <InputText
            v-model="internalValue"
            :disabled="disabled"
            :placeholder="placeholder"
            :maxlength="maxLength"
            :class="{ 'p-invalid': hasError }"
            class="w-full"
          />
          <div v-if="maxLength" class="text-xs text-gray-500 text-right">
            {{ (internalValue?.length || 0) }}/{{ maxLength }} tegn
          </div>
        </div>

        <!-- Textarea -->
        <div v-else-if="type === 'textarea'" class="space-y-3">
          <Textarea
            v-model="internalValue"
            :disabled="disabled"
            :placeholder="placeholder"
            :maxlength="maxLength"
            :rows="rows || 3"
            :class="{ 'p-invalid': hasError }"
            class="w-full"
            auto-resize
          />
          <div v-if="maxLength" class="text-xs text-gray-500 text-right">
            {{ (internalValue?.length || 0) }}/{{ maxLength }} tegn
          </div>
        </div>

        <!-- Date Input -->
        <div v-else-if="type === 'date'" class="space-y-3">
          <Calendar
            v-model="internalValue"
            :disabled="disabled"
            :placeholder="placeholder"
            :class="{ 'p-invalid': hasError }"
            date-format="dd/mm/yy"
            :show-icon="true"
            :max-date="maxDate"
            :min-date="minDate"
            class="w-full"
          />
        </div>

        <!-- Boolean/Toggle -->
        <div v-else-if="type === 'boolean'" class="space-y-3">
          <div class="flex items-center gap-3">
            <ToggleButton
              v-model="internalValue"
              :disabled="disabled"
              :on-label="booleanLabels?.true || 'Ja'"
              :off-label="booleanLabels?.false || 'Nej'"
              :class="{ 'p-invalid': hasError }"
            />
          </div>
        </div>

        <!-- Slider -->
        <div v-else-if="type === 'slider'" class="space-y-3">
          <div class="slider-container">
            <Slider
              v-model="internalValue"
              :min="min"
              :max="max"
              :step="step"
              :disabled="disabled"
              :class="{ 'p-invalid': hasError }"
              class="w-full"
            />
            <div class="flex justify-between text-xs text-gray-500 mt-2">
              <span>{{ min }}</span>
              <span class="font-medium">{{ internalValue }}</span>
              <span>{{ max }}</span>
            </div>
            <div v-if="sliderLabels" class="flex justify-between text-xs text-gray-600 mt-1">
              <span>{{ sliderLabels.min }}</span>
              <span>{{ sliderLabels.max }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="hasError && errorMessage" class="error-message mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
        <i class="pi pi-exclamation-triangle mr-2"></i>
        {{ errorMessage }}
      </div>

      <!-- Validation Status -->
      <div v-if="showValidationStatus && touched" class="validation-status mt-2 text-xs">
        <span v-if="!hasError" class="text-green-600 flex items-center gap-1">
          <i class="pi pi-check-circle"></i>
          Gyldigt
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import RadioButton from 'primevue/radiobutton'
import Checkbox from 'primevue/checkbox'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Calendar from 'primevue/calendar'
import ToggleButton from 'primevue/togglebutton'
import Slider from 'primevue/slider'
import Button from 'primevue/button'

export interface QuestionOption {
  label: string
  value: any
  description?: string
  points?: number
  disabled?: boolean
}

export interface BooleanLabels {
  true: string
  false: string
}

export interface SliderLabels {
  min: string
  max: string
}

interface Props {
  // Question content
  question: string
  description?: string
  helpText?: string
  questionNumber?: number
  showNumber?: boolean
  
  // Question type and options
  type: 'single' | 'multiple' | 'numeric' | 'text' | 'textarea' | 'date' | 'boolean' | 'slider'
  options?: QuestionOption[]
  
  // Input constraints
  min?: number
  max?: number
  step?: number
  maxLength?: number
  rows?: number
  placeholder?: string
  unit?: string
  
  // Validation
  required?: boolean
  disabled?: boolean
  name?: string
  errorMessage?: string
  touched?: boolean
  showValidationStatus?: boolean
  
  // Styling
  theme?: 'sky' | 'teal' | 'orange'
  
  // Special labels
  booleanLabels?: BooleanLabels
  sliderLabels?: SliderLabels
  
  // Date constraints
  minDate?: Date
  maxDate?: Date
}

interface Emits {
  (e: 'update:modelValue', value: any): void
  (e: 'change', value: any): void
  (e: 'focus'): void
  (e: 'blur'): void
}

const props = withDefaults(defineProps<Props>(), {
  showNumber: true,
  showValidationStatus: true,
  theme: 'teal',
  step: 1
})

const emit = defineEmits<Emits>()

const modelValue = defineModel<any>()

// Internal state
const showHelp = ref(false)
const internalValue = computed({
  get: () => modelValue.value,
  set: (value) => {
    modelValue.value = value
    emit('update:modelValue', value)
    emit('change', value)
  }
})

// Computed properties
const hasError = computed(() => !!props.errorMessage)

const questionClasses = computed(() => ({
  'question-sky': props.theme === 'sky',
  'question-teal': props.theme === 'teal',
  'question-orange': props.theme === 'orange',
  'question-required': props.required,
  'question-disabled': props.disabled,
  'question-error': hasError.value
}))

const isOptionSelected = (value: any) => {
  if (Array.isArray(internalValue.value)) {
    return internalValue.value.includes(value)
  }
  return false
}

// Event handlers
const handleFocus = () => {
  emit('focus')
}

const handleBlur = () => {
  emit('blur')
}

// Initialize multiple choice as array if needed
onMounted(() => {
  if (props.type === 'multiple' && !internalValue.value) {
    internalValue.value = []
  }
})

// Watch for changes to emit events
watch(internalValue, (newValue) => {
  emit('change', newValue)
})
</script>

<style scoped>
.medical-question {
  @apply bg-white rounded-lg border border-gray-200 p-6 shadow-sm;
}

.medical-question.question-sky {
  @apply border-sky-200;
}

.medical-question.question-sky .question-header h3 {
  @apply text-sky-800;
}

.medical-question.question-teal {
  @apply border-teal-200;
}

.medical-question.question-teal .question-header h3 {
  @apply text-teal-800;
}

.medical-question.question-orange {
  @apply border-orange-200;
}

.medical-question.question-orange .question-header h3 {
  @apply text-orange-800;
}

.medical-question.question-required::before {
  content: '';
  @apply absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full;
  position: absolute;
}

.medical-question.question-disabled {
  @apply opacity-60 pointer-events-none;
}

.medical-question.question-error {
  @apply border-red-300 bg-red-50;
}

.question-number {
  @apply inline-block w-8 h-8 bg-gray-100 text-gray-600 rounded-full text-center leading-8 text-sm font-bold mr-3;
}

.question-sky .question-number {
  @apply bg-sky-100 text-sky-700;
}

.question-teal .question-number {
  @apply bg-teal-100 text-teal-700;
}

.question-orange .question-number {
  @apply bg-orange-100 text-orange-700;
}

.option-item:hover {
  @apply transform translate-y-px;
}

.option-item label.border-blue-500 {
  @apply shadow-sm;
}

.help-panel {
  @apply animate-in slide-in-from-top-2 duration-200;
}

.error-message {
  @apply animate-in slide-in-from-top-2 duration-200;
}

.validation-status {
  @apply animate-in fade-in duration-200;
}

/* Custom PrimeVue component styling */
:deep(.p-radiobutton .p-radiobutton-box) {
  @apply border-2;
}

:deep(.p-checkbox .p-checkbox-box) {
  @apply border-2;
}

:deep(.p-inputnumber-input) {
  @apply border-2;
}

:deep(.p-inputtext) {
  @apply border-2;
}

:deep(.p-calendar .p-inputtext) {
  @apply border-2;
}

:deep(.p-togglebutton) {
  @apply border-2;
}

/* Error states */
:deep(.p-invalid) {
  @apply border-red-300 bg-red-50;
}

:deep(.p-invalid:focus) {
  @apply border-red-500 shadow-red-200;
}

/* Theme-specific focus styles */
.question-sky :deep(.p-inputtext:focus),
.question-sky :deep(.p-inputnumber-input:focus) {
  @apply border-sky-500 shadow-sky-200;
}

.question-teal :deep(.p-inputtext:focus),
.question-teal :deep(.p-inputnumber-input:focus) {
  @apply border-teal-500 shadow-teal-200;
}

.question-orange :deep(.p-inputtext:focus),
.question-orange :deep(.p-inputnumber-input:focus) {
  @apply border-orange-500 shadow-orange-200;
}

/* Responsive design */
@media (max-width: 640px) {
  .medical-question {
    @apply p-4;
  }
  
  .question-header h3 {
    @apply text-base;
  }
  
  .option-item label {
    @apply p-2;
  }
}

/* Accessibility enhancements */
.option-item label:focus-within {
  @apply ring-2 ring-blue-500 ring-offset-2;
}

@media (prefers-reduced-motion: reduce) {
  .help-panel,
  .error-message,
  .validation-status {
    @apply animate-none;
  }
  
  .option-item:hover {
    @apply transform-none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .medical-question {
    @apply border-2 border-black;
  }
  
  .option-item label {
    @apply border-2 border-gray-800;
  }
  
  .error-message {
    @apply bg-red-100 border-2 border-red-800;
  }
}
</style>