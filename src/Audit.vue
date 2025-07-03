<template>
  <div id="app">
    <AuditScore />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import AuditScore from "./components/AuditScore.vue";

export default defineComponent({
  components: {
    AuditScore
  },
});
</script>
