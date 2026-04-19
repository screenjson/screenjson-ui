import { sveltekit } from '@sveltejs/kit/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type UserConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }): UserConfig => {
  if (mode === 'lib') {
    /* Library build for npm + CDN distribution. */
    return {
      plugins: [
        tailwindcss(),
        svelte({ compilerOptions: { customElement: false } })
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/lib/index.ts'),
          name: 'ScreenJSONUI',
          fileName: (format) =>
            format === 'es' ? 'screenjson-ui.js' : `screenjson-ui.${format}.js`,
          formats: ['es', 'umd']
        },
        rollupOptions: {
          output: {
            exports: 'named',
            assetFileNames: (asset) =>
              asset.name === 'style.css' ? 'style.css' : asset.name ?? 'asset',
            globals: {}
          }
        },
        cssCodeSplit: false,
        minify: 'esbuild',
        sourcemap: true,
        emptyOutDir: true
      },
      resolve: {
        alias: [
          { find: '$lib', replacement: resolve(__dirname, 'src/lib') },
          { find: '$app/environment', replacement: resolve(__dirname, 'src/lib/shims/environment.ts') }
        ]
      }
    };
  }

  /* Default: SvelteKit dev / SPA build. */
  return {
    plugins: [tailwindcss(), sveltekit()]
  };
});
