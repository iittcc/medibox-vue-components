<template>
  <div class="medical-calculator-container">
    <div class="w-full max-w-[800px] mx-auto px-4">
      <SurfaceCard title="Medicin - dosering til børn">
        <template #content>
          
          <form>
            <div class="flex flex-col p-4 bg-primary-100 rounded-lg mb-4">
              <span class="font-bold text-xl">Medicin</span>
            <div class="space-y-4">
                <!-- Indholdsstof -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 items-center">
                  <label class="">Indholdsstof</label>
                  <div class="md:col-span-1">
                    <Select
                      v-model="selectedIndholdsstof"
                      :options="indholdsstofOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Vælg indholdsstof"
                      class="w-full"
                    />
                  </div>
                </div>

                <!-- Dispensering -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 items-center">
                  <label class="">Dispensering</label>
                  <div class="md:col-span-1">
                    <Select
                      v-model="selectedDispensering"
                      :options="dispenseringOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Vælg dispensering"
                      class="w-full"
                    />
                  </div>
                </div>

                <!-- Præparat -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 items-center">
                  <label class="">Præparat</label>
                  <div class="md:col-span-1">
                    <Select
                      v-model="selectedPraeparat"
                      :options="praeparatOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Vælg præparat"
                      class="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col p-4 bg-primary-50 rounded-lg">
              <span class="font-bold text-xl">Dosering</span>
              <!-- Dosering -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
            
                  <div class="text-sm text-gray-600 mt-2 justify-start">
                    <span class="font-bold">Anbefalet: </span>
                    <span class="font-semibold">{{ currentDetails?.anbefalettext || '' }}</span>
                  </div>
                  <div class="text-sm text-gray-600 flex items-center gap-2 mt-1 justify-start">
                    <span class="font-bold">Doseringsforslag:</span>
                    <Select
                      v-model="selectedDoseringForslag"
                      :options="doseringForslagOptions"
                      optionLabel="label"
                      optionValue="value"
                      placeholder="Vælg forslag"
                      class="w-full mt-1"
                      @change="onDoseringForslagChange"
                    />
                  </div>
                </div>
                <div class="md:col-span-1">
                  <NumberSliderInput
                    v-model="dosering"
                    :min="currentDetails?.anbefaletmin || 0"
                    :max="currentDetails?.anbefaletmax || 100"
                    :step="1"
                    :suffix="' ' + (currentDetails?.stofenhed || '')"
                    :showButtons="true"
                    :normalMin="currentDetails?.anbefaletmin || 0"
                    :normalMax="currentDetails?.anbefaletmax || 100"
                    :tooltip="true"
                    sliderType="prime"
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-col p-4 bg-primary-100 rounded-lg mt-4">
              <span class="font-bold text-xl">Vægt</span>
              <!-- Vægt -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <div class="text-sm text-gray-600 mt-1">Kg = (alder i år * 2) + 8</div>
                </div>
                <div class="md:col-span-1">
                  <NumberSliderInput
                    v-model="vaegt"
                    :min="0.3"
                    :max="40"
                    :step="0.1"
                    suffix=" kg"
                    :showButtons="true"
                    :normalMin="5"
                    :normalMax="30"
                    :tooltip="true"
                    sliderType="prime"
                  />
                </div>
              </div>
            </div>

            <!-- Resultater -->
             <div class="flex flex-col p-4 border-1 border-primary-100 rounded-lg mt-4 justify-center items-center ">
              <div class="flex gap-4 items-center mt-2 text-xl flex-col">
                <div>{{ currentPraeparat?.text }}</div>
                
                <div> {{ amountPerDose }} {{ currentPraeparat?.dispenseringsenhed || '' }}

                  <InputNumber
                    v-model="fordeltPaaVal"
                    :allowEmpty="false"
                    :min="1"
                    :max="10"
                    :showButtons="false"
                    pt:root:class="w-14"
                    pt:pcInputText:root:class="w-full px-2 h-8 border-1 border-gray-300 rounded-md text-center bg-surface-0 dark:bg-surface-950 text-surface-700 dark:text-surface-0 hover:border-surface-400 dark:hover:border-surface-600 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-colors duration-200"
                  />
                  <span> x dagligt i </span>

                  <InputNumber
                    v-model="antalDage"
                    :allowEmpty="false"
                    :min="1"
                    :max="365"
                    :showButtons="false"
                    pt:root:class="w-14"
                    pt:pcInputText:root:class="w-full px-2 h-8 border-1 border-gray-300 rounded-md text-center bg-surface-0 dark:bg-surface-950 text-surface-700 dark:text-surface-0 hover:border-surface-400 dark:hover:border-surface-600 focus:border-primary-500 dark:focus:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-colors duration-200"
                  /> 
                  <span> dage</span>
                  
                </div>
                <Message v-if="warning" severity="warn" class="mt-2" :closable="false">
                    <small>{{ warning }}</small>
                  </Message>
                <div class="text-base text-gray-600">Anbefalet: Fordelt på {{ currentDetails?.fordeltpaatext || '' }} doser. {{antalPrDogn}} {{ currentPraeparat?.dispenseringsenhed || '' }} pr. døgn i {{ antalDage }} dage = {{ antalIAlt }} {{ currentPraeparat?.dispenseringsenhed || '' }}</div>
              </div>
            </div>
            <!-- Buttons -->
            <div class="flex justify-end mt-6 gap-3">
              <CopyDialog
                title="Kopier til Clipboard"
                icon="pi pi-clipboard"
                class="rounded-lg"
                :disabled="!showResults"
              >
                <template #container>
                  <b>Medicin - dosering til børn</b>
                  <br /><br />
                  Indholdsstof: {{ getCurrentIndholdsstof()?.indholdsstoftext || '' }}<br />
                  Dispensering: {{ getCurrentDispensering()?.dispenseringstext || '' }}<br />
                  Præparat: {{ currentPraeparat?.text || '' }}<br /><br />
                  Dosering: {{ dosering }} {{ currentDetails?.stofenhed || '' }}<br />
                  Vægt: {{ vaegt }} kg<br /><br />
                  Antal {{ currentPraeparat?.dispenseringsenhed || '' }} pr. døgn: {{ antalPrDogn }}<br />
                  Fordelt på {{ currentDetails?.fordeltpaatext || '' }} doser<br /><br />
                  Ved {{ amountPerDose }} {{ currentPraeparat?.dispenseringsenhed || '' }} {{ fordeltPaaVal }} gange dagligt i {{ antalDage }} dage:<br />
                  Antal {{ currentPraeparat?.dispenseringsenhed || '' }} i alt: {{ antalIAlt }}
                  <span v-if="warning"><br /><br />{{ warning }}</span>
                </template>
              </CopyDialog>
              <SecondaryButton
                severity="secondary"
                label="Nulstil"
                icon="pi pi-sync"
                class="rounded-lg"
                @click="resetForm"
              />
            </div>
          </form>
        </template>
      </SurfaceCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
