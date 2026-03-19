import { describe, it, expect } from 'vitest';
import { auditorSchema } from './auditor';

describe('auditorSchema', () => {
	it('accepts valid minimal auditor data', () => {
		const result = auditorSchema.safeParse({
			name: 'Max Mustermann',
			email: 'max@example.com'
		});
		expect(result.success).toBe(true);
	});

	it('accepts valid full auditor data', () => {
		const result = auditorSchema.safeParse({
			name: 'Max Mustermann',
			title: 'Lead Auditor',
			email: 'max@example.com',
			phone: '+49 123 456789',
			mobile: '+49 170 1234567',
			company: 'Audit GmbH',
			street: 'Musterstraße 1',
			zipCode: '12345',
			city: 'Berlin',
			country: 'Deutschland',
			iso9001: true,
			iso14001: true,
			iso45001: false,
			iso50001: false,
			iso27001: true,
			certifications: 'VDA 6.3, IATF 16949',
			languages: 'Deutsch, Englisch',
			experienceYears: 12,
			dailyRate: 1200,
			availability: 'full_time',
			notes: 'Bevorzugt Süddeutschland'
		});
		expect(result.success).toBe(true);
	});

	it('rejects missing name', () => {
		const result = auditorSchema.safeParse({
			email: 'max@example.com'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.some((i) => i.path.includes('name'))).toBe(true);
		}
	});

	it('rejects empty name', () => {
		const result = auditorSchema.safeParse({
			name: '',
			email: 'max@example.com'
		});
		expect(result.success).toBe(false);
	});

	it('rejects missing email', () => {
		const result = auditorSchema.safeParse({
			name: 'Max Mustermann'
		});
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.some((i) => i.path.includes('email'))).toBe(true);
		}
	});

	it('rejects invalid email format', () => {
		const result = auditorSchema.safeParse({
			name: 'Max Mustermann',
			email: 'not-an-email'
		});
		expect(result.success).toBe(false);
	});

	it('rejects invalid availability value', () => {
		const result = auditorSchema.safeParse({
			name: 'Max Mustermann',
			email: 'max@example.com',
			availability: 'invalid_option'
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative experience years', () => {
		const result = auditorSchema.safeParse({
			name: 'Max Mustermann',
			email: 'max@example.com',
			experienceYears: -5
		});
		expect(result.success).toBe(false);
	});

	it('rejects negative daily rate', () => {
		const result = auditorSchema.safeParse({
			name: 'Max Mustermann',
			email: 'max@example.com',
			dailyRate: -100
		});
		expect(result.success).toBe(false);
	});

	it('sets boolean defaults to false', () => {
		const result = auditorSchema.safeParse({
			name: 'Max Mustermann',
			email: 'max@example.com'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.iso9001).toBe(false);
			expect(result.data.iso14001).toBe(false);
			expect(result.data.iso45001).toBe(false);
			expect(result.data.iso50001).toBe(false);
			expect(result.data.iso27001).toBe(false);
		}
	});
});
