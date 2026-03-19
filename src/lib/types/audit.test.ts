import { describe, it, expect } from 'vitest';
import { auditSchema, AUDIT_TYPES, AUDIT_STATUSES, AUDIT_FORMATS } from './audit';

const validAudit = {
	auditName: 'Q-Audit 2026',
	auditTyp: 'internal' as const,
	startDatum: '2026-04-15',
	unternehmen: 'Test GmbH',
	abteilung: 'Produktion'
};

describe('auditSchema', () => {
	it('accepts valid minimal data', () => {
		const result = auditSchema.safeParse(validAudit);
		expect(result.success).toBe(true);
	});

	it('accepts full data', () => {
		const result = auditSchema.safeParse({
			...validAudit,
			endDatum: '2026-04-16',
			uhrzeitVon: '09:00',
			uhrzeitBis: '17:00',
			standort: 'Berlin',
			format: 'on_site',
			geltungsbereich: 'Produktion und Lager',
			leitenderAuditorId: 'aud-123',
			ansprechpartner: 'Max Mustermann',
			kontaktEmail: 'max@example.com',
			notizen: 'Erste Zertifizierung',
			status: 'planned'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing auditName', () => {
		const { auditName: _auditName, ...rest } = validAudit;
		const result = auditSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects empty auditName', () => {
		const result = auditSchema.safeParse({ ...validAudit, auditName: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing startDatum', () => {
		const { startDatum: _startDatum, ...rest } = validAudit;
		const result = auditSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects missing unternehmen', () => {
		const { unternehmen: _unternehmen, ...rest } = validAudit;
		const result = auditSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects missing abteilung', () => {
		const { abteilung: _abteilung, ...rest } = validAudit;
		const result = auditSchema.safeParse(rest);
		expect(result.success).toBe(false);
	});

	it('rejects invalid auditTyp', () => {
		const result = auditSchema.safeParse({ ...validAudit, auditTyp: 'invalid' });
		expect(result.success).toBe(false);
	});

	it('accepts all valid audit types', () => {
		for (const typ of AUDIT_TYPES) {
			const result = auditSchema.safeParse({ ...validAudit, auditTyp: typ });
			expect(result.success).toBe(true);
		}
	});

	it('accepts all valid statuses', () => {
		for (const status of AUDIT_STATUSES) {
			const result = auditSchema.safeParse({ ...validAudit, status });
			expect(result.success).toBe(true);
		}
	});

	it('accepts all valid formats', () => {
		for (const format of AUDIT_FORMATS) {
			const result = auditSchema.safeParse({ ...validAudit, format });
			expect(result.success).toBe(true);
		}
	});

	it('defaults status to planned', () => {
		const result = auditSchema.parse(validAudit);
		expect(result.status).toBe('planned');
	});

	it('accepts empty kontaktEmail', () => {
		const result = auditSchema.safeParse({ ...validAudit, kontaktEmail: '' });
		expect(result.success).toBe(true);
	});

	it('rejects invalid kontaktEmail', () => {
		const result = auditSchema.safeParse({ ...validAudit, kontaktEmail: 'not-email' });
		expect(result.success).toBe(false);
	});
});

describe('audit constants', () => {
	it('has 5 audit types', () => {
		expect(AUDIT_TYPES).toHaveLength(5);
	});

	it('has 5 audit statuses', () => {
		expect(AUDIT_STATUSES).toHaveLength(5);
	});

	it('has 3 audit formats', () => {
		expect(AUDIT_FORMATS).toHaveLength(3);
	});
});
