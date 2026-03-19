import { describe, it, expect } from 'vitest';
import {
	auditPlanGrunddatenSchema,
	auditPlanBlockZeileSchema,
	AUDIT_PLAN_TEAM_ROLES,
	AUDIT_METHODS,
	SHIFT_SYSTEMS,
	AUDIT_LANGUAGES,
	AUDITART_OPTIONS,
	ISO_NORMS
} from './audit-plan';

describe('auditPlanGrunddatenSchema', () => {
	it('accepts valid data with only name', () => {
		const result = auditPlanGrunddatenSchema.safeParse({ name: 'ISO 9001 Audit 2026' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('ISO 9001 Audit 2026');
			expect(result.data.auftraggeber).toBe('');
			expect(result.data.verteilungAuditteam).toBe(true);
			expect(result.data.verteilungGeschaeftsfuehrung).toBe(true);
			expect(result.data.verteilungFachabteilungen).toBe(false);
			expect(result.data.verteilungExtern).toBe(false);
		}
	});

	it('rejects empty name', () => {
		const result = auditPlanGrunddatenSchema.safeParse({ name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects missing name', () => {
		const result = auditPlanGrunddatenSchema.safeParse({});
		expect(result.success).toBe(false);
	});

	it('accepts full grunddaten', () => {
		const result = auditPlanGrunddatenSchema.safeParse({
			name: 'Test Plan',
			auftraggeber: 'ACME GmbH',
			geltungsbereich: 'Produktion',
			beauftragter: 'Max Mustermann',
			auditziel: 'Konformitätsbewertung',
			auditzielEditierbar: true,
			schichtsystem: 'double_shift',
			auditmethode: 'on_site',
			iktTechnik: 'Microsoft Teams',
			iktTestdatum: '2026-03-20',
			testLetztesAudit: true,
			gastgeber: 'Anna Schmidt',
			verteiler: 'Team A, Team B',
			verteilungAuditteam: true,
			verteilungGeschaeftsfuehrung: false,
			verteilungFachabteilungen: true,
			verteilungExtern: true
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.auftraggeber).toBe('ACME GmbH');
			expect(result.data.auditzielEditierbar).toBe(true);
			expect(result.data.verteilungGeschaeftsfuehrung).toBe(false);
		}
	});

	it('provides defaults for optional boolean fields', () => {
		const result = auditPlanGrunddatenSchema.safeParse({ name: 'Plan' });
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.auditzielEditierbar).toBe(false);
			expect(result.data.testLetztesAudit).toBe(false);
		}
	});
});

describe('auditPlanBlockZeileSchema', () => {
	it('accepts valid zeile with id', () => {
		const result = auditPlanBlockZeileSchema.safeParse({
			id: 'zeile-1',
			organisationseinheit: 'Produktion',
			auditor: 'Max Mustermann'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.organisationseinheit).toBe('Produktion');
			expect(result.data.normkapitel).toEqual([]);
			expect(result.data.themen).toEqual([]);
			expect(result.data.elemente).toEqual([]);
		}
	});

	it('accepts zeile with arrays', () => {
		const result = auditPlanBlockZeileSchema.safeParse({
			id: 'zeile-2',
			datum: '2026-03-20',
			uhrzeitVon: '09:00',
			uhrzeitBis: '12:00',
			istRemote: true,
			normkapitel: ['4.1', '4.2'],
			themen: ['Strategische Planung'],
			elemente: ['Prozess A']
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.normkapitel).toEqual(['4.1', '4.2']);
			expect(result.data.istRemote).toBe(true);
		}
	});

	it('requires id field', () => {
		const result = auditPlanBlockZeileSchema.safeParse({
			organisationseinheit: 'IT'
		});
		expect(result.success).toBe(false);
	});
});

describe('constants', () => {
	it('has 4 team roles', () => {
		expect(AUDIT_PLAN_TEAM_ROLES).toHaveLength(4);
		expect(AUDIT_PLAN_TEAM_ROLES).toContain('lead_auditor');
		expect(AUDIT_PLAN_TEAM_ROLES).toContain('experts');
	});

	it('has 3 audit methods', () => {
		expect(AUDIT_METHODS).toHaveLength(3);
		expect(AUDIT_METHODS).toContain('on_site');
		expect(AUDIT_METHODS).toContain('fully_remote');
	});

	it('has 4 shift systems', () => {
		expect(SHIFT_SYSTEMS).toHaveLength(4);
		expect(SHIFT_SYSTEMS).toContain('other');
	});

	it('has 14 audit languages', () => {
		expect(AUDIT_LANGUAGES).toHaveLength(14);
		expect(AUDIT_LANGUAGES).toContain('de');
		expect(AUDIT_LANGUAGES).toContain('en');
	});

	it('has 16 auditart options', () => {
		expect(AUDITART_OPTIONS).toHaveLength(16);
		expect(AUDITART_OPTIONS).toContain('initial_certification');
		expect(AUDITART_OPTIONS).toContain('combined');
	});

	it('has 5 ISO norms', () => {
		expect(ISO_NORMS).toHaveLength(5);
		expect(ISO_NORMS).toContain('ISO 9001');
		expect(ISO_NORMS).toContain('ISO 27001');
	});
});
