<!-- src/Danpss.vue -->
<template>
  <div id="app">
    <PUQEScore />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PUQEScore from "./components/PUQEScore.vue";

export default defineComponent({
  components: {
    PUQEScore,
  },
});
</script>

