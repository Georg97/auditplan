import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte({ hot: false })],
	test: {
		environment: 'jsdom',
		include: ['src/**/*.test.ts'],
		globals: true
	},
	resolve: {
		alias: {
			$lib: '/src/lib',
			$app: '/node_modules/@sveltejs/kit/src/runtime/app'
		}
	}
});
