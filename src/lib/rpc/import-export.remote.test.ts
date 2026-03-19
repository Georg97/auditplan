import { describe, it, expect } from 'vitest';
import { exportDataSchema, importResultSchema } from '$lib/types';
import { exportAllData, importData } from './import-export.remote';

describe('exportDataSchema validation', () => {
	it('accepts a valid full export object', () => {
		const result = exportDataSchema.safeParse({
			version: '1.0.0',
			exportedAt: '2026-03-19T10:00:00.000Z',
			organization: 'org-123',
			audits: [{ id: 'a1', name: 'Audit 1' }],
			auditors: [{ id: 'au1', firstName: 'Max' }],
			saved_plans: [{ id: 'p1' }],
			saved_notes: [{ id: 'n1' }],
			calendar_entries: [{ id: 'c1' }],
			actions: [{ id: 'ac1' }],
			settings: [{ key: 'theme', value: 'dark' }]
		});
		expect(result.success).toBe(true);
	});

	it('accepts a minimal export object (only required fields)', () => {
		const result = exportDataSchema.safeParse({
			version: '1.0.0',
			exportedAt: '2026-03-19T10:00:00.000Z',
			organization: 'org-123'
		});
		expect(result.success).toBe(true);
	});

	it('defaults optional array fields to empty arrays when omitted', () => {
		const result = exportDataSchema.safeParse({
			version: '1.0.0',
			exportedAt: '2026-03-19T10:00:00.000Z',
			organization: 'org-123'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.audits).toEqual([]);
			expect(result.data.auditors).toEqual([]);
			expect(result.data.saved_plans).toEqual([]);
			expect(result.data.saved_notes).toEqual([]);
			expect(result.data.calendar_entries).toEqual([]);
			expect(result.data.actions).toEqual([]);
			expect(result.data.settings).toEqual([]);
		}
	});

	it('accepts explicitly empty arrays', () => {
		const result = exportDataSchema.safeParse({
			version: '1.0.0',
			exportedAt: '2026-03-19T10:00:00.000Z',
			organization: 'org-123',
			audits: [],
			auditors: [],
			saved_plans: [],
			saved_notes: [],
			calendar_entries: [],
			actions: [],
			settings: []
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing version', () => {
		const result = exportDataSchema.safeParse({
			exportedAt: '2026-03-19T10:00:00.000Z',
			organization: 'org-123'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing exportedAt', () => {
		const result = exportDataSchema.safeParse({
			version: '1.0.0',
			organization: 'org-123'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing organization', () => {
		const result = exportDataSchema.safeParse({
			version: '1.0.0',
			exportedAt: '2026-03-19T10:00:00.000Z'
		});
		expect(result.success).toBe(false);
	});
});

describe('importResultSchema validation', () => {
	it('accepts a valid import result', () => {
		const result = importResultSchema.safeParse({
			success: true,
			importedKeys: ['audits', 'auditors'],
			skippedKeys: ['settings'],
			errors: [],
			counts: { audits: 5, auditors: 3 }
		});
		expect(result.success).toBe(true);
	});

	it('accepts a result with all zeros and empty arrays', () => {
		const result = importResultSchema.safeParse({
			success: false,
			importedKeys: [],
			skippedKeys: [],
			errors: ['Parse error'],
			counts: {}
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing success field', () => {
		const result = importResultSchema.safeParse({
			importedKeys: [],
			skippedKeys: [],
			errors: [],
			counts: {}
		});
		expect(result.success).toBe(false);
	});

	it('rejects non-numeric counts values', () => {
		const result = importResultSchema.safeParse({
			success: true,
			importedKeys: [],
			skippedKeys: [],
			errors: [],
			counts: { audits: 'five' }
		});
		expect(result.success).toBe(false);
	});
});

describe('import-export remote function exports', () => {
	it('exportAllData is a function', () => {
		expect(typeof exportAllData).toBe('function');
	});

	it('importData is a function', () => {
		expect(typeof importData).toBe('function');
	});
});
