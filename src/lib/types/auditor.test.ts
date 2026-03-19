import { describe, it, expect } from 'vitest';
import { auditorSchema } from './auditor';

const validAuditor = {
	name: 'Max Mustermann',
	email: 'max@example.com'
};

describe('auditorSchema', () => {
	it('accepts valid minimal data', () => {
		const result = auditorSchema.safeParse(validAuditor);
		expect(result.success).toBe(true);
	});

	it('accepts full data', () => {
		const result = auditorSchema.safeParse({
			...validAuditor,
			title: 'Dr.',
			phone: '+49 123 456',
			mobile: '+49 170 123',
			company: 'TÜV Nord',
			street: 'Musterstraße 1',
			zipCode: '12345',
			city: 'Berlin',
			country: 'DE',
			iso9001: true,
			iso14001: false,
			iso45001: true,
			iso50001: false,
			iso27001: false,
			certifications: 'IRCA Lead Auditor',
			languages: 'Deutsch, Englisch',
			experienceYears: 10,
			dailyRate: 1200,
			availability: 'full_time',
			notes: 'Spezialist für Automobilindustrie'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const result = auditorSchema.safeParse({ email: 'test@example.com' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.some((i) => i.path.includes('name'))).toBe(true);
		}
	});

	it('rejects empty name', () => {
		const result = auditorSchema.safeParse({ name: '', email: 'test@example.com' });
		expect(result.success).toBe(false);
	});

	it('rejects missing email', () => {
		const result = auditorSchema.safeParse({ name: 'Test' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.some((i) => i.path.includes('email'))).toBe(true);
		}
	});

	it('rejects invalid email', () => {
		const result = auditorSchema.safeParse({ name: 'Test', email: 'not-an-email' });
		expect(result.success).toBe(false);
	});

	it('defaults ISO booleans to false', () => {
		const result = auditorSchema.parse(validAuditor);
		expect(result.iso9001).toBe(false);
		expect(result.iso14001).toBe(false);
		expect(result.iso45001).toBe(false);
		expect(result.iso50001).toBe(false);
		expect(result.iso27001).toBe(false);
	});

	it('rejects negative experienceYears', () => {
		const result = auditorSchema.safeParse({ ...validAuditor, experienceYears: -1 });
		expect(result.success).toBe(false);
	});

	it('rejects negative dailyRate', () => {
		const result = auditorSchema.safeParse({ ...validAuditor, dailyRate: -100 });
		expect(result.success).toBe(false);
	});

	it('rejects non-integer experienceYears', () => {
		const result = auditorSchema.safeParse({ ...validAuditor, experienceYears: 2.5 });
		expect(result.success).toBe(false);
	});

	it('accepts valid availability values', () => {
		for (const value of ['full_time', 'part_time', 'by_arrangement', 'limited']) {
			const result = auditorSchema.safeParse({ ...validAuditor, availability: value });
			expect(result.success).toBe(true);
		}
	});

	it('rejects invalid availability', () => {
		const result = auditorSchema.safeParse({ ...validAuditor, availability: 'invalid' });
		expect(result.success).toBe(false);
	});
});
