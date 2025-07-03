<template>
  <div id="app">
    <PasswordResetComponent :visible="true" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import PasswordResetComponent from "@/components/PasswordResetComponent.vue";

export default defineComponent({
  components: {
    PasswordResetComponent,
  }
});
</script>

<style scoped>
@import "primeflex/primeflex.css";
html {
  font-size: 12px;
}
</style>
