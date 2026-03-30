<template>
  <div id="app">
    <PasswordResetComponent :modalState="modalState" />
  </div>
</template>

<script setup lang="ts">
import PasswordResetComponent from '@/components/PasswordResetComponent.vue'

declare global {
  interface Window {
    passwordResetConfig?: { modalState: number }
  }
}

const modalState = window.passwordResetConfig?.modalState ?? 1
</script>
