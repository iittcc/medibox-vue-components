<!-- src/Audit.vue -->
<template>
  <div id="app">
    <IPSS />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import IPSS from "./components/IPSSScore.vue";

export default defineComponent({
  components: {
    IPSS,
  },
});
</script>