// import Button from '@/volt/Button.vue'
import SecondaryButton from '@/volt/SecondaryButton.vue'
import Select from '@/volt/Select.vue'
import InputNumber from '@/volt/InputNumber.vue'
import Message from '@/volt/Message.vue'
import SurfaceCard from './SurfaceCard.vue'
import NumberSliderInput from './NumberSliderInput.vue'
import CopyDialog from './CopyDialog.vue'
import {
  mainarray,
  dispenseringsarray,
  praeparatarray,
  detaljerarray,
  calculateDosage,
  // type Indholdsstof,
  // type Dispensering,
  type Praeparat as _Praeparat,
  type Detaljer as _Detaljer
  // type Forslag
} from '@/assets/medicinBoern'
import sendDataToServer from '@/assets/sendDataToServer'

const apiUrlServer = import.meta.env.VITE_API_URL
if (!apiUrlServer) {
  throw new Error('VITE_API_URL environment variable is not defined')
}
const apiUrl = `${apiUrlServer}/index.php/callback/LogCB/log`
const keyUrl = `${apiUrlServer}/index.php/KeyServer/getPublicKey`

// Form state
const selectedIndholdsstof = ref<string>(mainarray[0].indholdsstofnavn)
const selectedDispensering = ref<string>('')
const selectedPraeparat = ref<number>(0)
const selectedDoseringForslag = ref<number>(0)
const dosering = ref<number>(0)
const vaegt = ref<number>(16)
const fordeltPaaVal = ref<number>(3)
const antalDage = ref<number>(7)

// Results state
const showResults = ref(false)
const antalPrDogn = ref<number>(0)
const antalIAlt = ref<number>(0)
const amountPerDose = ref<number>(0)
const warning = ref<string>('')

// Computed options
const indholdsstofOptions = computed(() =>
  mainarray.map((item) => ({
    label: item.indholdsstoftext,
    value: item.indholdsstofnavn
  }))
)

const dispenseringOptions = computed(() => {
  const current = mainarray.find((item) => item.indholdsstofnavn === selectedIndholdsstof.value)
  if (!current) return []
  
  const dispArray = dispenseringsarray[current.dispenseringsarray] || []
  return dispArray.map((item) => ({
    label: item.dispenseringstext,
    value: item.dispenseringsnavn
  }))
})

const praeparatOptions = computed(() => {
  if (!selectedIndholdsstof.value || !selectedDispensering.value) return []
  
  const key = `${selectedIndholdsstof.value}_${selectedDispensering.value}`
  const praepArray = praeparatarray[key] || []
  return praepArray.map((item) => ({
    label: item.text,
    value: item.index
  }))
})

const doseringForslagOptions = computed(() => {
  if (!currentDetails.value) return []
  
  return currentDetails.value.forslag.map((item) => ({
    label: item.text,
    value: item.index
  }))
})

