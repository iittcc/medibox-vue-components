<template>
        <Button 
          :label="title" 
          :icon 
          :severity 
          :disabled 
          class="rounded-lg" 
          @click="visible = true" 
        />
        <Dialog v-model:visible="visible" class="flex w-2/3" modal :header="title" :footer="info" >
            <div class="medical-calculator-container">
            <div ref="containerContent">
                <slot name="container"></slot>
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Luk" @click="visible = false" 
                pt:root:class="bg-primary-500 hover:enabled:bg-primary-600 active:enabled:bg-primary-700 rounded-lg"
                pt:label:class="text-white text-base"
                pt:icon:class="text-white text-base"
                />
            </div>
        </div>
        </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";

import Dialog from '@/volt/Dialog.vue';
import Button from '@/volt/Button.vue';

const visible = ref(false);
const containerContent = ref<HTMLElement | null>(null);

export interface Props {
    title?: string;
    info?: string;
    icon?:string;
    severity?: string;
    disabled?: boolean;
    class?: string;
}

defineProps<Props>();

const copyTextToClipboard = () => {
    if (containerContent.value) {
        // Get the HTML content of the container
        let htmlContent = containerContent.value.innerHTML;

        // Create a temporary element to parse the HTML
        const tempElement = document.createElement('div');
        tempElement.innerHTML = htmlContent;

        // Function to convert the parsed HTML to text with newlines
        const convertHtmlToText = (element: HTMLElement): string => {
            let text = "";
            element.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE) {
                    text += node.textContent;
                } else if (node.nodeType === Node.ELEMENT_NODE) {
                    if ((node as HTMLElement).tagName === "BR") {
                        text += "\n";
                    } else {
                        text += convertHtmlToText(node as HTMLElement);
                    }
                }
            });
            return text;
        };

        const textToCopy = convertHtmlToText(tempElement);

        navigator.clipboard.writeText(textToCopy).then(() => {
           
        }).catch(err => {
            console.error('Tekst ikke kopieret: ', err);
        });
    }
};

// Watch the 'visible' ref and trigger copy to clipboard when it becomes true
watch(visible, (newValue) => {
    if (newValue) {
        nextTick(() => {
            copyTextToClipboard();
        });
    }
});
</script>

<style scoped>

</style>
