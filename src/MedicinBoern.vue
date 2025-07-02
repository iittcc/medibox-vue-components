<template>
  <div id="app">
    <MedicinBoernScore />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import MedicinBoernScore from './components/MedicinBoernScore.vue'

export default defineComponent({
  components: {
    MedicinBoernScore
  }
})
</script>