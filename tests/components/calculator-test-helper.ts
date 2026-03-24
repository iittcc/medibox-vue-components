/**
 * What: Shared test helper for calculator component tests.
 * How: Provides mount utility with all child components stubbed.
 */
import { vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { type Component } from 'vue'
import PrimeVue from 'primevue/config'

// Mock sendDataToServer — all calculators import it
vi.mock('@/assets/sendDataToServer', () => ({
  default: vi.fn().mockResolvedValue({})
}))

const questionStub = {
  name: 'QuestionSingleComponent',
  props: ['question', 'options', 'index', 'isUnanswered', 'name', 'scrollHeight'],
  template: '<div data-testid="question"></div>'
}

const questionComponentStub = {
  name: 'QuestionComponent',
  props: ['question', 'optionsA', 'optionsB', 'index', 'isUnanswered', 'name'],
  template: '<div data-testid="question"></div>'
}

const printStub = {
  props: ['config', 'patient', 'result'],
  template: '<div class="calculator-print-view"></div>'
}

export function mountCalculator(component: Component) {
  return mount(component, {
    global: {
      plugins: [[PrimeVue, { unstyled: true }]],
      stubs: {
        QuestionSingleComponent: questionStub,
        QuestionComponent: questionComponentStub,
        QuestionTabs: {
          props: ['activeTab', 'sections', 'name', 'formSubmitted', 'isUnanswered'],
          emits: ['update:activeTab'],
          template: '<div data-testid="question-tabs"><div v-for="s in sections" :key="s.key"><div v-for="(q, i) in s.questions" :key="i" data-testid="question"></div></div></div>'
        },
        PersonInfo: {
          props: ['name', 'age', 'minAge', 'maxAge', 'gender', 'genderdisplay', 'showCpr', 'cpr', 'child'],
          emits: ['update:name', 'update:age', 'update:gender', 'update:cpr'],
          template: '<div data-testid="person-info"></div>'
        },
        CopyDialog: {
          props: ['title', 'icon', 'severity', 'disabled'],
          template: '<div data-testid="copy-dialog"><slot name="container" /></div>'
        },
        SurfaceCard: {
          props: ['title'],
          template: '<div data-testid="surface-card"><slot name="content" /></div>'
        },
        SurfaceCardItem: {
          template: '<div data-testid="surface-card-item"><slot name="icon" /><slot name="title" /><slot name="content" /></div>'
        },
        Tabs: { props: ['value'], template: '<div data-testid="tabs"><slot /></div>' },
        TabList: { template: '<div data-testid="tab-list"><slot /></div>' },
        Tab: { props: ['value'], template: '<span data-testid="tab"><slot /></span>' },
        TabPanels: { template: '<div><slot /></div>' },
        TabPanel: { props: ['value'], template: '<div><slot /></div>' },
        Button: { template: '<button><slot /></button>', props: ['label', 'icon', 'type', 'disabled'] },
        SecondaryButton: { template: '<button><slot /></button>', props: ['label', 'icon', 'severity', 'disabled'] },
        Message: { template: '<div><slot /></div>', props: ['severity'] },
        ToggleButton: {
          props: ['modelValue', 'onLabel', 'offLabel'],
          emits: ['update:modelValue'],
          template: '<button @click="$emit(\'update:modelValue\', !modelValue)">{{ modelValue ? onLabel : offLabel }}</button>'
        },
        AuditCalculatorPrint: printStub,
        Who5CalculatorPrint: printStub,
        PuqeCalculatorPrint: printStub,
        WestleyCroupCalculatorPrint: printStub,
        GcsCalculatorPrint: printStub,
        IpssCalculatorPrint: printStub,
        LrtiCalculatorPrint: printStub,
        EpdsCalculatorPrint: printStub,
        DanpssCalculatorPrint: printStub,
        ChadsvascCalculatorPrint: printStub,
        CentorCalculatorPrint: printStub,
        WellsDvtCalculatorPrint: printStub,
        WellsPeCalculatorPrint: printStub,
        YbocsCalculatorPrint: printStub,
        AsrsCalculatorPrint: printStub,
        AdhdrsCalculatorPrint: printStub,
        Gds15CalculatorPrint: printStub,
        MdiCalculatorPrint: printStub,
        HamiltonCalculatorPrint: printStub,
        DepressionIcd10CalculatorPrint: printStub
      }
    }
  })
}
