import { sveltekit } from '@sveltejs/kit/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type UserConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }): UserConfig => {
  if (mode === 'lib') {
    // Library build for CDN distribution
    return {
      plugins: [
        tailwindcss(),
        svelte({
          compilerOptions: {
            customElement: false
          }
        })
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/lib/index.ts'),
          name: 'ScreenJSONUI',
          fileName: 'screenjson-ui',
          formats: ['es', 'umd']
        },
        rollupOptions: {
          output: {
            assetFileNames: 'style.[ext]',
            globals: {}
          }
        },
        cssCodeSplit: false,
        minify: 'terser',
        sourcemap: true
      },
      resolve: {
        alias: [
          { find: '$lib', replacement: resolve(__dirname, 'src/lib') },
          { find: '$app/environment', replacement: resolve(__dirname, 'src/lib/shims/environment.ts') }
        ]
      }
    };
  }

  // Development/SvelteKit build
  return {
    plugins: [tailwindcss(), sveltekit()]
  };
});
