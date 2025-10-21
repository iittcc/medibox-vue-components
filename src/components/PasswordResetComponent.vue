<template>
    <Dialog v-model:visible="visible" modal header="Password Skal Ændres" :style="{ width: '30rem' }" :closable="canCancel">
        <div class="medical-calculator-container">
            <p class="mb-4">Administratoren har anmodet om at du ændrer dit password.</p>

            <Form v-slot="$form" :initialValues :resolver @submit="onFormSubmit" class="flex flex-col gap-4 w-full">
                <div class="flex flex-col gap-1">
                    <Password name="password" placeholder="Nyt Password" toggleMask fluid
                        promptLabel="Password Styrke" weakLabel="Svagt" mediumLabel="Mellem" strongLabel="Stærkt">
                        <template #header>
                            <div class="font-semibold text-xm mb-4">Indtast nyt password</div>
                        </template>
                        <template #footer>
                            <Divider />
                            <ul class="pl-2 pt-2 my-0 leading-normal">
                                <li>Minimum 8 tegn</li>
                                <li>Minimum ét små bogstav</li>
                                <li>Minimum ét stort bogstav</li>
                                <li>Minimum ét tal</li>
                                <li>Minimum ét specialtegn</li>
                            </ul>
                        </template>
                    </Password>
                    <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple">
                        <ul class="my-0 px-4 flex flex-col gap-1">
                            <li v-for="(error, index) of $form.password.errors" :key="index">{{ error.message }}</li>
                        </ul>
                    </Message>
                </div>

                <div class="flex flex-col gap-1">
                    <Password name="confirm_password" placeholder="Gentag Password" :feedback="false" toggleMask fluid />
                    <Message v-if="$form.confirm_password?.invalid" severity="error" size="small" variant="simple">
                        {{ $form.confirm_password.error.message }}
                    </Message>
                </div>

                <Message v-if="errorMessage" severity="error" size="small">{{ errorMessage }}</Message>
                <Message v-if="successMessage" severity="success" size="small">{{ successMessage }}</Message>

                <div class="flex justify-end gap-2">
                    <Button v-if="canCancel" type="button" label="Annuller" severity="secondary" @click="handleCancel" />
                    <Button type="submit" label="Ændre Password" :loading="isSubmitting" />
                </div>
            </Form>
        </div>
    </Dialog>
</template>

<script lang="ts">
import { ref, computed, watch } from "vue";
import { zodResolver } from '@primevue/forms/resolvers/zod';
import { z } from 'zod';
import { Form } from '@primevue/forms';
import Password from '@/volt/Password.vue';
import Button from '@/volt/Button.vue';
import Message from '@/volt/Message.vue';
import Dialog from '@/volt/Dialog.vue';
import Divider from '@/volt/Divider.vue';

export default {
    props: {
        modalState: {
            type: Number,
            required: true,
            validator: (value: number) => [0, 1, 2].includes(value)
        }
    },
    components: {
        Form
    },
    setup(props) {
        const visible = ref(props.modalState > 0);
        const isSubmitting = ref(false);
        const errorMessage = ref('');
        const successMessage = ref('');

        // Watch for changes in modalState prop
        watch(() => props.modalState, (newValue) => {
            visible.value = newValue > 0;
        }, { immediate: true });

        // Can cancel only if modalState is 1 (first time)
        const canCancel = computed(() => props.modalState === 1);

        const initialValues = ref({
            password: '',
            confirm_password: ''
        });

        // Password validation schema matching PHP backend requirements
        const resolver = zodResolver(
            z.object({
                password: z
                    .string()
                    .min(8, { message: 'Minimum 8 tegn' })
                    .refine((value) => /[a-z]/.test(value), {
                        message: 'Minimum ét små bogstav'
                    })
                    .refine((value) => /[A-Z]/.test(value), {
                        message: 'Minimum ét stort bogstav'
                    })
                    .refine((value) => /[0-9]/.test(value), {
                        message: 'Minimum ét tal'
                    })
                    .refine((value) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value), {
                        message: 'Minimum ét specialtegn'
                    }),
                confirm_password: z.string()
            }).refine((values) => values.password === values.confirm_password, {
                message: "Password og Gentag Password skal være ens",
                path: ["confirm_password"],
            })
        );

        const onFormSubmit = async (e: any) => {
            if (e.valid) {
                isSubmitting.value = true;
                errorMessage.value = '';
                successMessage.value = '';

                try {
                    // Create form data to match existing Credentials controller expectations
                    const formData = new FormData();
                    formData.append('old_password', ''); // Not required for admin-requested reset
                    formData.append('new_password', e.values.password);
                    formData.append('repeat_password', e.values.confirm_password);

                    const response = await fetch('/credentials/changePassword', {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok || response.redirected) {
                        successMessage.value = 'Password ændret med succes!';
                        setTimeout(() => {
                            window.location.reload();
                        }, 1500);
                    } else {
                        errorMessage.value = 'Der opstod en fejl ved ændring af password.';
                    }
                } catch (error) {
                    errorMessage.value = 'Netværksfejl. Prøv igen senere.';
                } finally {
                    isSubmitting.value = false;
                }
            }
        };

        const handleCancel = async () => {
            try {
                const response = await fetch('/credentials/cancelPasswordReset', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    // Reload page to update modal state
                    window.location.reload();
                } else {
                    errorMessage.value = 'Kunne ikke annullere anmodningen.';
                }
            } catch (error) {
                errorMessage.value = 'Netværksfejl. Prøv igen senere.';
            }
        };

        return {
            initialValues,
            resolver,
            onFormSubmit,
            handleCancel,
            visible,
            canCancel,
            isSubmitting,
            errorMessage,
            successMessage
        }
    }
}
</script>
