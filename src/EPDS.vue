<!-- src/EPDS.vue -->
<template>
  <div id="app">
    <EPDSScore />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import EPDSScore from "./components/EPDSScore.vue";
import Toast from "@/volt/Toast.vue";
</script>