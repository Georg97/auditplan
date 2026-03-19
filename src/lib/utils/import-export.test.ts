import { describe, it, expect } from 'vitest';
import { validateImportJson, escapeCsvValue, buildExportJson, buildAuditsCsv } from './import-export';
import type { ExportData } from './import-export';

describe('validateImportJson', () => {
	it('should accept valid JSON with all keys', () => {
		const data = {
			version: '1.0',
			exportedAt: '2026-01-01T00:00:00Z',
			audits: [{ id: '1' }],
			auditors: [{ id: '2' }],
			calendarEntries: [],
			actions: [{ id: '3' }, { id: '4' }]
		};
		const result = validateImportJson(JSON.stringify(data));

		expect(result.success).toBe(true);
		expect(result.importedKeys).toEqual(['audits', 'auditors', 'calendarEntries', 'actions']);
		expect(result.skippedKeys).toEqual([]);
		expect(result.errors).toEqual([]);
		expect(result.counts).toEqual({
			audits: 1,
			auditors: 1,
			calendarEntries: 0,
			actions: 2
		});
	});

	it('should skip missing keys', () => {
		const data = { audits: [{ id: '1' }] };
		const result = validateImportJson(JSON.stringify(data));

		expect(result.success).toBe(true);
		expect(result.importedKeys).toEqual(['audits']);
		expect(result.skippedKeys).toEqual(['auditors', 'calendarEntries', 'actions']);
		expect(result.counts).toEqual({ audits: 1 });
	});

	it('should fail on invalid JSON', () => {
		const result = validateImportJson('not valid json {{{');

		expect(result.success).toBe(false);
		expect(result.errors).toEqual(['Invalid JSON format']);
	});

	it('should fail when input is not an object', () => {
		const result = validateImportJson('"just a string"');
		expect(result.success).toBe(false);
		expect(result.errors).toEqual(['Import data must be a JSON object']);
	});

	it('should fail when input is an array', () => {
		const result = validateImportJson('[1, 2, 3]');
		expect(result.success).toBe(false);
		expect(result.errors).toEqual(['Import data must be a JSON object']);
	});

	it('should fail when input is null', () => {
		const result = validateImportJson('null');
		expect(result.success).toBe(false);
		expect(result.errors).toEqual(['Import data must be a JSON object']);
	});

	it('should report error when a key has a non-array value', () => {
		const data = { audits: 'not an array', auditors: [{ id: '1' }] };
		const result = validateImportJson(JSON.stringify(data));

		expect(result.success).toBe(false);
		expect(result.errors).toEqual(['Key "audits" must be an array']);
		expect(result.importedKeys).toEqual(['auditors']);
		expect(result.counts).toEqual({ auditors: 1 });
	});

	it('should fail when all keys have non-array values', () => {
		const data = { audits: 'string', auditors: 42 };
		const result = validateImportJson(JSON.stringify(data));

		expect(result.success).toBe(false);
		expect(result.importedKeys).toEqual([]);
		expect(result.errors.length).toBe(2);
	});

	it('should fail when no valid keys are present', () => {
		const data = { unknownKey: [1, 2, 3] };
		const result = validateImportJson(JSON.stringify(data));

		expect(result.success).toBe(false);
		expect(result.importedKeys).toEqual([]);
		expect(result.skippedKeys).toEqual(['audits', 'auditors', 'calendarEntries', 'actions']);
	});
});

describe('escapeCsvValue', () => {
	it('should return plain value unchanged', () => {
		expect(escapeCsvValue('hello', ';')).toBe('hello');
	});

	it('should quote values containing the separator', () => {
		expect(escapeCsvValue('hello;world', ';')).toBe('"hello;world"');
	});

	it('should quote and escape values containing double quotes', () => {
		expect(escapeCsvValue('say "hi"', ';')).toBe('"say ""hi"""');
	});

	it('should quote values containing newlines', () => {
		expect(escapeCsvValue('line1\nline2', ';')).toBe('"line1\nline2"');
	});

	it('should handle a custom separator', () => {
		expect(escapeCsvValue('hello,world', ',')).toBe('"hello,world"');
		expect(escapeCsvValue('hello;world', ',')).toBe('hello;world');
	});

	it('should return empty string unchanged', () => {
		expect(escapeCsvValue('', ';')).toBe('');
	});
});

