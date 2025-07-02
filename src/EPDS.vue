<!-- src/Audit.vue -->
<template>
  <div id="app">
    <EPDSScore />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import EPDSScore from "./components/EPDSScore.vue";

export default defineComponent({
  components: {
    EPDSScore,
  },
});
</script>