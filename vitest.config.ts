import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
	plugins: [react()],
	test: {
		environment: 'jsdom',
		globals: true,
		setupFiles: ['./tests/setup.ts'],
		exclude: ['**/node_modules/**', '**/e2e/**', '**/dist/**'],
	},
	resolve: {
		alias: [
			{ find: '@', replacement: path.resolve(__dirname, './src') },
			{ find: /^@prisma\/client$/, replacement: path.resolve(__dirname, './prisma/generated/client') },
		],
	},
});
