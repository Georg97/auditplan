import { describe, it, expect } from 'vitest';
import { auditCreateSchema, auditUpdateSchema, auditSchema, auditFileCreateSchema, auditStatusSchema, auditTypeSchema, auditFormatSchema } from '$lib/types';
import { getAudits, getAuditById, addAudit, updateAudit, deleteAudit, searchAudits, getAuditFiles, uploadAuditFile, deleteAuditFile } from './audits.remote';

describe('auditCreateSchema validation', () => {
	const validData = {
		auditName: 'ISO 9001 Audit Q1',
		auditType: 'internal' as const,
		startDate: '2026-04-01',
		company: 'Musterfirma GmbH',
		department: 'Produktion',
		leadAuditorId: 'aud-1'
	};

	it('accepts valid minimal audit data', () => {
		const result = auditCreateSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts full audit data', () => {
		const result = auditCreateSchema.safeParse({
			...validData,
			endDate: '2026-04-03',
			startTime: '09:00',
			endTime: '17:00',
			location: 'Standort Berlin',
			format: 'on_site',
			norms: '["iso9001","iso14001"]',
			scope: 'Produktionsbereich',
			auditTeam: 'Max Mustermann\nErika Muster',
			contactPerson: 'Hans Schmidt',
			contactEmail: 'hans@example.com',
			notes: 'Vorbereitungsdokumente anfordern',
			documentLinks: 'https://example.com/doc1',
			status: 'planned'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing auditName', () => {
		const { auditName: _, ...rest } = validData;
		const result = auditCreateSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects auditName shorter than 3 chars', () => {
		const result = auditCreateSchema.safeParse({ ...validData, auditName: 'AB' });
		expect(result.success).toBe(false);
	});

	it('rejects missing startDate', () => {
		const { startDate: _, ...rest } = validData;
		const result = auditCreateSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects missing company', () => {
		const { company: _, ...rest } = validData;
		const result = auditCreateSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects missing department', () => {
		const { department: _, ...rest } = validData;
		const result = auditCreateSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects missing leadAuditorId', () => {
		const { leadAuditorId: _, ...rest } = validData;
		const result = auditCreateSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects invalid auditType', () => {
		const result = auditCreateSchema.safeParse({ ...validData, auditType: 'unknown' });
		expect(result.success).toBe(false);
	});

	it('rejects invalid contactEmail', () => {
		const result = auditCreateSchema.safeParse({ ...validData, contactEmail: 'not-email' });
		expect(result.success).toBe(false);
	});

	it('defaults status to planned', () => {
		const result = auditCreateSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.status).toBe('planned');
		}
	});
});

describe('auditUpdateSchema validation', () => {
	it('accepts partial update', () => {
		const result = auditUpdateSchema.safeParse({ auditName: 'Updated Audit' });
		expect(result.success).toBe(true);
	});

	it('accepts empty object', () => {
		const result = auditUpdateSchema.safeParse({});
		expect(result.success).toBe(true);
	});

	it('accepts status change only', () => {
		const result = auditUpdateSchema.safeParse({ status: 'completed' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid status', () => {
		const result = auditUpdateSchema.safeParse({ status: 'invalid' });
		expect(result.success).toBe(false);
	});
});

describe('auditSchema (full)', () => {
	it('requires id, organizationId, and timestamps', () => {
		const result = auditSchema.safeParse({
			auditName: 'Test',
			auditType: 'internal',
			startDate: '2026-01-01',
			company: 'Test',
			department: 'Test',
			leadAuditorId: 'aud-1'
		});
		expect(result.success).toBe(false);
	});
});

describe('auditStatusSchema', () => {
	it.each(['planned', 'in_progress', 'completed', 'cancelled'])('accepts "%s"', (status) => {
		expect(auditStatusSchema.safeParse(status).success).toBe(true);
	});

	it('rejects invalid status', () => {
		expect(auditStatusSchema.safeParse('deleted').success).toBe(false);
	});
});

describe('auditTypeSchema', () => {
	it.each(['internal', 'external', 'certification', 'surveillance', 'recertification'])('accepts "%s"', (type) => {
		expect(auditTypeSchema.safeParse(type).success).toBe(true);
	});
});

describe('auditFormatSchema', () => {
	it.each(['on_site', 'remote', 'hybrid'])('accepts "%s"', (format) => {
		expect(auditFormatSchema.safeParse(format).success).toBe(true);
	});
});

describe('auditFileCreateSchema', () => {
	const validFile = {
		auditId: 'audit-1',
		fileName: 'report.pdf',
		fileType: 'application/pdf',
		fileSize: 1024,
		fileContent: 'base64data...'
	};

	it('accepts valid file', () => {
		const result = auditFileCreateSchema.safeParse(validFile);
		expect(result.success).toBe(true);
	});

	it('rejects file over 5MB', () => {
		const result = auditFileCreateSchema.safeParse({ ...validFile, fileSize: 6_000_000 });
		expect(result.success).toBe(false);
	});

	it('rejects missing fileName', () => {
		const { fileName: _, ...rest } = validFile;
		const result = auditFileCreateSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});
});

describe('audit remote function signatures', () => {
	it.each([
		['getAudits', getAudits],
		['getAuditById', getAuditById],
		['addAudit', addAudit],
		['updateAudit', updateAudit],
		['deleteAudit', deleteAudit],
		['searchAudits', searchAudits],
		['getAuditFiles', getAuditFiles],
		['uploadAuditFile', uploadAuditFile],
		['deleteAuditFile', deleteAuditFile]
	])('%s is a function', (_, fn) => {
		expect(typeof fn).toBe('function');
	});
});
