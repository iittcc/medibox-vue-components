<template>
  <Tabs :value="activeTab" @update:value="$emit('update:activeTab', $event)"
    :pt="{ root: 'bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-0 pt-[0.875rem] pb-0 px-[1.125rem] outline-none' }"
    :ptOptions="{ mergeProps: true }">
    <TabList>
      <Tab v-for="section in sections" :key="section.key" :value="section.key">{{ section.title }}</Tab>
    </TabList>
    <TabPanels
      :pt="{ root: 'bg-surface-0 dark:bg-surface-900 text-surface-700 dark:text-surface-0 pt-[0.875rem] pb-0 px-[1.125rem] outline-none' }"
      :ptOptions="{ mergeProps: true }">
      <TabPanel v-for="section in sections" :key="section.key" :value="section.key">
        <slot :name="'before-' + section.key" />
        <QuestionSingleComponent
          v-for="(question, qIdx) in section.questions" :key="section.startIndex + qIdx"
          :name="name" :question="question" :options="question.options" :index="section.startIndex + qIdx"
          :is-unanswered="formSubmitted && isUnanswered(question)"
        />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script setup lang="ts">
import Tabs from '@/volt/Tabs.vue'
import TabList from '@/volt/TabList.vue'
import Tab from '@/volt/Tab.vue'
import TabPanels from '@/volt/TabPanels.vue'
import TabPanel from '@/volt/TabPanel.vue'
import QuestionSingleComponent from './QuestionSingleComponent.vue'
import type { Question } from '../scoring/types'

interface Section {
  key: string
  title: string
  startIndex: number
  questions: Question[]
}

defineProps<{
  activeTab: string
  sections: Section[]
  name: string
  formSubmitted: boolean
  isUnanswered: (question: Question) => boolean
}>()

defineEmits<{
  'update:activeTab': [value: string]
}>()
</script>
