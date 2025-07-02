<template>
  <div class="p-4 shadow-md rounded-md m-2">
    <div class="flex flex-row w-full justify-between">
      <div
        class="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 w-full"
      >
        <div class="text-3xl font-medium mb-1">{{ title }}</div>
        <div class="inline-flex items-end">
          <div class="text-right">
            <slot name="button"></slot>
          </div>
        </div>
      </div>
    </div>

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
    }
  }
});
</script>
