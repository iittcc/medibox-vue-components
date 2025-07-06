<template>
  <div id="app">
    <PasswordResetComponent :visible="true" />
  </div>
</template>

<script setup lang="ts">
import PasswordResetComponent from "@/components/PasswordResetComponent.vue";
</script> 

<style scoped>
@import "primeflex/primeflex.css";
html {
  font-size: 12px;
}
</style>
