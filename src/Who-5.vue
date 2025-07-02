<!-- src/Audit.vue -->
<template>
  <div id="app">
    <Who5Score />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Who5Score from "./components/Who-5Score.vue";

export default defineComponent({
  components: {
    Who5Score,
  },
});
</script>

