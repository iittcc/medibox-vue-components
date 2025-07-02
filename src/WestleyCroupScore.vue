<!-- src/Danpss.vue -->
<template>
  <div id="app">
    <WestleyCroupScore />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import WestleyCroupScore from "./components/WestleyCroupScore.vue";

export default defineComponent({
  components: {
    WestleyCroupScore,
  },
});
</script>

