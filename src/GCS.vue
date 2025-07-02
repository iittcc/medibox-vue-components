<!-- src/Danpss.vue -->
<template>
  <div id="app">
    <GCSScore />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import GCSScore from "./components/GCSScore.vue";

export default defineComponent({
  components: {
    GCSScore,
  },
});
</script>