import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [svelte({ hot: false })],
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.ts'],
		globals: true
	},
	resolve: {
		alias: {
			$lib: path.resolve(__dirname, './src/lib'),
			'$app/server': path.resolve(__dirname, './src/lib/__mocks__/app-server.ts'),
			'$app/navigation': path.resolve(__dirname, './src/lib/__mocks__/app-navigation.ts'),
			'$app/state': path.resolve(__dirname, './src/lib/__mocks__/app-state.ts'),
			'$app/environment': path.resolve(__dirname, './src/lib/__mocks__/app-environment.ts'),
			'$env/dynamic/private': path.resolve(__dirname, './src/lib/__mocks__/env-private.ts')
		}
	}
});