describe('buildExportJson', () => {
	it('should produce valid JSON with correct structure', () => {
		const data: ExportData = {
			version: '1.0',
			exportedAt: '2026-01-01T00:00:00Z',
			audits: [{ id: '1' }],
			auditors: [],
			calendarEntries: [],
			actions: []
		};
		const { json, filename } = buildExportJson(data);
		const parsed = JSON.parse(json);

		expect(parsed.version).toBe('1.0');
		expect(parsed.audits).toEqual([{ id: '1' }]);
		expect(filename).toMatch(/^auditplan_backup_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json$/);
	});

	it('should generate a filename with a timestamp', () => {
		const data: ExportData = {
			version: '1.0',
			exportedAt: '',
			audits: [],
			auditors: [],
			calendarEntries: [],
			actions: []
		};
		const { filename } = buildExportJson(data);

		expect(filename.startsWith('auditplan_backup_')).toBe(true);
		expect(filename.endsWith('.json')).toBe(true);
	});
});

describe('buildAuditsCsv', () => {
	it('should produce CSV with header row and semicolon separator', () => {
		const { csv } = buildAuditsCsv([]);

		const lines = csv.split('\r\n');
		expect(lines[0]).toBe('Audit-Name;Audittyp;Startdatum;Enddatum;Unternehmen;Abteilung;Standort;Format;Leitender Auditor;Status');
	});

	it('should include data rows with correct column mapping', () => {
		const audits = [
			{
				name: 'Test Audit',
				auditType: 'Internal',
				startDate: '2026-03-01',
				endDate: '2026-03-05',
				company: 'ACME',
				department: 'IT',
				location: 'Berlin',
				format: 'On-site',
				leadAuditor: 'Max Mustermann',
				status: 'planned'
			}
		];
		const { csv } = buildAuditsCsv(audits);

		const lines = csv.split('\r\n');
		expect(lines.length).toBe(2);
		expect(lines[1]).toBe('Test Audit;Internal;2026-03-01;2026-03-05;ACME;IT;Berlin;On-site;Max Mustermann;planned');
	});

	it('should use empty string for missing fields', () => {
		const audits = [{ name: 'Partial Audit' }];
		const { csv } = buildAuditsCsv(audits);

		const lines = csv.split('\r\n');
		const columns = lines[1].split(';');
		expect(columns[0]).toBe('Partial Audit');
		expect(columns[1]).toBe('');
		expect(columns.length).toBe(10);
	});

	it('should escape values containing semicolons', () => {
		const audits = [{ name: 'Audit; Special', auditType: 'Internal' }];
		const { csv } = buildAuditsCsv(audits);

		const lines = csv.split('\r\n');
		expect(lines[1].startsWith('"Audit; Special"')).toBe(true);
	});

	it('should generate a filename with .csv extension', () => {
		const { filename } = buildAuditsCsv([]);

		expect(filename).toMatch(/^audits_export_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.csv$/);
	});

	it('should support custom separator', () => {
		const { csv } = buildAuditsCsv([], { separator: ',' });

		const lines = csv.split('\r\n');
		expect(lines[0]).toContain(',');
		expect(lines[0]).not.toContain(';');
	});

	it('should support custom line break', () => {
		const audits = [{ name: 'Test' }];
		const { csv } = buildAuditsCsv(audits, { lineBreak: '\n' });

		expect(csv).not.toContain('\r\n');
		const lines = csv.split('\n');
		expect(lines.length).toBe(2);
	});
});
