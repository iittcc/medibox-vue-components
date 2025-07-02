
<!-- src/App.vue -->
<template>
  <div id="app">
    <RiskAssessment />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RiskAssessment from './components/RiskAssessment.vue';

export default defineComponent({
  components: {
    RiskAssessment
  }
});
</script>