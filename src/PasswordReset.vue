<!-- src/PasswordReset.vue -->
<template>
  <div id="password-reset" class="medical-calculator-container">
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
    // Initialize with the correct value immediately if available
    const modalState = ref(window.passwordResetConfig?.modalState || 0);

    onMounted(() => {
      // Update if window config is available (fallback for cases where it wasn't set initially)
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
html {
  font-size: 12px;
}
</style>
