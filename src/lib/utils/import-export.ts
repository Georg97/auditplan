export interface ExportData {
	version: string;
	exportedAt: string;
	audits: unknown[];
	auditors: unknown[];
	calendarEntries: unknown[];
	actions: unknown[];
}

export interface ImportResult {
	success: boolean;
	importedKeys: string[];
	skippedKeys: string[];
	errors: string[];
	counts: Record<string, number>;
}

export interface CsvExportOptions {
	separator: string;
	lineBreak: string;
	withBom: boolean;
}

const VALID_EXPORT_KEYS = ['audits', 'auditors', 'calendarEntries', 'actions'];

const DEFAULT_CSV_OPTIONS: CsvExportOptions = {
	separator: ';',
	lineBreak: '\r\n',
	withBom: true
};

const CSV_HEADERS = ['Audit-Name', 'Audittyp', 'Startdatum', 'Enddatum', 'Unternehmen', 'Abteilung', 'Standort', 'Format', 'Leitender Auditor', 'Status'];

/**
 * Create a JSON export blob and trigger download.
 * Returns the filename used.
 */
export function exportToJson(data: ExportData): string {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
	const filename = `auditplan_backup_${timestamp}.json`;
	const json = JSON.stringify(data, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	downloadBlob(blob, filename);
	return filename;
}

/**
 * Build JSON string for export without triggering a download.
 * Useful for server-side or test contexts.
 */
export function buildExportJson(data: ExportData): { json: string; filename: string } {
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
	const filename = `auditplan_backup_${timestamp}.json`;
	const json = JSON.stringify(data, null, 2);
	return { json, filename };
}

/**
 * Parse and validate a JSON import file.
 * Returns ImportResult with counts of imported items per key.
 */
export function validateImportJson(jsonString: string): ImportResult {
	const result: ImportResult = {
		success: false,
		importedKeys: [],
		skippedKeys: [],
		errors: [],
		counts: {}
	};

	let parsed: unknown;
	try {
		parsed = JSON.parse(jsonString);
	} catch {
		result.errors.push('Invalid JSON format');
		return result;
	}

	if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
		result.errors.push('Import data must be a JSON object');
		return result;
	}

	const obj = parsed as Record<string, unknown>;

	for (const key of VALID_EXPORT_KEYS) {
		if (!(key in obj)) {
			result.skippedKeys.push(key);
			continue;
		}

		const value = obj[key];
		if (!Array.isArray(value)) {
			result.errors.push(`Key "${key}" must be an array`);
			continue;
		}

		result.importedKeys.push(key);
		result.counts[key] = value.length;
	}

	if (result.errors.length === 0 && result.importedKeys.length > 0) {
		result.success = true;
	}

	return result;
}

/**
 * Export audits as CSV with UTF-8 BOM for Excel compatibility.
 */
export function exportAuditsCsv(audits: Array<Record<string, string>>, options?: Partial<CsvExportOptions>): string {
	const opts = { ...DEFAULT_CSV_OPTIONS, ...options };
	const { csv, filename } = buildAuditsCsv(audits, opts);
	const bom = opts.withBom ? '\uFEFF' : '';
	const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8' });
	downloadBlob(blob, filename);
	return filename;
}

/**
 * Build CSV string for audits without triggering a download.
 * Useful for server-side or test contexts.
 */
export function buildAuditsCsv(audits: Array<Record<string, string>>, options?: Partial<CsvExportOptions>): { csv: string; filename: string } {
	const opts = { ...DEFAULT_CSV_OPTIONS, ...options };
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
	const filename = `audits_export_${timestamp}.csv`;

	const headerRow = CSV_HEADERS.map((h) => escapeCsvValue(h, opts.separator)).join(opts.separator);

	const columnKeys = ['name', 'auditType', 'startDate', 'endDate', 'company', 'department', 'location', 'format', 'leadAuditor', 'status'];

	const dataRows = audits.map((audit) => columnKeys.map((key) => escapeCsvValue(audit[key] ?? '', opts.separator)).join(opts.separator));

	const csv = [headerRow, ...dataRows].join(opts.lineBreak);
	return { csv, filename };
}

/** Trigger download of a Blob in the browser. */
function downloadBlob(blob: Blob, filename: string): void {
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

/** Escape a CSV value, quoting if it contains the separator, quotes, or newlines. */
export function escapeCsvValue(value: string, separator: string): string {
	if (value.includes(separator) || value.includes('"') || value.includes('\n')) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}
