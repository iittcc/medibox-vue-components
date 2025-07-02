<!-- src/Danpss.vue -->
<template>
  <div id="app">
    <LRTIScore />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import LRTIScore from "./components/LRTIScore.vue";

export default defineComponent({
  components: {
    LRTIScore,
  },
});
</script>
