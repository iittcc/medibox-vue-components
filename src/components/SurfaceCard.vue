<template>
  <div class="p-4 shadow-md rounded-md m-2">
    <div v-if="title" class="flex flex-row w-full justify-between">
      <div
        class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 w-full pl-1"
      >
        <div class="text-2xl font-medium mb-1 text-surface-600">{{ title }}</div>
        <div class="inline-flex items-end">
          <div class="text-right">
            <slot name="button"></slot>
          </div>
        </div>
      </div>
    </div>
    <div v-if="description" class="text-sm text-gray-500 mt-1 pl-1">{{ description }}</div>
    <slot name="content"></slot>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    title: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: false
    }
  }
});
</script>
