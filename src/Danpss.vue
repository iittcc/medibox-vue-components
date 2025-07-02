<!-- src/Danpss.vue -->
<template>
  <div id="app">
    <DanpssForm />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import DanpssForm from "./components/DanpssForm.vue";

export default defineComponent({
  components: {
    DanpssForm,
  },
});
</script>
