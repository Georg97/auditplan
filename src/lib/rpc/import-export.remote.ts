import { query, command } from '$app/server';
import type { ExportData, ImportResult } from '$lib/types';

export const exportAllData = query(async (): Promise<ExportData> => {
	throw new Error('Not implemented');
});

export const importData = command('unchecked', async (_data: ExportData): Promise<ImportResult> => {
	throw new Error('Not implemented');
});
