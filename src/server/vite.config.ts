import { defineConfig } from 'vite';
import { builtinModules } from 'node:module';
import { resolve } from 'node:path';

export default defineConfig({
  root: __dirname,
  ssr: { noExternal: true },
  build: {
    emptyOutDir: false,
    ssr: resolve(__dirname, 'index.ts'),
    outDir: resolve(__dirname, '../../dist/server'),
    target: 'node22',
    sourcemap: true,
    rollupOptions: {
      external: [...builtinModules],
      output: { format: 'cjs', entryFileNames: 'index.cjs', inlineDynamicImports: true },
    },
  },
});