// Current selections
const currentPraeparat = computed(() => {
  if (!selectedIndholdsstof.value || !selectedDispensering.value) return null
  
  const key = `${selectedIndholdsstof.value}_${selectedDispensering.value}`
  const praepArray = praeparatarray[key] || []
  return praepArray[selectedPraeparat.value] || null
})

const currentDetails = computed(() => {
  if (!currentPraeparat.value) return null
  return detaljerarray[currentPraeparat.value.detaljer] || null
})

// Helper functions
const getCurrentIndholdsstof = () => {
  return mainarray.find((item) => item.indholdsstofnavn === selectedIndholdsstof.value)
}

const getCurrentDispensering = () => {
  const current = mainarray.find((item) => item.indholdsstofnavn === selectedIndholdsstof.value)
  if (!current) return null
  
  const dispArray = dispenseringsarray[current.dispenseringsarray] || []
  return dispArray.find((item) => item.dispenseringsnavn === selectedDispensering.value)
}

// Watchers
watch(selectedIndholdsstof, () => {
  // Reset dependent fields
  const current = mainarray.find((item) => item.indholdsstofnavn === selectedIndholdsstof.value)
  if (current) {
    const dispArray = dispenseringsarray[current.dispenseringsarray] || []
    if (dispArray.length > 0) {
      // Try to keep same dispensering if available
      const hasCurrentDispensering = dispArray.some(
        (d) => d.dispenseringsnavn === selectedDispensering.value
      )
      if (!hasCurrentDispensering) {
        selectedDispensering.value = dispArray[0].dispenseringsnavn
      }
    }
  }
})

watch(selectedDispensering, () => {
  // Reset praeparat when dispensering changes
  selectedPraeparat.value = 0
})

watch(currentDetails, (newDetails) => {
  if (newDetails) {
    // Set default values from details
    if (newDetails.forslag.length > 0) {
      selectedDoseringForslag.value = 0
      dosering.value = newDetails.forslag[0].value
      if (newDetails.forslag[0].dage) {
        antalDage.value = newDetails.forslag[0].dage
      }
    }
    fordeltPaaVal.value = newDetails.fordeltpaaval
  }
})

// Event handlers
const onDoseringForslagChange = () => {
  if (!currentDetails.value) return
  
  const forslag = currentDetails.value.forslag[selectedDoseringForslag.value]
  if (forslag) {
    dosering.value = forslag.value
    if (forslag.dage) {
      antalDage.value = forslag.dage
    }
  }
}

const calculate = async () => {
  if (!dosering.value || !vaegt.value || !currentPraeparat.value || !currentDetails.value) {
    showResults.value = true
    return
  }

  const result = calculateDosage(
    dosering.value,
    vaegt.value,
    currentPraeparat.value,
    currentDetails.value,
    fordeltPaaVal.value,
    antalDage.value
  )

  antalPrDogn.value = result.dailyAmount
  antalIAlt.value = Math.ceil(result.totalAmount)
  amountPerDose.value = result.amountPerDose
  warning.value = result.warning
  showResults.value = true
  
  // Send data to server
  const data = {
    type: 'medicinBoern',
    indholdsstof: getCurrentIndholdsstof()?.indholdsstoftext || '',
    dispensering: getCurrentDispensering()?.dispenseringstext || '',
    praeparat: currentPraeparat.value?.text || '',
    dosering: dosering.value,
    doseringEnhed: currentDetails.value?.stofenhed || '',
    vaegt: vaegt.value,
    antalPrDogn: antalPrDogn.value,
    antalIAlt: antalIAlt.value,
    fordeltPaa: fordeltPaaVal.value,
    antalDage: antalDage.value,
    warning: warning.value
  }
  
  try {
    await sendDataToServer(apiUrl, keyUrl, data)
  } catch (error) {
    console.error('Failed to send data:', error)
  }
}

const resetForm = () => {
  selectedIndholdsstof.value = mainarray[0].indholdsstofnavn
  vaegt.value = 16
  
  // Reset dosering to current suggestion value
  if (currentDetails.value && currentDetails.value.forslag.length > 0) {
    const forslag = currentDetails.value.forslag[selectedDoseringForslag.value]
    if (forslag) {
      dosering.value = forslag.value
    }
  } else {
    dosering.value = 0
  }
  
  showResults.value = true
  antalPrDogn.value = 0
  antalIAlt.value = 0
  warning.value = ''
  
  // Calculate with the reset values
  calculate()
}

// Initialize dispensering
watch(
  selectedIndholdsstof,
  () => {
    const current = mainarray.find((item) => item.indholdsstofnavn === selectedIndholdsstof.value)
    if (current) {
      const dispArray = dispenseringsarray[current.dispenseringsarray] || []
      if (dispArray.length > 0 && !selectedDispensering.value) {
        selectedDispensering.value = dispArray[0].dispenseringsnavn
      }
    }
  },
  { immediate: true }
)

// Auto-calculate on input changes
watch([dosering, vaegt, fordeltPaaVal, antalDage], () => {
  calculate()
})

// Also calculate when preparation or details change
watch([selectedPraeparat, currentDetails], () => {
  calculate()
})
</script>