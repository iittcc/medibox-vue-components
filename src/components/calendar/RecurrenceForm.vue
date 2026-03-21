<template>
  <div class="calendar-container">
    <!-- Frequency + Interval row -->
    <div class="flex flex-wrap gap-4 items-end">
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-surface-700 dark:text-surface-200">
          Gentagelse
        </label>
        <Select
          :modelValue="config.frequency"
          @update:modelValue="updateField('frequency', $event)"
          :options="frequencyOptions"
          optionLabel="label"
          optionValue="value"
          class="w-40"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-sm font-medium text-surface-700 dark:text-surface-200">
          Hver
        </label>
        <div class="flex items-center gap-2">
          <InputNumber
            :modelValue="config.interval"
            @update:modelValue="updateField('interval', $event ?? 1)"
            :min="1"
            :max="100"
            showButtons
            class="w-20"
          />
          <span class="text-sm text-surface-600 dark:text-surface-300">
            {{ intervalLabel }}
          </span>
        </div>
      </div>
    </div>

    <!-- Weekly day selection -->
    <div v-if="config.frequency === 'WEEKLY'" class="mt-4">
      <label class="text-sm font-medium text-surface-700 dark:text-surface-200 mb-2 block">
        Gentag på
      </label>
      <div class="flex flex-wrap gap-1">
        <ToggleButton
          v-for="day in weekDays"
          :key="day.value"
          :modelValue="config.days.includes(day.value)"
          @update:modelValue="toggleDay(day.value, $event)"
          :onLabel="day.label"
          :offLabel="day.label"
          class="w-12"
        />
      </div>
    </div>

    <!-- Monthly day selection -->
    <div v-if="config.frequency === 'MONTHLY'" class="mt-4">
      <div class="flex items-center gap-2">
        <span class="text-sm text-surface-600 dark:text-surface-300">Den</span>
        <Select
          :modelValue="config.monthDay"
          @update:modelValue="updateField('monthDay', $event)"
          :options="monthDayOptions"
          optionLabel="label"
          optionValue="value"
          class="w-20"
        />
        <span class="text-sm text-surface-600 dark:text-surface-300">dag i måneden</span>
      </div>
    </div>

    <!-- End condition -->
    <div class="mt-4 flex flex-col gap-3">
      <label class="text-sm font-medium text-surface-700 dark:text-surface-200">
        Slutter
      </label>

      <!-- Never -->
      <div class="flex items-center gap-2">
        <RadioButton
          :modelValue="config.endType"
          @update:modelValue="updateField('endType', $event)"
          inputId="end-never"
          value="never"
        />
        <label for="end-never" class="text-sm text-surface-700 dark:text-surface-200 cursor-pointer">
          Aldrig
        </label>
      </div>

      <!-- On date -->
      <div class="flex items-center gap-2">
        <RadioButton
          :modelValue="config.endType"
          @update:modelValue="updateField('endType', $event)"
          inputId="end-date"
          value="date"
        />
        <label for="end-date" class="text-sm text-surface-700 dark:text-surface-200 cursor-pointer">
          På dato:
        </label>
        <input
          type="date"
          :value="props.untilDate ?? ''"
          @input="onDateInput"
          :disabled="config.endType !== 'date'"
          class="border border-surface-300 dark:border-surface-700 rounded-md px-2 py-1 text-sm
            bg-surface-0 dark:bg-surface-950 text-surface-700 dark:text-surface-0
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      <!-- After count -->
      <div class="flex items-center gap-2">
        <RadioButton
          :modelValue="config.endType"
          @update:modelValue="updateField('endType', $event)"
          inputId="end-count"
          value="count"
        />
        <label for="end-count" class="text-sm text-surface-700 dark:text-surface-200 cursor-pointer">
          Efter
        </label>
        <InputNumber
          :modelValue="config.count ?? 1"
          @update:modelValue="updateField('count', $event ?? 1)"
          :min="1"
          :max="999"
          :disabled="config.endType !== 'count'"
          showButtons
          class="w-24"
        />
        <span class="text-sm text-surface-600 dark:text-surface-300">gentagelser</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Select from '@/volt/Select.vue'
import InputNumber from '@/volt/InputNumber.vue'
import ToggleButton from '@/volt/ToggleButton.vue'
import RadioButton from '@/volt/RadioButton.vue'
import type { RRuleConfig } from '@/composables/useRecurrence'

const props = defineProps<{
  modelValue: RRuleConfig
  untilDate: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: RRuleConfig]
  'update:untilDate': [value: string | null]
}>()

const config = ref<RRuleConfig>({ ...props.modelValue })

watch(
  () => props.modelValue,
  (newVal) => {
    config.value = { ...newVal }
  },
  { deep: true }
)

watch(
  config,
  (newVal) => {
    emit('update:modelValue', { ...newVal })
  },
  { deep: true }
)

const frequencyOptions = [
  { label: 'Dagligt', value: 'DAILY' },
  { label: 'Ugentligt', value: 'WEEKLY' },
  { label: 'Månedligt', value: 'MONTHLY' },
  { label: 'Årligt', value: 'YEARLY' }
]

const weekDays = [
  { label: 'Man', value: 'MO' },
  { label: 'Tir', value: 'TU' },
  { label: 'Ons', value: 'WE' },
  { label: 'Tor', value: 'TH' },
  { label: 'Fre', value: 'FR' },
  { label: 'Lør', value: 'SA' },
  { label: 'Søn', value: 'SU' }
]

const intervalLabels: Record<string, string> = {
  DAILY: 'dag',
  WEEKLY: 'uge',
  MONTHLY: 'måned',
  YEARLY: 'år'
}

const intervalLabel = computed(() => intervalLabels[config.value.frequency] ?? 'uge')

const monthDayOptions = Array.from({ length: 31 }, (_, i) => ({
  label: String(i + 1),
  value: i + 1
}))

function updateField<K extends keyof RRuleConfig>(field: K, value: RRuleConfig[K]) {
  config.value = { ...config.value, [field]: value }
}

function toggleDay(day: string, active: boolean) {
  const days = active
    ? [...config.value.days, day]
    : config.value.days.filter((d) => d !== day)
  config.value = { ...config.value, days }
}

function onDateInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:untilDate', target.value || null)
}
</script>
