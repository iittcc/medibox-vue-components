<!-- src/PasswordReset.vue -->
<template>
  <div id="password-reset-app" class="medical-calculator-container">
    <PasswordResetComponent :modalState="modalState" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import PasswordResetComponent from "@/components/PasswordResetComponent.vue";

// Declare window interface for TypeScript
declare global {
  interface Window {
    passwordResetConfig?: {
      modalState: number;
    };
  }
}

export default defineComponent({
  components: {
    PasswordResetComponent,
  },
  setup() {
    const modalState = ref(0);

    onMounted(() => {
      // Read configuration from window object set by PHP template
      if (window.passwordResetConfig) {
        modalState.value = window.passwordResetConfig.modalState;
      }
    });

    return {
      modalState
    };
  }
});
</script>

<style scoped>
@import "primeflex/primeflex.css";
html {
  font-size: 12px;
}
</style>
