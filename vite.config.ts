import { defineConfig } from 'vite';
import monacoPlugin from 'vite-plugin-monaco-editor';

const monacoEditorPlugin =
  typeof monacoPlugin === 'function'
    ? monacoPlugin
    : (monacoPlugin as { default: typeof monacoPlugin }).default;

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService'],
    }),
  ],
});
