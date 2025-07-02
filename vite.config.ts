import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import {PrimeVueResolver} from '@primevue/auto-import-resolver';
import Components from 'unplugin-vue-components/vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  base: './',
  plugins: [
    vue(),
    tailwindcss(),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    })
  ],
  optimizeDeps: {
    include: ['chart.js', 'chartjs-plugin-datalabels'],
  },
  build: {
    rollupOptions: {
    input: {
      score2: './src/score2.ts',
      danpss: './src/danpss.ts',
      puqe: './src/puqe.ts',
      audit: './src/audit.ts',
      westleycroupscore: './src/westleyCroupScore.ts',
      who5: './src/who-5.ts',
      epds: './src/epds.ts',
      lrti: './src/lrti.ts',
      gcs: './src/gcs.ts',
      ipss: './src/ipss.ts',
      passwordReset: './src/passwordReset.ts',
      medicinBoern: './src/medicinBoern.ts'
    },
    output: {
      entryFileNames: '[name].js',
      chunkFileNames: '[name].js',
      assetFileNames: '[name].[ext]'
      }
    },
  
  outDir: 'dist',
  emptyOutDir: true, 
  cssCodeSplit: true
  },
  resolve: {
    alias: {
       '@': path.resolve(__dirname, './src')
    }
}
  
});