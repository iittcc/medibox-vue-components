<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="Ændring af password"
    :style="{ width: '25rem' }"
    :closable="modalState === 1"
    @hide="onDialogHide"
  >
    <Form
      v-slot="$form"
      :initialValues
      :resolver
      @submit="onFormSubmit"
      class="flex flex-col gap-4 w-full sm:w-60"
    >
      <div class="flex flex-col gap-1">
        <Password
          name="password"
          placeholder="Password"
          toggleMask
          fluid
          promptLabel="Password Styrke"
          weakLabel="Svagt"
          mediumLabel="Mellem"
          strongLabel="Stærkt"
          stringRegex="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{10,})"
        >
          <template #header>
            <div class="font-semibold text-xm mb-4">Indtast nyt password</div>
          </template>
          <template #footer>
            <Divider />
            <ul class="pl-2 pt-2 my-0 leading-normal">
              <li>Minimum 10 tegn</li>
              <li>Minimum ét små bogstav</li>
              <li>Minimum ét stort bogstav</li>
              <li>Minimum ét tal</li>
            </ul>
          </template>
        </Password>
        <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
          <ul class="my-0 px-4 flex flex-col gap-1">
            <li v-for="(error, index) of $form.password.errors" :key="index">
              {{ error.message }}
            </li>
          </ul>
        </Message>
      </div>
      <div class="flex flex-col gap-1">
        <Password
          name="confirm_password"
          placeholder="Gentag Password"
          :feedback="false"
          toggleMask
          fluid
        />
        <Message
          v-if="$form.confirm_password?.invalid"
          severity="error"
          size="small"
          variant="simple"
        >
          {{ $form.confirm_password.error.message }}
        </Message>
      </div>
      <Button type="submit" label="Gem" />
    </Form>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { zodResolver } from '@primevue/forms/resolvers/zod'
import { z } from 'zod'
import { Form } from '@primevue/forms'
import Password from '@/volt/Password.vue'
import Button from '@/volt/Button.vue'
import Message from '@/volt/Message.vue'
import Dialog from '@/volt/Dialog.vue'
import Divider from '@/volt/Divider.vue'

const props = withDefaults(
  defineProps<{
    modalState?: number
  }>(),
  {
    modalState: 1
  }
)

const visible = ref(true)
const initialValues = ref({
  password: '',
  confirm_password: ''
})

/**
 * What: Get CSRF token from page meta tag
 * How: Reads the meta[name="csrf-token"] element set by the PHP template
 * Why: CI3 requires CSRF tokens on all POST requests
 */
function getCsrfToken(): string {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? ''
}

const resolver = zodResolver(
  z
    .object({
      password: z
        .string()
        .min(10, { message: 'Minimum 10 tegn' })
        .refine((value) => /[a-z]/.test(value), {
          message: 'Minimum ét små bogstav'
        })
        .refine((value) => /[A-Z]/.test(value), {
          message: 'Minimum ét stort bogstav'
        })
        .refine((value) => /[0-9]/.test(value), {
          message: 'Minimum ét tal'
        }),
      confirm_password: z.string()
    })
    .refine((values) => values.password === values.confirm_password, {
      message: 'Password og Gentag Password skal være ens',
      path: ['confirm_password']
    })
)

/**
 * What: Handle dialog close/cancel
 * How: When modalState is 1 (first request), POST to cancel endpoint to update flag to 2
 * Why: User gets one chance to defer password change; state 2 prevents future dismissal
 */
const onDialogHide = async () => {
  if (props.modalState === 1) {
    const formData = new URLSearchParams()
    formData.append('csrf_test_name', getCsrfToken())

    await fetch('/credentials/cancelPasswordReset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString()
    })
  }
}

/**
 * What: Submit password change to backend
 * How: POST form data to credentials/changePassword with mapped field names
 * Why: Backend expects new_password/repeat_password; Vue form uses password/confirm_password
 */
const onFormSubmit = async (e: any) => {
  if (e.valid) {
    const formData = new URLSearchParams()
    formData.append('new_password', e.values.password)
    formData.append('repeat_password', e.values.confirm_password)
    formData.append('csrf_test_name', getCsrfToken())

    const response = await fetch('/credentials/changePassword', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: formData.toString()
    })

    if (response.ok) {
      e.reset()
      visible.value = false
    }
  }
}
</script>
