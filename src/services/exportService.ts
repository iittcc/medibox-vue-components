import type { CalculationResult, CalculatorResponses, PatientData } from '@/types/calculatorTypes'
import type { CalculatorConfig } from '@/composables/useCalculatorFramework'

// Dependency injection interface
export interface ExportDependencies {
  useLogging: () => {
    logUserAction: (action: string, details: any, calculatorType?: string) => void
  }
}

export interface ExportData {
  calculator: CalculatorConfig
  patient: Partial<PatientData>
  responses: Partial<CalculatorResponses>
  result: CalculationResult
  metadata: {
    sessionId: string
    duration: number
    exportTime: string
  }
}

export type ExportFormat = 'json' | 'text' | 'pdf' | 'csv'

export interface ExportPlugin {
  format: ExportFormat
  name: string
  description: string
  export: (data: ExportData) => string | Promise<string>
}

export const useExportService = (dependencies: ExportDependencies) => {
  const { useLogging } = dependencies
  const { logUserAction } = useLogging()

  // Built-in export plugins
  const builtInPlugins: ExportPlugin[] = [
    {
      format: 'json',
      name: 'JSON Export',
      description: 'Export results as JSON format',
      export: (data: ExportData) => JSON.stringify(data, null, 2)
    },
    {
      format: 'text',
      name: 'Text Export',
      description: 'Export results as plain text',
      export: (data: ExportData) => formatResultsAsText(data)
    }
  ]

  // Plugin registry
  const plugins = new Map<ExportFormat, ExportPlugin>()
  
  // Register built-in plugins
  builtInPlugins.forEach(plugin => {
    plugins.set(plugin.format, plugin)
  })

  const formatResultsAsText = (data: ExportData): string => {
    return `
${data.calculator.name} - Resultat

Patient Information:
${Object.entries(data.patient).map(([key, value]) => `  ${key}: ${value}`).join('\n')}

Resultat:
  Score: ${data.result.score}
  Risiko niveau: ${data.result.riskLevel}
  Fortolkning: ${data.result.interpretation}

Anbefalinger:
${data.result.recommendations.map((rec: string) => `  - ${rec}`).join('\n')}

Metadata:
  Session ID: ${data.metadata.sessionId}
  Varighed: ${data.metadata.duration} sekunder
  Eksporteret: ${data.metadata.exportTime}
    `.trim()
  }

  const prepareExportData = (
    config: CalculatorConfig,
    patient: Partial<PatientData>,
    responses: Partial<CalculatorResponses>,
    result: CalculationResult,
    sessionId: string,
    duration: number
  ): ExportData => {
    return {
      calculator: config,
      patient,
      responses,
      result,
      metadata: {
        sessionId,
        duration,
        exportTime: new Date().toISOString()
      }
    }
  }

  const exportResults = async (
    data: ExportData,
    format: ExportFormat = 'json'
  ): Promise<string | null> => {
    try {
      const plugin = plugins.get(format)
      if (!plugin) {
        throw new Error(`Export format '${format}' is not supported`)
      }

      logUserAction('results_exported', {
        format,
        sessionId: data.metadata.sessionId
      }, data.calculator.type)

      const result = await plugin.export(data)
      return result
    } catch (error) {
      console.error('Export failed:', error)
      return null
    }
  }

  const registerPlugin = (plugin: ExportPlugin): void => {
    plugins.set(plugin.format, plugin)
  }

  const getAvailableFormats = (): ExportFormat[] => {
    return Array.from(plugins.keys())
  }

  const getPlugin = (format: ExportFormat): ExportPlugin | undefined => {
    return plugins.get(format)
  }

  const getAllPlugins = (): ExportPlugin[] => {
    return Array.from(plugins.values())
  }

  // Future extension points for PDF and CSV exports
  const createPdfPlugin = (): ExportPlugin => {
    return {
      format: 'pdf',
      name: 'PDF Export',
      description: 'Export results as PDF document',
      export: async (data: ExportData) => {
        // TODO: Implement PDF generation
        throw new Error('PDF export not yet implemented')
      }
    }
  }

  const createCsvPlugin = (): ExportPlugin => {
    return {
      format: 'csv',
      name: 'CSV Export', 
      description: 'Export results as CSV spreadsheet',
      export: (data: ExportData) => {
        // TODO: Implement CSV generation
        throw new Error('CSV export not yet implemented')
      }
    }
  }

  return {
    prepareExportData,
    exportResults,
    registerPlugin,
    getAvailableFormats,
    getPlugin,
    getAllPlugins,
    createPdfPlugin,
    createCsvPlugin,
    formatResultsAsText
  }
}